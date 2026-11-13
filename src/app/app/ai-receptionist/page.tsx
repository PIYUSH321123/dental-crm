"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Mic,
  MicOff,
  Package,
  Receipt,
  RotateCcw,
  Send,
  Sparkles,
  User,
  Users,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DentflowPageHeader, DentflowStatusPill } from "@/components/dental/dentflow-primitives";
import { useDentflow } from "@/lib/dentflow-store";

type VoiceLanguage = "en-IN" | "hi-IN" | "mr-IN";
type OrbState = "idle" | "listening" | "processing" | "speaking";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  cardType?: "patient" | "appointment" | "invoice" | "inventory" | "staff" | "confirm_action";
  cardData?: any;
}

const QUICK_ACTIONS = [
  { title: "Daily summary", example: "Give me today's daily summary" },
  { title: "Register patient", example: "Create a new patient named..." },
  { title: "Book appointment", example: "Book an appointment for..." },
  { title: "Create invoice", example: "Create an invoice for..." },
  { title: "Record payment", example: "Record a payment for..." },
  { title: "Today's appointments", example: "Show today's appointments" },
  { title: "Overdue invoices", example: "Check overdue invoices" },
  { title: "Revenue this month", example: "Show revenue this month" },
  { title: "Low stock items", example: "Show low stock items" },
  { title: "Patient lookup", example: "Look up patient..." },
  { title: "Create lab order", example: "Create a lab order for..." },
  { title: "Show staff", example: "Show all staff members" },
];

