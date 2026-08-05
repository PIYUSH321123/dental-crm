import * as React from "react";
import type { Metadata } from "next";

// UI Components
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// App Components
import { AppSidebar } from "@/app/(admin)/admin/_navigation/app-sidebar"

export const metadata: Metadata = {
  title: "Sales Guru",
  description: "Sales Guru Application",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-slate-50 dark:bg-slate-950">
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
