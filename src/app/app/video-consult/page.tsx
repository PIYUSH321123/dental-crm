"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Copy,
  ExternalLink,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  PhoneOff,
  MessageSquare,
  FileText,
  Sparkles,
  Send,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  DentflowKpiCard,
  DentflowPageHeader,
  DentflowStatusPill,
} from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

export default function VideoConsultPage() {
  const { state } = useDentflow();

  const [activeTab, setActiveTab] = useState<"consults" | "schedule" | "instant">("consults");
  const [activeCallRoom, setActiveCallRoom] = useState<{
    patientName: string;
    patientPhone: string;
    doctorName: string;
    time: string;
    reason: string;
  } | null>(null);

  // Call simulation states
  const [callDuration, setCallDuration] = useState(128); // seconds
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callChatMessages, setCallChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "System", text: "End-to-end encrypted dental tele-consultation session connected.", time: "10:30 am" },
    { sender: "Patient", text: "Hello doctor, can you hear me properly?", time: "10:31 am" },
    { sender: "Doctor", text: "Yes Priya ji, loud and clear. Let us review the lower molar sensitivity.", time: "10:31 am" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Schedule form state
  const [schedulePatientId, setSchedulePatientId] = useState("pat-priya");
  const [scheduleDoctor, setScheduleDoctor] = useState("Dr. Sneha Kulkarni");
  const [scheduleTime, setScheduleTime] = useState("11:30 AM");
  const [scheduleReason, setScheduleReason] = useState("Post-op review / Sensitivity check");
  const [sendWhatsAppLink, setSendWhatsAppLink] = useState(true);

  // Instant room link
  const instantRoomUrl = "https://meet.dentflow.in/room/df-tele-instant-942";

  interface VideoConsultItem {
    id: string;
    patientName: string;
    patientPhone: string;
    doctorName: string;
    time: string;
    status: "In Progress" | "Scheduled" | "Completed";
    reason: string;
  }

  const [consults, setConsults] = useState<VideoConsultItem[]>([
    {
      id: "vc-1",
      patientName: "Priya Deshmukh",
      patientPhone: "+91 98220 44100",
      doctorName: "Dr. Sneha Kulkarni",
      time: "10:30 AM",
      status: "In Progress",
      reason: "Tooth 36 deep caries review & treatment options discussion",
    },
    {
      id: "vc-2",
      patientName: "Rahul Varma",
      patientPhone: "+91 98220 12345",
      doctorName: "Dr. Arjun Mehta",
      time: "02:00 PM",
      status: "Scheduled",
      reason: "Post-extraction day 3 bleeding check",
    },
    {
      id: "vc-3",
      patientName: "Sunita Rao",
      patientPhone: "+91 98220 67890",
      doctorName: "Dr. Sneha Kulkarni",
      time: "04:30 PM",
      status: "Scheduled",
      reason: "Clear aligner fit verification & attachment check",
    },
  ]);

  const handleScheduleConsult = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pat = state.patients.find((p) => p.id === schedulePatientId) || state.patients[0];
    const newConsult: VideoConsultItem = {
      id: `vc-${Date.now()}`,
      patientName: pat ? pat.name : "Scheduled Patient",
      patientPhone: pat ? pat.phone : "+91 98220 12345",
      doctorName: scheduleDoctor,
      time: scheduleTime || "11:30 AM",
      status: "Scheduled",
      reason: scheduleReason || "Tele-dentistry review",
    };
    setConsults((prev) => [newConsult, ...prev]);
    toast.success(
      `Video consultation scheduled for ${newConsult.patientName} at ${newConsult.time}. WhatsApp invite sent to patient.`,
    );
    setActiveTab("consults");
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setCallChatMessages((prev) => [
      ...prev,
      {
        sender: "Doctor",
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="space-y-6">
      {/* Clean Full-Width Header */}
      <DentflowPageHeader
        title="Video Consultation"
        subtitle="Tele-dentistry consultations, live patient reviews, and instant encrypted video rooms"
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <DentflowKpiCard
          label="Today's Video Consults"
          value={String(consults.length)}
          subtext="1 In Progress"
          subtextTone="green"
          highlighted
        />
        <DentflowKpiCard
          label="Scheduled Next 7 Days"
          value="14"
          subtext="+4 vs last week"
          subtextTone="muted"
        />
        <DentflowKpiCard
          label="Completed Tele-Visits"
          value="128"
          subtext="96% Satisfaction"
          subtextTone="green"
        />
        <DentflowKpiCard
          label="Average Call Time"
          value="11m 40s"
          subtext="Buffer safe"
          subtextTone="teal"
        />
      </div>

      {/* Main Container with Tabs & Actions */}
      <div className="df-card">
        {/* Navigation Tabs + Action Buttons Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-border)] px-4 py-2.5 bg-[var(--df-surface-muted)]/30 rounded-t-xl">
          {/* Left: Tab Selectors */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("consults")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "consults"
                  ? "bg-[var(--df-surface)] text-[var(--df-teal)] shadow-xs border border-[var(--df-border)] font-bold"
                  : "text-[var(--df-text-muted)] hover:text-[var(--df-text)] hover:bg-[var(--df-surface-hover)]"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Today&apos;s Consults ({consults.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "schedule"
                  ? "bg-[var(--df-surface)] text-[var(--df-teal)] shadow-xs border border-[var(--df-border)] font-bold"
                  : "text-[var(--df-text-muted)] hover:text-[var(--df-text)] hover:bg-[var(--df-surface-hover)]"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule New Consult</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("instant")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "instant"
                  ? "bg-[var(--df-surface)] text-[var(--df-teal)] shadow-xs border border-[var(--df-border)] font-bold"
                  : "text-[var(--df-text-muted)] hover:text-[var(--df-text)] hover:bg-[var(--df-surface-hover)]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Room Generator</span>
            </button>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("instant")}
              className="df-btn-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] text-[var(--df-text)] shadow-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--df-teal)]" />
              <span>Instant Room</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className="df-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-xl text-white bg-[var(--df-teal)] hover:bg-[var(--df-teal-hover)] shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Consult</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Today's Consults */}
        {activeTab === "consults" && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              {consults.map((vc) => (
                <div
                  key={vc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] hover:border-[var(--df-teal-border)] transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--df-text)]">{vc.patientName}</span>
                      <span className="text-xs text-[var(--df-text-muted)]">{vc.patientPhone}</span>
                      <DentflowStatusPill
                        label={vc.status}
                        tone={vc.status === "In Progress" ? "green" : "blue"}
                      />
                    </div>
                    <p className="text-xs text-[var(--df-text-muted)]">
                      {vc.time} · Doctor: {vc.doctorName}
                    </p>
                    <p className="text-xs text-[var(--df-text)] bg-[var(--df-surface-muted)]/60 px-2 py-1 rounded inline-block mt-1">
                      Reason: {vc.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText?.(
                          `https://meet.dentflow.in/room/df-tele-${vc.id}`,
                        );
                        toast.success("Meeting link copied to clipboard");
                      }}
                      className="df-btn-secondary px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] hover:bg-[var(--df-surface-hover)] text-[var(--df-text)] shadow-xs transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5 text-[var(--df-text-muted)]" />
                      <span>Copy Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCallRoom({
                          patientName: vc.patientName,
                          patientPhone: vc.patientPhone,
                          doctorName: vc.doctorName,
                          time: vc.time,
                          reason: vc.reason,
                        });
                      }}
                      className="df-btn-primary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer rounded-xl text-white bg-[var(--df-teal)] hover:bg-[var(--df-teal-hover)] shadow-xs transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Join Call Room</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Schedule New */}
        {activeTab === "schedule" && (
          <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-4">
            <h3 className="text-base font-semibold text-[var(--df-text)]">
              Schedule Video Consultation
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--df-text-muted)] mb-1">
                  Select Patient
                </label>
                <select
                  value={schedulePatientId}
                  onChange={(e) => setSchedulePatientId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                >
                  {state.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone}) - {p.age}y / {p.gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--df-text-muted)] mb-1">
                    Attending Dentist
                  </label>
                  <select
                    value={scheduleDoctor}
                    onChange={(e) => setScheduleDoctor(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  >
                    <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
                    <option value="Dr. Arjun Mehta">Dr. Arjun Mehta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--df-text-muted)] mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                    placeholder="e.g. 11:30 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--df-text-muted)] mb-1">
                  Reason for Consultation
                </label>
                <input
                  type="text"
                  value={scheduleReason}
                  onChange={(e) => setScheduleReason(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[var(--df-border)] bg-[var(--df-surface)] px-3 py-2 text-[var(--df-text)]"
                  placeholder="e.g. Post-extraction swelling review"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[var(--df-text)] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={sendWhatsAppLink}
                  onChange={(e) => setSendWhatsAppLink(e.target.checked)}
                  className="rounded border-[var(--df-border)] accent-[var(--df-teal)]"
                />
                <span>Send WhatsApp invite with secure video room link to patient</span>
              </label>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleScheduleConsult}
                  className="w-full df-btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  <Video className="h-4 w-4" />
                  Confirm & Send Video Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Instant Meeting Generator */}
        {activeTab === "instant" && (
          <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[var(--df-teal-soft)] text-[var(--df-teal)] flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[var(--df-text)]">
                Instant Tele-Dentistry Room
              </h3>
              <p className="text-xs text-[var(--df-text-muted)]">
                Launch a disposable WebRTC video room immediately. Share the link with any patient or colleague.
              </p>
            </div>

            <div className="p-3 bg-[var(--df-surface-muted)] rounded-xl border border-[var(--df-border)] flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[var(--df-text)] truncate">{instantRoomUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText?.(instantRoomUrl);
                  toast.success("Instant room link copied to clipboard");
                }}
                className="p-1.5 rounded-lg border border-[var(--df-border)] hover:bg-[var(--df-surface)] text-[var(--df-text)] cursor-pointer"
                aria-label="Copy video consultation link"
                title="Copy link"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCallRoom({
                    patientName: "Instant Walk-in Patient",
                    patientPhone: "+91 98XXX XX000",
                    doctorName: "Dr. Sneha Kulkarni",
                    time: "Now",
                    reason: "Ad-hoc tele-consultation",
                  });
                }}
                className="df-btn-primary flex items-center gap-2 px-6 py-2.5 text-xs font-semibold cursor-pointer"
              >
                <Video className="h-4 w-4" />
                Start Instant Video Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Tele-Dentistry Video Call Overlay */}
      {activeCallRoom && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white animate-fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-zinc-900/80 px-4 py-3 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <div>
                <p className="text-sm font-semibold">{activeCallRoom.patientName}</p>
                <p className="text-xs text-zinc-400">
                  {activeCallRoom.doctorName} · {activeCallRoom.reason}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-mono font-medium">
                {formatTimer(callDuration)}
              </div>
              <Link
                href="/app/prescriptions"
                target="_blank"
                className="px-3 py-1 bg-[var(--df-teal)] hover:bg-[var(--df-teal-hover)] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Write Rx
              </Link>
            </div>
          </div>

          {/* Video Frames Center */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 my-4 min-h-0">
            {/* Main Patient Video */}
            <div className="md:col-span-2 relative bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
                  <User className="h-12 w-12" />
                </div>
                <div>
                  <p className="font-semibold text-base">{activeCallRoom.patientName}</p>
                  <p className="text-xs text-zinc-400">Live Video Stream · 1080p</p>
                </div>
              </div>

              {/* Doctor PiP Video */}
              <div className="absolute bottom-4 right-4 w-40 h-28 bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden shadow-2xl flex items-center justify-center">
                {isVideoOff ? (
                  <VideoOff className="h-6 w-6 text-zinc-500" />
                ) : (
                  <div className="text-center">
                    <User className="h-8 w-8 text-zinc-400 mx-auto" />
                    <span className="text-[10px] text-zinc-400">Dr. Sneha (You)</span>
                  </div>
                )}
              </div>
            </div>

            {/* In-Call Chat Drawer */}
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col p-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
                <MessageSquare className="h-4 w-4 text-[var(--df-teal)]" />
                Session Notes & In-Call Chat
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-3 text-xs">
                {callChatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl ${
                      msg.sender === "Doctor"
                        ? "bg-[var(--df-teal)]/20 border border-[var(--df-teal)]/40 ml-4"
                        : msg.sender === "System"
                        ? "bg-zinc-800/60 text-zinc-400 text-center text-[10px]"
                        : "bg-zinc-800 border border-zinc-700 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                      <span className="font-semibold">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-zinc-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send message to patient..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[var(--df-teal)]"
                />
                <button
                  type="submit"
                  aria-label="Send chat message"
                  title="Send chat message"
                  className="p-2 bg-[var(--df-teal)] rounded-lg text-white hover:bg-[var(--df-teal-hover)] cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Call Controls */}
          <div className="flex items-center justify-center gap-3 bg-zinc-900/80 px-6 py-3 rounded-2xl border border-zinc-800 w-fit mx-auto">
            <button
              type="button"
              onClick={() => setIsMicMuted(!isMicMuted)}
              aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              className={`p-3 rounded-xl cursor-pointer transition-colors ${
                isMicMuted ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
              title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
              className={`p-3 rounded-xl cursor-pointer transition-colors ${
                isVideoOff ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsScreenSharing(!isScreenSharing);
                toast.info(isScreenSharing ? "Stopped screen sharing" : "Sharing clinical screen with patient");
              }}
              aria-label={isScreenSharing ? "Stop sharing screen" : "Share clinical screen"}
              className={`p-3 rounded-xl cursor-pointer transition-colors ${
                isScreenSharing ? "bg-[var(--df-teal)] text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
              title="Share Screen"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCallRoom(null);
                toast.success("Tele-dentistry session ended. Clinical record updated.");
              }}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-colors"
            >
              <PhoneOff className="h-5 w-5" />
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
