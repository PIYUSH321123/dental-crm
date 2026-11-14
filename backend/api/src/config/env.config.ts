import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  appMode: process.env.APP_MODE || 'api',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map((s) => s.trim()),
  timezone: process.env.TIMEZONE || 'Asia/Kolkata',
}));

export const authConfig = registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_dentflow_access_secret_min_32_characters',
  accessTtl: process.env.JWT_ACCESS_TTL || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_dentflow_refresh_secret_min_32_characters',
  refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  patientOtpTtlSeconds: parseInt(process.env.PATIENT_OTP_TTL_SECONDS || '300', 10),
  patientOtpMockCode: process.env.PATIENT_OTP_MOCK_CODE || '123456',
  explainerSigningSecret: process.env.EXPLAINER_SIGNING_SECRET || 'dev_explainer_secret',
  staffEsignSecret: process.env.STAFF_ESIGN_SECRET || 'dev_staff_esign_secret',
}));

export const s3Config = registerAs('s3', () => ({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'ap-south-1',
  bucket: process.env.S3_BUCKET || 'dentflow-media',
  accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.S3_SECRET_KEY || 'minioadmin123',
  usePathStyle: process.env.S3_USE_PATH_STYLE !== 'false',
  signedUrlExpiresSeconds: parseInt(process.env.SIGNED_URL_EXPIRES_SECONDS || '900', 10),
}));

export const rulesConfig = registerAs('rules', () => ({
  quietHoursStart: process.env.QUIET_HOURS_START || '21:00',
  quietHoursEnd: process.env.QUIET_HOURS_END || '08:00',
  recoveryCooldownDays: parseInt(process.env.RECOVERY_COOLDOWN_DAYS || '5', 10),
  gapFillerWaveSize: parseInt(process.env.GAP_FILLER_WAVE_SIZE || '3', 10),
  gapFillerWaveDelayMinutes: parseInt(process.env.GAP_FILLER_WAVE_DELAY_MINUTES || '10', 10),
  gapFillerHoldMinutes: parseInt(process.env.GAP_FILLER_HOLD_MINUTES || '10', 10),
  gapFillerMaxDistanceKm: parseFloat(process.env.GAP_FILLER_MAX_DISTANCE_KM || '5'),
  gapFillerSkipMessagedHours: parseInt(process.env.GAP_FILLER_SKIP_MESSAGED_HOURS || '48', 10),
  explainerLinkExpiresDays: parseInt(process.env.EXPLAINER_LINK_EXPIRES_DAYS || '30', 10),
  anxietyBufferMinutes: parseInt(process.env.ANXIETY_BUFFER_MINUTES || '15', 10),
  gstCosmeticRate: parseFloat(process.env.GST_COSMETIC_RATE || '0.18'),
  tds194jRate: parseFloat(process.env.TDS_194J_RATE || '0.10'),
}));

export const integrationsConfig = registerAs('integrations', () => ({
  whatsappProvider: process.env.WHATSAPP_PROVIDER || 'mock',
  whatsappApiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'dentflow_wa_verify_token',
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET || '',
  upiGatewayProvider: process.env.UPI_GATEWAY_PROVIDER || 'mock',
  upiMerchantVpa: process.env.UPI_MERCHANT_VPA || 'smilestudio@icici',
  upiMerchantName: process.env.UPI_MERCHANT_NAME || 'Smile Studio Dental',
  upiKeyId: process.env.UPI_KEY_ID || '',
  upiKeySecret: process.env.UPI_KEY_SECRET || '',
  upiWebhookSecret: process.env.UPI_WEBHOOK_SECRET || '',
  abdmMode: process.env.ABDM_MODE || 'mock',
  abdmBaseUrl: process.env.ABDM_BASE_URL || 'https://dev.abdm.gov.in',
  abdmClientId: process.env.ABDM_CLIENT_ID || '',
  abdmClientSecret: process.env.ABDM_CLIENT_SECRET || '',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  aiServiceInternalKey: process.env.AI_SERVICE_INTERNAL_KEY || 'dev_ai_internal_key',
}));

