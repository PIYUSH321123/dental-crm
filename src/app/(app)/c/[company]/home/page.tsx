import Hero from "@/components/marketing/Hero";
import HowWeHelp from "@/components/marketing/HowWeHelp";
import PathToRecovery from "@/components/marketing/PathToRecovery";
import Testimonials from "@/components/marketing/Testimonials";
import CtaBanner from "@/components/marketing/CtaBanner";

export default function LandingPage() {
  return (
    <div className="bg-white text-zinc-950">
      <Hero />
      <HowWeHelp />
      <PathToRecovery />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}
