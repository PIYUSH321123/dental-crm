import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Stethoscope, CalendarPlus, Play, ShieldCheck } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 py-16 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="flex w-fit items-center gap-2 rounded-full bg-[#00c950]/10 px-4 py-1.5">
            <Stethoscope className="size-4 text-[#00c950]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[#00c950]">
              Trusted Physiotherapy &amp; Yoga Care
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Recover stronger. Move better.{" "}
            <span className="text-[#00c950]">Feel like yourself again.</span>
          </h1>

          <p className="max-w-md text-lg text-zinc-500">
            At YogaPlus, our therapists guide your personalized journey to recovery, blending advanced
            physiotherapy with the healing benefits of yoga.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Button className="rounded-full bg-[#00c950] px-6 text-[#f0fdf4] hover:bg-[#00b048] cursor-pointer" asChild>
              <Link href="/Booking">
                <CalendarPlus className="size-4" /> Book a Session
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full border-0 px-6 cursor-pointer">
              <Play className="size-4" /> View Our Services
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-2 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">12k+</span>
              <span className="text-sm text-zinc-500">Patients Treated</span>
            </div>
            <div className="h-10 w-px bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold">25+</span>
              <span className="text-sm text-zinc-500">Expert Therapists</span>
            </div>
            <div className="h-10 w-px bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold">4.9★</span>
              <span className="text-sm text-zinc-500">Patient Rating</span>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative w-full">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-lg aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] max-h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1699523229199-fce5aa6b0ec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
              alt="Physiotherapy session"
              width={1200}
              height={750}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#00c950]/10">
              <ShieldCheck className="size-5 text-[#00c950]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Certified Clinic</span>
              <span className="text-xs text-zinc-500">Licensed &amp; Insured Care</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
