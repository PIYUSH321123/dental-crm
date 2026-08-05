"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

const subscriptionPlans = [
    { name: "Physio Restore Basic", price: "$1,500/mo", features: ["Marketing basic", "Up to 500 patients", "Email support"] },
    { name: "Physio Care Premium", price: "$3,500/mo", features: ["Full Marketing suite", "Up to 2,000 patients", "Priority support", "Telehealth basic"] },
    { name: "Yoga Plus Pro", price: "$2,500/mo", features: ["Full Marketing suite", "Up to 1,500 patients", "Dedicated account rep"] },
    { name: "Sports Rehab Intensive", price: "$6,000/mo", features: ["Custom integrations", "Unlimited patients", "24/7 Phone support", "Advanced Analytics"] },
]

const clinicSubscriptions = [
    { clinic: "Active Life Physio", plan: "Physio Care Premium", status: "Active", amount: "$3,500/mo", billingSince: "May 12, 2025", nextRenewal: "Aug 12, 2026" },
    { clinic: "Wellness Plus", plan: "Yoga Plus Pro", status: "Active", amount: "$2,500/mo", billingSince: "Jul 18, 2025", nextRenewal: "Aug 18, 2026" },
    { clinic: "SportsRehab Center", plan: "Sports Rehab Intensive", status: "Unpaid", amount: "$6,000/mo", billingSince: "Sep 01, 2024", nextRenewal: "Suspended" },
]

export default function SubscriptionsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-6 md:p-10 font-sans transition-colors duration-200">
            {/* Header */}
            <div className="mb-8">
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Billing Configuration
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Platform Subscriptions
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Manage service subscription tiers, price models, and clinic billing statements.
                </p>
            </div>

            {/* Plans List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {subscriptionPlans.map((plan) => (
                    <div 
                        key={plan.name}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shadow-xs hover:border-slate-350 dark:hover:border-slate-700/80 transition-all"
                    >
                        <div>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold border border-cyan-200 dark:border-cyan-900 mb-3">
                                Plan Tier
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-1">{plan.name}</h3>
                            <p className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight mb-4">{plan.price}</p>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map(f => (
                                    <li key={f} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-555 dark:text-emerald-500 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer h-9">
                            Modify Package
                        </Button>
                    </div>
                ))}
            </div>

            {/* Subscriptions Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinic Billings</h3>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 text-[10px] font-bold px-2 py-0.5">
                        Active Contracts
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 font-semibold">
                                <th className="pb-3 text-xs uppercase tracking-wider">Clinic Name</th>
                                <th className="pb-3 text-xs uppercase tracking-wider">Subscription Tier</th>
                                <th className="pb-3 text-xs uppercase tracking-wider">Billing Rate</th>
                                <th className="pb-3 text-xs uppercase tracking-wider">Active Since</th>
                                <th className="pb-3 text-xs uppercase tracking-wider">Next Invoice</th>
                                <th className="pb-3 text-xs uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                            {clinicSubscriptions.map((sub) => (
                                <tr key={sub.clinic} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 text-slate-700 dark:text-slate-300">
                                    <td className="py-4 font-bold text-slate-900 dark:text-white">{sub.clinic}</td>
                                    <td className="py-4">{sub.plan}</td>
                                    <td className="py-4 text-cyan-600 dark:text-cyan-400 font-semibold">{sub.amount}</td>
                                    <td className="py-4 text-slate-500 dark:text-slate-400">{sub.billingSince}</td>
                                    <td className="py-4 text-slate-500 dark:text-slate-400">{sub.nextRenewal}</td>
                                    <td className="py-4 text-right">
                                        <Badge className={`rounded-lg border-0 text-[10px] font-bold px-2.5 py-0.5 ${
                                            sub.status === "Active" 
                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                                : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                                        }`}>
                                            {sub.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
