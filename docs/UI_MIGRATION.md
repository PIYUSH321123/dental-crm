# DentFlow UI & Application Flow Migration Audit (`/docs/UI_MIGRATION.md`)

**Branch:** `ui-redesign`  
**Source Spec:** `DentFlow-Screen-Mockups.pdf` (38 screens across Public Landing, Auth, One-Time Setup Wizard, Clinic & Owner App, Patient App, Specialist Portal, Dental Lab Portal, and Platform Admin Portal)  
**Strict Naming Rule:** No internal mockup codes (`C01`, `O01`, `P01`, `S01`, `L01`, `A01`, etc.) are used anywhere in the UI, routes, filenames, component names, query parameters, comments, or identifiers. Every screen is identified solely by its readable screen name and readable URL path.

---

## 1. End-to-End Application Flow & Role Redirect Rules

1. **Public Landing Page (`/`)**
   - Public marketing & product showcase (mobile responsive): hero section, 6 core capabilities (*AI X-ray scan*, *Treatment explainer*, *Gap filler*, *Treatment recovery*, *Post-op check-ins*, *Voice AI receptionist*), pricing tiers (*Starter* `₹4,999/mo`, *Growth* `₹14,999/mo`, *Chain* `Custom`), clinic owner testimonials, interactive *Book a demo* drawer/modal, *Log in* (`/login`), and *Start free trial* (`/signup`).
