"use client";

import React, { useState } from "react";
import {
    Search,
    Bell,
    Upload,
    ChevronDown,
    Building2,
    Sparkles,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ODONTOGRAM_TEETH,
    PERIODONTAL_LOWER_LEFT,
    DENTAL_IMAGING_ITEMS,
    DENTAL_CHART_PATIENT,
    OdontogramTooth,
} from "@/lib/mock/dentflow";
import { toast } from "sonner";

interface DentflowChartProps {
    patientName?: string;
    doctorName?: string;
    lastCharted?: string;
    branchName?: string;
    onSwitchToExplainer?: () => void;
}

export function DentflowChart({
    patientName = DENTAL_CHART_PATIENT.name,
    doctorName = DENTAL_CHART_PATIENT.doctor,
    lastCharted = DENTAL_CHART_PATIENT.fdiNote,
    branchName = DENTAL_CHART_PATIENT.branch,
    onSwitchToExplainer,
}: DentflowChartProps) {
    const [dentitionType, setDentitionType] = useState<"adult" | "child" | "mixed">("adult");
    const [selectedToothNum, setSelectedToothNum] = useState<number>(36);
    const [teethState, setTeethState] = useState<Record<number, OdontogramTooth>>(ODONTOGRAM_TEETH);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedTooth: OdontogramTooth = teethState[selectedToothNum] || {
        number: selectedToothNum,
        status: "healthy",
        name: `Tooth ${selectedToothNum}`,
    };

    const toggleSurface = (surf: "B" | "M" | "O" | "D" | "L") => {
        setTeethState((prev) => {
            const current = prev[selectedToothNum] || {
                number: selectedToothNum,
                status: "healthy",
                name: `Tooth ${selectedToothNum}`,
            };
            const currentSurfaces = current.surfaces || { B: false, M: false, O: false, D: false, L: false };
            return {
                ...prev,
                [selectedToothNum]: {
                    ...current,
                    surfaces: {
                        ...currentSurfaces,
                        [surf]: !currentSurfaces[surf],
                    },
                },
            };
        });
    };

    const renderToothBox = (num: number) => {
        const tooth = teethState[num] || { number: num, status: "healthy", name: `Tooth ${num}` };
        const isSelected = selectedToothNum === num;
        const isMissing = tooth.status === "missing";

        // Styling based on status
        let borderClass = "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200";
        let badgeColor = "";

        if (isMissing) {
            borderClass = "border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-400";
        } else if (tooth.status === "caries") {
            borderClass = "border-[#A93226] text-[#A93226] bg-rose-50/40 dark:bg-rose-950/20";
            badgeColor = "text-[#A93226]";
        } else if (tooth.status === "filled") {
            borderClass = "border-sky-500 text-sky-700 dark:text-sky-400 bg-sky-50/40 dark:bg-sky-950/20";
            badgeColor = "text-sky-700 dark:text-sky-400";
        } else if (tooth.status === "crown") {
            borderClass = "border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20";
            badgeColor = "text-amber-700 dark:text-amber-400";
        } else if (tooth.status === "root_canal") {
            borderClass = "border-purple-600 text-purple-700 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20";
            badgeColor = "text-purple-700 dark:text-purple-400";
        } else if (tooth.status === "planned") {
            borderClass = "border-[#0E6B5E] text-[#0E6B5E] bg-emerald-50/40 dark:bg-emerald-950/20";
            badgeColor = "text-[#0E6B5E]";
        }

        return (
            <button
                key={num}
                type="button"
                onClick={() => setSelectedToothNum(num)}
                className={`relative flex flex-col items-center justify-between w-9 sm:w-10 h-14 sm:h-16 rounded-md border text-center transition-all cursor-pointer ${borderClass} ${
                    isSelected ? "ring-2 ring-[#0E6B5E] shadow-sm scale-105 z-10" : "hover:border-[#0E6B5E]/60"
                }`}
                title={`Tooth ${num}: ${tooth.name} (${tooth.status})`}
            >
                <span className="text-[11px] font-semibold pt-1 text-slate-800 dark:text-slate-200">
                    {num}
                </span>

                <div className="flex-1 flex items-center justify-center">
                    {isMissing ? (
                        <span className="text-[11px] text-slate-400 select-none">✕</span>
                    ) : tooth.badge ? (
                        <span className={`text-[11px] font-bold ${badgeColor}`}>
                            {tooth.badge}
                        </span>
                    ) : null}
                </div>
                <div className="w-full h-1" />
            </button>
        );
    };

    return (
        <div className="space-y-4">
            {/* Top Navigation & Context Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-1">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        Dental chart · {patientName}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {lastCharted}
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
                {/* Left Area: Odontogram, Periodontal & Imaging (~68% width) */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Odontogram Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Odontogram
                            </h2>

                            {/* Adult / Child / Mixed Tabs */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setDentitionType("adult")}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        dentitionType === "adult"
                                            ? "bg-[#1B2B28] text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                    }`}
                                >
                                    Adult
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDentitionType("child")}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        dentitionType === "child"
                                            ? "bg-[#1B2B28] text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                    }`}
                                >
                                    Child (primary)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDentitionType("mixed")}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        dentitionType === "mixed"
                                            ? "bg-[#1B2B28] text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                    }`}
                                >
                                    Mixed
                                </button>
                            </div>
                        </div>

                        {/* Upper Arch */}
                        <div className="space-y-2">
                            <div className="text-center text-[11px] text-slate-400 font-medium">
                                Upper · patient&apos;s right &larr; &rarr; patient&apos;s left
                            </div>

                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto pb-1">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                    {[18, 17, 16, 15, 14, 13, 12, 11].map(renderToothBox)}
                                </div>
                                <div className="w-[1.5px] h-12 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                    {[21, 22, 23, 24, 25, 26, 27, 28].map(renderToothBox)}
                                </div>
                            </div>
                        </div>

                        {/* Lower Arch */}
                        <div className="space-y-2 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto pb-1">
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                    {[48, 47, 46, 45, 44, 43, 42, 41].map(renderToothBox)}
                                </div>
                                <div className="w-[1.5px] h-12 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                    {[31, 32, 33, 34, 35, 36, 37, 38].map(renderToothBox)}
                                </div>
                            </div>

                            <div className="text-center text-[11px] text-slate-400 font-medium">
                                Lower
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 inline-block" />
                                <span>Healthy</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded border border-[#A93226] bg-rose-50 inline-block" />
                                <span>Caries</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded border border-sky-500 bg-sky-50 inline-block" />
                                <span>Filled</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded border border-amber-600 bg-amber-50 inline-block" />
                                <span>Crown</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded border border-purple-600 bg-purple-50 inline-block" />
                                <span>Root canal</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-400 bg-slate-50 inline-block" />
                                <span>Missing</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded border border-[#0E6B5E] bg-emerald-50 inline-block" />
                                <span>Planned</span>
                            </div>
                        </div>
                    </div>

                    {/* Lower 2 Cards: Periodontal Chart & Imaging */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Periodontal Chart Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                Periodontal chart · lower left
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                                            <th className="py-1.5 pr-2 font-medium">Tooth</th>
                                            {PERIODONTAL_LOWER_LEFT.map((item) => (
                                                <th key={item.tooth} className="py-1.5 px-1.5 text-center font-bold text-slate-800 dark:text-slate-200">
                                                    {item.tooth}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Pocket mm */}
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="py-2 pr-2 font-medium text-slate-500 whitespace-nowrap">
                                                Pocket (mm)
                                            </td>
                                            {PERIODONTAL_LOWER_LEFT.map((item) => (
                                                <td key={item.tooth} className="py-2 px-1.5 text-center">
                                                    {item.pocket !== null ? (
                                                        item.alert ? (
                                                            <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-[#A93226] font-bold">
                                                                {item.pocket}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                                {item.pocket}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Bleeding */}
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="py-2 pr-2 font-medium text-slate-500 whitespace-nowrap">
                                                Bleeding
                                            </td>
                                            {PERIODONTAL_LOWER_LEFT.map((item) => (
                                                <td key={item.tooth} className="py-2 px-1.5 text-center">
                                                    {item.bleeding ? (
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#A93226]" />
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Mobility */}
                                        <tr>
                                            <td className="py-2 pr-2 font-medium text-slate-500 whitespace-nowrap">
                                                Mobility
                                            </td>
                                            {PERIODONTAL_LOWER_LEFT.map((item) => (
                                                <td key={item.tooth} className="py-2 px-1.5 text-center text-slate-500">
                                                    {item.mobility !== null ? item.mobility : ""}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                                Pockets &ge; 5 mm shaded. Compare with 12 Mar charting &rarr;
                            </p>
                        </div>

                        {/* Imaging Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    Imaging
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => toast.info("Opening RVG Import dialog...")}
                                    className="text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-2 py-0.5 rounded cursor-pointer"
                                >
                                    Upload / RVG import
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {DENTAL_IMAGING_ITEMS.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            if (item.hasAnnotation && onSwitchToExplainer) {
                                                onSwitchToExplainer();
                                            } else {
                                                toast.info(`Viewing ${item.title}`);
                                            }
                                        }}
                                        className="group cursor-pointer text-left"
                                    >
                                        <div className="aspect-[4/3] rounded bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden group-hover:ring-1 group-hover:ring-[#0E6B5E] transition-all">
                                            {item.hasAnnotation ? (
                                                <svg viewBox="0 0 100 80" className="w-full h-full opacity-90">
                                                    <rect width="100" height="80" fill="#080e1a" />
                                                    <circle cx="50" cy="40" r="30" fill="#131e33" opacity="0.6" />
                                                    <circle cx="50" cy="40" r="12" fill="none" stroke="#F2A66B" strokeWidth="2.5" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 100 80" className="w-full h-full opacity-60">
                                                    <rect width="100" height="80" fill="#080e1a" />
                                                    <path d="M 20 60 Q 50 30 80 60" stroke="#475569" strokeWidth="3" fill="none" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="mt-1">
                                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                                {item.title}
                                            </div>
                                            <div className="text-[9px] text-slate-400">
                                                {item.date}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                                Images are linked to teeth. Annotate &rarr; use in patient explainer.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Area: Selected Tooth Detail Panel (~32% width) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                    {/* Header */}
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {selectedTooth.number}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {selectedTooth.name}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-[#A93226] mt-1">
                            {selectedTooth.conditionText || `${selectedTooth.status.toUpperCase()} condition`}
                        </p>
                    </div>

                    {/* Surfaces Cross Grid */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Surfaces
                        </label>
                        <div className="flex flex-col items-center justify-center py-2">
                            {/* B surface */}
                            <button
                                type="button"
                                onClick={() => toggleSurface("B")}
                                className={`h-8 w-8 rounded text-xs font-bold transition-colors cursor-pointer ${
                                    selectedTooth.surfaces?.B
                                        ? "bg-[#A93226] text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                }`}
                            >
                                B
                            </button>

                            {/* M, O, D surfaces */}
                            <div className="flex items-center gap-1.5 my-1.5">
                                <button
                                    type="button"
                                    onClick={() => toggleSurface("M")}
                                    className={`h-8 w-8 rounded text-xs font-bold transition-colors cursor-pointer ${
                                        selectedTooth.surfaces?.M
                                            ? "bg-[#A93226] text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                    }`}
                                >
                                    M
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleSurface("O")}
                                    className={`h-8 w-8 rounded text-xs font-bold transition-colors cursor-pointer ${
                                        selectedTooth.surfaces?.O
                                            ? "bg-[#A93226] text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                    }`}
                                >
                                    O
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleSurface("D")}
                                    className={`h-8 w-8 rounded text-xs font-bold transition-colors cursor-pointer ${
                                        selectedTooth.surfaces?.D
                                            ? "bg-[#A93226] text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                    }`}
                                >
                                    D
                                </button>
                            </div>

                            {/* L surface */}
                            <button
                                type="button"
                                onClick={() => toggleSurface("L")}
                                className={`h-8 w-8 rounded text-xs font-bold transition-colors cursor-pointer ${
                                    selectedTooth.surfaces?.L
                                        ? "bg-[#A93226] text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                }`}
                            >
                                L
                            </button>
                        </div>
                    </div>

                    {/* Finding Box */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Finding
                        </label>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {selectedTooth.finding || "No abnormal symptoms noted. Sound clinical structure."}
                        </div>
                    </div>

                    {/* Planned on this tooth */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Planned on this tooth
                        </label>
                        <div className="space-y-1.5">
                            {selectedTooth.planned && selectedTooth.planned.length > 0 ? (
                                selectedTooth.planned.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                                    >
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                            {item.name}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {item.price}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">No treatment planned.</p>
                            )}
                        </div>
                    </div>

                    {/* Action CTAs */}
                    <div className="pt-2 space-y-2">
                        <Button
                            className="w-full h-9 bg-[#0E6B5E] hover:bg-[#0c594e] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                            onClick={() => toast.success(`Added procedures for Tooth ${selectedTooth.number} to treatment plan`)}
                        >
                            Add to treatment plan
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 text-xs font-medium rounded-lg cursor-pointer"
                            onClick={() => {
                                if (onSwitchToExplainer) {
                                    onSwitchToExplainer();
                                } else {
                                    toast.info("Navigating to Treatment Explainer...");
                                }
                            }}
                        >
                            Create patient explainer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
