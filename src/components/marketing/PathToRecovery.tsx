"use client"

import Link from "next/link"
import Image from "next/image"
import { useCompany } from "@/components/marketing/CompanyContext"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function PathToRecovery() {
  const { company } = useCompany()

  return (
    <section className="border-y border-zinc-200 bg-zinc-50/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 py-16 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
            alt="Yoga wellness studio"
            width={1200}
            height={380}
            className="h-[380px] w-full object-cover"
            style={{ height: "auto" }}
          />
        </div>

        <div className="flex flex-col gap-6 text-left">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
            Your Path to Recovery
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a]">A simple journey, guided every step of the way</h2>

          <div className="flex flex-col gap-5">
            {[
              { step: "1", title: "Book your appointment", desc: "Choose a time that works for you, in-clinic or online." },
              { step: "2", title: "Get assessed by an expert", desc: "Our therapists evaluate your condition and design a plan." },
              { step: "3", title: "Recover & track progress", desc: "Follow your care plan and watch your recovery unfold." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white shadow-xs">
                  {step}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-[#0f172a]">{title}</span>
                  <p className="text-sm text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button className="mt-2 w-fit rounded-full bg-brand-primary px-6 text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" asChild>
            <Link href={`/c/${company.slug}/home/onboarding`}>
              <ArrowRight className="size-4" /> Start Your Journey
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
