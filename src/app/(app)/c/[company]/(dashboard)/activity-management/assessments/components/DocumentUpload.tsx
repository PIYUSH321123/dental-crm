import * as React from "react"

export default function DocumentUpload() {
    const btnClasses = "bg-transparent border border-[#1a6eb5] text-[#1a6eb5] hover:bg-slate-50 px-2.5 py-1 text-[10px] rounded-md font-semibold cursor-pointer transition-colors"

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-3 font-sans mt-[10px]">
            <div className="text-[10px] font-bold text-[#1a6eb5] tracking-wider uppercase">
                DOCUMENTS & REPORTS
            </div>
            <div className="flex gap-2.5 items-center flex-wrap">
                <button type="button" className={btnClasses}>
                    📎 Upload X-Ray
                </button>
                <button type="button" className={btnClasses}>
                    📎 Upload MRI
                </button>
                <button type="button" className={btnClasses}>
                    📎 Upload Reports
                </button>
                <div className="text-[10px] text-slate-400 ml-2">
                    Uploaded: X-Ray (2), MRI Report.pdf
                </div>
            </div>
        </div>
    )
}
