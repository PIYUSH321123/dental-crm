# DentFlow UI & Backend Migration Audit (`/docs/UI_MIGRATION.md`)

**Branch:** `ui-redesign`  
**Source Spec:** `DentFlow-Screen-Mockups.pdf` (38 screens: `C01–C17` Clinic Portal, `O01–O05` Owner & Multi-Clinic, `P01–P13` Patient App PWA/WhatsApp, `S01` Specialist Portal, `L01` Dental Lab Portal, `A01` SaaS Super-Admin)  
**Target Architecture:** Next.js App Router frontend (`src/`) wired to DentFlow NestJS + Prisma + BullMQ + FastAPI AI backend (`backend/api`, `backend/ai-service`) with local mock fallback when offline.

---

## 1. Visual Design System & Ambiguity Resolutions (Best-Guess Spec Notes)

Extracted directly from `DentFlow-Screen-Mockups.pdf` pages 1–30:

1. **Color Palette & Tokens (`src/styles/dentflow-theme.css` + `src/lib/dentflow-theme.ts`)**
   - **Clinic/Owner Sidebar:** Deep forest green `#12352C` (hover `#1A463B`, active pill `#1F5447`, section headers muted sage `#7FA398`, border `#1E493E`).
   - **Partner Portal Top Bars:**
     - Specialist (`S01`): Deep slate navy `#232738`
     - Dental Lab (`L01`): Deep steel blue `#1D446B`
     - Super-Admin (`A01`): Charcoal forest `#1C2A26`
   - **Canvas Background:** Warm cream `#F6F5F0` (secondary surface `#EFECE4`, pure white `#FFFFFF` cards with `1px solid #E5E2D9` borders and subtle shadow).
   - **Primary Action / Teal:** `#146C58` (hover `#0F5646`, foreground `#FFFFFF`).
   - **Accent Pills:**
     - `"Unique"` badge: soft amber/peach background `#F9E5D3` / text `#B45B1C` (or dark-sidebar variant `rgba(242, 166, 107, 0.22)` / `#F2A66B`).
     - `"New"` badge: soft mint `#D7F2E3` / text `#136A47`.
     - **Status Pills:**
       - Green (`Done`, `Confirmed`, `Paid`, `Pass`, `Connected`, `Live`, `Healthy`, `On track`): `#E3F5EC` bg / `#146C43` text.
       - Amber (`In chair`, `Checked in`, `Pending`, `Viewed`, `Sent`, `Part paid`, `Expiring`, `Due`, `Overdue 2 d`, `At risk`, `Trial`): `#FEF3DC` bg / `#9A5B00` text.
       - Red (`Alert`, `Late 10 min`, `Low`, `Declined`, `Overdue`, `Fail`, `High`): `#FDE7E7` bg / `#B42318` text.
       - Blue (`Booked`, `Received`, `Scheduled`, `New`): `#E5EFFD` bg / `#1D4ED8` text.
       - Grey (`Not confirmed`, `No reply`, `Closed`, `Draft`, `Off`, `Leave`): `#EFECE6` bg / `#5C5B55` text.
2. **Typography**
   - **Display / Headings / KPI Big Numbers:** Editorial serif (`Fraunces` / `Source Serif 4` / `Georgia` fallback) — used for screen titles (`Good morning, Anita`, `Dental chart · Priya Deshmukh`, `All branches`, `Treatments`) and KPI figures (`34`, `₹48,200`, `₹6.84 L`, `₹24.6 L`).
   - **Body / Tables / Controls:** Clean geometric sans (`Plus Jakarta Sans` / `Inter`).
   - **Clinical Codes / Tooth / Cycle IDs:** Monospace (`JetBrains Mono`) for FDI numbers, invoice IDs (`INV-SR-2026-04418`), lab cases (`LC-8841`), autoclave cycles (`#1419`), and ABHA IDs (`91-XXXX-XXXX-4821`).
