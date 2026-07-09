/**
 * Meta Marketing API - Authorization Service
 *
 * Implements the OAuth 2.0 flow required by the Meta Marketing API.
 * Reference: https://developers.facebook.com/docs/marketing-apis/authorization
 *
 * Access tiers (Marketing API Access Tier):
 *   - Limited Access  -> granted automatically when the Marketing API product is added.
 *   - Full Access     -> requires App Review + 500+ successful calls in 15 days, <15% error rate.
 *
 * Key permissions used for ad management:
 *   - ads_management  - read + manage ad accounts
 *   - ads_read        - read-only access to ad reports
 */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** Supported Meta permission scopes for the Marketing API. */
export type MetaScope =
  | "ads_management"
  | "ads_read"
  | "business_management"
  | "pages_read_engagement"
  | string;

/** Marketing API Access Tier as returned by the Graph API. */
export type MarketingApiAccessTier = "limited_access" | "full_access" | "unknown";

/** Decoded short-lived or long-lived user access token payload. */
export interface MetaTokenPayload {
  /** Raw OAuth access token string. */
  accessToken: string;
  /** Unix timestamp (seconds) when the token expires. 0 means non-expiring (system user token). */
  expiresAt: number;
  /** Token type - always "bearer" for user tokens. */
  tokenType: "bearer";
  /** List of scopes granted by the user. */
  scopes: MetaScope[];
}

/** Response shape returned by Meta token exchange endpoint. */
interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  /** Present on long-lived token exchange responses. */
  expires?: number;
}

/** Response shape from the /debug_token endpoint. */
interface MetaTokenDebugResponse {
  data: {
    app_id: string;
    type: string;
    application: string;
    is_valid: boolean;
    scopes: string[];
    user_id?: string;
    expires_at?: number;
    granular_scopes?: Array<{ scope: string; target_ids?: string[] }>;
  };
}

/** Options accepted by MetaAuthService.getAuthorizationUrl. */
export interface AuthorizationUrlOptions {
  /**
   * Which permissions to request from the user.
   * Defaults to ["ads_management"].
   */
  scopes?: MetaScope[];
  /** Optional opaque string to prevent CSRF (recommended). */
  state?: string;
  /**
   * Display mode: "page" | "popup" | "touch" | "wap".
   * Defaults to "page".
   */
  display?: string;
}

