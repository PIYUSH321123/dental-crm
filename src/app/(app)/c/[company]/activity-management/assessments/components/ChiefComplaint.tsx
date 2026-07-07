import * as React from "react"

export default function ChiefComplaint() {
    return (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg p-3 shadow-sm space-y-3 font-sans h-full">
            <div className="text-[10px] font-bold text-[#1a6eb5] dark:text-sky-400 tracking-wider uppercase">
                CHIEF COMPLAINT
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Primary Complaint
                </label>
                <textarea 
                    className="w-full text-[11px] px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-[5px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#1a6eb5] dark:focus:border-sky-500 transition-colors h-9 resize-none"
                    defaultValue="Pain in left knee while walking and climbing stairs" 
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Pain Score (0–10)
                </label>
                <div className="flex gap-1 flex-wrap mt-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((score) => (
                        <div 
                            key={score}
                            className="w-[22px] h-[22px] rounded-full bg-[#eceff1] dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-semibold cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                            {score}
                        </div>
                    ))}
                    <div className="w-[22px] h-[22px] rounded-full bg-[#e67e22] text-white flex items-center justify-center text-[9px] font-bold cursor-pointer shadow-sm shadow-orange-500/20">
                        7
                    </div>
                    {[8, 9, 10].map((score) => (
                        <div 
                            key={score}
                            className="w-[22px] h-[22px] rounded-full bg-[#eceff1] dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-semibold cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                            {score}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Pain Duration
                </label>
                <select 
                    className="w-full text-[11px] px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-[5px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#1a6eb5] dark:focus:border-sky-500 transition-colors"
                    defaultValue="1–6 months"
                >
                    <option value="< 1 week">&lt; 1 week</option>
                    <option value="1–4 weeks">1–4 weeks</option>
                    <option value="1–6 months">1–6 months</option>
                    <option value="> 6 months">&gt; 6 months</option>
                </select>
            </div>
            
            <div className="flex flex-col gap-1 mt-1.5">
                <label className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Pain Type
                </label>
                <div className="flex gap-1 flex-wrap mt-1">
                    <span className="bg-[#e3f2fd] dark:bg-sky-950/50 text-[#1a6eb5] dark:text-sky-400 px-2 py-0.5 rounded-[10px] text-[9px] font-medium cursor-pointer transition-all hover:scale-105">
                        Dull Ache
                    </span>
                    <span className="bg-[#1a6eb5] dark:bg-sky-600 text-white px-2 py-0.5 rounded-[10px] text-[9px] font-semibold cursor-pointer transition-all hover:scale-105">
                        Sharp
                    </span>
                    <span className="bg-[#e3f2fd] dark:bg-sky-950/50 text-[#1a6eb5] dark:text-sky-400 px-2 py-0.5 rounded-[10px] text-[9px] font-medium cursor-pointer transition-all hover:scale-105">
                        Burning
                    </span>
                    <span className="bg-[#e3f2fd] dark:bg-sky-950/50 text-[#1a6eb5] dark:text-sky-400 px-2 py-0.5 rounded-[10px] text-[9px] font-medium cursor-pointer transition-all hover:scale-105">
                        Throbbing
                    </span>
                </div>
            </div>
        </div>
    )
}