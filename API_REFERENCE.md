# API Reference - Role-Segregated Authentication and Administration

This document provides a comprehensive reference for the authentication, company registration, and role assignment API endpoints organized cleanly by **role level**.

All endpoints use JSON payloads for requests and responses and store authentication sessions in HTTP-Only cookies.

---

## Role Authentication Architecture

| Role Level | Namespace | Auth Cookie | Default Expiry |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `/api/auth/super-admin/*` | `admin_session` | 4 Hours |
| **Company / Clinic Admin** | `/api/auth/company/*` | `session` | 7 Days |
| **Clinic Staff** | `/api/auth/staff/*` | `session` | 7 Days |
| **Patient** | `/api/auth/patient/*` | `patient_session` | 30 Days |

---

## Table of Contents
1. [Super Admin Bootstrap (Server Initiation)](#1-super-admin-bootstrap-server-initiation)
2. [Super Admin Authentication](#2-super-admin-authentication)
   - [Super Admin Login](#21-super-admin-login)
   - [Super Admin Logout](#22-super-admin-logout)
3. [Company (Clinic) Authentication & Registration](#3-company-clinic-authentication--registration)
   - [Company Registration](#31-company-clinic-registration)
   - [Company Login](#32-company-admin-login)
   - [Company Logout](#33-company-logout)
4. [Staff Authentication & Management](#4-staff-authentication--management)
   - [Staff Login](#41-staff-login)
   - [Staff Logout](#42-staff-logout)
   - [Staff Role Assignment](#43-staff-role-assignment)
5. [Patient Authentication](#5-patient-authentication)
   - [Patient Login](#51-patient-login)
   - [Patient Logout](#52-patient-logout)
6. [Legacy Endpoint Compatibility](#6-legacy-endpoint-compatibility)

---

## 1. Super Admin Bootstrap (Server Initiation)

The initial platform Super Admin is automatically created upon Next.js server startup using the `register()` hook in `src/instrumentation.ts` and `src/lib/bootstrap.ts`.

### Environment Configuration (`.env`)
```env
SUPER_ADMIN_NAME="Platform Super Admin"
SUPER_ADMIN_EMAIL="admin@physioyoga.com"
SUPER_ADMIN_PASSWORD="your-strong-password"
```

* **Security**: These credentials remain strictly server-side (never prefixed with `NEXT_PUBLIC_`).
* **Idempotency**: The system verifies if a Super Admin already exists in PostgreSQL before creating.
* **Encryption**: Passwords are saved with bcrypt password hashing (10 salt rounds).

---

## 2. Super Admin Authentication

### 2.1 Super Admin Login
Authenticates a platform-level Super Admin. Sets the `admin_session` cookie on success.

* **URL**: `/api/auth/super-admin/login` *(Legacy alias: `/api/admin/login`)*
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "email": "admin@physioyoga.com",
  "password": "superadminpassword123"
}
```

#### Response Example (200 OK)
*Sets HTTP-Only cookie `admin_session` (Expiry: 4 Hours, Path: `/`, SameSite: `Strict`)*
```json
{
  "success": true,
  "user": {
    "id": "cmrx9ah310003wgrlu8axorxx",
    "name": "Platform Super Admin",
    "email": "admin@physioyoga.com",
    "role": "SUPER_ADMIN"
  }
}
```

### 2.2 Super Admin Logout
* **URL**: `/api/auth/super-admin/logout` *(Legacy alias: `/api/admin/logout`)*
* **Method**: `POST`

---

## 3. Company (Clinic) Authentication & Registration

### 3.1 Company (Clinic) Registration
Registers a new clinic (Company), configures feature access permissions, and provisions the initial Company Admin user.
*Restricted to: Super Admin (requires valid `admin_session` cookie).*

* **URL**: `/api/auth/company/register` *(Legacy alias: `/api/admin/companies`)*
* **Method**: `POST`

#### Request Body
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

### 3.2 Company Admin Login
* **URL**: `/api/auth/company/login` *(Legacy alias: `/api/auth/login`)*
* **Method**: `POST`

#### Request Body
```json
{
  "email": "sarah@activelife.com",
  "password": "clinicadminpass",
  "companySlug": "active-life"
}
```

### 3.3 Company Logout
* **URL**: `/api/auth/company/logout` *(Legacy alias: `/api/auth/logout`)*
* **Method**: `POST`

---

## 4. Staff Authentication & Management

### 4.1 Staff Login
Authenticates clinic staff members (e.g. physiotherapists, front-desk operators).

* **URL**: `/api/auth/staff/login`
* **Method**: `POST`

#### Request Body
```json
{
  "email": "therapist@activelife.com",
  "password": "staffpassword123",
  "companySlug": "active-life"
}
```

### 4.2 Staff Logout
* **URL**: `/api/auth/staff/logout`
* **Method**: `POST`

### 4.3 Staff Role Assignment
Promotes or updates a staff member's role within their clinic.
*Restricted to: Company Admin of the same clinic (requires `session` cookie) or Super Admin.*

* **URL**: `/api/auth/staff/assign-role` *(Legacy alias: `/api/auth/assign-role`)*
* **Method**: `POST`

#### Request Body
```json
{
  "targetUserId": "cmrx9d4r20004wgrly1sz9c04",
  "newRole": "COMPANY_ADMIN"
}
```

---

## 5. Patient Authentication

### 5.1 Patient Login
Authenticates a patient to access the clinic patient portal using either email or phone number.

* **URL**: `/api/auth/patient/login` *(Legacy alias: `/api/auth/patient-login`)*
* **Method**: `POST`

#### Request Body (Mobile)
```json
{
  "emailOrMobile": "9876543210",
  "password": "patient_secure_password",
  "companySlug": "active-life"
}
```

#### Request Body (Email)
```json
{
  "emailOrMobile": "patient@example.com",
  "password": "patient_secure_password",
  "companySlug": "active-life"
}
```

### 5.2 Patient Logout
* **URL**: `/api/auth/patient/logout` *(Legacy alias: `/api/auth/patient-logout`)*
* **Method**: `POST`

---

## 6. Legacy Endpoint Compatibility

For seamless backward compatibility with older clients or automated scripts, the following legacy routes are aliased:

| Legacy Route | Refactored Role Route |
| :--- | :--- |
| `/api/admin/login` | `/api/auth/super-admin/login` |
| `/api/admin/logout` | `/api/auth/super-admin/logout` |
| `/api/admin/companies` | `/api/auth/company/register` |
| `/api/auth/login` | `/api/auth/company/login` |
| `/api/auth/logout` | `/api/auth/company/logout` |
| `/api/auth/patient-login` | `/api/auth/patient/login` |
| `/api/auth/patient-logout` | `/api/auth/patient/logout` |
| `/api/auth/assign-role` | `/api/auth/staff/assign-role` |
