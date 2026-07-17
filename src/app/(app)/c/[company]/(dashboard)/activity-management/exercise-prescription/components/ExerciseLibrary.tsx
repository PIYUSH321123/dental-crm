"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export interface Exercise {
  id: number
  name: string
  category: string
  difficulty: string
  defaultRoutine: string
  icon: string
  bg: string
}

export interface ExerciseLibraryProps {
  onPrescribe?: (exercise: Exercise) => void
  onPreview?: (exercise: Exercise) => void
  onAddExercise?: () => void
}

// Data extracted directly from the requirement sheet catalog wireframe
const mockLibrary: Exercise[] = [
  { id: 1, name: "Quad Sets", category: "Knee", difficulty: "Beginner", defaultRoutine: "3 Sets × 15 Reps", icon: "🏋️", bg: "bg-[#e3f2fd]" },
  { id: 2, name: "Straight Leg Raise", category: "Knee", difficulty: "Beginner", defaultRoutine: "3 Sets × 12 Reps", icon: "🦵", bg: "bg-[#e8f5e9]" },
  { id: 3, name: "Hip Abduction", category: "Hip/Knee", difficulty: "Intermediate", defaultRoutine: "3 Sets × 10 Reps", icon: "🔄", bg: "bg-[#fff3e0]" },
  { id: 4, name: "Hamstring Stretch", category: "Knee/Back", difficulty: "Beginner", defaultRoutine: "Hold 30s × 3", icon: "🧘", bg: "bg-[#f3e5f5]" },
]

export default function ExerciseLibrary({
  onPrescribe,
  onPreview,
  onAddExercise,
}: ExerciseLibraryProps) {
  const inputStyles = "p-1.5 border border-[#cfd8dc] rounded-[5px] text-[11px] bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"

  // Search and Filter states
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All Categories")
  const [selectedDifficulty, setSelectedDifficulty] = React.useState("All Difficulty")

  // Memoized filter logic
  const filteredLibrary = React.useMemo(() => {
    return mockLibrary.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = 
        selectedCategory === "All Categories" || 
        item.category.toLowerCase().includes(selectedCategory.toLowerCase())

      const matchesDifficulty = 
        selectedDifficulty === "All Difficulty" || 
        item.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [searchQuery, selectedCategory, selectedDifficulty])

  return (
    <div className="space-y-4">
      {/* Live Search and Filter Operations Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <input 
          type="text" 
          className={`${inputStyles} flex-1 min-w-[180px]`} 
          placeholder="🔍 Search exercises..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className={inputStyles} 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All Categories">All Categories</option>
          <option value="Knee">Knee</option>
          <option value="Back">Back</option>
          <option value="Shoulder">Shoulder</option>
        </select>
        <select 
          className={inputStyles} 
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          <option value="All Difficulty">All Difficulty</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
        </select>
        <Button 
          size="sm" 
          className="text-xs ml-auto bg-primary text-white"
          onClick={onAddExercise}
        >
          + Add Exercise to Catalog
        </Button>
      </div>

      {/* Exercise Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredLibrary.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-[#dde3ed] overflow-hidden shadow-sm flex flex-col justify-between">
            <div className={`${item.bg} h-20 flex items-center justify-center text-3xl`}>
              {item.icon}
            </div>
            <div className="p-3 space-y-1">
              <div className="text-[12px] font-bold text-foreground">{item.name}</div>
              <div className="text-[9px] text-muted-foreground">{item.category} • {item.difficulty}</div>
              <div className="text-[10px] text-foreground font-medium pt-1">{item.defaultRoutine}</div>
              
              <div className="flex gap-1 pt-2 mt-auto">
                <button 
                  type="button" 
                  onClick={() => onPrescribe?.(item)}
                  className="flex-1 text-[10px] py-1 font-semibold rounded-[4px] bg-[#1a6eb5] text-white hover:bg-[#0f4a7d] cursor-pointer"
                >
                  + Prescribe
                </button>
                <button 
                  type="button" 
                  onClick={() => onPreview?.(item)}
                  className="px-2 py-1 text-[10px] font-semibold border border-[#1a6eb5] text-[#1a6eb5] rounded-[4px] hover:bg-[#f0f5ff] cursor-pointer"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredLibrary.length === 0 && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No exercises found matching your search.
        </div>
      )}
    </div>
  )
}
