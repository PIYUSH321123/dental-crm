import * as React from "react"

export default function ActionButtons() {
    const btnBase = "px-4 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors"

    return (
        <div className="flex gap-2 mt-3 flex-wrap font-sans">
            <button 
                type="button"
                className={`${btnBase} bg-[#1a6eb5] hover:bg-[#155a96] text-white`}
            >
                💾 Save Assessment
            </button>
            <button 
                type="button"
                className={`${btnBase} bg-[#27ae60] hover:bg-[#1e7e46] text-white`}
            >
                💾 Save & Create Treatment Plan
            </button>
            <button 
                type="button"
                className={`${btnBase} bg-transparent border border-[#1a6eb5] text-[#1a6eb5] hover:bg-slate-50`}
            >
                🖨 Print Assessment
            </button>
        </div>
    )
}
