import Image from "next/image"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-16">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-[#00c950]">Patient Stories</span>
        <h2 className="text-3xl font-bold tracking-tight">Real recoveries, real people</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            name: "Meera Shah",
            role: "Shoulder Rehab",
            img: "https://images.unsplash.com/photo-1650381473833-3e2c74a40fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
            quote: "After my shoulder injury I could barely lift my arm. The team here got me back to full strength in weeks.",
          },
          {
            name: "Ravi Kumar",
            role: "Knee Mobilization",
            img: "https://images.unsplash.com/photo-1560071072-02101fd1ed12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
            quote: "The online sessions made it so easy to keep up my exercises. My knee has never felt better.",
          },
          {
            name: "Arjun Singh",
            role: "ACL Post-op Rehab",
            img: "https://images.unsplash.com/photo-1742436707321-33fed05590bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
            quote: "A caring, professional team that treated me like family throughout my ACL recovery.",
          },
        ].map(({ name, role, img, quote }) => (
          <Card key={name} className="p-6">
            <CardHeader className="flex-row items-center gap-3 p-0">
              <div className="size-12 overflow-hidden rounded-full">
                <Image src={img} alt={name} width={48} height={48} className="size-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{name}</span>
                <span className="text-xs text-zinc-500">{role}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <div className="mb-2 flex gap-0.5 text-[#00c950]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-zinc-500">&quot;{quote}&quot;</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
