"use client";

import * as React from "react";
import { DentflowProvider } from "@/lib/dentflow-store";
import { DentflowDashboardShell } from "@/components/dental/dentflow-primitives";

export default function CompanyDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DentflowProvider>
      <DentflowDashboardShell>{children}</DentflowDashboardShell>
    </DentflowProvider>
  );
}
