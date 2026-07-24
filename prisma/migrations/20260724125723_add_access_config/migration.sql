-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "password" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "CompanyAccessConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "appointments" BOOLEAN NOT NULL DEFAULT false,
    "billing" BOOLEAN NOT NULL DEFAULT false,
    "patientManagement" BOOLEAN NOT NULL DEFAULT false,
    "leadManagement" BOOLEAN NOT NULL DEFAULT false,
    "activityManagement" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAccessConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAccessConfig_companyId_key" ON "CompanyAccessConfig"("companyId");

-- AddForeignKey
ALTER TABLE "CompanyAccessConfig" ADD CONSTRAINT "CompanyAccessConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
