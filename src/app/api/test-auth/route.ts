import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, comparePassword, signJWT, verifyJWT } from "@/lib/auth-server";

// Import route handlers to test them directly in-memory
import { POST as adminLoginHandler } from "@/app/api/admin/login/route";
import { POST as createCompanyHandler } from "@/app/api/admin/companies/route";
import { POST as companyLoginHandler } from "@/app/api/auth/login/route";
import { POST as patientLoginHandler } from "@/app/api/auth/patient-login/route";
import { POST as assignRoleHandler } from "@/app/api/auth/assign-role/route";

export async function GET() {
  const log: string[] = [];
  try {
    log.push("Starting Auth API Integration Tests...");

    // 1. Test Password Hashing and Comparison
    const rawPassword = "SecurePassword123!";
    const hashed = await hashPassword(rawPassword);
    log.push("Password hashed successfully");

    const matches = await comparePassword(rawPassword, hashed);
    const fails = await comparePassword("wrong_password", hashed);
    if (!matches || fails) {
      throw new Error("Password verification logic failed");
    }
    log.push("Password verification matches and fails correctly");

    // 2. Test JWT Signing and Verification
    const payload = { testId: "12345", role: "TEST_ROLE" };
    const token = await signJWT(payload, "1h");
    log.push("JWT signed successfully");

    const verifiedPayload = await verifyJWT(token);
    if (!verifiedPayload || verifiedPayload.testId !== "12345") {
      throw new Error("JWT verification logic failed");
    }
    log.push("JWT verified and decrypted payload correctly");

    // Cleanup existing test records to ensure clean run
    log.push("Cleaning up previous test database records...");
    await db.platformUser.deleteMany({ where: { email: "test-superadmin@platform.com" } }).catch(() => {});
    await db.platformRole.deleteMany({ where: { name: "SUPER_ADMIN" } }).catch(() => {});
    
    // We also need to delete company-level records. We delete the test company and all relations cascade.
    const testCompany = await db.company.findUnique({ where: { slug: "test-clinic" } });
    if (testCompany) {
      await db.company.delete({ where: { id: testCompany.id } });
    }
    log.push("Database cleanup complete");

    // 3. Seed Super Admin
    log.push("Seeding PlatformRole SUPER_ADMIN and PlatformUser...");
    let superAdminRole = await db.platformRole.findFirst({
      where: { name: "SUPER_ADMIN" },
    });
    if (!superAdminRole) {
      superAdminRole = await db.platformRole.create({
        data: {
          name: "SUPER_ADMIN",
          description: "Super Administrator of the platform",
        },
      });
    }

    const hashedSuperAdminPass = await hashPassword("superadminpass123");
    const superAdminUser = await db.platformUser.create({
      data: {
        name: "Test Super Admin",
        email: "test-superadmin@platform.com",
        password: hashedSuperAdminPass,
        roleId: superAdminRole.id,
      },
    });
    log.push(`Super Admin user created: ${superAdminUser.email}`);

    // 4. Test Super Admin Login Endpoint
    log.push("Testing Super Admin Login Endpoint...");
    const loginReq = new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test-superadmin@platform.com",
        password: "superadminpass123",
      }),
    });
    const loginRes = await adminLoginHandler(loginReq);
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error("Super Admin Login API failed: " + JSON.stringify(loginData));
    }
    log.push("Super Admin Login API succeeded");

    // Extract cookie from response headers
    const cookieHeader = loginRes.headers.get("set-cookie");
    if (!cookieHeader || !cookieHeader.includes("admin_session")) {
      throw new Error("Super Admin Login did not return 'admin_session' cookie");
    }
    const adminSessionToken = cookieHeader.split("admin_session=")[1].split(";")[0];
    log.push("Super Admin admin_session cookie extracted");

    // 5. Test Company Creation by Super Admin (requires admin_session cookie)
    log.push("Testing Company Creation Endpoint...");
    const createCompanyReq = new Request("http://localhost/api/admin/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `admin_session=${adminSessionToken}`,
      },
      body: JSON.stringify({
        name: "Test Clinic",
        slug: "test-clinic",
        email: "testclinic@example.com",
        phone: "555-0199",
        admin: {
          name: "Test Clinic Admin",
          email: "admin@testclinic.com",
          password: "clinicadminpass123",
        },
        accessConfig: {
          marketing: true,
          appointments: true,
          billing: false,
          patientManagement: true,
          leadManagement: false,
          activityManagement: true,
        },
      }),
    });
    const createCompanyRes = await createCompanyHandler(createCompanyReq);
    const createCompanyData = await createCompanyRes.json();
    if (!createCompanyRes.ok || !createCompanyData.success) {
      throw new Error("Company Creation API failed: " + JSON.stringify(createCompanyData));
    }
    log.push("Company Creation API succeeded");
    const companyId = createCompanyData.company.id;
    const companySlug = createCompanyData.company.slug;
    const companyAdminId = createCompanyData.admin.id;

    // Check if CompanyAccessConfig was created successfully
    const config = await db.companyAccessConfig.findUnique({
      where: { companyId },
    });
    if (!config || !config.marketing || !config.appointments || config.billing) {
      throw new Error("Company Access Configuration values not saved correctly: " + JSON.stringify(config));
    }
    log.push("CompanyAccessConfig validated successfully in Database");

    // 6. Test Company Admin Login Endpoint
    log.push("Testing Company Admin Login Endpoint...");
    const compLoginReq = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@testclinic.com",
        password: "clinicadminpass123",
        companySlug: "test-clinic",
      }),
    });
    const compLoginRes = await companyLoginHandler(compLoginReq);
    const compLoginData = await compLoginRes.json();
    if (!compLoginRes.ok || !compLoginData.success) {
      throw new Error("Company Admin Login API failed: " + JSON.stringify(compLoginData));
    }
    log.push("Company Admin Login API succeeded");

    const compCookieHeader = compLoginRes.headers.get("set-cookie");
    if (!compCookieHeader || !compCookieHeader.includes("session")) {
      throw new Error("Company Admin Login did not return 'session' cookie");
    }
    const sessionTokenVal = compCookieHeader.split("session=")[1].split(";")[0];
    log.push("Company session cookie extracted");

    // 7. Create a staff user and verify Role Assignment
    log.push("Testing Role Assignment Endpoint...");
    // Let's create a staff user directly under the company
    const hashedStaffPass = await hashPassword("staffpass123");
    const staffUser = await db.user.create({
      data: {
        name: "Test Staff",
        email: "staff@testclinic.com",
        password: hashedStaffPass,
        role: "STAFF",
        companyId,
      },
    });
    log.push(`Test Staff user created in DB: ${staffUser.email}`);

    // Call assign-role to promote staff to COMPANY_ADMIN
    const assignRoleReq = new Request("http://localhost/api/auth/assign-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `session=${sessionTokenVal}`, // Authenticated as Company Admin
      },
      body: JSON.stringify({
        targetUserId: staffUser.id,
        newRole: "COMPANY_ADMIN",
      }),
    });
    const assignRoleRes = await assignRoleHandler(assignRoleReq);
    const assignRoleData = await assignRoleRes.json();
    if (!assignRoleRes.ok || !assignRoleData.success) {
      throw new Error("Role Assignment API failed: " + JSON.stringify(assignRoleData));
    }
    log.push("Role Assignment API succeeded");

    // Verify change in DB
    const updatedStaff = await db.user.findUnique({ where: { id: staffUser.id } });
    if (!updatedStaff || updatedStaff.role !== "COMPANY_ADMIN") {
      throw new Error("Role was not updated in database: " + JSON.stringify(updatedStaff));
    }
    log.push("Role updated successfully in Database");

    // 8. Create a patient and verify Patient Login
    log.push("Testing Patient Login Endpoint...");
    const hashedPatientPass = await hashPassword("patientpass123");
    const patient = await db.patient.create({
      data: {
        name: "Test Patient",
        dob: new Date("1990-01-01"),
        gender: "Female",
        mobile: "9876543210",
        email: "patient@example.com",
        password: hashedPatientPass,
        companyId,
      },
    });
    log.push(`Test Patient created in DB: ${patient.name}`);

    // Call patient-login
    const patLoginReq = new Request("http://localhost/api/auth/patient-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrMobile: "9876543210",
        password: "patientpass123",
        companySlug: "test-clinic",
      }),
    });
    const patLoginRes = await patientLoginHandler(patLoginReq);
    const patLoginData = await patLoginRes.json();
    if (!patLoginRes.ok || !patLoginData.success) {
      throw new Error("Patient Login API failed: " + JSON.stringify(patLoginData));
    }
    log.push("Patient Login API succeeded");

    const patCookieHeader = patLoginRes.headers.get("set-cookie");
    if (!patCookieHeader || !patCookieHeader.includes("patient_session")) {
      throw new Error("Patient Login did not return 'patient_session' cookie");
    }
    log.push("Patient session cookie extracted successfully");

    log.push("ALL TESTS COMPLETED SUCCESSFULLY!");
    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("Test execution failed:", error);
    log.push("TEST FAILED: " + error.message);
    return NextResponse.json({ success: false, log, error: error.message }, { status: 500 });
  }
}