2. **Authentication (`/login`, `/signup`, `/forgot-password`, `/patient/login`)**
   - **Clinic & Staff Login (`/login`)**: Email/password login + instant role-preview login cards for every persona so flows can be tested immediately.
   - **Clinic Owner Sign Up (`/signup`)**: Registers a new clinic group owner with `setupCompleted = false` and routes straight into `/setup`.
   - **Forgot Password (`/forgot-password`)**: Sends password reset instructions and confirms delivery.
   - **Patient OTP Login (`/patient/login`)**: Mobile `+91` OTP login flow redirecting to `/patient`.
   - **Post-Login Role Redirects & Route Guards (`src/proxy.ts` + server/client guards)**:
     - `platform_admin` → `/admin` (Admin portal)
     - `owner` (first time, `setupCompleted === false`) → `/setup` (cannot skip to `/app/*` until setup completes) → `/app/group-dashboard`
     - `owner` (after setup, `setupCompleted === true`) → `/app/group-dashboard`
     - `branch_manager`, `dentist`, `front_desk`, `assistant`, `accounts` → `/app/today`
     - `specialist` → `/specialist`
     - `lab` → `/lab`
     - `patient` → `/patient`
     - Unauthorized access to `/admin/*`, `/app/*`, `/setup`, `/specialist`, `/lab`, or `/patient` is blocked and redirected to `/login` (or the user's permitted home route).
3. **Platform Admin Portal (`/admin`, `/admin/clinics`)**
   - Accessible exclusively to `platform_admin`.
   - Sections: *Clinics* (clinic accounts + *Onboard clinic*), *Plans & billing* (Starter / Growth / Chain + feature flags), *Messaging* (WhatsApp credits), *AI usage* (voice minutes), *Support*, and *Compliance* (DPDP access/deletion/breach request queue).
4. **One-Time Setup Wizard (`/setup`)**
   - Mandatory 8-step onboarding wizard for first-time clinic owners (`setupCompleted === false` blocks direct navigation to `/app/*`):
     1. *Clinic profile* → 2. *Branches* → 3. *Chairs and rooms* → 4. *Working hours* → 5. *Staff and roles* → 6. *Procedure fees* → 7. *WhatsApp connect* → 8. *Done* (sets `setupCompleted = true` and launches `/app/group-dashboard`).
5. **Clinic & Owner Application (`/app/*`)**
   - Shared shell with dark forest-green sidebar (`#12352C`), cream canvas (`#F6F5F0`), teal primary buttons (`#146C58`), orange `"Unique"` accent pills, green `"New"` pills, editorial serif headings & KPI numbers, status pills, branch selector, global search, and right-side detail drawers.
   - Sidebar items and route access are dynamically controlled by the **Users & roles** permission matrix in **Settings** (`/app/settings`).
6. **Specialist Portal (`/specialist`), Dental Lab Portal (`/lab`), Patient App (`/patient`)**
   - **Specialist Portal (`/specialist`)**: *My days*, *Referrals*, *Patients*, *Earnings*, referral inbox with *Accept & slot* / *Reply with advice*.
   - **Dental Lab Portal (`/lab`)**: *Open cases*, STL scan preview, case specification sheet, *Mark dispatched · attach invoice* synced with clinic *Lab cases*.
   - **Patient App (`/patient`)**: Mobile-first PWA with bottom tab bar (*Home*, *Book*, *Records*, *Family*, *Pay*) and full workflows (*Book a visit*, *WhatsApp bot*, *Home*, *Before your visit*, *Self-check*, *Photo check*, *Result*, *My treatment explained*, *Plan and payments*, *Records*, *Family*, *Recovery check-in*, *Aligner progress*).

---

## 2. Complete Route & Component Migration Map

| Current / Legacy Route or File | Current Purpose | Target DentFlow Screen | Target Readable Route | Action |
|---|---|---|---|---|
| `/` (`src/app/page.tsx`) | Internal portal launcher with screen codes | Public Landing Page | `/` | **REPLACE** |
| `/previous-landing-page/*` | Old PhysioYoga landing page | Public Landing Page (`/`) | Redirect `/` | **DELETE** |
| `/[companySlug]/login` & `/admin/login` | Old company/admin login pages | Unified Login (`/login`) | `/login` (redirect old URLs) | **REPLACE** |
| `/[companySlug]/patient-login` | Old patient login page | Patient OTP Login (`/patient/login`) | `/patient/login` (redirect old URL) | **REPLACE** |
| *(none)* | — | Clinic Owner Sign Up | `/signup` | **CREATE** |
| *(none)* | — | Forgot Password | `/forgot-password` | **CREATE** |
| *(none)* | — | One-Time Clinic Setup Wizard | `/setup` | **CREATE** |
| `/admin/dashboard`, `/admin/projects`, `/admin/subscription` | Admin portal with screen IDs / legacy pages | Platform Admin Portal (`Clinics`, `Plans`, `Messaging`, `AI usage`, `Support`, `Compliance`) | `/admin` & `/admin/clinics` (redirect old URLs) | **REPLACE** |
| `/c/[company]/dashboard` & `/c/[company]/dashboard/layout.tsx` | Tenant-prefixed dashboard with screen IDs | Clinic & Owner App Shell + *Today* | `/app/today` & `/app/layout.tsx` (redirect `/c/*`) | **REPLACE** |
| `/c/[company]/dashboard/calendar` & `/appointments/*` | Chair calendar / legacy timeline | *Calendar* | `/app/calendar` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/patients` & `/patient-management/*` | Patient profile & directory | *Patients* | `/app/patients` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/gap-filler` | Waitlist & gap filler | *Gap filler* | `/app/gap-filler` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/ai-receptionist` | Voice AI receptionist | *AI receptionist* | `/app/ai-receptionist` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/dental-chart` | FDI odontogram & imaging | *Dental chart* | `/app/dental-chart` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/treatment-plans` & `/activity-management/*` | Treatment plan builder / legacy therapy | *Treatment plans* | `/app/treatment-plans` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/explainers` | 8-language treatment explainer | *Explainers* | `/app/explainers` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/prescriptions` | Prescription builder w/ allergy block | *Prescriptions* | `/app/prescriptions` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/post-op` | Post-op check-in monitor | *Post-op check-ins* | `/app/post-op` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/billing/*` | GST billing, UPI QR, EMI, Tally | *Billing* | `/app/billing` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/recovery` & `/lead-management/*` | Unfinished treatment recovery / legacy leads | *Treatment recovery* | `/app/treatment-recovery` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/campaigns` & `/marketing/*` | Recall, campaigns, referrals, reviews | *Recall & campaigns* | `/app/recall-campaigns` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/inventory` | Batches, expiry, procedure profit | *Inventory & costing* | `/app/inventory` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/lab-cases` | Lab case Kanban board | *Lab cases* | `/app/lab-cases` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/sterilisation` | Autoclave cycles & kit trace | *Sterilisation* | `/app/sterilisation` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/staff` & `/erp/staff` | Staff & commission + TDS 194J | *Staff & commission* | `/app/staff-commission` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/all-branches` | Owner group dashboard | *All branches* (Group dashboard) | `/app/group-dashboard` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/patient-insights` | Funnel, cohort retention, loyal patients | *Patient insights* | `/app/patient-insights` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/visiting-specialists` | Visiting specialist schedule & settlement | *Visiting specialists* | `/app/visiting-specialists` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/reports` | Group P&L & reports | *Reports & P&L* | `/app/reports` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/settings/*` | Clinic settings & RBAC matrix | *Settings* | `/app/settings` | **KEEP+RESTYLE** |
| `/specialist` (`src/app/specialist/page.tsx`) | Specialist portal (remove screen IDs) | *Specialist portal* | `/specialist` | **KEEP+RESTYLE** |
| `/lab` (`src/app/lab/page.tsx`) | Dental lab portal (remove screen IDs) | *Dental lab portal* | `/lab` | **KEEP+RESTYLE** |
| `/[companySlug]/patient-portal` & `/c/[company]/home/*` | Patient app (remove screen IDs, move to `/patient`) | *Patient app* (13 patient views) | `/patient` (redirect old URLs) | **REPLACE** |
| `src/components/dental/dentflow-chart.tsx`, `dentflow-explainer.tsx`, `medical-alert-banner.tsx` | Unused prototype components | Superseded by `/app/dental-chart` & `/app/explainers` | — | **DELETE** |

---

## 3. Best-Guess Spec Notes (Items Not Explicit in Mockup PDF)

- **Landing Page Copy & Pricing Tiers (`/`)**: Uses the exact 3 plans from the platform admin mockup (*Starter* `₹4,999/mo`, *Growth* `₹14,999/mo`, *Chain* `Custom`) and showcases the 6 flagship capabilities from the clinic/patient mockups.
- **Setup Wizard Steps (`/setup`)**: Structured into the 8 operational configuration groups shown in *Settings* (*Clinic profile*, *Branches*, *Chairs and rooms*, *Working hours*, *Staff and roles*, *Procedure fees*, *WhatsApp connect*, *Done*).
- **Session Cookie & Demo Sign-In**: Uses an HTTP cookie (`dentflow_session`) read by `src/proxy.ts` for server-side route protection + role redirects, paired with both standard form submission and one-click persona sign-in buttons on `/login`.

---

## 4. Verification Status Checklist (Updated in Step F)

| Area / Screen | Readable Route | Status |
|---|---|---|
| Public Landing Page | `/` | Planned |
| Auth (`Login`, `Sign up`, `Forgot password`, `Patient OTP login`) | `/login`, `/signup`, `/forgot-password`, `/patient/login` | Planned |
| One-Time Setup Wizard (8 steps) | `/setup` | Planned |
| Platform Admin Portal (`Clinics`, `Plans`, `Messaging`, `AI usage`, `Support`, `Compliance`) | `/admin`, `/admin/clinics` | Planned |
| Clinic & Owner App (22 screens) | `/app/today` … `/app/settings` | Planned |
| Specialist Portal | `/specialist` | Planned |
| Dental Lab Portal | `/lab` | Planned |
| Patient App (13 views) | `/patient` | Planned |
