# API Reference - Authentication and Administration

This document provides a reference for the authentication, company registration, and role assignment API endpoints. Use these details to integrate the frontend with the backend.

All endpoints use JSON payloads for requests and responses and store authentication sessions in HTTP-Only cookies.

---

## Table of Contents
1. [Super Admin Login](#1-super-admin-login)
2. [Super Admin Logout](#2-super-admin-logout)
3. [Company (Clinic) Registration](#3-company-clinic-registration)
4. [Company Admin / Staff Login](#4-company-admin--staff-login)
5. [Company Admin / Staff Logout](#5-company-admin--staff-logout)
6. [Patient Login](#6-patient-login)
7. [Patient Logout](#7-patient-logout)
8. [Role Assignment](#8-role-assignment)

---

## 1. Super Admin Login

Authenticates a platform-level Super Admin. Sets the `admin_session` cookie on success.

* **URL**: `/api/admin/login`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`

### Request Body
```json
{
  "email": "superadmin@example.com",
  "password": "super_admin_secure_password"
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | The email address of the Super Admin. |
| `password` | `string` | Yes | The password of the Super Admin. |

### Response Example (Success - 200 OK)
*Sets HTTP-Only cookie `admin_session` (Expiry: 4 Hours, Path: `/`, SameSite: `Strict`)*
```json
{
  "success": true,
  "user": {
    "id": "cmrx9ah310003wgrlu8axorxx",
    "name": "Super Admin Name",
    "email": "superadmin@example.com",
    "role": "SUPER_ADMIN"
  }
}
```

### Response Example (Error - 401 Unauthorized / 400 Bad Request)
```json
{
  "error": "Invalid email or password"
}
```

---

## 2. Super Admin Logout

Logs out the Super Admin by clearing the `admin_session` cookie.

* **URL**: `/api/admin/logout`
* **Method**: `POST`

### Response Example (Success - 200 OK)
*Clears HTTP-Only cookie `admin_session`*
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Company (Clinic) Registration

Registers a new clinic (Company), assigns feature access configs (Access Groups), and provisions the initial Company Admin user.
*Restricted to: Super Admin (requires valid `admin_session` cookie).*

* **URL**: `/api/admin/companies`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`

### Request Body
```json
{
  "name": "Active Life Physio",
  "slug": "active-life",
  "email": "contact@activelife.com",
  "phone": "555-0100",
  "admin": {
    "name": "Dr. Sarah Connor",
    "email": "sarah@activelife.com",
    "password": "clinicadminpass"
  },
  "accessConfig": {
    "marketing": true,
    "appointments": true,
    "billing": false,
    "patientManagement": true,
    "leadManagement": false,
    "activityManagement": true
  }
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | The user-facing name of the company/clinic. |
| `slug` | `string` | Yes | Unique URL slug (e.g. `active-life` in `/[companySlug]/dashboard`). |
| `email` | `string` | No | General contact email for the company. |
| `phone` | `string` | No | General contact phone number for the company. |
| `admin` | `object` | Yes | Object containing initial clinic owner user credentials. |
| `admin.name` | `string` | Yes | Display name of the clinic owner. |
| `admin.email` | `string` | Yes | Work email of the clinic owner. |
| `admin.password` | `string` | Yes | Account password for the clinic owner (Min 8 chars). |
| `accessConfig` | `object` | No | Boolean toggles for permitted features. Defaults to `false` for omitted keys. |
| `accessConfig.marketing` | `boolean` | No | Enables AI Ad Studio & campaigns. |
| `accessConfig.appointments` | `boolean` | No | Enables calendar scheduling. |
| `accessConfig.billing` | `boolean` | No | Enables invoices and payments. |
| `accessConfig.patientManagement` | `boolean` | No | Enables patient records & exercises. |
| `accessConfig.leadManagement` | `boolean` | No | Enables CRM lead tracking. |
| `accessConfig.activityManagement` | `boolean` | No | Enables audit logs & system activity dashboard. |

### Response Example (Success - 200 OK)
```json
{
  "success": true,
  "company": {
    "id": "cmrx9b3z20000wgrl902j82v1",
    "name": "Active Life Physio",
    "slug": "active-life"
  },
  "admin": {
    "id": "cmrx9b3z20001wgrly8sz1c90",
    "name": "Dr. Sarah Connor",
    "email": "sarah@activelife.com",
    "role": "COMPANY_ADMIN"
  },
  "accessConfig": {
    "marketing": true,
    "appointments": true,
    "billing": false,
    "patientManagement": true,
    "leadManagement": false,
    "activityManagement": true
  }
}
```

---

## 4. Company Admin / Staff Login

Authenticates a clinic's administrator or general staff user. Sets the `session` cookie on success.

* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`

### Request Body
```json
{
  "email": "sarah@activelife.com",
  "password": "clinicadminpass",
  "companySlug": "active-life"
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | The work email of the clinic admin or staff member. |
| `password` | `string` | Yes | Account password. |
| `companySlug` | `string` | Yes | The slug identifier of the clinic they are logging into. |

### Response Example (Success - 200 OK)
*Sets HTTP-Only cookie `session` (Expiry: 7 Days, Path: `/`, SameSite: `Lax`)*
```json
{
  "success": true,
  "user": {
    "id": "cmrx9b3z20001wgrly8sz1c90",
    "name": "Dr. Sarah Connor",
    "email": "sarah@activelife.com",
    "role": "COMPANY_ADMIN",
    "companyId": "cmrx9b3z20000wgrl902j82v1",
    "companySlug": "active-life"
  }
}
```

---

## 5. Company Admin / Staff Logout

Logs out a company user by clearing the `session` cookie.

* **URL**: `/api/auth/logout`
* **Method**: `POST`

### Response Example (Success - 200 OK)
*Clears HTTP-Only cookie `session`*
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 6. Patient Login

Authenticates a patient to access the patient portal. Supports logging in with either email or mobile number. Sets the `patient_session` cookie on success.

* **URL**: `/api/auth/patient-login`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`

### Request Body (Using Mobile)
```json
{
  "emailOrMobile": "9876543210",
  "password": "patient_secure_password",
  "companySlug": "active-life"
}
```

### Request Body (Using Email)
```json
{
  "emailOrMobile": "patient@example.com",
  "password": "patient_secure_password",
  "companySlug": "active-life"
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `emailOrMobile`| `string` | Yes | The email address or the mobile number of the patient. |
| `password` | `string` | Yes | Account password. |
| `companySlug` | `string` | Yes | The slug of the clinic the patient belongs to. |

### Response Example (Success - 200 OK)
*Sets HTTP-Only cookie `patient_session` (Expiry: 30 Days, Path: `/`, SameSite: `Lax`)*
```json
{
  "success": true,
  "patient": {
    "id": "cmrx9c5v20002wgrlx7sz0c02",
    "name": "John Doe",
    "email": "patient@example.com",
    "mobile": "9876543210",
    "companyId": "cmrx9b3z20000wgrl902j82v1",
    "companySlug": "active-life"
  }
}
```

---

## 7. Patient Logout

Logs out a patient by clearing the `patient_session` cookie.

* **URL**: `/api/auth/patient-logout`
* **Method**: `POST`

### Response Example (Success - 200 OK)
*Clears HTTP-Only cookie `patient_session`*
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 8. Role Assignment

Assigns or updates a staff member's role within their clinic.
*Restricted to: Company Admin of the same clinic (requires valid `session` cookie) or Super Admin.*

* **URL**: `/api/auth/assign-role`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`

### Request Body
```json
{
  "targetUserId": "cmrx9d4r20004wgrly1sz9c04",
  "newRole": "COMPANY_ADMIN"
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `targetUserId` | `string` | Yes | The unique ID of the staff user whose role is being changed. |
| `newRole` | `string` | Yes | The new role to assign. Accepted values: `COMPANY_ADMIN` or `STAFF`. |

### Response Example (Success - 200 OK)
```json
{
  "success": true,
  "message": "Successfully assigned role \"COMPANY_ADMIN\" to user John Therapist",
  "user": {
    "id": "cmrx9d4r20004wgrly1sz9c04",
    "name": "John Therapist",
    "email": "therapist@activelife.com",
    "role": "COMPANY_ADMIN",
    "companyId": "cmrx9b3z20000wgrl902j82v1"
  }
}
```

### Response Example (Error - 403 Forbidden)
```json
{
  "error": "Forbidden: Cannot assign role to a user of a different company"
}
```
