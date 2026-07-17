"use client"
import { useEffect, useState } from "react";
import { BookingData } from "./BookingFlow";

type Props = {
  data: BookingData;
  onNext: (date: string, time: string) => void;
  onBack: () => void;
};

// Generates the next 7 days as selectable date cards
function getUpcomingDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      label: String(d.getDate()),
    };
  });
}

const allTimes = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "4:30 PM", "6:00 PM"];

export default function DateTimeStep({ data, onNext, onBack }: Props) {
  const [dates] = useState(getUpcomingDates());
  const [selectedDate, setSelectedDate] = useState(data.date ?? dates[0].date);
  const [availableTimes, setAvailableTimes] = useState<string[]>(allTimes);
  const [selectedTime, setSelectedTime] = useState(data.time ?? "");
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    setLoadingSlots(true);
    fetch(`/api/availability?date=${selectedDate}&therapist=${encodeURIComponent(data.therapist ?? "")}`)
      .then((res) => res.json())
      .then((json) => setAvailableTimes(json.availableTimes ?? allTimes))
      .catch(() => setAvailableTimes(allTimes))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, data.therapist]);

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-3">Pick a date & time</p>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {dates.map(({ date, day, label }) => {
          const selected = selectedDate === date;
          return (
            <button
              key={date}
              onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
              className={`min-w-[56px] rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-center shrink-0 ${
                selected ? "border-[#e0431f] bg-[#fef2ee]" : "border-gray-200"
              }`}
            >
              <p className="text-[10px] text-gray-400">{day}</p>
              <p className={`text-[15px] font-bold mt-0.5 ${selected ? "text-[#e0431f]" : "text-gray-800"}`}>{label}</p>
            </button>
          );
        })}
      </div>

      {loadingSlots ? (
        <p className="text-xs text-gray-400 py-4 text-center">Checking availability…</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {allTimes.map((time) => {
            const isAvailable = availableTimes.includes(time);
            const selected = selectedTime === time;
            return (
              <button
                key={time}
                disabled={!isAvailable}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg border-[1.5px] py-2.5 text-xs font-semibold ${
                  !isAvailable
                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                    : selected
                    ? "border-[#e0431f] bg-[#fef2ee] text-[#e0431f]"
                    : "border-gray-200 text-gray-800"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2.5 mt-6">
        <button onClick={onBack} className="flex-1 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm font-semibold text-gray-500">
          Back
        </button>
        <button
          disabled={!selectedTime}
          onClick={() => onNext(selectedDate, selectedTime)}
          className="flex-[2] py-3 bg-gradient-to-br from-[#f5822a] to-[#e0431f] text-white rounded-xl text-sm font-semibold disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
