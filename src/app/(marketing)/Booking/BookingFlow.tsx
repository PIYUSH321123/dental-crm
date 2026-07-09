"use client"
import { useState } from "react";
import ServiceStep from "./ServiceStep";
import TherapistStep from "./TherapistStep";
import DateTimeStep from "./DateTimeStep";
import ConfirmStep from "./ConfirmStep";

export type BookingData = {
  service?: string;
  therapist?: string;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
  email?: string;
};

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>({});

  const update = (fields: Partial<BookingData>) => setData((d) => ({ ...d, ...fields }));
  const next = (fields: Partial<BookingData>) => { update(fields); setStep(step + 1); };
  const back = () => setStep(step - 1);

  const submitBooking = async () => {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setStep(5); // success screen
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-[20px] shadow-xl p-8">
      <ProgressBar step={step} />
      {step === 1 && <ServiceStep data={data} onNext={(service: string) => next({ service })} />}
      {step === 2 && <TherapistStep data={data} onNext={(therapist: string) => next({ therapist })} onBack={back} />}
      {step === 3 && <DateTimeStep data={data} onNext={(date: string, time: string) => next({ date, time })} onBack={back} />}
      {step === 4 && <ConfirmStep data={data} onChange={update} onSubmit={submitBooking} onBack={back} />}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={`flex-1 h-1 rounded-full ${n <= step ? "bg-[#e0431f]" : "bg-gray-200"}`} />
      ))}
    </div>
  );
}
