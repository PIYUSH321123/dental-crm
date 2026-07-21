"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Shield, Lock, CheckCircle2, Info, ChevronRight, HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default function MetaMockAuthPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const companySlug = (Array.isArray(params.company) ? params.company[0] : params.company) || "clinic"
  const formattedCompany = companySlug.charAt(0).toUpperCase() + companySlug.slice(1)

  const handleCancel = () => {
    router.push(`/c/${companySlug}/dashboard/settings/integrations?error=user_cancelled_mock_auth`)
  }

  const handleConfirm = () => {
    // Redirect to the callback route with a mock code and state
    router.push(`/api/integrations/meta/callback?code=mock_code_${Math.random().toString(36).substring(2, 9)}&state=${companySlug}`)
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 flex flex-col justify-between font-sans">
      {/* Header Bar */}
      <header className="bg-[#1877f2] dark:bg-indigo-950/40 text-white px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
          </svg>
          <span className="font-bold text-lg tracking-tight">Meta for Developers</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold opacity-90">
          <span>Sandbox Mode</span>
          <button onClick={handleCancel} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-lg border border-slate-200 dark:border-slate-850 shadow-xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
          {/* Header Info */}
          <CardHeader className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 p-6 flex flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
              SG
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                Sales Guru Integration
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                is requesting access to link with <span className="font-semibold text-slate-700 dark:text-slate-250">{formattedCompany}</span>
              </CardDescription>
            </div>
          </CardHeader>

          {/* Body Consent Details */}
          <CardContent className="p-6 space-y-6">
            {/* Meta Alert */}
            <div className="bg-[#e7f3ff] dark:bg-indigo-950/40 border border-[#1877f2]/20 rounded-lg p-3.5 flex gap-3 text-xs text-[#0e3b6c] dark:text-indigo-300">
              <Info className="h-4 w-4 text-[#1877f2] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Local Developer Sandbox:</strong> You are currently executing a simulated OAuth2 workflow. Clicking confirm will generate a mock credential and securely save it in your database configuration for company <strong>{companySlug}</strong>.
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Permission Scopes Requested
              </h4>

              <div className="space-y-3">
                {/* Scope 1 */}
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold font-mono text-slate-850 dark:text-slate-200">ads_management</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Allows Sales Guru to retrieve advertising performance data, CPC metrics, and ad sets.
                    </p>
                  </div>
                </div>

                {/* Scope 2 */}
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold font-mono text-slate-850 dark:text-slate-200">leads_retrieval</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Allows Sales Guru to fetch data from Facebook Lead Forms dynamically via webhooks.
                    </p>
                  </div>
                </div>

                {/* Scope 3 */}
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold font-mono text-slate-850 dark:text-slate-200">pages_manage_metadata</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Allows integration to register instant alert handlers for newly received messages or page metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy details */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" /> Secure SSL Connection
              </span>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline flex items-center gap-0.5 font-semibold text-[#1877f2]">
                Privacy Policy <ChevronRight className="h-2.5 w-2.5" />
              </a>
            </div>
          </CardContent>

          {/* Footer Actions */}
          <CardFooter className="bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center">
            <span className="text-[10px] text-slate-450 dark:text-slate-500">Logged in as {formattedCompany}_Sandbox</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-8 text-xs font-semibold border-slate-350 dark:border-slate-700 bg-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="h-8 text-xs font-bold bg-[#1877f2] hover:bg-[#166fe5] text-white"
              >
                Confirm & Authorize
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer Info */}
      <footer className="text-center py-6 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-md mx-auto space-y-1">
          <p>© 2026 Meta Platforms Inc. Built for Sales Guru Sandbox integrations.</p>
          <p className="text-[10px] opacity-75">Meta is a registered trademark of Meta Platforms, Inc.</p>
        </div>
      </footer>
    </div>
  )
}
