import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCompanyBySlug } from "@/lib/companies";
import { CompanyLoginForm } from "@/components/auth/company-login-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}): Promise<Metadata> {
  const { companySlug } = await params;
  const company = await getCompanyBySlug(companySlug);
  return { title: company ? `Sign in · ${company.name}` : "Sign in" };
}

export default async function CompanyLoginPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const company = await getCompanyBySlug(companySlug);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Branding panel — dynamic per company */}
      <div
        className="hidden md:flex flex-col justify-between p-10 text-white"
        style={{ backgroundColor: company.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/90 flex items-center justify-center text-sm font-semibold text-slate-800">
            {company.name.charAt(0)}
          </div>
          <span className="font-medium">{company.name}</span>
        </div>

        <div>
          <p className="text-2xl font-medium mb-3">Staff portal</p>
          <p className="text-sm text-white/80 leading-relaxed max-w-sm">
            {company.tagline}
          </p>
        </div>

        <p className="text-xs text-white/60">Powered by PhysioYoga CRM</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 md:px-16 py-12 bg-background">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with your staff credentials.
          </p>

          <CompanyLoginForm
            companySlug={company.slug}
            companyName={company.name}
            primaryColor={company.primaryColor}
          />
        </div>
      </div>
    </div>
  );
}
