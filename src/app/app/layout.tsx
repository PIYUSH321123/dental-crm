"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { DentflowDashboardShell } from "@/components/dental/dentflow-primitives";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import { canRoleAccessAppSlug, DentflowRoleKey } from "@/lib/dentflow-theme";

function RoleAccessEnforcer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isHydrated, setActiveRole } = useDentflow();

  // Sync initial activeRole from HTTP session when entering /app/*
  useEffect(() => {
    let active = true;
    fetch("/api/dentflow/session")
      .then((r) => r.json())
      .then((data) => {
        if (!active || !data?.session?.staffRoleKey) return;
        const roleKey = data.session.staffRoleKey as DentflowRoleKey;
        if (roleKey !== "Owner") {
          setActiveRole(roleKey);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [setActiveRole]);

  // Enforce role permissions against current route & Settings > Users & roles matrix
  useEffect(() => {
    if (!isHydrated || !pathname) return;
    if (!canRoleAccessAppSlug(state.activeRole, pathname, state.rolePermissions)) {
      toast.error(`${state.activeRole} role does not have access to this page.`);
      router.replace("/app/today");
    }
  }, [isHydrated, pathname, state.activeRole, state.rolePermissions, router]);

  return <DentflowDashboardShell>{children}</DentflowDashboardShell>;
}

export default function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DentflowProvider>
      <RoleAccessEnforcer>{children}</RoleAccessEnforcer>
    </DentflowProvider>
  );
}

