# Posture Report Hub - API Reference for CRM Integration

This document provides a comprehensive API reference for integrating the Posture Report Hub into a CRM or other external system.

## Which Service to Integrate Against

**IMPORTANT:** The gateway service is the **only public service** and acts as the entire authentication boundary. The underlying Alpha and Beta internal services have no authentication of their own and must **never** be exposed to the public internet or called directly by the CRM. 

Always route your requests through the gateway's public URL.

## Authentication

The API uses cookie-based sessions for authentication. **There is currently no support for `Authorization: Bearer` tokens.** 

To authenticate, you must log in via the `/login` endpoint. This sets an `httponly` cookie named `session` containing a JWT. Every subsequent request to a protected endpoint must include this cookie. 

- **Token Lifetime**: The session token expires after 7 days.
- **Expiry Behavior**: On expiration or if the cookie is missing, protected endpoints will return a `401 Unauthorized` status (with body `{"detail": "Invalid credentials"}` or `{"detail": "Not authenticated"}`). The client must then re-authenticate via `/login`.

### Authentication Example

1. **Login and save cookies**:
```bash
curl -X POST https://api.yourdomain.com/login \
  -d "email=crm_service@example.com" \
  -d "password=your_secure_password" \
  -c cookies.txt
```

2. **Call a protected endpoint**:
```bash
curl -X GET https://api.yourdomain.com/api/history \
  -b cookies.txt
```

## Per-User Isolation

Every Beta session and history record is strictly owned by the account that created it. Requesting a `session_id` or `record_id` that belongs to another account will return a `403 Forbidden` response. 

**CRM Integration Guarantee**: You can rely on this for tenant isolation. For CRM integrations, this means either:
1. Each individual CRM user needs their own account and must log in via the API.
2. The CRM integration uses a single "service account" whose records are all shared and managed by the CRM itself.

## Rate Limits & File Constraints

When uploading media, the following constraints are strictly enforced:
- **Images (Standing / Sitting)**:
  - Max size: 15MB
  - Formats: JPG, PNG
  - Minimum Resolution: 300x300 pixels
  - Error when exceeded: `400 Bad Request` with an explanation (e.g. `"File size exceeds 15MB limit. Please upload a smaller photo."`)
- **Videos (Gait)**:
  - Max size: 100MB
  - Formats: MP4, MOV
  - Minimum Duration: 2.0 seconds
  - Error when exceeded: `400 Bad Request` with an explanation (e.g. `"Video file exceeds 100MB limit. Please trim your clip."`)

## The Two Report Flows

The API exposes two distinct flows for generating a report:

1. **Alpha Flow (Synchronous)**: One step. Send photos or a video to `/api/alpha/analyze` or `/api/alpha/analyze_video` and wait for the PDF to be streamed directly back in the HTTP response.
2. **Beta Flow (Asynchronous)**: Multi-step process for detailed reports.
   1. Create a session to get a `session_id`.
   2. Upload standing, sitting, and/or gait media tied to that `session_id`.
   3. Trigger report generation.
   4. Poll for the report status.
   5. Fetch the final PDF or HTML.

---

# API Endpoints

## Base & Auth Routes

### `GET /health`
Health check for the gateway and upstream services.
- **Auth Required**: No
- **Content-Type**: None
- **Parameters**: None
- **Success Response (200 OK)**: `application/json`
  ```json
  {
    "gateway": "ok",
    "alpha": "ok",
    "beta": "ok"
  }
  ```

### `POST /signup`
Registers a new user account and returns an authenticated session cookie.
- **Auth Required**: No
- **Content-Type**: `application/x-www-form-urlencoded`
- **Parameters**:
  - `email` (string, required)
  - `password` (string, required, min 8 characters)
- **Success Response (200 OK)**: `text/plain`
  ```text
  Signed up successfully
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "Email already registered"}` or `{"detail": "Password must be at least 8 characters"}`

