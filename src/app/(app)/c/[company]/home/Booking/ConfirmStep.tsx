"use client"
import { useState } from "react";
import { BookingData } from "./BookingFlow";

type Props = {
  data: BookingData;
  onChange: (fields: Partial<BookingData>) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
};

const fields: { key: keyof BookingData; type: string; placeholder: string }[] = [
  { key: "name", type: "text", placeholder: "Full name" },
  { key: "phone", type: "tel", placeholder: "Phone number" },
  { key: "email", type: "email", placeholder: "Email address" },
];

export default function ConfirmStep({ data, onChange, onSubmit, onBack }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid = fields.every(({ key }) => data[key]);

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-3.5">Your details</p>

      {fields.map(({ key, type, placeholder }) => (
        <input
          key={key}
          type={type}
          placeholder={placeholder}
          value={data[key] ?? ""}
          onChange={(e) => onChange({ [key]: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-[10px] text-sm mb-2.5 outline-none focus:border-[#e0431f]"
        />
      ))}

      <div className="bg-[#fef2ee] rounded-xl p-3.5 text-xs text-gray-800 space-y-1.5 mt-1">
        <div className="flex justify-between"><span className="text-gray-400">Service</span><strong>{data.service}</strong></div>
        <div className="flex justify-between"><span className="text-gray-400">Practitioner</span><strong>{data.therapist}</strong></div>
        <div className="flex justify-between"><span className="text-gray-400">Date & time</span><strong>{data.date}, {data.time}</strong></div>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      <div className="flex gap-2.5 mt-6">
        <button onClick={onBack} className="flex-1 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm font-semibold text-gray-500">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-[2] py-3 bg-gradient-to-br from-[#f5822a] to-[#e0431f] text-white rounded-xl text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
