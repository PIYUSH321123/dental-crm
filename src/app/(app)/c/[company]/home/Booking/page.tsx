"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookingFlow from "./BookingFlow";
import { useCompany } from "@/components/marketing/CompanyContext";

export default function BookingPage() {
  const router = useRouter();
  const { company } = useCompany();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("sg-user");
    if (!user) {
      // Redirect to login page, redirecting back here after successful registration
      const currentUrl = `/c/${company.slug}/home/Booking`;
      const redirectUrl = `/c/${company.slug}/home/login?tab=login&redirect=${encodeURIComponent(currentUrl)}`;
      router.push(redirectUrl);
    } else {
      setAuthorized(true);
    }
  }, [router, company]);

  if (!authorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <BookingFlow />
    </div>
  );
}
