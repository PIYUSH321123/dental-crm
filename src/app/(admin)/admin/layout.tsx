import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DentFlow · Platform Admin",
  description: "DentFlow SaaS super-admin console",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
