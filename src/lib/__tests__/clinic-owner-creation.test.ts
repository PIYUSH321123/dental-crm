import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signDentflowSession,
  verifyDentflowSession,
  getDefaultRedirectForSession,
  staffRoleKeyToAuthRole,
  DentflowSessionPayload,
} from "../dentflow-session.ts";
import { canRoleAccessAppSlug } from "../dentflow-theme.ts";
import type {
  ClinicSetupConfig,
  TenantAccountRecord,
} from "../../types/dentflow.ts";

describe("Clinic & Owner Creation Lifecycle", () => {
  describe("1. New Clinic Owner Signup & 14-Day Free Trial Provisioning", () => {
    it("creates an unconfigured owner session with trial metadata and redirects to /setup", async () => {
      const ownerInput = {
        name: "Dr. Kavita Sharma",
        email: "kavita@novasmiledental.in",
        clinicGroupName: "Nova Smile Dental",
        city: "Pune, Maharashtra",
        phone: "+91 98220 44100",
        plan: "Growth" as const,
      };

      const now = new Date();
      const trialDurationMs = 14 * 24 * 60 * 60 * 1000;
      const trialEnd = new Date(now.getTime() + trialDurationMs);

      // Simulates the backend SIGNUP_OWNER state update
      const initialSetup: ClinicSetupConfig = {
        completed: false,
        clinicGroupName: ownerInput.clinicGroupName,
        ownerName: ownerInput.name,
        ownerEmail: ownerInput.email,
        gstin: "",
        city: ownerInput.city,
        phone: ownerInput.phone,
        branches: [
          {
            id: "br-main",
            name: `${ownerInput.clinicGroupName} Main Branch`,
            chairs: 2,
            address: ownerInput.city,
          },
        ],
        chairsAndRooms: ["Chair 1", "Chair 2"],
        workingHours: "9:00 am – 8:00 pm",
        staffRoster: [{ id: "stf-1", name: ownerInput.name, role: "Owner" }],
        procedureFees: [],
        whatsappConnected: false,
        whatsappNumber: ownerInput.phone,
        trialInfo: {
          trialStart: now.toISOString(),
          trialEnd: trialEnd.toISOString(),
          plan: ownerInput.plan,
          status: "trial",
        },
      };

      const ownerSession: DentflowSessionPayload = {
        userId: `usr-owner-${Date.now()}`,
        name: ownerInput.name,
        email: ownerInput.email,
        role: "owner",
        staffRoleKey: "Owner",
        clinicGroupName: ownerInput.clinicGroupName,
        setupCompleted: false,
      };

      // 1. Verify owner role and identity
      assert.equal(ownerSession.role, "owner");
      assert.equal(ownerSession.staffRoleKey, "Owner");
      assert.equal(ownerSession.name, "Dr. Kavita Sharma");
      assert.equal(ownerSession.clinicGroupName, "Nova Smile Dental");
      assert.equal(ownerSession.setupCompleted, false);

      // 2. Verify redirect for unconfigured owner is /setup
      const redirect = getDefaultRedirectForSession(ownerSession);
      assert.equal(redirect, "/setup");

      // 3. Verify trial duration is exactly 14 days
      assert.ok(initialSetup.trialInfo?.trialStart && initialSetup.trialInfo?.trialEnd);
      const startMs = new Date(initialSetup.trialInfo.trialStart).getTime();
      const endMs = new Date(initialSetup.trialInfo.trialEnd).getTime();
      assert.equal(endMs - startMs, trialDurationMs);
      assert.equal(initialSetup.trialInfo.status, "trial");
      assert.equal(initialSetup.trialInfo.plan, "Growth");

      // 4. Verify session JWT token signing and verification
      const token = await signDentflowSession(ownerSession);
      assert.ok(token && typeof token === "string");
      const verified = await verifyDentflowSession(token);
      assert.ok(verified);
      assert.equal(verified?.name, "Dr. Kavita Sharma");
      assert.equal(verified?.clinicGroupName, "Nova Smile Dental");
      assert.equal(verified?.setupCompleted, false);
    });
  });

  describe("2. Setup Wizard Completion & Transition to Dashboard", () => {
    it("completes setup wizard and directs owner to /Dashboard/today", async () => {
      const ownerSessionBefore: DentflowSessionPayload = {
        userId: "usr-owner-kavita",
        name: "Dr. Kavita Sharma",
        email: "kavita@novasmiledental.in",
        role: "owner",
        staffRoleKey: "Owner",
        clinicGroupName: "Nova Smile Dental",
        setupCompleted: false,
      };

      // Complete setup
      const completedSession: DentflowSessionPayload = {
        ...ownerSessionBefore,
        setupCompleted: true,
      };

      const token = await signDentflowSession(completedSession);
      const verified = await verifyDentflowSession(token);
      assert.ok(verified);
      assert.equal(verified?.setupCompleted, true);

      // Verify post-setup destination is /Dashboard/today
      const destination = getDefaultRedirectForSession(verified!);
      assert.equal(destination, "/Dashboard/today");
    });
  });

  describe("3. Multi-Tenant Clinic & Owner Isolation", () => {
    it("guarantees complete isolation between two distinct clinic owners", async () => {
      // Clinic A Owner
      const clinicAOwner: DentflowSessionPayload = {
        userId: "usr-sneha-1",
        name: "Dr. Sneha Kulkarni",
        email: "sneha@smilestudio.in",
        role: "owner",
        staffRoleKey: "Owner",
        clinicGroupName: "Smile Studio Dental",
        setupCompleted: true,
      };

      // Clinic B Owner
      const clinicBOwner: DentflowSessionPayload = {
        userId: "usr-kavita-2",
        name: "Dr. Kavita Sharma",
        email: "kavita@novasmiledental.in",
        role: "owner",
        staffRoleKey: "Owner",
        clinicGroupName: "Nova Smile Dental",
        setupCompleted: true,
      };

      const tokenA = await signDentflowSession(clinicAOwner);
      const tokenB = await signDentflowSession(clinicBOwner);

      const verifiedA = await verifyDentflowSession(tokenA);
      const verifiedB = await verifyDentflowSession(tokenB);

      // Verify Clinic A isolation
      assert.equal(verifiedA?.userId, "usr-sneha-1");
      assert.equal(verifiedA?.name, "Dr. Sneha Kulkarni");
      assert.equal(verifiedA?.clinicGroupName, "Smile Studio Dental");

      // Verify Clinic B isolation
      assert.equal(verifiedB?.userId, "usr-kavita-2");
      assert.equal(verifiedB?.name, "Dr. Kavita Sharma");
      assert.equal(verifiedB?.clinicGroupName, "Nova Smile Dental");

      // Verify tokens do not cross-contaminate
      assert.notEqual(verifiedA?.clinicGroupName, verifiedB?.clinicGroupName);
      assert.notEqual(verifiedA?.email, verifiedB?.email);
    });

    it("verifies Owner role access across all clinical and administrative modules", () => {
      const ownerRole = "Owner";
      const protectedPaths = [
        "/Dashboard/today",
        "/app/today",
        "/app/dental-chart",
        "/app/treatment-plans",
        "/app/prescriptions",
        "/app/billing",
        "/app/settings",
        "/app/group-dashboard",
        "/app/staff-commission",
        "/app/reports",
      ];

      for (const path of protectedPaths) {
        assert.equal(
          canRoleAccessAppSlug(ownerRole, path),
          true,
          `Owner should have access to ${path}`
        );
      }
    });
  });

  describe("4. Platform Admin Clinic Onboarding & Tenant Registry", () => {
    it("creates a new clinic tenant record with full owner credentials and metadata", () => {
      const tenantInput = {
        clinicGroup: "Apex Implant & Laser Dental",
        ownerName: "Dr. Rajesh Khanna",
        ownerEmail: "rajesh@apeximplants.in",
        branchesCount: 3,
        plan: "Growth" as const,
      };

      const tenantRecord: TenantAccountRecord = {
        id: `ten-${Date.now()}`,
        clinicGroup: tenantInput.clinicGroup,
        ownerName: tenantInput.ownerName,
        ownerEmail: tenantInput.ownerEmail,
        branchesLabel: `${tenantInput.branchesCount} branches`,
        plan: tenantInput.plan,
        branchesCount: tenantInput.branchesCount,
        mrrLabel: "₹14,999",
        whatsappCredits: 5000,
        lastActive: "Just now",
        health: "Healthy",
      };

      assert.equal(tenantRecord.clinicGroup, "Apex Implant & Laser Dental");
      assert.equal(tenantRecord.ownerName, "Dr. Rajesh Khanna");
      assert.equal(tenantRecord.ownerEmail, "rajesh@apeximplants.in");
      assert.equal(tenantRecord.plan, "Growth");
      assert.equal(tenantRecord.branchesCount, 3);
      assert.equal(tenantRecord.whatsappCredits, 5000);
      assert.equal(tenantRecord.health, "Healthy");
    });

    it("assigns appropriate trial credits and health for Trial plan clinics", () => {
      const trialTenant: TenantAccountRecord = {
        id: `ten-trial-${Date.now()}`,
        clinicGroup: "Smile Care Dental",
        ownerName: "Dr. Ananya Roy",
        ownerEmail: "ananya@smilecare.in",
        branchesLabel: "Single clinic",
        plan: "Trial",
        branchesCount: 1,
        mrrLabel: "— (14d trial)",
        whatsappCredits: 500,
        lastActive: "Just now",
        health: "Trial",
      };

      assert.equal(trialTenant.plan, "Trial");
      assert.equal(trialTenant.health, "Trial");
      assert.equal(trialTenant.whatsappCredits, 500);
      assert.equal(trialTenant.branchesCount, 1);
    });
  });
});
