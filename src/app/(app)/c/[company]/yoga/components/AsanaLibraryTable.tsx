"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Pose {
    id: number
    sanskrit: string
    english: string
    target: string
    level: string
    duration: string
    issues: string
    emoji: string
}

interface Pranayama {
    id: number
    name: string
    english: string
    level: string
    duration: string
    contraindications: string
    emoji: string
}

interface Meditation {
    id: number
    name: string
    description: string
    level: string
    duration: string
    emoji: string
}

interface Sequence {
    id: number
    name: string
    duration: string
    posesCount: number
    description: string
}

// Move static values and classes outside of the component render cycle
const INPUT_STYLES = "p-1.5 border border-[#cfd8dc] rounded-[5px] text-[11px] bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8e44ad]";

const POSES: Pose[] = [
    { id: 1, sanskrit: "Tadasana", english: "Mountain Pose", target: "Full Body", level: "Beginner", duration: "30–60s", issues: "None", emoji: "🧘" },
    { id: 2, sanskrit: "Trikonasana", english: "Triangle Pose", target: "Back, Hips", level: "Intermediate", duration: "45–60s", issues: "Low BP, Neck issues", emoji: "🙆" },
    { id: 3, sanskrit: "Balasana", english: "Child's Pose", target: "Back, Hips", level: "Beginner", duration: "1–3 min", issues: "Knee injuries", emoji: "🤸" }
]

const PRANAYAMAS: Pranayama[] = [
    { id: 1, name: "Anulom Vilom", english: "Alternate Nostril Breathing", level: "Beginner", duration: "5-10 min", contraindications: "None", emoji: "🌬️" },
    { id: 2, name: "Kapalabhati", english: "Skull Shining Breath", level: "Intermediate", duration: "3-5 min", contraindications: "Pregnancy, Cardiac issues", emoji: "💨" },
    { id: 3, name: "Bhastrika", english: "Bellows Breath", level: "Advanced", duration: "2-3 min", contraindications: "Vertigo, Heart issues", emoji: "🔥" }
]

const MEDITATIONS: Meditation[] = [
    { id: 1, name: "Yoga Nidra", description: "Guided deep relaxation and sleep meditation", level: "All Levels", duration: "20-30 min", emoji: "🛌" },
    { id: 2, name: "Mindfulness", description: "Breath focus and present moment awareness", level: "Beginner", duration: "10-15 min", emoji: "🧠" },
    { id: 3, name: "Trataka", description: "Steady candle flame gazing to build concentration", level: "Intermediate", duration: "5-10 min", emoji: "🕯️" }
]

const SEQUENCES: Sequence[] = [
    { id: 1, name: "Monday Morning Hatha Flow", duration: "60 min", posesCount: 12, description: "Gentle morning warmups, sun salutations, standing poses, and Savasana." },
    { id: 2, name: "Evening Vinyasa Power Flow", duration: "45 min", posesCount: 18, description: "Fast-paced dynamic movements, core strength, arm balances, and cool downs." },
    { id: 3, name: "Gentle Prenatal Yoga Sequence", duration: "60 min", posesCount: 8, description: "Safe stretches, hip opening, breathing practices, and restorative poses." }
]