3. **PDF Placeholder Resolutions (Best-Guess Rules)**
   - `[LENDING PARTNER]` (`C05`, `O04`) → Rendered as `"Bajaj Finserv Health / GrayQuest"` (configurable partner label in `BranchIntegrationConfig`).
   - `[IMPLANT BRAND]` (`L01`) → Rendered as `"Straumann BLX 4.2 mm"` (and stored as editable `implantSystem` on `LabCase`).
   - `[CLINIC ADDRESS]` / `[REG NO]` (`C07`) → Populated from `Branch.address` and `StaffUser.registrationNo` (`DCI Reg. A-24819`).
   - `[OTHER CLINIC A]`, `[OTHER CLINIC B]` (`S01`) & `[CLINIC B..G]` (`A01`) → Seeded with realistic Indian dental clinic names (`Apex Dental Care, Pune`, `Pearl & Root Clinic, Baner`, etc.) while supporting arbitrary tenant names from DB.
   - `[MIN]` hold (`C15`) → Default `4 min` hold at `134 °C · 2.1 bar` (or `20 min` at `121 °C · 1.1 bar`).
   - `[N]` / `₹[AMT]` KPIs (`A01`) → Computed dynamically from `ClinicGroup` & `Branch` records (with sample values `24` groups, `68` branches, `₹4.85 L` MRR, `1,42,800` WhatsApp msgs, `3,140` AI voice mins).
4. **Role-Based Sidebar Filtering (`O04` Permission Matrix)**
   - Clinic/Owner layout includes a **Role Switcher** (`Owner`, `Branch mgr`, `Dentist`, `Visiting`, `Assistant`, `Front desk`, `Accounts`) wired directly to the `O04` Role Permissions Matrix so each role sees and accesses only its permitted screens and actions, and every patient record view writes to the DPDP `AccessLog`.

---

## 2. Complete Inventory & Migration Mapping (`Purana Page -> Naya Screen ID -> Action`)

### A. Clinic & Owner Dashboard Routes (`src/app/(app)/c/[company]/dashboard/...`)

