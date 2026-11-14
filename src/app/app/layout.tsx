"use client";

import React, { useEffect } from "react";
import { DentflowDashboardShell } from "@/components/dental/dentflow-primitives";
import { DentflowProvider, useDentflow } from "@/lib/dentflow-store";
import { DentflowRoleKey } from "@/lib/dentflow-theme";

function RoleAccessEnforcer({ children }: { children: React.ReactNode }) {
  const { setActiveRole } = useDentflow();

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

  return <DentflowDashboardShell>{children}</DentflowDashboardShell>;
}

export default function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DentflowProvider>
      <RoleAccessEnforcer>{children}</RoleAccessEnforcer>
    </DentflowProvider>
  );
}