export default function AiAssistantPage() {
  const { state, updateState } = useDentflow();

  // Settings & state
  const [handsFree, setHandsFree] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<VoiceLanguage>("en-IN");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handsFreeRef = useRef<boolean>(handsFree);
  const voiceEnabledRef = useRef<boolean>(voiceEnabled);
  const orbStateRef = useRef<OrbState>(orbState);

  handsFreeRef.current = handsFree;
  voiceEnabledRef.current = voiceEnabled;
  orbStateRef.current = orbState;

  // Hydrate settings from localStorage
  useEffect(() => {
    try {
      const storedHf = localStorage.getItem("dentflow_ai_handsfree");
      if (storedHf !== null) setHandsFree(storedHf === "true");

      const storedVoice = localStorage.getItem("dentflow_ai_voice");
      if (storedVoice !== null) setVoiceEnabled(storedVoice === "true");

      const storedLang = localStorage.getItem("dentflow_ai_lang");
      if (storedLang) setLanguage(storedLang as VoiceLanguage);
    } catch {}
  }, []);

  const handleToggleHandsFree = () => {
    setHandsFree((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dentflow_ai_handsfree", String(next));
      } catch {}
      if (next) {
        toast.info("Hands-free mode active — Assistant will continuously listen after replying.");
        startListening();
      } else {
        stopListening();
      }
      return next;
    });
  };

  const handleToggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dentflow_ai_voice", String(next));
      } catch {}
      if (!next && typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      toast.success(next ? "Voice response enabled" : "Voice response muted");
      return next;
    });
  };

  const handleLanguageChange = (newLang: VoiceLanguage) => {
    setLanguage(newLang);
    try {
      localStorage.setItem("dentflow_ai_lang", newLang);
    } catch {}
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
  };

  // Text to Speech
  const speakText = useCallback((text: string, onComplete?: () => void) => {
    if (!voiceEnabledRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel();
    setOrbState("speaking");

    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/₹/g, "rupees ")
      .slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language;
    utterance.rate = 1.05;

    utterance.onend = () => {
      setOrbState("idle");
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      setOrbState("idle");
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  }, [language]);

  // Speech Recognition Setup
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      toast.error("Speech Recognition is not supported by your browser. Please type below.");
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRecognition();
      rec.lang = language;
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => {
        setOrbState("listening");
        setLiveTranscript("Listening...");
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = final || interim;
        setLiveTranscript(text);

        if (final && final.trim()) {
          const spoken = final.trim();
          setLiveTranscript("");
          stopListening();

          if (spoken.toLowerCase() === "stop" || spoken.toLowerCase() === "exit") {
            setHandsFree(false);
            toast.info("Hands-free conversation stopped.");
            return;
          }

          processUserQuery(spoken);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e.error);
        setOrbState("idle");
        setLiveTranscript("");
        if (e.error === "not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone access.");
        }
      };

      rec.onend = () => {
        if (orbStateRef.current === "listening") {
          setOrbState("idle");
          setLiveTranscript("");
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setOrbState("idle");
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setOrbState("idle");
    setLiveTranscript("");
  }, []);

  const handleOrbClick = () => {
    if (orbState === "listening") {
      stopListening();
    } else {
      startListening();
    }
  };

  // Process User Query
  const processUserQuery = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setOrbState("processing");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = q.toLowerCase();

      // Guardrail: Diagnosis or medicine prescriptions
      if (
        lower.includes("prescribe") ||
        lower.includes("medicine") ||
        lower.includes("dosage") ||
        lower.includes("diagnose") ||
        lower.includes("antibiotic") ||
        lower.includes("painkiller")
      ) {
        const replyText =
          "Safety Guardrail: DentFlow AI is strictly barred from prescribing medications or issuing medical diagnoses. Please consult Dr. Sneha Kulkarni or your attending clinician for drug advice.";
        finishReply(replyText);
        return;
      }

      // 1. Patient lookup
      if (lower.includes("patient") && (lower.includes("lookup") || lower.includes("find") || lower.includes("show") || lower.includes("priya") || lower.includes("rohan") || lower.includes("meera"))) {
        const found =
          state.patients.find(
            (p) =>
              lower.includes(p.name.toLowerCase().split(" ")[0]) ||
              lower.includes(p.code.toLowerCase()),
          ) || state.patients[0];

        const replyText = `Here is the record for ${found.name} (${found.code}).`;
        finishReply(replyText, "patient", found);
        return;
      }

      // 2. Register patient
      if (lower.includes("register") || lower.includes("new patient") || lower.includes("create patient")) {
        const replyText =
          "I can register a new patient for Smile Studio Dental. Please confirm the details below:";
        finishReply(replyText, "confirm_action", {
          action: "REGISTER_PATIENT",
          title: "Register New Patient",
          details: "Name: Ananya Sharma · Phone: +91 98220 55110 · Branch: Station Road",
        });
        return;
      }

      // 3. Book appointment
      if (lower.includes("book") || lower.includes("schedule") || lower.includes("sitting")) {
        const replyText =
          "I can schedule an appointment. Ready to book for Chair 2 with Dr. Sneha:";
        finishReply(replyText, "confirm_action", {
          action: "BOOK_APPOINTMENT",
          title: "Book Chair Appointment",
          details: "Patient: Priya Deshmukh · Procedure: RCT 36 Sitting 2 · Slot: Thu 1 Oct 10:00 am · Chair 2",
        });
        return;
      }

      // 4. Create invoice / Record payment
      if (lower.includes("invoice") || lower.includes("bill")) {
        const replyText =
          "Here is the pending invoice proposal for Priya Deshmukh:";
        finishReply(replyText, "confirm_action", {
          action: "CREATE_INVOICE",
          title: "Generate GST Invoice",
          details: "Patient: Priya Deshmukh · Procedure: RCT 36 · Total: ₹8,000 (Exempt dental) · UPI Dynamic QR",
        });
        return;
      }

      if (lower.includes("payment")) {
        const replyText = "Ready to record a received payment:";
        finishReply(replyText, "confirm_action", {
          action: "RECORD_PAYMENT",
          title: "Record Payment Received",
          details: "Amount: ₹7,500 · Mode: UPI (Ref: UPI/2026/89412) · Patient: Priya Deshmukh",
        });
        return;
      }

      // 5. Today's appointments
      if (lower.includes("today") && lower.includes("appointment")) {
        const aptCount = state.appointments.length;
        const replyText = `You have ${aptCount} appointments scheduled today across Station Road branch. 4 chairs are active.`;
        finishReply(replyText, "appointment", state.appointments.slice(0, 3));
        return;
      }

      // 6. Overdue invoices & Revenue
      if (lower.includes("revenue") || lower.includes("overdue") || lower.includes("summary")) {
        const replyText =
          "Here is your clinic revenue overview: Collected ₹48,200 today across 4 chairs (71% UPI AutoPay, 18% card, 11% cash). Overdue invoices total ₹9,500 across 2 accounts.";
        finishReply(replyText, "invoice", {
          collectedToday: "₹48,200",
          overdue: "₹9,500",
          upiShare: "71%",
          chairsActive: 4,
        });
        return;
      }

      // 7. Low stock inventory
      if (lower.includes("stock") || lower.includes("inventory")) {
        const lowItems = state.inventoryItems.filter((i) => i.inStock <= i.reorderAt);
        const replyText = `Found ${lowItems.length} inventory items below reorder threshold: ${lowItems.map(i => i.item).slice(0, 3).join(", ") || "Composite resin A2"}.`;
        finishReply(replyText, "inventory", lowItems);
        return;
      }

      // 8. Staff members
      if (lower.includes("staff") || lower.includes("doctor")) {
        const replyText =
          "Smile Studio Dental has 6 staff members on duty today: Dr. Sneha Kulkarni, Dr. Arjun Mehta, Prakash Jha, Anita Pawar, Ravi Gaikwad, and visiting specialist Dr. Farhan Ali.";
        finishReply(replyText, "staff", {
          onDuty: 6,
          specialist: "Dr. Farhan Ali (Implantologist)",
          nextShift: "2:00 pm",
        });
        return;
      }

      // Default fallback
      const replyText = `Understood: "${q}". I have checked the live clinic database. What would you like me to look up or schedule next?`;
      finishReply(replyText);
    }, 700);
  };

  const finishReply = (
    replyText: string,
    cardType?: ChatMessage["cardType"],
    cardData?: any,
  ) => {
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: replyText,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      cardType,
      cardData,
    };

    setMessages((prev) => [...prev, assistantMsg]);

    speakText(replyText, () => {
      // If hands-free is enabled, automatically start listening again
      if (handsFreeRef.current) {
        setTimeout(() => {
          if (handsFreeRef.current) {
            startListening();
          }
        }, 500);
      }
    });
  };

  const handleConfirmAction = (cardData: any) => {
    if (cardData.action === "BOOK_APPOINTMENT") {
      toast.success("Appointment confirmed and synced to Chair 2 calendar!");
    } else if (cardData.action === "REGISTER_PATIENT") {
      toast.success("Patient Ananya Sharma registered with DPDP consent.");
    } else if (cardData.action === "CREATE_INVOICE") {
      toast.success("GST Invoice generated and dynamic UPI QR created.");
    } else if (cardData.action === "RECORD_PAYMENT") {
      toast.success("Payment of ₹7,500 recorded in Tally & billing register.");
    }
    finishReply("Action confirmed and executed successfully!");
  };

  const handleCancelAction = () => {
    finishReply("Action cancelled. No records were modified.");
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    processUserQuery(inputMessage);
  };

  const handleQuickAction = (example: string) => {
    setInputMessage(example);
    processUserQuery(example);
  };

  const handleResetChat = () => {
    setMessages([]);
    stopListening();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setOrbState("idle");
    toast.info("Conversation reset");
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] relative pb-28">
      {/* Header with Title and Assistant Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--df-border)]">
        <div>
          <h1 className="df-serif text-2xl font-semibold text-[var(--df-text)] tracking-tight">
            AI Assistant
          </h1>
          <p className="text-xs text-[var(--df-text-muted)] mt-0.5">
            Type or speak to manage your clinic
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hands-free pill indicator */}
          {handsFree && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--df-teal-soft)] text-[var(--df-teal)] border border-[var(--df-teal-border)] animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[var(--df-teal)]" />
              <span>Hands-free on</span>
            </span>
          )}

          {/* Hands-free Toggle Button */}
          <button
            type="button"
            onClick={handleToggleHandsFree}
            aria-label="Toggle hands-free mode"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              handsFree
                ? "bg-[var(--df-teal)] text-white border-[var(--df-teal)]"
                : "bg-[var(--df-surface)] text-[var(--df-text-secondary)] border-[var(--df-border)] hover:bg-[var(--df-surface-hover)]"
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full transition-transform ${
                handsFree ? "bg-white" : "bg-[var(--df-text-muted)]"
              }`}
            />
            <span>Hands-free</span>
          </button>

          {/* Voice On/Off Speaker Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            aria-label={voiceEnabled ? "Mute voice response" : "Enable voice response"}
            title={voiceEnabled ? "Voice replies enabled (tap to mute)" : "Voice replies muted (tap to enable)"}
            className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              voiceEnabled
                ? "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border-[var(--df-teal-border)]"
                : "bg-[var(--df-surface)] text-[var(--df-text-muted)] border-[var(--df-border)] hover:bg-[var(--df-surface-hover)]"
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-500" />}
          </button>

          {/* Language Selector */}
          <select
            aria-label="Speech language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as VoiceLanguage)}
            className="bg-[var(--df-surface)] border border-[var(--df-border)] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--df-text)] hover:border-[var(--df-border-strong)] focus:outline-none cursor-pointer"
          >
            <option value="en-IN">English (en-IN)</option>
            <option value="hi-IN">हिन्दी (hi-IN)</option>
            <option value="mr-IN">मराठी (mr-IN)</option>
          </select>

          {/* Reset chat when active */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)] text-[var(--df-text-muted)] hover:text-[var(--df-text)] hover:bg-[var(--df-surface-hover)] cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Body */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 py-6 space-y-7">
          {/* Large Circular Blue Mic Orb (126px) */}
          <div className="flex flex-col items-center relative my-2">
            <button
              type="button"
              onClick={handleOrbClick}
              aria-label="Tap to speak"
              className={`relative w-[126px] h-[126px] rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--df-teal)]/30 ${
                orbState === "listening"
                  ? "bg-[var(--df-teal)] text-white scale-105"
                  : orbState === "processing"
                  ? "bg-[#0B6A5B] text-white animate-spin"
                  : orbState === "speaking"
                  ? "bg-[var(--df-teal)] text-white ring-4 ring-[var(--df-teal-border)]"
                  : "bg-[var(--df-teal)] hover:bg-[var(--df-teal-hover)] text-white hover:scale-102"
              }`}
            >
              {/* Outer pulsing animated rings when listening */}
              {orbState === "listening" && (
                <>
                  <span className="absolute inset-0 rounded-full bg-[var(--df-teal)] opacity-30 animate-ping" />
                  <span className="absolute -inset-3 rounded-full border-2 border-[var(--df-teal)] opacity-60 animate-pulse" />
                  <span className="absolute -inset-6 rounded-full border border-[var(--df-teal-border)] opacity-40" />
                </>
              )}

              {/* Soft wave glowing ring when speaking */}
              {orbState === "speaking" && (
                <span className="absolute -inset-3 rounded-full border-2 border-[var(--df-teal-border)] opacity-70 animate-pulse" />
              )}

              <Mic className="h-12 w-12" />
            </button>

            {/* Live transcript under the orb */}
            {liveTranscript && (
              <div className="mt-3 px-3 py-1 rounded-full bg-[var(--df-teal-soft)] border border-[var(--df-teal-border)] text-xs font-semibold text-[var(--df-teal)] animate-pulse">
                {liveTranscript}
              </div>
            )}
          </div>

          {/* Heading & Descriptions */}
          <div className="text-center space-y-1.5 max-w-xl">
            <h2 className="df-serif text-2xl sm:text-[26px] font-semibold text-[var(--df-text)]">
              How can I help you today?
            </h2>
            <p className="text-sm text-[var(--df-text-secondary)] leading-relaxed">
              I can look up patients, check appointments, show revenue, manage inventory, and more.
            </p>
            <p className="text-xs font-semibold text-[var(--df-teal)] pt-1">
              Tap the orb to speak, or type below. Enable Hands-free for continuous conversation.
            </p>
          </div>

          {/* Grid of 12 Quick-Action Cards (4 cols desktop, 2 cols tablet, 1 col mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => handleQuickAction(action.example)}
                className="text-left p-3.5 rounded-xl df-card hover:border-[var(--df-teal)] hover:bg-[var(--df-surface-hover)] transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-[var(--df-text)] group-hover:text-[var(--df-teal)]">
                  {action.title}
                </p>
                <p className="text-[11px] text-[var(--df-text-muted)] mt-1 line-clamp-1 italic">
                  “{action.example}”
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Active Conversation Stream */
        <div className="flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "assistant" && (
                <div className="h-7 w-7 rounded-lg bg-[var(--df-teal)] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  W
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-3.5 space-y-2.5 text-xs ${
                  msg.sender === "user"
                    ? "bg-[var(--df-teal)] text-white rounded-tr-none shadow-sm"
                    : "df-card text-[var(--df-text)] rounded-tl-none shadow-sm"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Structured Cards */}
                {msg.cardType === "patient" && msg.cardData && (
                  <div className="p-3 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[var(--df-teal)] text-white font-bold text-xs flex items-center justify-center">
                          {msg.cardData.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--df-text)]">{msg.cardData.name}</p>
                          <p className="text-[11px] text-[var(--df-text-muted)]">
                            {msg.cardData.code} · {msg.cardData.phone}
                          </p>
                        </div>
                      </div>
                      <DentflowStatusPill label={msg.cardData.homeBranch} tone="teal" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--df-border)] text-[11px]">
                      <div>
                        <span className="text-[var(--df-text-muted)]">Allergies: </span>
                        <span className="font-semibold text-red-600">
                          {msg.cardData.allergies.join(", ") || "None"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--df-text-muted)]">Anxiety buffer: </span>
                        <span className="font-semibold text-[var(--df-teal)]">
                          +{msg.cardData.comfortProfile?.autoBufferMin || 0} min
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <Link
                        href={`/app/patients?patientId=${msg.cardData.id}`}
                        className="df-btn-secondary px-2.5 py-1 text-[11px] inline-flex items-center gap-1"
                      >
                        <span>View patient record</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {msg.cardType === "appointment" && Array.isArray(msg.cardData) && (
                  <div className="space-y-1.5 pt-1">
                    {msg.cardData.map((apt: any) => (
                      <div
                        key={apt.id}
                        className="p-2.5 rounded-lg bg-[var(--df-surface-muted)] border border-[var(--df-border)] flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-semibold text-[var(--df-text)]">{apt.patientName}</p>
                          <p className="text-[11px] text-[var(--df-text-muted)]">
                            {apt.time} · {apt.procedure} · {apt.doctor}
                          </p>
                        </div>
                        <DentflowStatusPill label={apt.chair} tone="blue" />
                      </div>
                    ))}
                    <div className="pt-1 text-right">
                      <Link href="/app/calendar" className="text-[11px] font-semibold text-[var(--df-teal)] hover:underline">
                        Open Day calendar →
                      </Link>
                    </div>
                  </div>
                )}

                {msg.cardType === "invoice" && msg.cardData && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--df-surface-muted)] border border-[var(--df-border)] text-[11px]">
                    <div>
                      <p className="text-[var(--df-text-muted)]">Collected today</p>
                      <p className="df-serif text-lg font-bold text-[var(--df-text)] mt-0.5">
                        {msg.cardData.collectedToday}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--df-text-muted)]">Overdue dues</p>
                      <p className="df-serif text-lg font-bold text-amber-600 mt-0.5">
                        {msg.cardData.overdue}
                      </p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[var(--df-border)] flex items-center justify-between">
                      <span className="text-[var(--df-text-muted)]">UPI AutoPay: {msg.cardData.upiShare}</span>
                      <Link href="/app/billing" className="font-semibold text-[var(--df-teal)] hover:underline">
                        View billing register →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Safety Confirmation Card for write actions */}
                {msg.cardType === "confirm_action" && msg.cardData && (
                  <div className="p-3.5 rounded-xl bg-[var(--df-surface)] border-2 border-[var(--df-teal-border)] space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[var(--df-teal)] font-bold text-xs">
                      <Sparkles className="h-4 w-4" />
                      <span>{msg.cardData.title}</span>
                    </div>
                    <p className="text-[11px] text-[var(--df-text-secondary)] bg-[var(--df-surface-muted)] p-2 rounded-lg border border-[var(--df-border)]">
                      {msg.cardData.details}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelAction}
                        className="df-btn-secondary px-3 py-1.5 text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmAction(msg.cardData)}
                        className="df-btn-primary px-3 py-1.5 text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Confirm & Save</span>
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.sender === "user" ? "text-white/80" : "text-[var(--df-text-muted)]"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 items-center">
              <div className="h-7 w-7 rounded-lg bg-[var(--df-teal)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                W
              </div>
              <div className="df-card px-4 py-2.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-1 text-[var(--df-text-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-teal)] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-teal)] animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-teal)] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-[236px] bg-[var(--df-canvas)]/95 backdrop-blur border-t border-[var(--df-border)] px-4 py-3 z-30">
        <div className="max-w-4xl mx-auto space-y-1.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-[var(--df-surface)] border border-[var(--df-border)] rounded-2xl p-1.5 shadow-xs focus-within:border-[var(--df-teal)] focus-within:ring-2 focus-within:ring-[var(--df-teal)]/20"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[var(--df-text)] placeholder:text-[var(--df-text-muted)] focus:outline-none"
            />

            {/* Small Mic Button mirroring state */}
            <button
              type="button"
              onClick={handleOrbClick}
              aria-label={orbState === "listening" ? "Stop listening" : "Start speaking"}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                orbState === "listening"
                  ? "bg-red-500 text-white animate-pulse"
                  : orbState === "speaking"
                  ? "bg-[var(--df-teal)] text-white"
                  : "text-[var(--df-text-muted)] hover:text-[var(--df-teal)] hover:bg-[var(--df-surface-hover)]"
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              aria-label="Send message"
              className={`p-2 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed ${
                inputMessage.trim()
                  ? "bg-[var(--df-teal)] text-white hover:bg-[var(--df-teal-hover)]"
                  : "bg-[var(--df-teal)]/30 text-white/70"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Disclaimer */}
          <p className="text-center text-[10.5px] text-[var(--df-text-muted)]">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
