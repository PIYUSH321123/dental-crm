import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarHeart, CalendarCheck, Phone } from "lucide-react"

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-8 pb-16">
      <Card className="overflow-hidden border-0 bg-[#00c950] p-12 text-[#f0fdf4]">
        <CardContent className="flex flex-col items-center gap-4 p-0 text-center">
          <CalendarHeart className="size-10" />
          <h2 className="max-w-xl text-3xl font-bold tracking-tight">
            Ready to start feeling like yourself again?
          </h2>
          <p className="max-w-lg text-[#f0fdf4]/80">
            Book your first appointment today and take the first step toward a stronger, healthier you.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Button className="rounded-full bg-white px-6 text-zinc-950 hover:bg-zinc-100 cursor-pointer" asChild>
              <Link href="/Booking">
                <CalendarCheck className="size-4" /> Book Appointment
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full border-[#f0fdf4]/40 bg-transparent px-6 text-[#f0fdf4] hover:bg-white/10 cursor-pointer" asChild>
              <Link href="tel:+919876543210">
                <Phone className="size-4" /> Call the Clinic
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