| Purana Route / File | Purana Purpose | Naya Screen ID | Naya Route | Action |
|---|---|---|---|---|
| `/c/[company]/dashboard` (`dashboard/page.tsx`) | PhysioYoga KPIs, Upcoming Sessions, Recent Inquiries | **C01** (`Today — front desk`) | `/c/[company]/dashboard` (alias `/today`) | **REPLACE** |
| `/c/[company]/dashboard/layout.tsx` | Generic Shadcn sidebar + floating bubble | **Shared Shell (C01–C17, O01–O05)** | `/c/[company]/dashboard/layout.tsx` | **REPLACE** |
| `/c/[company]/dashboard/_navigation/*` | Marketing, Lead Mgmt, Activity Mgmt, Physio sidebar | **PDF 5-Section Sidebar** | `_navigation/dentflow-sidebar.tsx` | **REPLACE** |
| `/c/[company]/dashboard/appointments/timeline-calendar` | FullCalendar Physio timeline | **C02** (`Chair calendar + booking`) | `/c/[company]/dashboard/calendar` (redirect old URL) | **REPLACE** |
| `/c/[company]/dashboard/appointments/sessions` | Physio session exercise/modalities tracker | **C02** | Redirect → `/c/[company]/dashboard/calendar` | **DELETE** (redirect) |
| `/c/[company]/dashboard/appointments` | Appointments index | **C02** | Redirect → `/c/[company]/dashboard/calendar` | **DELETE** (redirect) |
| `/c/[company]/dashboard/patient-management/patients` | Patient table + Physio workspace | **C03** (`Patient profile` + directory) | `/c/[company]/dashboard/patients` | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/patient-management/dental-chart` | `DentflowChart` prototype | **C04** (`Dental chart & imaging`) | `/c/[company]/dashboard/dental-chart` (keep old alias) | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/patient-management/explainer` | `DentflowExplainer` prototype | **C06** (`Treatment explainer (unique)`) | `/c/[company]/dashboard/explainers` (keep old alias) | **KEEP+RESTYLE** |
| `/c/[company]/dashboard/patient-management` | Redirect to patients | **C03** | Redirect → `/c/[company]/dashboard/patients` | **KEEP+RESTYLE** |
| *(none)* | — | **C11** (`Gap filler & waitlist (unique)`) | `/c/[company]/dashboard/gap-filler` | **CREATE NEW** |
| *(none)* | — | **C17** (`Voice AI receptionist (unique)`) | `/c/[company]/dashboard/ai-receptionist` | **CREATE NEW** |
| `/c/[company]/dashboard/activity-management/treatment-plans` | Physio therapy phases | **C05** (`Treatment plan builder`) | `/c/[company]/dashboard/treatment-plans` (redirect old URL) | **REPLACE** |
| `/c/[company]/dashboard/activity-management/exercise-prescription` | Physio exercise prescription | **C07** (`Prescription` w/ allergy block) | `/c/[company]/dashboard/prescriptions` (redirect old URL) | **REPLACE** |
| `/c/[company]/dashboard/activity-management/assessments` | Physio clinical assessments | **C04 / C08** | Redirect → `/c/[company]/dashboard/dental-chart` | **DELETE** (redirect) |
| `/c/[company]/dashboard/activity-management/ai-assesment` | AI Biomechanical ROM | **C04** | Redirect → `/c/[company]/dashboard/dental-chart` | **DELETE** (redirect) |
| `/c/[company]/dashboard/activity-management` | Activity management index | **C05** | Redirect → `/c/[company]/dashboard/treatment-plans` | **DELETE** (redirect) |
| *(none)* | — | **C08** (`Post-op monitor (unique)`) | `/c/[company]/dashboard/post-op` | **CREATE NEW** |
| `/c/[company]/dashboard/billing` (+ `/invoices`, `/payments`, `/subscriptions`) | Basic invoice/subscription list | **C09** (`Billing & payments` w/ GST, UPI QR, EMI) | `/c/[company]/dashboard/billing` (redirect subroutes) | **REPLACE** |
| `/c/[company]/dashboard/lead-management/follow-up` | Lead follow-up table | **C10** (`Unfinished treatment recovery (unique)`) | `/c/[company]/dashboard/recovery` (redirect old URL) | **REPLACE** |
| `/c/[company]/dashboard/lead-management/leads` (+ `lead-management/page.tsx`) | Generic sales leads CRM | **C10 / C12** | Redirect → `/c/[company]/dashboard/recovery` | **DELETE** (redirect) |
| `/c/[company]/dashboard/marketing/campaign` (+ `marketing/page.tsx`, `ai-ad-studio`) | Meta ad studio & marketing table | **C12** (`Recall & campaigns` + Reviews + Referrals) | `/c/[company]/dashboard/campaigns` (redirect old URLs) | **REPLACE** |
| *(none)* | — | **C13** (`Inventory & procedure profit`) | `/c/[company]/dashboard/inventory` | **CREATE NEW** |
| *(none)* | — | **C14** (`Lab cases` Kanban) | `/c/[company]/dashboard/lab-cases` | **CREATE NEW** |
| *(none)* | — | **C15** (`Sterilisation log (unique)`) | `/c/[company]/dashboard/sterilisation` | **CREATE NEW** |
| `/c/[company]/dashboard/erp/staff` | Basic staff list | **C16** (`Staff & commission` + TDS 194J) | `/c/[company]/dashboard/staff` (redirect old URL) | **REPLACE** |
| *(none)* | — | **O01** (`Group dashboard — All branches`) | `/c/[company]/dashboard/all-branches` | **CREATE NEW** |
| *(none)* | — | **O05** (`Patient insights (unique)`) | `/c/[company]/dashboard/patient-insights` | **CREATE NEW** |
| *(none)* | — | **O02** (`Visiting specialists (unique)`) | `/c/[company]/dashboard/visiting-specialists` | **CREATE NEW** |
| *(none)* | — | **O03** (`Reports & P&L`) | `/c/[company]/dashboard/reports` | **CREATE NEW** |
| `/c/[company]/dashboard/settings/integrations` | Meta integration page | **O04** (`Settings, users & roles` RBAC matrix + integrations) | `/c/[company]/dashboard/settings` (redirect old URL) | **REPLACE** |

---

### B. Patient App Routes (`P01–P13` — Mobile Web / PWA + WhatsApp)

