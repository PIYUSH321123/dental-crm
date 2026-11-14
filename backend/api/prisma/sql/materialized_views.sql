-- Owner & Multi-Clinic Materialised Views (O01, O03, O05)
-- Execute via `psql` or NestJS migration/bootstrap after Prisma schema push/migrate.

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_branch_kpis AS
SELECT
  b.id AS branch_id,
  b."groupId" AS group_id,
  b.name AS branch_name,
  COALESCE(SUM(CASE WHEN i.status IN ('PAID', 'PART_PAID') THEN i."paidAmount" ELSE 0 END), 0) AS revenue,
  COUNT(DISTINCT p.id) AS total_patients,
  COUNT(DISTINCT CASE WHEN a.status = 'NO_SHOW' THEN a.id END)::float /
    NULLIF(COUNT(DISTINCT a.id), 0) AS no_show_rate,
  COALESCE(SUM(CASE WHEN tp.status IN ('PROPOSED', 'ACCEPTED', 'IN_PROGRESS') THEN tp."balanceAmount" ELSE 0 END), 0) AS unfinished_treatment_value,
  COALESCE(AVG(r.rating), 0) AS avg_rating,
  NOW() AS refreshed_at
FROM "Branch" b
LEFT JOIN "Patient" p ON p."homeBranchId" = b.id AND p."deletedAt" IS NULL
LEFT JOIN "Appointment" a ON a."branchId" = b.id AND a."deletedAt" IS NULL
LEFT JOIN "Invoice" i ON i."branchId" = b.id AND i."deletedAt" IS NULL
LEFT JOIN "TreatmentPlan" tp ON tp."branchId" = b.id AND tp."deletedAt" IS NULL
LEFT JOIN "PatientFeedbackReview" r ON r."branchId" = b.id
WHERE b."deletedAt" IS NULL
GROUP BY b.id, b."groupId", b.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_branch_kpis_branch_id ON mv_branch_kpis (branch_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_branch_pnl AS
SELECT
  b.id AS branch_id,
  b."groupId" AS group_id,
  b.name AS branch_name,
  TO_CHAR(COALESCE(i."issuedAt", NOW()), 'YYYY-MM') AS month,
  COALESCE(SUM(CASE WHEN i.type = 'INVOICE' AND i.status IN ('PAID', 'PART_PAID') THEN i."paidAmount" ELSE 0 END), 0) AS revenue,
  COALESCE((SELECT SUM(lc."labCost") FROM "LabCase" lc WHERE lc."branchId" = b.id AND lc."deletedAt" IS NULL), 0) AS lab_costs,
  COALESCE((SELECT SUM(it.quantity * it."unitCost") FROM "InventoryTransaction" it WHERE it."branchId" = b.id AND it.type = 'DEDUCT_PROCEDURE'), 0) AS consumables,
  COALESCE((SELECT SUM(cle."netPayable") FROM "CommissionLedgerEntry" cle WHERE cle."branchId" = b.id), 0) AS doctor_payouts,
  COALESCE((SELECT SUM(be.amount) FROM "BranchExpense" be WHERE be."branchId" = b.id), 0) AS operating_expenses
FROM "Branch" b
LEFT JOIN "Invoice" i ON i."branchId" = b.id AND i."deletedAt" IS NULL
WHERE b."deletedAt" IS NULL
GROUP BY b.id, b."groupId", b.name, TO_CHAR(COALESCE(i."issuedAt", NOW()), 'YYYY-MM');

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_patient_retention AS
SELECT
  p."groupId" AS group_id,
  p."homeBranchId" AS branch_id,
  COUNT(*) AS total_patients,
  COUNT(*) FILTER (WHERE p."visitsCount" >= 2) AS returning_patients,
  ROUND((COUNT(*) FILTER (WHERE p."visitsCount" >= 2)::numeric / NULLIF(COUNT(*), 0)) * 100, 1) AS retention_pct,
  COALESCE(AVG(p."visitsCount"), 0) AS avg_visits_per_patient
FROM "Patient" p
WHERE p."deletedAt" IS NULL
GROUP BY p."groupId", p."homeBranchId";

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_treatment_dropoff_funnel AS
SELECT
  tp."groupId" AS group_id,
  tp."branchId" AS branch_id,
  COUNT(*) AS proposed_count,
  COUNT(*) FILTER (WHERE tp.status IN ('ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REVIEW')) AS accepted_count,
  COUNT(*) FILTER (WHERE tp.status IN ('IN_PROGRESS', 'COMPLETED', 'REVIEW')) AS started_count,
  COUNT(*) FILTER (WHERE tp.status IN ('COMPLETED', 'REVIEW')) AS completed_count
FROM "TreatmentPlan" tp
WHERE tp."deletedAt" IS NULL
GROUP BY tp."groupId", tp."branchId";

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_loyal_patients AS
SELECT
  p.id AS patient_id,
  p."groupId" AS group_id,
  p."homeBranchId" AS branch_id,
  p.name,
  p."familyGroupId" AS family_group_id,
  p."visitsCount" AS visits_count,
  p."lifetimeValue" AS lifetime_value,
  p."referredCount" AS referred_count,
  p."createdAt" AS member_since
FROM "Patient" p
WHERE p."deletedAt" IS NULL
ORDER BY p."lifetimeValue" DESC, p."visitsCount" DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_loyal_patients_id ON mv_loyal_patients (patient_id);

