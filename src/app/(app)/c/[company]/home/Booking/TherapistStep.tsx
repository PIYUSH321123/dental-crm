"use client"
import { useEffect, useState } from "react";
import { BookingData } from "./BookingFlow";

type Therapist = {
  id: string;
  name: string;
  role: string;
  experience: string;
  initials: string;
  color: string;
};

type Props = {
  data: BookingData;
  onNext: (therapist: string) => void;
  onBack: () => void;
};

export default function TherapistStep({ data, onNext, onBack }: Props) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/therapists?service=${encodeURIComponent(data.service ?? "")}`)
      .then((res) => res.json())
      .then(setTherapists)
      .catch(() =>
        setTherapists([
          { id: "1", name: "Dr. Ankita Kulkarni", role: "Physiotherapist", experience: "8 yrs experience", initials: "AK", color: "#f5822a" },
          { id: "2", name: "Dr. Priya Shah", role: "Yoga therapist", experience: "6 yrs experience", initials: "PS", color: "#8e44ad" },
        ])
      )
      .finally(() => setLoading(false));
  }, [data.service]);

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Loading available practitioners…</p>;
  }

  const btnClass = (selected: boolean) =>
    `flex items-center gap-3 p-3 rounded-xl border-[1.5px] text-left transition-colors ${
      selected ? "border-[#e0431f] bg-[#fef2ee]" : "border-gray-200 hover:border-gray-300"
    }`;

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-3">Choose your practitioner</p>
      <div className="flex flex-col gap-2.5">
        {therapists.map(({ id, name, role, experience, initials, color }) => {
          const selected = data.therapist === name;
          return (
            <button key={id} onClick={() => onNext(name)} className={btnClass(selected)}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                style={{ background: color }}
              >
                {initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{role} · {experience}</p>
              </div>
              {selected && <span className="text-[#e0431f] text-lg">✓</span>}
            </button>
          );
        })}

        <button onClick={() => onNext("No preference")} className={btnClass(data.therapist === "No preference")}>
          <div className="w-9 h-9 rounded-full bg-gray-400 text-white flex items-center justify-center text-base shrink-0">
            🔀
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">No preference</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Match me with the earliest slot</p>
          </div>
        </button>
      </div>

      <button onClick={onBack} className="mt-4 text-xs text-gray-400 font-medium">← Back</button>
    </div>
  );
}