| Purana Route / File | Purana Purpose | Naya Screen ID | Naya Route | Action |
|---|---|---|---|---|
| `/[companySlug]/patient-portal` (`(auth)/[companySlug]/patient-portal/page.tsx`) | Basic placeholder patient card | **P01–P13** (Full DentFlow Mobile PWA App) | `/[companySlug]/patient-portal` (with bottom nav + screen switcher for P01–P13) | **REPLACE** |
| `/c/[company]/home/Booking/*` | Physio multi-step booking | **P01** (`Online booking`) | Integrated in Patient PWA (`P01`) + redirect `/c/[company]/home/Booking` | **REPLACE** |
| *(none)* | — | **P02** (`WhatsApp booking bot`) | Patient PWA (`P02` interactive Hindi/EN WhatsApp simulator + live webhook) | **CREATE NEW** |
| `/c/[company]/home/page.tsx` | Physio patient home | **P03** (`Patient home`) | Integrated in Patient PWA (`P03`) + redirect `/c/[company]/home` | **REPLACE** |
| `/c/[company]/home/onboarding/page.tsx` | Basic onboarding | **P04** (`Pre-visit form & comfort`) | Integrated in Patient PWA (`P04`) | **REPLACE** |
| *(none)* | — | **P05** (`Self-assessment`) | Integrated in Patient PWA (`P05`) | **CREATE NEW** |
| *(none)* | — | **P06** (`Photo check (unique)`) | Integrated in Patient PWA (`P06`) | **CREATE NEW** |
| *(none)* | — | **P07** (`Assessment result`) | Integrated in Patient PWA (`P07`) | **CREATE NEW** |
| *(none)* | — | **P08** (`My treatment explained (unique)`) | Integrated in Patient PWA (`P08`) + public signed link `/explainer/[slug]` | **CREATE NEW** |
| *(none)* | — | **P09** (`Plan, payments & EMI`) | Integrated in Patient PWA (`P09`) | **CREATE NEW** |
| *(none)* | — | **P10** (`Records` + ABHA sharing) | Integrated in Patient PWA (`P10`) | **CREATE NEW** |
| *(none)* | — | **P11** (`Family timeline (unique)`) | Integrated in Patient PWA (`P11`) | **CREATE NEW** |
| *(none)* | — | **P12** (`Recovery check-in (unique)`) | Integrated in Patient PWA (`P12`) | **CREATE NEW** |
| *(none)* | — | **P13** (`Aligner progress (unique)`) | Integrated in Patient PWA (`P13`) | **CREATE NEW** |
| `/c/[company]/home/sessions/*` & `/home/blogs/*` | Physio video room & yoga blogs | — | Redirect → `/[companySlug]/patient-portal` | **DELETE** (redirect) |

---

### C. Partner & Super-Admin Portals (`S01`, `L01`, `A01`) & Entry Points

| Purana Route / File | Purana Purpose | Naya Screen ID | Naya Route | Action |
|---|---|---|---|---|
| *(none)* | — | **S01** (`Specialist portal`) | `/specialist` (and `/c/[company]/specialist`) | **CREATE NEW** |
| *(none)* | — | **L01** (`Dental lab portal`) | `/lab` | **CREATE NEW** |
| `/admin/dashboard` (`(admin)/admin/*`) | Generic SaaS admin panel | **A01** (`SaaS super-admin`) | `/admin/dashboard` | **REPLACE** |
| `/admin/projects` & `/admin/subscription` | Old admin subpages | **A01** | Redirect → `/admin/dashboard` | **DELETE** (redirect) |
| `/` (`src/app/page.tsx`) & `/previous-landing-page/*` | PhysioYoga marketing landing page | **DentFlow Portal Launcher + Clinic Entry** | `/` (clean DentFlow hub linking Clinic Portal, Owner View, Patient App PWA, Specialist Portal, Lab Portal, Super-Admin) | **REPLACE** |

---

## 3. Existing Reusable Components & New Shared Component Plan

