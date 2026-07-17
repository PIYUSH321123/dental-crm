"use client"
import { BookingData } from "./BookingFlow";

const services = [
  {
    name: "Physiotherapy",
    description: "Injury recovery & pain relief · 45 min",
    icon: "🦵",
    bg: "#fde3d7",
  },
  {
    name: "Therapeutic Yoga",
    description: "Guided 1:1 or group class · 60 min",
    icon: "🧘",
    bg: "#f3f0fe",
  },
  {
    name: "Consultation",
    description: "First-time assessment · 30 min",
    icon: "🩺",
    bg: "#eaf7ee",
  },
];

type Props = {
  data: BookingData;
  onNext: (service: string) => void;
};

export default function ServiceStep({ data, onNext }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-3">What do you need help with?</p>
      <div className="flex flex-col gap-2.5">
        {services.map(({ name, description, icon, bg }) => {
          const selected = data.service === name;
          return (
            <button
              key={name}
              onClick={() => onNext(name)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-[1.5px] text-left transition-colors ${
                selected ? "border-[#e0431f] bg-[#fef2ee]" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className="w-9.5 h-9.5 rounded-[10px] flex items-center justify-center text-lg shrink-0"
                style={{ background: bg }}
              >
                {icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
              </div>
              {selected && <span className="text-[#e0431f] text-lg">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
