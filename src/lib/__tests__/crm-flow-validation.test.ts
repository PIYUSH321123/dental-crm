import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSafeInternalRedirect } from "../../proxy.ts";
import { canRoleAccessAppSlug } from "../dentflow-theme.ts";
import { getDefaultRedirectForSession, staffRoleKeyToAuthRole } from "../dentflow-session.ts";

describe("CRM Flow Validation & Security", () => {
  describe("getDefaultRedirectForSession", () => {
    it("redirects authenticated owner to clinical dashboard /Dashboard/today instead of group dashboard", () => {
      assert.equal(
        getDefaultRedirectForSession({
          userId: "usr-1",
          name: "Dr. Kavita Sharma",
          role: "owner",
          setupCompleted: true,
        }),
        "/Dashboard/today"
      );
    });

    it("redirects unconfigured owner to setup wizard", () => {
      assert.equal(
        getDefaultRedirectForSession({
          userId: "usr-1",
          name: "Dr. Kavita Sharma",
          role: "owner",
          setupCompleted: false,
        }),
        "/setup"
      );
    });

    it("redirects clinical staff to dashboard /Dashboard/today", () => {
      assert.equal(
        getDefaultRedirectForSession({
          userId: "usr-2",
          name: "Dr. Arjun Mehta",
          role: "dentist",
          setupCompleted: true,
        }),
        "/Dashboard/today"
      );
    });
  });

  describe("staffRoleKeyToAuthRole", () => {
    it("maps UI staff roles correctly to auth roles", () => {
      assert.equal(staffRoleKeyToAuthRole("Owner"), "owner");
      assert.equal(staffRoleKeyToAuthRole("Branch mgr"), "branch_manager");
      assert.equal(staffRoleKeyToAuthRole("Dentist"), "dentist");
      assert.equal(staffRoleKeyToAuthRole("Front desk"), "front_desk");
      assert.equal(staffRoleKeyToAuthRole("Assistant"), "assistant");
      assert.equal(staffRoleKeyToAuthRole("Accounts"), "accounts");
    });
  });

  describe("getSafeInternalRedirect", () => {
    it("permits safe relative internal paths", () => {
      assert.equal(getSafeInternalRedirect("/Dashboard/today"), "/Dashboard/today");
      assert.equal(getSafeInternalRedirect("/app/today"), "/app/today");
      assert.equal(getSafeInternalRedirect("/app/dental-chart"), "/app/dental-chart");
      assert.equal(getSafeInternalRedirect("/admin/clinics"), "/admin/clinics");
      assert.equal(getSafeInternalRedirect("/c/smile-studio"), "/c/smile-studio");
    });

    it("blocks open redirects and protocol-relative attempts", () => {
      assert.equal(getSafeInternalRedirect("https://attacker.com"), null);
      assert.equal(getSafeInternalRedirect("http://evil.com/phish"), null);
      assert.equal(getSafeInternalRedirect("//attacker.com"), null);
      assert.equal(getSafeInternalRedirect("/\\attacker.com"), null);
      assert.equal(getSafeInternalRedirect("javascript:alert(1)"), null);
      assert.equal(getSafeInternalRedirect(""), null);
      assert.equal(getSafeInternalRedirect(null), null);
      assert.equal(getSafeInternalRedirect(undefined), null);
    });
  });

  describe("canRoleAccessAppSlug RBAC", () => {
    it("allows Owner role full access to all clinical, financial and operational routes", () => {
      assert.equal(canRoleAccessAppSlug("Owner", "/app/today"), true);
      assert.equal(canRoleAccessAppSlug("Owner", "/app/group-dashboard"), true);
      assert.equal(canRoleAccessAppSlug("Owner", "/app/dental-chart"), true);
      assert.equal(canRoleAccessAppSlug("Owner", "/app/prescriptions"), true);
      assert.equal(canRoleAccessAppSlug("Owner", "/app/staff-commission"), true);
      assert.equal(canRoleAccessAppSlug("Owner", "/app/reports"), true);
    });

    it("restricts Dentist from accessing staff commission and P&L reports", () => {
      assert.equal(canRoleAccessAppSlug("Dentist", "/app/dental-chart"), true);
      assert.equal(canRoleAccessAppSlug("Dentist", "/app/prescriptions"), true);
      assert.equal(canRoleAccessAppSlug("Dentist", "/app/treatment-plans"), true);
      assert.equal(canRoleAccessAppSlug("Dentist", "/app/staff-commission"), false);
      assert.equal(canRoleAccessAppSlug("Dentist", "/app/reports"), false);
    });

    it("restricts Accounts role from clinical prescription drafting", () => {
      assert.equal(canRoleAccessAppSlug("Accounts", "/app/billing"), true);
      assert.equal(canRoleAccessAppSlug("Accounts", "/app/reports"), true);
      assert.equal(canRoleAccessAppSlug("Accounts", "/app/prescriptions"), false);
      assert.equal(canRoleAccessAppSlug("Accounts", "/app/dental-chart"), false);
    });
  });
});
