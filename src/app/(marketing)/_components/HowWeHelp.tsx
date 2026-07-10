import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Activity, Flower2, Video, ClipboardList } from "lucide-react"

export default function HowWeHelp() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-16">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-[#00c950]">How We Help</span>
        <h2 className="max-w-lg text-3xl font-bold tracking-tight">Comprehensive Care for Every Patient</h2>
        <p className="max-w-xl text-zinc-500">
          From injury rehab to holistic wellness, we offer treatments tailored to your body and your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Activity,
            title: "Physiotherapy",
            desc: "Targeted rehabilitation programs to restore mobility and relieve pain after injury or surgery.",
          },
          {
            icon: Flower2,
            title: "Therapeutic Yoga",
            desc: "Guided yoga sessions designed to improve flexibility, posture and mental wellbeing.",
          },
          {
            icon: Video,
            title: "Online Sessions",
            desc: "Recover from home with live virtual consultations and guided exercise plans.",
          },
          {
            icon: ClipboardList,
            title: "Care Plans",
            desc: "Personalized treatment plans with progress tracking through your patient dashboard.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="p-6">
            <CardHeader className="gap-3 p-0">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#00c950]/10">
                <Icon className="size-5 text-[#00c950]" />
              </div>
              <span className="text-base font-semibold">{title}</span>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <p className="text-sm text-zinc-500">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
