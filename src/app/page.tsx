"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { checkCompanyExistsAction } from "@/lib/actions/companies";
import { toast } from "sonner";
import { ArrowRight, Sparkles, Building2, Shield, LayoutDashboard, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SalesGuruPortal() {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePortalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;

    setLoading(true);
    try {
      const exists = await checkCompanyExistsAction(slug.trim());
      if (exists) {
        toast.success(`Redirecting to ${slug} clinic portal...`);
        router.push(`/c/${slug.toLowerCase().trim()}/home`);
      } else {
        toast.error("Company slug not found. Try 'yogaplus', 'stark', 'wayne', or 'hooli'!");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white overflow-hidden relative">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-600/30">
            SG
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Sales Guru
          </span>
        </div>
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 hover:bg-slate-900"
          onClick={() => router.push("/admin/login")}
        >
          <Shield className="h-4 w-4 text-emerald-500" />
          <span>Super Admin Access</span>
        </Button>
      </header>

      {/* Hero & Portal Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: CRM Intro */}
        <div className="space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Clinic CRM Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Supercharge your clinic sales & patient management
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Sales Guru is the ultimate white-labeled CRM software designed specifically for physiotherapy centers, medical clinics, and wellness studios. Manage patient care, lead pipelines, treatment campaigns, and athletic performance training in a unified, premium interface.
          </p>

          {/* CRM Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Patient Portals</h4>
                <p className="text-xs text-slate-500 mt-0.5">Custom white-labeled portals for every clinic brand.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Lead Pipelines</h4>
                <p className="text-xs text-slate-500 mt-0.5">Convert enquiries to consultations with smart pipelines.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Access & Login */}
        <div className="flex justify-center">
          <Card className="w-full max-w-[450px] bg-slate-950/70 border-slate-900 backdrop-blur-xl shadow-2xl shadow-emerald-950/20">
            <CardHeader className="pb-4">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-500 mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Clinic Portal Access</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Enter your company or clinic slug below to access your customized CRM workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePortalSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="slug" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Clinic Slug / URL Name
                  </label>
                  <div className="relative">
                    <Input
                      id="slug"
                      placeholder="e.g. yogaplus, stark, hooli"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="bg-slate-900/50 border-slate-800 focus-visible:ring-emerald-600 text-white placeholder:text-slate-600 pr-12 h-11 rounded-lg"
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-600 select-none">
                      .sales-guru.com
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 gap-1.5 font-medium rounded-lg" disabled={loading}>
                  {loading ? "Verifying..." : "Access Workspace"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Demo Section */}
              <div className="pt-4 border-t border-slate-900 text-center">
                <p className="text-xs text-slate-500">
                  New here? Access using one of our demo slugs:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  {["yogaplus", "stark", "wayne", "hooli"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSlug(d)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors animate-fade-in"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950/50">
        &copy; {new Date().getFullYear()} Sales Guru CRM. All rights reserved.
      </footer>
    </div>
  );
}