| Existing File | Status | Migration Decision |
|---|---|---|
| `src/components/dental/dentflow-chart.tsx` | Exists (C04 prototype) | **KEEP+RESTYLE** — align colors to theme tokens, wire to chart versioning & backend API |
| `src/components/dental/dentflow-explainer.tsx` | Exists (C06 prototype) | **KEEP+RESTYLE** — wire doctor-approval lock, 8-language toggle, signed 30d link, backend API |
| `src/lib/mock/dentflow.ts` | Exists (partial mock data) | **EXPAND** — add complete deterministic dataset matching every number, patient, invoice, cycle, and KPI in the 38-screen PDF |
| `src/types/dental.ts` | Exists (partial types) | **EXPAND** — add full TypeScript interfaces for all 38 screens & API payloads |
| `src/components/marketing/*` & `src/app/previous-landing-page/*` | Unused PhysioYoga marketing | **DELETE** in Step 4 after routes are migrated |
| `src/components/ui/*` | Shadcn UI primitives | **KEEP** — restyle tokens in `globals.css` / `dentflow-theme.css` |

---

## 4. Final Verification Checklist (Updated in Step 5)

| Screen ID | Screen Name | Route | Implemented | Wired to Backend | Playwright Verified | Status |
|---|---|---|---|---|---|---|
| C01 | Today — front desk | `/c/[company]/dashboard` | Pending | Pending | Pending | Planned |
| C02 | Chair calendar + booking | `/c/[company]/dashboard/calendar` | Pending | Pending | Pending | Planned |
| C03 | Patient profile | `/c/[company]/dashboard/patients` | Pending | Pending | Pending | Planned |
| C04 | Dental chart & imaging | `/c/[company]/dashboard/dental-chart` | Pending | Pending | Pending | Planned |
| C05 | Treatment plan builder | `/c/[company]/dashboard/treatment-plans` | Pending | Pending | Pending | Planned |
| C06 | Treatment explainer (unique) | `/c/[company]/dashboard/explainers` | Pending | Pending | Pending | Planned |
| C07 | Prescription | `/c/[company]/dashboard/prescriptions` | Pending | Pending | Pending | Planned |
| C08 | Post-op monitor (unique) | `/c/[company]/dashboard/post-op` | Pending | Pending | Pending | Planned |
| C09 | Billing & payments | `/c/[company]/dashboard/billing` | Pending | Pending | Pending | Planned |
| C10 | Unfinished treatment recovery | `/c/[company]/dashboard/recovery` | Pending | Pending | Pending | Planned |
| C11 | Gap filler & waitlist | `/c/[company]/dashboard/gap-filler` | Pending | Pending | Pending | Planned |
| C12 | Recall & campaigns | `/c/[company]/dashboard/campaigns` | Pending | Pending | Pending | Planned |
| C13 | Inventory & procedure profit | `/c/[company]/dashboard/inventory` | Pending | Pending | Pending | Planned |
| C14 | Lab cases | `/c/[company]/dashboard/lab-cases` | Pending | Pending | Pending | Planned |
| C15 | Sterilisation log (unique) | `/c/[company]/dashboard/sterilisation` | Pending | Pending | Pending | Planned |
| C16 | Staff & commission | `/c/[company]/dashboard/staff` | Pending | Pending | Pending | Planned |
| C17 | Voice AI receptionist (unique) | `/c/[company]/dashboard/ai-receptionist` | Pending | Pending | Pending | Planned |
| O01 | Group dashboard (All branches) | `/c/[company]/dashboard/all-branches` | Pending | Pending | Pending | Planned |
| O02 | Visiting specialists (unique) | `/c/[company]/dashboard/visiting-specialists` | Pending | Pending | Pending | Planned |
| O03 | Reports & P&L | `/c/[company]/dashboard/reports` | Pending | Pending | Pending | Planned |
| O04 | Settings, users & roles | `/c/[company]/dashboard/settings` | Pending | Pending | Pending | Planned |
| O05 | Patient insights (unique) | `/c/[company]/dashboard/patient-insights` | Pending | Pending | Pending | Planned |
| P01–P13 | Patient App PWA (13 screens) | `/[companySlug]/patient-portal` | Pending | Pending | Pending | Planned |
| S01 | Specialist portal | `/specialist` | Pending | Pending | Pending | Planned |
| L01 | Dental lab portal | `/lab` | Pending | Pending | Pending | Planned |
| A01 | SaaS super-admin | `/admin/dashboard` | Pending | Pending | Pending | Planned |