### `POST /login`
Authenticates a user and sets the `session` cookie.
- **Auth Required**: No
- **Content-Type**: `application/x-www-form-urlencoded`
- **Parameters**:
  - `email` (string, required)
  - `password` (string, required)
- **Success Response (200 OK)**: `text/plain`
  ```text
  Logged in successfully
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "Incorrect email or password"}`

### `POST /logout`
Clears the session cookie.
- **Auth Required**: No
- **Content-Type**: None
- **Parameters**: None
- **Success Response (200 OK)**: `text/plain`
  ```text
  Logged out successfully
  ```

### `GET /`
Provides the HTML UI for the Gateway. **Not for integration.**
- **Auth Required**: No

---

## Alpha Proxy Routes (Synchronous)

### `POST /api/alpha/analyze`
Submits images for synchronous posture analysis and streams back a PDF.
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `patient_id` (string, optional): A unique identifier or name.
  - `front_image` (file, optional): JPG/PNG.
  - `back_image` (file, optional): JPG/PNG.
  - `left_image` (file, optional): JPG/PNG.
  - `right_image` (file, optional): JPG/PNG.
- **Success Response (200 OK)**: `application/pdf` (Binary PDF stream)
- **Error Responses**:
  - `401 Unauthorized`

### `POST /api/alpha/analyze_video`
Submits a video for synchronous posture analysis and streams back a PDF.
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `patient_id` (string, optional): A unique identifier or name.
  - `file` (file, required): MP4/MOV video.
- **Success Response (200 OK)**: `application/pdf` (Binary PDF stream)
- **Error Responses**:
  - `401 Unauthorized`

---

## Beta Proxy Routes (Asynchronous)

### `POST /api/beta/session`
Initializes a new upload session.
- **Auth Required**: Yes
- **Content-Type**: None
- **Parameters**: None
- **Success Response (200 OK)**: `application/json`
  ```json
  {
    "success": true,
    "session_id": "c83b...49f",
    "data": { ... }
  }
  ```

### `POST /api/beta/upload/standing`
Uploads a standing view photo to an active session.
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `session_id` (string, required)
  - `view_name` (string, required): Allowed values: `front`, `back`, `rear`, `left`, `right`.
  - `file` (file, required): JPG/PNG (Max 15MB).