export default function AsanaLibraryTable() {
    const [activeSubTab, setActiveSubTab] = React.useState<"asanas" | "pranayama" | "meditation" | "sequences">("asanas")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedBodyArea, setSelectedBodyArea] = React.useState("All Body Areas")
    const [selectedLevel, setSelectedLevel] = React.useState("All Levels")

    // Filter list using search query, body area, and level category dropdowns
    const filteredPoses = React.useMemo(() => {
        return POSES.filter((pose) => {
            const matchesSearch = 
                pose.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pose.sanskrit.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesBodyArea = 
                selectedBodyArea === "All Body Areas" || 
                pose.target.toLowerCase().includes(selectedBodyArea.toLowerCase())

            const matchesLevel = 
                selectedLevel === "All Levels" || 
                pose.level.toLowerCase() === selectedLevel.toLowerCase()

            return matchesSearch && matchesBodyArea && matchesLevel
        })
    }, [searchQuery, selectedBodyArea, selectedLevel])

    const filteredPranayama = React.useMemo(() => {
        return PRANAYAMAS.filter((p) => {
            const matchesSearch = 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.english.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesLevel = 
                selectedLevel === "All Levels" || 
                p.level.toLowerCase() === selectedLevel.toLowerCase()

            return matchesSearch && matchesLevel
        })
    }, [searchQuery, selectedLevel])

    const filteredMeditation = React.useMemo(() => {
        return MEDITATIONS.filter((m) => {
            const matchesSearch = 
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.description.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesLevel = 
                selectedLevel === "All Levels" || 
                m.level.toLowerCase() === selectedLevel.toLowerCase()

            return matchesSearch && matchesLevel
        })
    }, [searchQuery, selectedLevel])

    const filteredSequences = React.useMemo(() => {
        return SEQUENCES.filter((s) => {
            return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   s.description.toLowerCase().includes(searchQuery.toLowerCase())
        })
    }, [searchQuery])

    const handleAddEntry = () => {
        const type = activeSubTab === "asanas" ? "Asana" : activeSubTab === "pranayama" ? "Pranayama" : activeSubTab === "meditation" ? "Meditation" : "Sequence"
        toast.info(`${type} wizard: Add Entry is coming soon!`)
    }

    const handleAddToSequence = (poseName: string) => {
        toast.success(`Added ${poseName} to active sequence`)
    }

    const handleEditPose = (poseName: string) => {
        toast.info(`Editing details for ${poseName}`)
    }

    return (
        <div className="space-y-4">
            {/* Sub-tabs strip */}
            <div className="flex border-b border-border text-xs font-medium">
                <button 
                    type="button" 
                    onClick={() => { setActiveSubTab("asanas"); setSearchQuery(""); }}
                    className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                        activeSubTab === "asanas" 
                        ? "border-[#8e44ad] text-[#8e44ad]" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Asanas
                </button>
                <button 
                    type="button" 
                    onClick={() => { setActiveSubTab("pranayama"); setSearchQuery(""); }}
                    className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                        activeSubTab === "pranayama" 
                        ? "border-[#8e44ad] text-[#8e44ad]" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Pranayama
                </button>
                <button 
                    type="button" 
                    onClick={() => { setActiveSubTab("meditation"); setSearchQuery(""); }}
                    className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                        activeSubTab === "meditation" 
                        ? "border-[#8e44ad] text-[#8e44ad]" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Meditation
                </button>
                <button 
                    type="button" 
                    onClick={() => { setActiveSubTab("sequences"); setSearchQuery(""); }}
                    className={`px-4 py-2 border-b-2 font-semibold -mb-[2px] transition-colors cursor-pointer ${
                        activeSubTab === "sequences" 
                        ? "border-[#8e44ad] text-[#8e44ad]" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Class Sequences
                </button>
            </div>

            {/* Filter and Operations Bar */}
            <div className="flex flex-wrap gap-2 items-center">
                <input 
                    type="text" 
                    className={`${INPUT_STYLES} flex-1 min-w-[160px]`} 
                    placeholder={
                        activeSubTab === "asanas" 
                        ? "🔍 Search English or Sanskrit index..." 
                        : activeSubTab === "pranayama"
                        ? "🔍 Search Pranayama exercises..."
                        : activeSubTab === "meditation"
                        ? "🔍 Search Meditation techniques..."
                        : "🔍 Search Class Sequences..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {activeSubTab === "asanas" && (
                    <select 
                        className={INPUT_STYLES} 
                        value={selectedBodyArea}
                        onChange={(e) => setSelectedBodyArea(e.target.value)}
                    >
                        <option value="All Body Areas">All Body Areas</option>
                        <option value="Back">Back</option>
                        <option value="Hips">Hips</option>
                        <option value="Full Body">Full Body</option>
                    </select>
                )}

                {(activeSubTab === "asanas" || activeSubTab === "pranayama" || activeSubTab === "meditation") && (
                    <select 
                        className={INPUT_STYLES} 
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                        <option value="All Levels">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                )}

                <Button 
                    size="sm" 
                    className="text-xs bg-[#8e44ad] text-white hover:bg-[#6a1b9a] ml-auto cursor-pointer"
                    onClick={handleAddEntry}
                >
                    {activeSubTab === "asanas" 
                        ? "+ Add Asana" 
                        : activeSubTab === "pranayama" 
                        ? "+ Add Pranayama" 
                        : activeSubTab === "meditation" 
                        ? "+ Add Meditation" 
                        : "+ New Sequence"
                    }
                </Button>
            </div>

            {/* Content Tables */}
            {activeSubTab === "asanas" && (
                <div className="overflow-x-auto w-full border border-[#eceff1] rounded-md bg-card shadow-xs">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                                <th className="p-2.5 pl-3">Image</th>
                                <th className="p-2.5">Sanskrit Name</th>
                                <th className="p-2.5">English Name</th>
                                <th className="p-2.5">Body Area</th>
                                <th className="p-2.5">Level</th>
                                <th className="p-2.5">Duration</th>
                                <th className="p-2.5">Contraindications</th>
                                <th className="p-2.5 pr-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                            {filteredPoses.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-2.5 pl-3">
                                        <div className="w-8 h-8 bg-[#f3e5f5] rounded flex items-center justify-center text-sm shadow-2xs">
                                            {p.emoji}
                                        </div>
                                    </td>
                                    <td className="p-2.5 text-foreground font-bold">{p.sanskrit}</td>
                                    <td className="p-2.5 text-foreground font-medium">{p.english}</td>
                                    <td className="p-2.5">{p.target}</td>
                                    <td className="p-2.5">{p.level}</td>
                                    <td className="p-2.5">{p.duration}</td>
                                    <td className="p-2.5 text-destructive/80 font-semibold">{p.issues}</td>
                                    <td className="p-2.5 pr-3 text-right space-x-1 whitespace-nowrap">
                                        <button 
                                            type="button" 
                                            onClick={() => handleEditPose(p.sanskrit)}
                                            className="text-[10px] px-2 py-0.5 border border-slate-300 rounded hover:bg-slate-100 text-foreground cursor-pointer transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleAddToSequence(p.sanskrit)}
                                            className="text-[10px] px-2 py-0.5 rounded bg-[#f3e5f5] text-[#8e44ad] font-semibold hover:bg-[#e1bee7] cursor-pointer transition-colors"
                                        >
                                            + Sequence
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === "pranayama" && (
                <div className="overflow-x-auto w-full border border-[#eceff1] rounded-md bg-card shadow-xs">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                                <th className="p-2.5 pl-3">Image</th>
                                <th className="p-2.5">Name</th>
                                <th className="p-2.5">English Translation</th>
                                <th className="p-2.5">Level</th>
                                <th className="p-2.5">Duration</th>
                                <th className="p-2.5">Contraindications</th>
                                <th className="p-2.5 pr-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                            {filteredPranayama.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-2.5 pl-3">
                                        <div className="w-8 h-8 bg-[#e8f5e9] rounded flex items-center justify-center text-sm shadow-2xs">
                                            {p.emoji}
                                        </div>
                                    </td>
                                    <td className="p-2.5 text-foreground font-bold">{p.name}</td>
                                    <td className="p-2.5 text-foreground font-medium">{p.english}</td>
                                    <td className="p-2.5">{p.level}</td>
                                    <td className="p-2.5">{p.duration}</td>
                                    <td className="p-2.5 text-destructive/80 font-semibold">{p.contraindications}</td>
                                    <td className="p-2.5 pr-3 text-right space-x-1 whitespace-nowrap">
                                        <button 
                                            type="button" 
                                            onClick={() => handleEditPose(p.name)}
                                            className="text-[10px] px-2 py-0.5 border border-slate-300 rounded hover:bg-slate-100 text-foreground cursor-pointer transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === "meditation" && (
                <div className="overflow-x-auto w-full border border-[#eceff1] rounded-md bg-card shadow-xs">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                                <th className="p-2.5 pl-3">Image</th>
                                <th className="p-2.5">Technique</th>
                                <th className="p-2.5">Description</th>
                                <th className="p-2.5">Level</th>
                                <th className="p-2.5">Duration</th>
                                <th className="p-2.5 pr-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                            {filteredMeditation.map((m) => (
                                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-2.5 pl-3">
                                        <div className="w-8 h-8 bg-[#e3f2fd] rounded flex items-center justify-center text-sm shadow-2xs">
                                            {m.emoji}
                                        </div>
                                    </td>
                                    <td className="p-2.5 text-foreground font-bold">{m.name}</td>
                                    <td className="p-2.5 text-foreground font-medium">{m.description}</td>
                                    <td className="p-2.5">{m.level}</td>
                                    <td className="p-2.5">{m.duration}</td>
                                    <td className="p-2.5 pr-3 text-right space-x-1 whitespace-nowrap">
                                        <button 
                                            type="button" 
                                            onClick={() => handleEditPose(m.name)}
                                            className="text-[10px] px-2 py-0.5 border border-slate-300 rounded hover:bg-slate-100 text-foreground cursor-pointer transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === "sequences" && (
                <div className="overflow-x-auto w-full border border-[#eceff1] rounded-md bg-card shadow-xs">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-[#37474f] text-white text-[10px] uppercase tracking-wider">
                                <th className="p-2.5 pl-3">Sequence Name</th>
                                <th className="p-2.5">Description</th>
                                <th className="p-2.5">Duration</th>
                                <th className="p-2.5">Poses Count</th>
                                <th className="p-2.5 pr-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eceff1] text-muted-foreground">
                            {filteredSequences.map((s) => (
                                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-2.5 pl-3 text-foreground font-bold">{s.name}</td>
                                    <td className="p-2.5 text-foreground font-medium">{s.description}</td>
                                    <td className="p-2.5">{s.duration}</td>
                                    <td className="p-2.5">{s.posesCount} poses</td>
                                    <td className="p-2.5 pr-3 text-right space-x-1 whitespace-nowrap">
                                        <button 
                                            type="button" 
                                            onClick={() => handleEditPose(s.name)}
                                            className="text-[10px] px-2 py-0.5 border border-slate-300 rounded hover:bg-slate-100 text-foreground cursor-pointer transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {((activeSubTab === "asanas" && filteredPoses.length === 0) ||
              (activeSubTab === "pranayama" && filteredPranayama.length === 0) ||
              (activeSubTab === "meditation" && filteredMeditation.length === 0) ||
              (activeSubTab === "sequences" && filteredSequences.length === 0)) && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                    No entries found matching your search criteria.
                </div>
            )}
        </div>
    )
}
