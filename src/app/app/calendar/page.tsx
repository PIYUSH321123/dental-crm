"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
  Mic,
  MicOff,
  MoreVertical,
  Phone,
  PhoneOff,
  Plus,
  Search,
  Share2,
  Sparkles,
  User,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DentflowDrawer,
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";
import { StatusTone } from "@/lib/dentflow-theme";
import { ClinicAppointment } from "@/types/dentflow";

interface AppointmentBlock {
  id: string;
  chair: "C1" | "C2" | "C3" | "C4";
  startHour: number; // e.g. 9.5 for 9:30
  durationHours: number;
  timeLabel: string;
  endTimeLabel: string;
  patientId: string;
  patientName: string;
  procedure: string;
  doctor: string;
  status: ClinicAppointment["status"];
  anxietyBufferMin: number;
  flags: string[];
}

const INITIAL_BLOCKS: AppointmentBlock[] = [
  { id: "cb-1", chair: "C1", startHour: 9.5, durationHours: 0.6, timeLabel: "9:30", endTimeLabel: "10:05", patientId: "pat-meera", patientName: "Meera Nair", procedure: "Scaling & polish", doctor: "Dr. Sneha K.", status: "Done", anxietyBufferMin: 0, flags: ["VIP"] },
  { id: "cb-2", chair: "C1", startHour: 10.25, durationHours: 0.75, timeLabel: "10:15", endTimeLabel: "11:00", patientId: "pat-rahul", patientName: "Rahul Verma", procedure: "Composite filling 14", doctor: "Dr. Arjun M.", status: "Checked in", anxietyBufferMin: 0, flags: [] },
  { id: "cb-3", chair: "C1", startHour: 12.5, durationHours: 0.75, timeLabel: "12:30", endTimeLabel: "1:15", patientId: "pat-imran", patientName: "Imran Khan", procedure: "Consultation & X-ray", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-4", chair: "C1", startHour: 15.0, durationHours: 0.9, timeLabel: "3:00", endTimeLabel: "3:55", patientId: "pat-pooja", patientName: "Pooja Jain", procedure: "RCT 26 sitting 1", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-5", chair: "C1", startHour: 16.5, durationHours: 0.75, timeLabel: "4:30", endTimeLabel: "5:15", patientId: "pat-ajay", patientName: "Ajay Rao", procedure: "Post-op review", doctor: "Dr. Arjun M.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-6", chair: "C2", startHour: 10.0, durationHours: 1.25, timeLabel: "10:00", endTimeLabel: "11:15", patientId: "pat-priya", patientName: "Priya Deshmukh", procedure: "Root canal 36 · sitting 2", doctor: "Dr. Sneha K.", status: "In chair", anxietyBufferMin: 15, flags: ["Anxious", "Allergy"] },
  { id: "cb-7", chair: "C2", startHour: 11.5, durationHours: 0.75, timeLabel: "11:30", endTimeLabel: "12:15", patientId: "pat-suresh", patientName: "Suresh Patil", procedure: "Denture trial", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-8", chair: "C2", startHour: 13.0, durationHours: 0.75, timeLabel: "1:00", endTimeLabel: "1:45", patientId: "pat-neha", patientName: "Neha Gupta", procedure: "Crown fit 46", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-9", chair: "C2", startHour: 16.5, durationHours: 0.75, timeLabel: "4:30", endTimeLabel: "5:15", patientId: "pat-deepak", patientName: "Deepak More", procedure: "RCT 11", doctor: "Dr. Sneha K.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-10", chair: "C3", startHour: 10.5, durationHours: 0.75, timeLabel: "10:30", endTimeLabel: "11:15", patientId: "pat-aarav", patientName: "Aarav Joshi", procedure: "Sealants + fluoride", doctor: "Dr. Karan S.", status: "Late 10 min", anxietyBufferMin: 0, flags: ["New"] },
  { id: "cb-11", chair: "C3", startHour: 12.0, durationHours: 0.58, timeLabel: "12:00", endTimeLabel: "12:35", patientId: "pat-kavya", patientName: "Kavya Reddy", procedure: "Aligner check 10", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 15, flags: ["Anxious"] },
  { id: "cb-12", chair: "C3", startHour: 12.5833, durationHours: 0.58, timeLabel: "12:35", endTimeLabel: "1:10", patientId: "pat-tanvi", patientName: "Tanvi Shah", procedure: "Braces adjustment", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-13", chair: "C3", startHour: 14.5, durationHours: 0.75, timeLabel: "2:30", endTimeLabel: "3:15", patientId: "pat-riya", patientName: "Riya Das", procedure: "Aligner 3D scan", doctor: "Dr. Karan S.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },

  { id: "cb-14", chair: "C4", startHour: 11.0, durationHours: 0.8, timeLabel: "11:00", endTimeLabel: "11:50", patientId: "pat-fatima", patientName: "Fatima Shaikh", procedure: "Implant review", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-15", chair: "C4", startHour: 14.5, durationHours: 0.8, timeLabel: "2:30", endTimeLabel: "3:20", patientId: "pat-vikram", patientName: "Vikram Singh", procedure: "Surgical extraction 38", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
  { id: "cb-16", chair: "C4", startHour: 15.5, durationHours: 0.85, timeLabel: "3:30", endTimeLabel: "4:20", patientId: "pat-anil", patientName: "Anil Bhosale", procedure: "Implant placement 46", doctor: "Dr. Farhan A.", status: "Confirmed", anxietyBufferMin: 0, flags: [] },
];

const SUGGESTED_SLOTS = [
  "9:30 AM",
  "11:00 AM",
  "12:30 PM",
  "2:30 PM",
  "4:00 PM",
  "5:15 PM",
];

const STATUS_TONES: Record<ClinicAppointment["status"], StatusTone> = {
  Done: "green",
  "In chair": "blue",
  "Checked in": "teal",
  "Late 10 min": "amber",
  Confirmed: "green",
  "Not confirmed": "grey",
  Cancelled: "red",
};

interface VideoConsultationItem {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  status: "Scheduled" | "Live" | "Completed";
  reason: string;
}

const INITIAL_VIDEO_CONSULTS: VideoConsultationItem[] = [
  { id: "vc-1", patientName: "Priya Deshmukh", doctorName: "Dr. Sneha Kulkarni", time: "11:30 AM", status: "Scheduled", reason: "Crown color preview & shade verification" },
  { id: "vc-2", patientName: "Rohan Mehta", doctorName: "Dr. Arjun Mehta", time: "1:00 PM", status: "Live", reason: "Day 3 post-op extraction pain check" },
  { id: "vc-3", patientName: "Ananya Iyer", doctorName: "Dr. Karan Shah", time: "9:00 AM", status: "Completed", reason: "Aligner tray 12 fitting assessment" },
];

interface WaitlistItem {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  type: "Walk-in" | "Priority Waitlist";
  arrivedTime: string;
  waitingInfo: string;
  procedure: string;
  preferredDoctor: string;
  preferredChair: string;
}

const WAITLIST_QUEUE: WaitlistItem[] = [
  {
    id: "wl-1",
    patientId: "pat-amit",
    name: "Amit Deshpande",
    phone: "+91 98220 98112",
    type: "Walk-in",
    arrivedTime: "10:15 AM",
    waitingInfo: "In lounge · 20m",
    procedure: "Scaling & polish",
    preferredDoctor: "Dr. Arjun M.",
    preferredChair: "Chair 1 or 2",
  },
  {
    id: "wl-2",
    patientId: "pat-sunita",
    name: "Sunita Rao",
    phone: "+91 98220 67890",
    type: "Priority Waitlist",
    arrivedTime: "11:00 AM",
    waitingInfo: "On call · 10m away",
    procedure: "Crown consult",
    preferredDoctor: "Dr. Sneha K.",
    preferredChair: "Chair 2",
  },
];

function CalendarPageInner() {
  const searchParams = useSearchParams();
  const { state, updateState } = useDentflow();

  // Calendar View Controls
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "List">("Day");
  const [selectedDate, setSelectedDate] = useState("Thursday, 1 Oct 2026");
  const [doctorFilter, setDoctorFilter] = useState("All Doctors");
  const [chairFilter, setChairFilter] = useState("All Chairs");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Appointments State
  const [blocks, setBlocks] = useState<AppointmentBlock[]>(INITIAL_BLOCKS);
  const [selectedBlock, setSelectedBlock] = useState<AppointmentBlock | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // New Appointment Drawer State
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("pat-priya");
  const [selectedProcedure, setSelectedProcedure] = useState("Root canal 36 · sitting 2 — 60 min");
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Sneha Kulkarni");
  const [selectedChair, setSelectedChair] = useState<"C1" | "C2" | "C3" | "C4">("C2");
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM");
  const [apptNotes, setApptNotes] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [askDeposit, setAskDeposit] = useState(false);

  // Video Consultation Modal & Call Overlay
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoTab, setVideoTab] = useState<"Schedule" | "Start now" | "Today">("Today");
  const [videoConsults, setVideoConsults] = useState<VideoConsultationItem[]>(INITIAL_VIDEO_CONSULTS);
  const [activeCall, setActiveCall] = useState<VideoConsultationItem | null>(null);
  const [callMuted, setCallMuted] = useState(false);
  const [callVideoOff, setCallVideoOff] = useState(false);
  const [callChatMessages, setCallChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "System", text: "Encrypted HD tele-dentistry session started." },
  ]);
  const [callInputChat, setCallInputChat] = useState("");

  // Check URL query for booking trigger
  React.useEffect(() => {
    const bookId = searchParams?.get("bookPatientId");
    if (bookId) {
      setSelectedPatientId(bookId);
      setNewApptOpen(true);
    }
  }, [searchParams]);

  const selectedPatient = useMemo(() => {
    return state.patients.find((p) => p.id === selectedPatientId) || state.patients[0];
  }, [state.patients, selectedPatientId]);

  const anxietyBuffer = selectedPatient?.comfortProfile?.autoBufferMin || 0;

  // Filtered blocks for Day Calendar
  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (doctorFilter !== "All Doctors" && !b.doctor.includes(doctorFilter.split(" ")[1] || "")) return false;
      if (chairFilter !== "All Chairs" && b.chair !== chairFilter) return false;
      if (statusFilter !== "All Status" && b.status !== statusFilter) return false;
      return true;
    });
  }, [blocks, doctorFilter, chairFilter, statusFilter]);

  // Chair column setup
  const chairs = [
    { id: "C1", label: "Chair 1 · General", doc: "Dr. Arjun M." },
    { id: "C2", label: "Chair 2 · Surgery/Endo", doc: "Dr. Sneha K." },
    { id: "C3", label: "Chair 3 · Ortho", doc: "Dr. Karan S." },
    { id: "C4", label: "Chair 4 · Implant", doc: "Dr. Farhan A." },
  ];

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  // Actions on appointment block
  const handleOpenBlock = (block: AppointmentBlock) => {
    setSelectedBlock(block);
    setDetailDrawerOpen(true);
  };

  const handleUpdateStatus = (newStatus: ClinicAppointment["status"]) => {
    if (!selectedBlock) return;
    setBlocks((prev) =>
      prev.map((b) => (b.id === selectedBlock.id ? { ...b, status: newStatus } : b)),
    );
    setSelectedBlock((prev) => (prev ? { ...prev, status: newStatus } : null));
    toast.success(`Appointment updated: ${newStatus}`);
  };

  // Book appointment handler
  const handleBookAppointment = () => {
    const startH = selectedSlot.includes("9:30")
      ? 9.5
      : selectedSlot.includes("11:00")
      ? 11.0
      : selectedSlot.includes("12:30")
      ? 12.5
      : selectedSlot.includes("2:30")
      ? 14.5
      : 16.0;

    const newBlock: AppointmentBlock = {
      id: `cb-${Date.now()}`,
      chair: selectedChair,
      startHour: startH,
      durationHours: 0.85,
      timeLabel: selectedSlot,
      endTimeLabel: "—",
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      procedure: selectedProcedure.split("—")[0].trim(),
      doctor: selectedDoctor,
      status: "Confirmed",
      anxietyBufferMin: anxietyBuffer,
      flags: selectedPatient.flags,
    };

    setBlocks((prev) => [...prev, newBlock]);
    setNewApptOpen(false);
    toast.success(`Appointment booked for ${selectedPatient.name} at ${selectedSlot}!`);
  };

  // Video call controls
  const handleStartCall = (consult: VideoConsultationItem) => {
    setActiveCall(consult);
    setVideoModalOpen(false);
    toast.success(`Connected to tele-consult with ${consult.patientName}`);
  };

  const handleEndCall = () => {
    setActiveCall(null);
    toast.info("Tele-consultation ended.");
  };

  return (
    <div className="space-y-4">
      {/* Header Pattern */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--df-border)]">
        <div>
          <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)] tracking-tight">
            Appointments
          </h1>
          <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
            Schedule and manage patient visits · Station Road branch
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setVideoTab("Today");
              setVideoModalOpen(true);
            }}
            className="df-btn-secondary px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="h-4 w-4 text-[var(--df-teal)]" />
            <span>Video Consultation</span>
          </button>

          <button
            type="button"
            onClick={() => setNewApptOpen(true)}
            className="df-btn-primary px-4 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Appointment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Card Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DentflowKpiCard
          label="Total today"
          value="16"
          subtext="+2 vs yesterday"
          subtextTone="green"
        />
        <DentflowKpiCard
          label="Confirmed"
          value="11"
          subtext="69% arrival rate"
          subtextTone="teal"
          highlighted
        />
        <DentflowKpiCard
          label="Completed"
          value="3"
          subtext="₹48,200 collected"
          subtextTone="green"
        />
        <DentflowKpiCard
          label="In chair / Waiting"
          value="2"
          subtext="1 delayed 10m"
          subtextTone="amber"
        />
      </div>

      {/* Controls Bar: View Toggle + Date Navigator + Filters */}
      <div className="df-card p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[var(--df-surface-muted)] p-1 rounded-xl border border-[var(--df-border)]">
          {(["Day", "Week", "List"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === mode
                  ? "bg-[var(--df-surface)] text-[var(--df-text)] shadow-xs"
                  : "text-[var(--df-text-muted)] hover:text-[var(--df-text)]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Center: Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] cursor-pointer text-[var(--df-text-muted)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-[var(--df-text)] px-1">
            {selectedDate}
          </span>
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] cursor-pointer text-[var(--df-text-muted)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            aria-label="Filter doctor"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="All Doctors">All Doctors</option>
            <option value="Dr. Sneha K.">Dr. Sneha K.</option>
            <option value="Dr. Arjun M.">Dr. Arjun M.</option>
            <option value="Dr. Farhan A.">Dr. Farhan A.</option>
            <option value="Dr. Karan S.">Dr. Karan S.</option>
          </select>

          <select
            aria-label="Filter chair"
            value={chairFilter}
            onChange={(e) => setChairFilter(e.target.value)}
            className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="All Chairs">All Chairs</option>
            <option value="C1">Chair 1</option>
            <option value="C2">Chair 2</option>
            <option value="C3">Chair 3</option>
            <option value="C4">Chair 4</option>
          </select>

          <select
            aria-label="Filter status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In chair">In chair</option>
            <option value="Checked in">Checked in</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {/* Main View Area: Day Calendar OR List View */}
      {viewMode === "Day" && (
        <div className="df-card overflow-hidden">
          {/* Chair Headers */}
          <div className="grid grid-cols-12 border-b border-[var(--df-border)] bg-[var(--df-surface-muted)] text-xs font-bold divide-x divide-[var(--df-border)]">
            <div className="col-span-1 p-3 text-center text-[11px] text-[var(--df-text-muted)] font-semibold flex items-center justify-center">
              Time
            </div>
            {chairs.map((c) => (
              <div key={c.id} className="col-span-2 p-3">
                <p className="text-[var(--df-text)] font-semibold text-xs">{c.label}</p>
                <p className="text-[11px] text-[var(--df-text-muted)] font-normal mt-0.5">{c.doc}</p>
              </div>
            ))}
            <div className="col-span-3 p-3 text-[11px] text-[var(--df-text-muted)] flex items-center justify-between">
              <span className="font-bold text-[var(--df-text)] text-xs">Waitlist & Walk-in queue</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)]">
                {WAITLIST_QUEUE.length} active
              </span>
            </div>
          </div>

          {/* Time Rows Grid: 12-Column Matching Layout */}
          <div className="grid grid-cols-12 divide-x divide-[var(--df-border)] bg-[var(--df-surface)] relative min-h-[720px]">
            {/* 1. Time Column (col-span-1) */}
            <div className="col-span-1 select-none">
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: "80px" }}
                  className="border-b border-[var(--df-border)]/50 p-2 text-center flex flex-col items-center justify-start pt-2"
                >
                  <span className="font-mono text-xs font-semibold text-[var(--df-text)]">
                    {h > 12 ? `${h - 12}:00` : `${h}:00`}
                  </span>
                  <span className="text-[10px] font-sans font-medium text-[var(--df-text-muted)] uppercase">
                    {h >= 12 ? "PM" : "AM"}
                  </span>
                </div>
              ))}
            </div>

            {/* 2. Chair Columns (col-span-2 each for C1, C2, C3, C4) */}
            {chairs.map((c) => {
              const chairBlocks = filteredBlocks.filter((b) => b.chair === c.id);
              const HOUR_HEIGHT = 80;

              return (
                <div key={c.id} className="col-span-2 relative">
                  {/* Hour background guide lines */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      style={{ height: "80px" }}
                      className="border-b border-[var(--df-border)]/50 hover:bg-[var(--df-surface-muted)]/30 transition-colors"
                    />
                  ))}

                  {/* Appointment cards for this chair */}
                  {chairBlocks.map((b) => {
                    const topOffset = (b.startHour - 9.0) * HOUR_HEIGHT;
                    const height = Math.max(b.durationHours * HOUR_HEIGHT, 48);

                    return (
                      <div
                        key={b.id}
                        onClick={() => handleOpenBlock(b)}
                        style={{
                          top: `${topOffset}px`,
                          height: `${height}px`,
                        }}
                        className="absolute left-1.5 right-1.5 p-0.5 z-20"
                      >
                        <div
                          className={`h-full w-full rounded-xl border p-2 text-xs flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer ${
                            b.status === "Done"
                              ? "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]"
                              : b.status === "In chair"
                              ? "bg-[#E3F3EE] border-[var(--df-teal-border)] text-[var(--df-teal)] ring-1 ring-[var(--df-teal)]"
                              : b.status === "Late 10 min"
                              ? "bg-[#FEF3DC] border-[#F8DFAA] text-[#9A5B00]"
                              : "bg-white border-[var(--df-border)] text-[var(--df-text)] hover:border-[var(--df-teal)]"
                          }`}
                        >
                          {/* Top Row: Patient Name & Time Badge */}
                          <div className="flex items-center justify-between gap-1 leading-none">
                            <span className="font-bold text-xs truncate text-[var(--df-text)]">
                              {b.patientName}
                            </span>
                            <span className="text-[10px] font-mono font-semibold text-[var(--df-text-muted)] bg-[var(--df-surface-muted)] px-1.5 py-0.5 rounded border border-[var(--df-border)]/80 shrink-0">
                              {b.timeLabel}
                            </span>
                          </div>

                          {/* Middle Row: Procedure Description */}
                          <p className="text-[11px] font-medium text-[var(--df-text-secondary)] truncate my-0.5 leading-snug">
                            {b.procedure}
                          </p>

                          {/* Bottom Row: Doctor & Status / Buffer */}
                          <div className="flex items-center justify-between gap-1 text-[10px] text-[var(--df-text-muted)] leading-none pt-0.5 border-t border-[var(--df-border)]/40">
                            <span className="truncate font-medium">{b.doctor}</span>
                            {b.anxietyBufferMin > 0 ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FEF3DC] text-[#9A5B00] border border-[#F8DFAA] shrink-0">
                                +{b.anxietyBufferMin}m
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-[var(--df-text-muted)]/70 uppercase tracking-wider shrink-0">
                                {b.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* 3. Waitlist & Walk-in Queue Column (col-span-3) */}
            <div className="col-span-3 bg-[var(--df-surface-muted)]/30 p-3 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-[var(--df-text-muted)] px-0.5">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Queue · Priority</span>
                <span className="text-[10px] text-[var(--df-teal)] font-medium">Auto-match on</span>
              </div>

              {WAITLIST_QUEUE.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] shadow-xs hover:border-[var(--df-teal-border)] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="font-bold text-xs text-[var(--df-text)]">{item.name}</p>
                      <p className="text-[10px] text-[var(--df-text-muted)]">{item.phone}</p>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                        item.type === "Walk-in"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-[var(--df-text-secondary)]">
                    {item.procedure}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[var(--df-text-muted)] pt-1 border-t border-[var(--df-border)]/60">
                    <span>{item.waitingInfo}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(item.patientId);
                        setSelectedProcedure(item.procedure);
                        setSelectedDoctor(item.preferredDoctor);
                        setNewApptOpen(true);
                      }}
                      className="df-btn-primary px-2.5 py-1 text-[10px] font-semibold cursor-pointer rounded-lg inline-flex items-center gap-1 shadow-xs"
                    >
                      Seat in Chair
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setNewApptOpen(true)}
                className="w-full py-2.5 border border-dashed border-[var(--df-border-strong)] rounded-xl text-[11px] font-semibold text-[var(--df-text-muted)] hover:text-[var(--df-teal)] hover:border-[var(--df-teal)] bg-[var(--df-surface)]/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Walk-in / Waitlist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List View Table */}
      {viewMode === "List" && (
        <div className="df-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--df-border)] bg-[var(--df-surface-muted)] text-[11px] font-bold text-[var(--df-text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Procedure</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Chair</th>
                  <th className="py-3 px-4">Buffer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--df-border)]">
                {filteredBlocks.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => handleOpenBlock(b)}
                    className="hover:bg-[var(--df-surface-hover)] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[var(--df-text)]">
                      {b.timeLabel}
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--df-text)]">
                      {b.patientName}
                    </td>
                    <td className="py-3 px-4 text-[var(--df-text-secondary)]">
                      {b.procedure}
                    </td>
                    <td className="py-3 px-4 text-[var(--df-text)]">
                      {b.doctor}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--df-surface-muted)] border text-[11px] font-semibold">
                        {b.chair}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {b.anxietyBufferMin > 0 ? (
                        <span className="text-amber-700 font-bold">+{b.anxietyBufferMin} min</span>
                      ) : (
                        <span className="text-[var(--df-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <DentflowStatusPill label={b.status} tone={STATUS_TONES[b.status] || "grey"} />
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenBlock(b)}
                        className="df-btn-secondary px-2.5 py-1 text-xs cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === "Week" && (
        <div className="df-card p-6 text-center space-y-3">
          <p className="font-bold text-sm text-[var(--df-text)]">Week Overview (Oct 1 - Oct 7, 2026)</p>
          <div className="grid grid-cols-7 gap-2 pt-2">
            {["Thu 1", "Fri 2", "Sat 3", "Sun 4", "Mon 5", "Tue 6", "Wed 7"].map((d, i) => (
              <div key={d} className={`p-3 rounded-xl border ${i === 0 ? "bg-[var(--df-teal-soft)] border-[var(--df-teal)]" : "bg-[var(--df-surface-muted)]"}`}>
                <p className="font-bold text-xs">{d}</p>
                <p className="text-xl font-bold mt-1">{i === 0 ? "16" : i === 3 ? "Closed" : "12-14"}</p>
                <p className="text-[10px] text-[var(--df-text-muted)] mt-0.5">{i === 3 ? "Sunday" : "slots full"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Detail Drawer */}
      {selectedBlock && (
        <DentflowDrawer
          open={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          title={`Appointment · ${selectedBlock.patientName}`}
          subtitle={`${selectedBlock.timeLabel} · ${selectedBlock.chair} · ${selectedBlock.procedure}`}
        >
          <div className="space-y-5 text-xs pb-10">
            {/* Status Card */}
            <div className="p-3.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[var(--df-text-muted)]">Current Status</p>
                <p className="font-bold text-sm text-[var(--df-text)] mt-0.5">{selectedBlock.status}</p>
              </div>
              <DentflowStatusPill label={selectedBlock.status} tone={STATUS_TONES[selectedBlock.status] || "grey"} />
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="font-bold text-xs text-[var(--df-text)]">Status Progression</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Checked in")}
                  className="df-btn-secondary py-2 text-xs font-semibold cursor-pointer"
                >
                  Mark Checked In
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("In chair")}
                  className="df-btn-secondary py-2 text-xs font-semibold text-[var(--df-teal)] border-[var(--df-teal-border)] cursor-pointer"
                >
                  Move to Chair
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Done")}
                  className="df-btn-primary py-2 text-xs font-semibold cursor-pointer"
                >
                  Complete Procedure
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Cancelled")}
                  className="df-btn-secondary py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Cancel Sitting
                </button>
              </div>
            </div>

            {/* Patient & Anxiety Alert */}
            {selectedBlock.anxietyBufferMin > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Anxiety Buffer Active (+{selectedBlock.anxietyBufferMin} mins)</span>
                </div>
                <p className="text-[11px]">
                  Patient sensitive to injections. Doctor must explain each step before starting and observe hand-raise stop signal.
                </p>
              </div>
            )}

            {/* Reminders & WhatsApp */}
            <div className="df-card p-3.5 space-y-2">
              <p className="font-bold text-xs text-[var(--df-text)]">WhatsApp Notifications</p>
              <p className="text-[11px] text-[var(--df-text-secondary)]">
                Automated reminder sent at 8:00 am today. Patient confirmed via WhatsApp interactive reply.
              </p>
              <button
                type="button"
                onClick={() => toast.success("WhatsApp appointment details resent!")}
                className="df-btn-secondary px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[var(--df-teal)]" />
                <span>Resend reminder</span>
              </button>
            </div>
          </div>
        </DentflowDrawer>
      )}

      {/* "+ New Appointment" Right-Side Drawer */}
      <DentflowDrawer
        open={newApptOpen}
        onClose={() => setNewApptOpen(false)}
        title="+ Book Chair Appointment"
        subtitle="Match patient, procedure duration, doctor & anxiety buffer"
      >
        <div className="space-y-5 text-xs pb-10">
          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[var(--df-text)]">Select patient *</label>
              <Link href="/app/patients" className="text-[11px] font-semibold text-[var(--df-teal)] hover:underline">
                + New patient
              </Link>
            </div>
            <select
              aria-label="Select patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 font-medium"
            >
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) · {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Allergy & Anxiety Alert */}
          {(selectedPatient.allergies.length > 0 || anxietyBuffer > 0) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span>Patient Health Alerts</span>
              </div>
              <p className="text-[11.5px]">
                {selectedPatient.allergies.length > 0 && (
                  <span>Allergies: <strong>{selectedPatient.allergies.join(", ")}</strong>. </span>
                )}
                {anxietyBuffer > 0 && (
                  <span>Dental anxiety: <strong>+{anxietyBuffer}m automatic buffer</strong> added to slot.</span>
                )}
              </p>
            </div>
          )}

          {/* Procedure */}
          <div>
            <label className="block font-semibold mb-1 text-[var(--df-text)]">Procedure *</label>
            <select
              aria-label="Procedure"
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2 font-medium"
            >
              <option value="Scaling & polish — 30 min">Scaling & polish — 30 min</option>
              <option value="Composite filling 14 — 45 min">Composite filling — 45 min</option>
              <option value="Root canal 36 · sitting 2 — 60 min">Root canal treatment — 60 min</option>
              <option value="Crown prep & scan — 60 min">Crown prep & scan — 60 min</option>
              <option value="Implant consultation — 45 min">Implant consultation — 45 min</option>
            </select>
          </div>

          {/* Doctor & Chair */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[var(--df-text)]">Doctor</label>
              <select
                aria-label="Doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
              >
                <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
                <option value="Dr. Arjun Mehta">Dr. Arjun Mehta</option>
                <option value="Dr. Farhan Ali">Dr. Farhan Ali</option>
                <option value="Dr. Karan Shah">Dr. Karan Shah</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[var(--df-text)]">Chair</label>
              <select
                aria-label="Chair"
                value={selectedChair}
                onChange={(e) => setSelectedChair(e.target.value as any)}
                className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2"
              >
                <option value="C1">Chair 1 · General</option>
                <option value="C2">Chair 2 · Surgery/Endo</option>
                <option value="C3">Chair 3 · Ortho</option>
                <option value="C4">Chair 4 · Implant</option>
              </select>
            </div>
          </div>

          {/* Suggested Free Slots Chips */}
          <div>
            <label className="block font-semibold mb-1.5 text-[var(--df-text)]">
              Suggested free time slots (Today)
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    selectedSlot === slot
                      ? "bg-[var(--df-teal)] text-white border-[var(--df-teal)]"
                      : "bg-[var(--df-surface)] border-[var(--df-border)] text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold mb-1 text-[var(--df-text)]">Clinical notes</label>
            <textarea
              rows={2}
              value={apptNotes}
              onChange={(e) => setApptNotes(e.target.value)}
              placeholder="e.g. Patient requested morning sitting, headphones enabled"
              className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl p-2.5 text-xs"
            />
          </div>

          {/* WhatsApp & Deposit Checkboxes */}
          <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-[var(--df-teal)]"
              />
              <span className="text-[11px] text-[var(--df-text-secondary)]">
                Send WhatsApp confirmation with Google Maps clinic directions
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={askDeposit}
                onChange={(e) => setAskDeposit(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-[var(--df-teal)]"
              />
              <span className="text-[11px] text-[var(--df-text-secondary)]">
                Request booking deposit (₹500 dynamic UPI QR link)
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--df-border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setNewApptOpen(false)}
              className="df-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBookAppointment}
              className="df-btn-primary px-5 py-2 text-xs font-semibold cursor-pointer"
            >
              Book appointment
            </button>
          </div>
        </div>
      </DentflowDrawer>

      {/* "Video Consultation" Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="df-card w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--df-border)] pb-2.5">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[var(--df-teal)]" />
                <h3 className="font-bold text-sm text-[var(--df-text)]">
                  Tele-Dentistry Video Consultations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg text-[var(--df-text-muted)] hover:bg-[var(--df-surface-muted)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 3 Tabs */}
            <div className="flex border-b border-[var(--df-border)] gap-2 pb-1 text-xs">
              {(["Today", "Schedule", "Start now"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setVideoTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                    videoTab === tab
                      ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)]"
                      : "text-[var(--df-text-secondary)] hover:bg-[var(--df-surface-hover)]"
                  }`}
                >
                  {tab === "Today" ? "Today's Consults (3)" : tab}
                </button>
              ))}
            </div>

            {/* Tab: Today's Consults List */}
            {videoTab === "Today" && (
              <div className="space-y-2.5">
                {videoConsults.map((consult) => (
                  <div
                    key={consult.id}
                    className="p-3 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-muted)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--df-text)]">{consult.patientName}</span>
                        <DentflowStatusPill
                          label={consult.status}
                          tone={consult.status === "Live" ? "red" : consult.status === "Scheduled" ? "blue" : "green"}
                        />
                      </div>
                      <p className="text-[11px] text-[var(--df-text-muted)] mt-0.5">
                        {consult.time} · {consult.doctorName}
                      </p>
                      <p className="text-[11px] text-[var(--df-text-secondary)] mt-0.5 italic">
                        “{consult.reason}”
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartCall(consult)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                        consult.status === "Live"
                          ? "bg-red-600 text-white animate-pulse"
                          : "df-btn-primary"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>{consult.status === "Live" ? "Join Live" : "Start Call"}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Schedule */}
            {videoTab === "Schedule" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Patient</label>
                  <select aria-label="Select patient for video" className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2">
                    <option>Priya Deshmukh (DF-10482)</option>
                    <option>Rohan Mehta (DF-10519)</option>
                    <option>Kavya Reddy (DF-10910)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--df-text)]">Date</label>
                    <input type="date" defaultValue="2026-10-01" className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--df-text)]">Time</label>
                    <input type="time" defaultValue="14:00" className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--df-text)]">Reason for consultation</label>
                  <input type="text" placeholder="e.g. Aligner tracking check & post-op sensitivity" className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[var(--df-text-secondary)]">
                  <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded text-[var(--df-teal)]" />
                  <span>Send meeting link via WhatsApp and SMS to patient</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setVideoModalOpen(false);
                    toast.success("Tele-dentistry consultation scheduled and link dispatched!");
                  }}
                  className="w-full df-btn-primary py-2 text-xs font-semibold cursor-pointer mt-2"
                >
                  Schedule Video Consult
                </button>
              </div>
            )}

            {/* Tab: Start now */}
            {videoTab === "Start now" && (
              <div className="space-y-3 text-xs text-center py-4">
                <p className="text-[var(--df-text-secondary)]">
                  Launch an instant video room and send a direct join link to the patient's phone.
                </p>
                <div className="max-w-xs mx-auto text-left space-y-2">
                  <label className="block font-semibold text-[var(--df-text)]">Patient</label>
                  <select aria-label="Select patient for instant video" className="w-full bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-3 py-2">
                    <option>Priya Deshmukh · +91 98220 11210</option>
                    <option>Rohan Mehta · +91 98220 33441</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleStartCall({
                      id: `vc-${Date.now()}`,
                      patientName: "Priya Deshmukh",
                      doctorName: "Dr. Sneha Kulkarni",
                      time: "Now",
                      status: "Live",
                      reason: "Instant clinical consultation",
                    });
                  }}
                  className="df-btn-primary px-6 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer mt-2"
                >
                  <Video className="h-4 w-4" />
                  <span>Launch Instant Room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tele-Dentistry Live Call Screen / Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col">
          {/* Top Bar of Call */}
          <div className="h-14 border-b border-slate-700 bg-slate-900/90 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <div>
                <p className="font-bold text-xs">Tele-Consult · {activeCall.patientName}</p>
                <p className="text-[10px] text-slate-400">{activeCall.doctorName} · Duration: 04:12</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                HD Encrypted (WebRTC)
              </span>
              <button
                type="button"
                onClick={handleEndCall}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Main Call View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Video Tiles */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center relative bg-black/40">
              {/* Patient Main Tile */}
              <div className="w-full h-full max-h-[500px] max-w-2xl rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="h-24 w-24 rounded-full bg-teal-800 text-teal-200 text-3xl font-bold flex items-center justify-center">
                  {activeCall.patientName.split(" ").map((n) => n[0]).join("")}
                </div>
                <p className="font-semibold text-sm mt-3">{activeCall.patientName} (Patient)</p>
                <p className="text-xs text-slate-400">Microphone active · Camera connected</p>

                {/* Self View (Doctor Preview Pip) */}
                <div className="absolute bottom-4 right-4 h-32 w-48 rounded-xl bg-slate-900 border-2 border-teal-500 overflow-hidden flex flex-col items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    Dr
                  </div>
                  <span className="text-[10px] text-slate-300 mt-1">You (Dr. Sneha)</span>
                </div>
              </div>

              {/* In-Call Action Toolbar */}
              <div className="absolute bottom-6 flex items-center gap-3 bg-slate-900/90 border border-slate-700 p-2 rounded-2xl backdrop-blur shadow-2xl">
                <button
                  type="button"
                  onClick={() => setCallMuted((v) => !v)}
                  className={`p-3 rounded-xl cursor-pointer ${callMuted ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
                >
                  {callMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCallVideoOff((v) => !v)}
                  className={`p-3 rounded-xl cursor-pointer ${callVideoOff ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
                >
                  {callVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => toast.info("Screen sharing initiated")}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Share Screen"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>Leave</span>
                </button>
              </div>
            </div>

            {/* Right: In-Call Clinical Chat & Notes Sidebar */}
            <div className="w-80 border-l border-slate-700 bg-slate-900 flex flex-col">
              <div className="p-3 border-b border-slate-700 font-bold text-xs flex items-center justify-between">
                <span>In-Call Notes & Chat</span>
                <Link
                  href="/app/prescriptions"
                  target="_blank"
                  className="text-[11px] font-semibold text-teal-400 hover:underline"
                >
                  + Rx
                </Link>
              </div>

              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                {callChatMessages.map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-[10px] text-teal-400">{m.sender}: </span>
                    <span className="text-[11px] text-slate-200">{m.text}</span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!callInputChat.trim()) return;
                  setCallChatMessages((prev) => [...prev, { sender: "Dr. Sneha", text: callInputChat.trim() }]);
                  setCallInputChat("");
                }}
                className="p-2 border-t border-slate-700 flex gap-1.5"
              >
                <input
                  type="text"
                  value={callInputChat}
                  onChange={(e) => setCallInputChat(e.target.value)}
                  placeholder="Send note or link..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--df-text-muted)]">Loading calendar...</div>}>
      <CalendarPageInner />
    </Suspense>
  );
}