- **Success Response (200 OK)**: `application/json`
  ```json
  {
    "success": true,
    "view": "front",
    "quality_score": 95.0,
    "status": "PASS",
    "landmarks_count": 33,
    "preview_b64": "...",
    "message": "Photo passed quality check!"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid view name, file too large, invalid format, low resolution.
  - `403 Forbidden`: Session does not belong to the user.

### `POST /api/beta/upload/sitting`
Uploads a sitting view photo to an active session.
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `session_id` (string, required)
  - `view_name` (string, required): Allowed values: `left`, `right`.
  - `file` (file, required): JPG/PNG (Max 15MB).
- **Success Response (200 OK)**: `application/json`
  ```json
  {
    "success": true,
    "view": "left",
    "quality_score": 90.0,
    "status": "PASS",
    "landmarks_count": 33,
    "preview_b64": "...",
    "message": "Sitting posture (Left View) tracked successfully!"
  }
  ```

### `POST /api/beta/upload/gait`
Uploads a gait walking video to an active session.
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `session_id` (string, required)
  - `view_name` (string, required): Allowed values: `front`, `rear`.
  - `file` (file, required): MP4/MOV (Max 100MB, min 2.0s).
- **Success Response (200 OK)**: `application/json`
  ```json
  {
    "success": true,
    "view": "front",
    "duration_sec": 3.5,
    "frame_count": 105,
    "message": "Gait video accepted (3.5s clip)!"
  }
  ```

### `POST /api/beta/generate-report`
Executes the full pipeline for the session assets. 
- **Auth Required**: Yes
- **Content-Type**: `application/x-www-form-urlencoded`
- **Parameters**:
  - `session_id` (string, required)
  - `patient_name` (string, optional, defaults to "Valued Patient")
  - `clinician_name` (string, optional, defaults to "Dr. Alex Taylor")
- **Success Response (200 OK)**: `application/json`

### `GET /api/beta/report/{session_id}/status`
### Polling Contract
This endpoint returns the current status of the report pipeline. Report generation can take minutes. 
**Recommended Client Behavior:** 
- Poll every 2 seconds.
- Tolerate `502 Bad Gateway` and `504 Gateway Timeout` when `retryable` is true (the backend inference engine blocks its event loop and might be momentarily unreachable). Give the caller a bounded retry budget and an overall timeout deadline.

- **Auth Required**: Yes
- **Parameters**: 
  - `session_id` (path, required)
- **Success Response (200 OK)**: `application/json`
  ```json
  {
    "success": true,
    "session_id": "c83b...49f",
    "data": {
      "status": "processing"
    }
  }
  ```
- **Error Responses**:
  - `504 Gateway Timeout` / `502 Bad Gateway`: 
    ```json
    {
      "status": "unavailable",
      "retryable": true,
      "reason": "Beta did not answer the status check within 10s (it is likely busy running inference)."
    }
    ```

### `GET /api/beta/report/{session_id}/html`
Fetches the completed report in HTML format.
- **Auth Required**: Yes
- **Parameters**:
  - `session_id` (path, required)
- **Success Response (200 OK)**: `text/html` (Streamed HTML content)

### `GET /api/beta/report/{session_id}/pdf`
Fetches the completed report in PDF format.
- **Auth Required**: Yes
- **Parameters**:
  - `session_id` (path, required)
- **Success Response (200 OK)**: `application/pdf` (Binary PDF stream)

---

## History Routes

### `GET /api/history`
Retrieves a list of all reports generated by the authenticated user.
- **Auth Required**: Yes
- **Parameters**: None
- **Success Response (200 OK)**: `application/json`
  ```json
  [
    {
      "id": 1,
      "record_id": "abc-123",
      "source": "beta",
      "timestamp": "2026-08-19T10:00:00.000Z",
      "patient_identifier": "Patient 1",
      "media_keys": ["front", "left"]
    }
  ]
  ```

### `GET /api/history/{record_id}/pdf`
Downloads the PDF of a historical report.
- **Auth Required**: Yes
- **Parameters**:
  - `record_id` (path, required)
- **Success Response (200 OK)**: `application/pdf` (Binary PDF stream)
- **Error Responses**:
  - `404 Not Found`: `{"detail": "PDF not found on disk"}`

### `GET /api/history/{record_id}/media/{filename}`
Retrieves uploaded media associated with a historical report.
- **Auth Required**: Yes
- **Parameters**:
  - `record_id` (path, required)
  - `filename` (path, required): Note that `filename` is actually the media key identifier (e.g. `front_image`, `video`, `standing`), not the raw file extension.
- **Success Response (200 OK)**: `image/jpeg` or `video/mp4`
- **Error Responses**:
  - `404 Not Found`: `{"detail": "Media key not found"}`

---

## Known Gaps for Integration

1. **No `Authorization: Bearer` Support**: Integrating servers must parse, store, and transmit a cookie (`session`) which is an awkward pattern for server-to-server CRM integration.
2. **Missing Granular Tenant Model**: Beta sessions are mapped to a `User` record (`user_id`). There is no overarching `Organization` or `Tenant` abstraction, which makes sharing records natively between different users in the same clinic difficult without sharing login credentials.
3. **No Webhooks**: The asynchronous Beta report generation relies entirely on the client polling the `/status` endpoint. There is no push notification or webhook to inform the CRM that a report has finished generating.
4. **HTML Content Not For Integration**: The `GET /` route provides an HTML UI but is not a functional endpoint for API consumption.
