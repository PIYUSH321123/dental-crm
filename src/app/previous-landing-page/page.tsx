import Hero from "./_components/Hero"
import HowWeHelp from "./_components/HowWeHelp"
import PathToRecovery from "./_components/PathToRecovery"
import Testimonials from "./_components/Testimonials"
import CtaBanner from "./_components/CtaBanner"

export default function LandingPage() {
  return (
    <div className="bg-white text-zinc-950">
      <Hero />
      <HowWeHelp />
      <PathToRecovery />
      <Testimonials />
      <CtaBanner />
    </div>
  )
}
