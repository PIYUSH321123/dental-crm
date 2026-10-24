"use client";

import React, { useState } from "react";
import {
    Search,
    Bell,
    Building2,
    ChevronDown,
    Play,
    Send,
    ExternalLink,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    EXPLAINER_LANGUAGES,
    DENTAL_CHART_PATIENT,
    ExplainerLanguageData,
} from "@/lib/mock/dentflow";
import { toast } from "sonner";

interface DentflowExplainerProps {
    patientName?: string;
    patientMobile?: string;
    doctorName?: string;
    planId?: string;
    toothId?: string;
    branchName?: string;
    onBackToChart?: () => void;
}

export function DentflowExplainer({
    patientName = "Priya Deshmukh",
    patientMobile = "+91 98201 54321",
    doctorName = DENTAL_CHART_PATIENT.doctor,
    planId = "TP-2231",
    toothId = "36",
    branchName = DENTAL_CHART_PATIENT.branch,
    onBackToChart,
}: DentflowExplainerProps) {
    // Default to Hindi (hi) as shown in the screenshot
    const [selectedLangCode, setSelectedLangCode] = useState<string>("hi");
    const [selectedOption, setSelectedOption] = useState<"a" | "b" | "c">("a");

    // Checkboxes
    const [addAudio, setAddAudio] = useState(true);
    const [showEmi, setShowEmi] = useState(true);
    const [allowQuestions, setAllowQuestions] = useState(true);
    const [doctorApproved, setDoctorApproved] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const currentLang: ExplainerLanguageData =
        EXPLAINER_LANGUAGES.find((l) => l.code === selectedLangCode) || EXPLAINER_LANGUAGES[1];

    const handleSendWhatsApp = () => {
        if (!doctorApproved) {
            toast.error("Doctor approval required before sending explainer to patient.");
            return;
        }
        const cleanPhone = patientMobile.replace(/[\s\+\-]/g, "");
        const message = `Smile Studio Dental — Treatment Explainer for ${patientName}\n\n${currentLang.whatsappPreview.text}\n${currentLang.whatsappPreview.bestOption}\n\nView interactive explainer: https://dentflow.app/exp/${planId}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
        toast.success(`WhatsApp Explainer dispatched to ${patientName} (${patientMobile})`);
    };

    return (
        <div className="space-y-4">
            {/* Top Navigation & Context Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-1">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        Treatment explainer · {patientName}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Built from IOPA {toothId} and plan {planId} · doctor approval required before patient send
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Branch Dropdown */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer hover:bg-slate-50">
                        <Building2 className="h-3.5 w-3.5 text-[#0E6B5E]" />
                        <span>{branchName}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search patient, phone, invoice..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0E6B5E] w-48 lg:w-56"
                        />
                    </div>

                    {/* Notification Bell */}
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                    >
                        <Bell className="h-3.5 w-3.5" />
                    </button>

                    {/* User Profile Chip */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-1.5 pr-3 py-1 rounded-lg">
                        <div className="h-6 w-6 rounded-full bg-[#0E6B5E] text-white flex items-center justify-center text-[10px] font-bold">
                            {DENTAL_CHART_PATIENT.doctorInitials}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                                {doctorName}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 leading-none">
                                {DENTAL_CHART_PATIENT.doctorRole}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main 2-Column Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Area: Language selector, IOPA X-Ray + 3 Text Blocks, Options, Checkboxes (~68% width) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
                    {/* Language Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Language
                            </span>
                            <span className="text-[11px] text-slate-400">
                                AI draft · edit freely
                            </span>
                        </div>

                        {/* Language Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {EXPLAINER_LANGUAGES.map((lang) => {
                                const isActive = selectedLangCode === lang.code;
                                return (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setSelectedLangCode(lang.code)}
                                        className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer font-medium ${
                                            isActive
                                                ? "bg-[#1B2B28] text-white font-semibold shadow-xs"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                    >
                                        {lang.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Middle Section: X-Ray with Orange Annotation + 3 Text Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                        {/* IOPA Thumbnail with Hindi/Language annotation */}
                        <div className="md:col-span-4 space-y-1.5">
                            <div className="relative aspect-[4/3] w-full rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-xs">
                                <svg viewBox="0 0 200 150" className="w-full h-full">
                                    <rect width="200" height="150" fill="#080e1a" />
                                    <circle cx="100" cy="75" r="60" fill="#131e33" opacity="0.6" />
                                    {/* Molar Tooth Anatomy Silhouette */}
                                    <path
                                        d="M 65 35 Q 75 20 100 20 Q 125 20 135 35 L 140 85 Q 135 130 120 135 Q 110 110 100 85 Q 90 110 80 135 Q 65 130 60 85 Z"
                                        fill="#e2e8f0"
                                        opacity="0.85"
                                    />
                                    {/* Pulp chamber */}
                                    <path
                                        d="M 80 45 Q 100 40 120 45 L 115 80 Q 110 115 106 125 Q 102 105 100 80 Q 98 105 94 125 Q 90 115 85 80 Z"
                                        fill="#0f172a"
                                    />
                                    {/* Orange Ring Annotation */}
                                    <circle
                                        cx="102"
                                        cy="52"
                                        r="18"
                                        fill="none"
                                        stroke="#F2A66B"
                                        strokeWidth="3.5"
                                    />
                                    {/* Text inside annotation */}
                                    <text
                                        x="102"
                                        y="55"
                                        fill="#F2A66B"
                                        fontSize="9"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        सड़न
                                    </text>
                                </svg>
                            </div>
                            <p className="text-[11px] text-slate-500 text-left font-medium">
                                IOPA 36 · annotation added
                            </p>
                        </div>

                        {/* 3 Diagnosis and Care Text Boxes */}
                        <div className="md:col-span-8 space-y-2.5">
                            {/* What is happening */}
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 space-y-1">
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    What is happening
                                </span>
                                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                                    {currentLang.what}
                                </p>
                            </div>

                            {/* If we wait */}
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 space-y-1">
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    If we wait
                                </span>
                                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                                    {currentLang.wait}
                                </p>
                            </div>

                            {/* Recovery */}
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 space-y-1">
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    Recovery
                                </span>
                                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                                    {currentLang.recovery}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Options & Prices (Pulled from plan) */}
                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-slate-900 dark:text-white">
                            Options &amp; prices (pulled from plan)
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Option A */}
                            <div
                                onClick={() => setSelectedOption("a")}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                    selectedOption === "a"
                                        ? "border-[#0E6B5E] ring-1 ring-[#0E6B5E] bg-emerald-50/20 dark:bg-emerald-950/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                                }`}
                            >
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    {currentLang.options.a.title}
                                </div>
                                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                    {currentLang.options.a.price}{" "}
                                    <span className="font-normal text-slate-500 text-[11px]">
                                        · {currentLang.options.a.note}
                                    </span>
                                </div>
                            </div>

                            {/* Option B */}
                            <div
                                onClick={() => setSelectedOption("b")}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                    selectedOption === "b"
                                        ? "border-[#0E6B5E] ring-1 ring-[#0E6B5E] bg-emerald-50/20 dark:bg-emerald-950/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                                }`}
                            >
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    {currentLang.options.b.title}
                                </div>
                                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                    {currentLang.options.b.price}{" "}
                                    <span className="font-normal text-slate-500 text-[11px]">
                                        · {currentLang.options.b.note}
                                    </span>
                                </div>
                            </div>

                            {/* Option C */}
                            <div
                                onClick={() => setSelectedOption("c")}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                    selectedOption === "c"
                                        ? "border-[#0E6B5E] ring-1 ring-[#0E6B5E] bg-emerald-50/20 dark:bg-emerald-950/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                                }`}
                            >
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    {currentLang.options.c.title}
                                </div>
                                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                    {currentLang.options.c.price}{" "}
                                    <span className="font-normal text-slate-500 text-[11px]">
                                        · {currentLang.options.c.note}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkboxes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                            <Checkbox
                                checked={addAudio}
                                onCheckedChange={(v) => setAddAudio(!!v)}
                                className="border-[#0E6B5E] data-[state=checked]:bg-[#0E6B5E] data-[state=checked]:text-white"
                            />
                            <span>Add narrated audio (clinic voice)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                            <Checkbox
                                checked={showEmi}
                                onCheckedChange={(v) => setShowEmi(!!v)}
                                className="border-[#0E6B5E] data-[state=checked]:bg-[#0E6B5E] data-[state=checked]:text-white"
                            />
                            <span>Show EMI option (3 &times; ₹7,500)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                            <Checkbox
                                checked={allowQuestions}
                                onCheckedChange={(v) => setAllowQuestions(!!v)}
                                className="border-[#0E6B5E] data-[state=checked]:bg-[#0E6B5E] data-[state=checked]:text-white"
                            />
                            <span>Allow &quot;Ask a question&quot; reply</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-500 dark:text-slate-400">
                            <Checkbox
                                checked={doctorApproved}
                                onCheckedChange={(v) => setDoctorApproved(!!v)}
                                className="border-[#0E6B5E] data-[state=checked]:bg-[#0E6B5E] data-[state=checked]:text-white"
                            />
                            <span>Doctor approved content (required)</span>
                        </label>
                    </div>
                </div>

                {/* Right Area: WhatsApp Smartphone Preview & Dispatch CTAs (~32% width) */}
                <div className="lg:col-span-4 flex flex-col items-center space-y-4">
                    {/* Smartphone Mock Frame */}
                    <div className="w-full max-w-[320px] rounded-[36px] p-3.5 bg-[#16302D] shadow-xl border-4 border-[#16302D] text-slate-900">
                        <div className="rounded-[28px] overflow-hidden bg-white flex flex-col min-h-[460px]">
                            {/* Phone Header / WhatsApp Business Banner */}
                            <div className="bg-[#0E6B5E] px-4 py-3 text-center">
                                <span className="text-xs font-bold text-white tracking-wide">
                                    Smile Studio Dental
                                </span>
                            </div>

                            {/* Inside Phone Content */}
                            <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between bg-slate-50/50">
                                {/* Video Thumbnail Card */}
                                <div className="relative aspect-[16/10] w-full rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
                                    <svg viewBox="0 0 160 100" className="w-full h-full opacity-80">
                                        <rect width="160" height="100" fill="#080e1a" />
                                        <circle cx="80" cy="50" r="36" fill="#131e33" opacity="0.6" />
                                        <circle cx="80" cy="50" r="16" fill="none" stroke="#F2A66B" strokeWidth="3" />
                                    </svg>

                                    {/* Video duration pill */}
                                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                                        <Play className="h-2.5 w-2.5 fill-white" />
                                        <span>2:30</span>
                                    </div>
                                </div>

                                {/* Patient Specific Message */}
                                <div className="space-y-1.5 text-left">
                                    <p className="text-[11px] text-slate-800 leading-snug font-medium">
                                        {currentLang.whatsappPreview.text}
                                    </p>
                                    <p className="text-[10px] text-slate-600 font-semibold">
                                        {currentLang.whatsappPreview.bestOption}
                                    </p>
                                </div>

                                {/* 3 WhatsApp Quick Interactive Buttons */}
                                <div className="space-y-1.5 pt-1">
                                    <button
                                        type="button"
                                        className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-[#0E6B5E] shadow-2xs hover:bg-slate-50 cursor-pointer"
                                    >
                                        पूरा देखें
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-[#0E6B5E] shadow-2xs hover:bg-slate-50 cursor-pointer"
                                    >
                                        सवाल पूछें
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-[#0E6B5E] shadow-2xs hover:bg-slate-50 cursor-pointer"
                                    >
                                        अपॉइंटमेंट बुक करें
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons below smartphone */}
                    <div className="w-full max-w-[320px] space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg cursor-pointer"
                                onClick={() => toast.info("Opening patient web explainer link...")}
                            >
                                Preview link
                            </Button>
                            <Button
                                className="h-9 bg-[#0E6B5E] hover:bg-[#0c594e] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                                onClick={handleSendWhatsApp}
                            >
                                Send on WhatsApp
                            </Button>
                        </div>

                        <p className="text-[10px] text-slate-400 text-center leading-tight">
                            Tracks opens, watch time, questions and acceptance. Link expires in 30 days.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