/** Resolved token set after the OAuth code exchange. */
export interface MetaAuthToken extends MetaTokenPayload {
  /** Long-lived token obtained by upgrading the short-lived token. undefined if not yet exchanged. */
  longLivedToken?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const META_GRAPH_BASE = "https://graph.facebook.com";
const META_API_VERSION = "v25.0";
const META_GRAPH_URL = `${META_GRAPH_BASE}/${META_API_VERSION}`;
const META_OAUTH_DIALOG = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth`;
const META_TOKEN_ENDPOINT = `${META_GRAPH_URL}/oauth/access_token`;
const META_DEBUG_TOKEN_ENDPOINT = `${META_GRAPH_URL}/debug_token`;

// ---------------------------------------------------------------------------
// MetaAuthService
// ---------------------------------------------------------------------------

/**
 * Service that encapsulates all Meta (Facebook) Marketing API authorization
 * logic: building authorization URLs, exchanging authorization codes for
 * tokens, refreshing short-lived tokens to long-lived ones, inspecting token
 * metadata, and revoking access.
 */
export class MetaAuthService {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;

  /**
   * @param appId       Meta App ID (from App Dashboard).
   * @param appSecret   Meta App Secret (keep server-side only).
   * @param redirectUri The URI Meta will redirect to after the user authorizes.
   *                    Must match a URI registered in the App Dashboard.
   *                    Include a trailing slash (e.g. "https://example.com/auth/meta/callback/").
   */
  constructor(appId: string, appSecret: string, redirectUri: string) {
    if (!appId) throw new Error("[MetaAuthService] appId is required.");
    if (!appSecret) throw new Error("[MetaAuthService] appSecret is required.");
    if (!redirectUri) throw new Error("[MetaAuthService] redirectUri is required.");

    this.appId = appId;
    this.appSecret = appSecret;
    this.redirectUri = redirectUri;
  }

  // -------------------------------------------------------------------------
  // Step 1 - Build Authorization URL
  // -------------------------------------------------------------------------

  /**
   * Constructs the Facebook OAuth dialog URL to redirect the user to.
   *
   * Follows the pattern:
   *   https://www.facebook.com/v25.0/dialog/oauth?
   *     client_id=<YOUR_APP_ID>
   *     &redirect_uri=<YOUR_URL>
   *     &scope=ads_management
   *
   * @example
   * const url = authService.getAuthorizationUrl({
   *   scopes: ["ads_management"],
   *   state: crypto.randomUUID(),
   * });
   * // Redirect the browser to `url`
   */
  getAuthorizationUrl(options: AuthorizationUrlOptions = {}): string {
    const { scopes = ["ads_management"], state, display = "page" } = options;

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(","),
      response_type: "code",
      display,
    });

    if (state) {
      params.set("state", state);
    }

    return `${META_OAUTH_DIALOG}?${params.toString()}`;
  }

  // -------------------------------------------------------------------------
  // Step 2 - Exchange Authorization Code for Short-Lived Access Token
  // -------------------------------------------------------------------------

  /**
   * Exchanges the authorization code (delivered via redirect URI query param)
   * for a short-lived user access token (~1 hour).
   *
   * Must be called server-side. The code is single-use.
   *
   * @param code  The `code` query parameter from the OAuth redirect callback.
   * @returns     Parsed short-lived token payload.
   */
  async exchangeCodeForToken(code: string): Promise<MetaAuthToken> {
    if (!code) throw new Error("[MetaAuthService] Authorization code is required.");

    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.redirectUri,
      code,
    });

    const response = await fetch(`${META_TOKEN_ENDPOINT}?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: { message: response.statusText } }));
      throw new Error(
        `[MetaAuthService] Token exchange failed: ${error?.error?.message ?? response.statusText}`,
      );
    }

    const data: MetaTokenResponse = await response.json();
    return this.parseTokenResponse(data);
  }

  // -------------------------------------------------------------------------
  // Step 3 - Extend to Long-Lived Token (~60 days)
  // -------------------------------------------------------------------------

  /**
   * Exchanges a short-lived user access token for a long-lived one (~60 days).
   * Should be performed server-side immediately after the initial code exchange.
   *
   * @param shortLivedToken  The short-lived access token from exchangeCodeForToken.
   * @returns                Long-lived token payload.
   */
  async getLongLivedToken(shortLivedToken: string): Promise<MetaAuthToken> {
    if (!shortLivedToken) throw new Error("[MetaAuthService] Short-lived token is required.");

    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const response = await fetch(`${META_TOKEN_ENDPOINT}?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: { message: response.statusText } }));
      throw new Error(
        `[MetaAuthService] Long-lived token exchange failed: ${error?.error?.message ?? response.statusText}`,
      );
    }

    const data: MetaTokenResponse = await response.json();
    const token = this.parseTokenResponse(data);
    return { ...token, longLivedToken: token.accessToken };
  }

  // -------------------------------------------------------------------------
  // Step 4 - System User Token (server-to-server, non-expiring)
  // -------------------------------------------------------------------------

  /**
   * Fetches a system user token for automated, server-to-server Marketing
   * API calls. System user tokens are non-expiring.
   *
   * Capacity per access tier:
   *   - Limited Access: 1 system user + 1 admin system user.
   *   - Full Access:    10 system users + 1 admin system user.
   *
   * @param systemUserId         Numeric ID of the Business Manager system user.
   * @param adminUserAccessToken Long-lived token of a Business Admin user.
   * @param scopes               Permissions to grant the system user token.
   * @returns                    Raw system user access token string.
   */
  async getSystemUserToken(
    systemUserId: string,
    adminUserAccessToken: string,
    scopes: MetaScope[] = ["ads_management"],
  ): Promise<string> {
    const appsecretProof = await this.generateAppSecretProof(adminUserAccessToken);

    const params = new URLSearchParams({
      access_token: adminUserAccessToken,
      appsecret_proof: appsecretProof,
      scope: scopes.join(","),
    });

    const url = `${META_GRAPH_URL}/${systemUserId}/access_tokens?${params.toString()}`;
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: { message: response.statusText } }));
      throw new Error(
        `[MetaAuthService] System user token fetch failed: ${error?.error?.message ?? response.statusText}`,
      );
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("[MetaAuthService] No access_token in system user token response.");
    }

    return data.access_token as string;
  }

  // -------------------------------------------------------------------------
  // Token Inspection & Validation
  // -------------------------------------------------------------------------

  /**
   * Calls the Graph API /debug_token endpoint to inspect a token's validity,
   * expiry, and granted scopes. Use server-side to validate tokens before
   * processing user requests.
   *
   * @param userAccessToken  The token to inspect.
   * @returns                Structured debug data from Meta.
   */
  async inspectToken(userAccessToken: string): Promise<MetaTokenDebugResponse["data"]> {
    const params = new URLSearchParams({
      input_token: userAccessToken,
      // App token format: appId|appSecret
      access_token: `${this.appId}|${this.appSecret}`,
    });

    const response = await fetch(`${META_DEBUG_TOKEN_ENDPOINT}?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: { message: response.statusText } }));
      throw new Error(
        `[MetaAuthService] Token inspection failed: ${error?.error?.message ?? response.statusText}`,
      );
    }

    const data: MetaTokenDebugResponse = await response.json();
    return data.data;
  }

  /**
   * Returns true if the given access token is still valid and not expired.
   */
  async isTokenValid(accessToken: string): Promise<boolean> {
    try {
      const info = await this.inspectToken(accessToken);
      const now = Math.floor(Date.now() / 1000);
      return info.is_valid && (info.expires_at === undefined || info.expires_at > now);
    } catch {
      return false;
    }
  }

  /**
   * Checks whether a specific permission was granted by the user.
   *
   * @param accessToken  User access token to inspect.
   * @param permission   The permission scope to verify (e.g. "ads_management").
   */
  async hasPermission(accessToken: string, permission: MetaScope): Promise<boolean> {
    const info = await this.inspectToken(accessToken);
    return info.is_valid && info.scopes.includes(permission);
  }

  // -------------------------------------------------------------------------
  // Marketing API Access Tier Detection
  // -------------------------------------------------------------------------

  /**
   * Attempts to determine the app's Marketing API Access Tier for a given
   * ad account by inspecting the x-business-use-case-usage response header.
   *
   * Tiers:
   *   - limited_access  - default; heavily rate-limited; development only.
   *   - full_access     - after App Review; lightly rate-limited; production ready.
   *   - unknown         - header absent or unparseable.
   *
   * For a definitive check, visit:
   *   App Dashboard -> App Review -> Permissions and Features.
   *
   * @param adAccountId   Ad account ID in the format act_<ACCOUNT_ID>.
   * @param accessToken   Valid user or system user access token.
   */
  async getMarketingApiAccessTier(
    adAccountId: string,
    accessToken: string,
  ): Promise<MarketingApiAccessTier> {
    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        fields: "account_id,account_status",
      });

      const response = await fetch(`${META_GRAPH_URL}/${adAccountId}?${params.toString()}`);

      if (response.ok) {
        const usageHeader = response.headers.get("x-business-use-case-usage");
        if (usageHeader) {
          const usage = JSON.parse(usageHeader) as Record<
            string,
            Array<Record<string, string>>
          >;
          const entries = Object.values(usage).flat();
          const tierEntry = entries.find(
            (u) => u.type === "ads_management" || u.type === "ads",
          );
          if (tierEntry?.access_tier) {
            return tierEntry.access_tier === "full_access"
              ? "full_access"
              : "limited_access";
          }
        }
      }
    } catch {
      // Fall through to unknown
    }

    return "unknown";
  }

  // -------------------------------------------------------------------------
  // appsecret_proof (HMAC-SHA256)
  // -------------------------------------------------------------------------

  /**
   * Generates an appsecret_proof HMAC-SHA256 signature required for
   * server-side API calls when "Require App Secret" is enabled in the
   * App Dashboard.
   *
   * @param accessToken  The access token to sign with the app secret.
   * @returns            Lowercase hex-encoded HMAC-SHA256 signature.
   */
  async generateAppSecretProof(accessToken: string): Promise<string> {
    const encoder = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.appSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(accessToken),
    );

    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // -------------------------------------------------------------------------
  // Token Revocation
  // -------------------------------------------------------------------------

  /**
   * Revokes all permissions granted by the user to this app, effectively
   * logging them out and removing the app from their authorized apps list.
   *
   * @param accessToken  The user access token to revoke.
   * @returns            true if revocation succeeded.
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    const params = new URLSearchParams({ access_token: accessToken });

    const response = await fetch(
      `${META_GRAPH_URL}/me/permissions?${params.toString()}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: { message: response.statusText } }));
      throw new Error(
        `[MetaAuthService] Token revocation failed: ${error?.error?.message ?? response.statusText}`,
      );
    }

    const data = await response.json();
    return data.success === true;
  }

  /**
   * Revokes a single permission rather than all permissions.
   *
   * @param accessToken  Valid user access token.
   * @param permission   The specific permission to remove (e.g. "ads_management").
   * @returns            true if the permission was successfully removed.
   */
  async revokePermission(accessToken: string, permission: MetaScope): Promise<boolean> {
    const params = new URLSearchParams({ access_token: accessToken });

    const response = await fetch(
      `${META_GRAPH_URL}/me/permissions/${permission}?${params.toString()}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: { message: response.statusText } }));
      throw new Error(
        `[MetaAuthService] Permission revocation failed: ${error?.error?.message ?? response.statusText}`,
      );
    }

    const data = await response.json();
    return data.success === true;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Parses a raw MetaTokenResponse from the token endpoint into a
   * structured MetaAuthToken.
   */
  private parseTokenResponse(data: MetaTokenResponse): MetaAuthToken {
    // expires_in -> relative seconds from now; expires -> absolute Unix timestamp.
    const expiresAt = data.expires
      ? data.expires
      : data.expires_in
        ? Math.floor(Date.now() / 1000) + data.expires_in
        : 0; // 0 = non-expiring (system user tokens)

    return {
      accessToken: data.access_token,
      tokenType: "bearer",
      expiresAt,
      scopes: [], // Populated via inspectToken or from the OAuth callback params
    };
  }
}

// ---------------------------------------------------------------------------
// Factory helper
// ---------------------------------------------------------------------------

/**
 * Creates a MetaAuthService instance from environment variables.
 *
 * Required environment variables:
 *   META_APP_ID      - Your Meta App ID
 *   META_APP_SECRET  - Your Meta App Secret (server-side only)
 *   META_REDIRECT_URI - OAuth redirect URI (with trailing slash)
 *
 * @throws If any required environment variables are missing.
 */
export function createMetaAuthService(): MetaAuthService {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    throw new Error(
      "[MetaAuthService] Missing required environment variables: " +
        "META_APP_ID, META_APP_SECRET, META_REDIRECT_URI",
    );
  }

  return new MetaAuthService(appId, appSecret, redirectUri);
}
