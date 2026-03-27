import React from 'react';

// ── Icons Components (SVG) ──────────────────────────────────
const Icons = {
  FileCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  Video: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  ),
  Patient: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
};

// ── 1. AISummaryVisual (Voice to File - White Mode) ──────────────────
export const AISummaryVisual = () => {
  return (
    <div className="relative w-full h-[350px] flex flex-row justify-center items-center gap-6 md:gap-12 overflow-hidden px-4 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm">

      {/* Voice Waves */}
      <div className="flex gap-2 items-center h-20 justify-center shrink-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-2.5 bg-gradient-to-t from-indigo-500 to-blue-400 rounded-full animate-[wave_1.2s_ease-in-out_infinite]"
            style={{
              animationDelay: `${i * 0.1}s`,
              height: '40%'
            }}
          />
        ))}
      </div>

      {/* Transformation Arrow */}
      <div className="text-slate-300 shrink-0">
        <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
          <path d="M0 12H38M38 12L28 2M38 12L28 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Medical Report Card */}
      <div className="w-48 md:w-64 bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] transform rotate-2 hover:rotate-0 transition-all duration-500 shrink-0">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
          <Icons.FileCheck />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Medical Report</span>
        </div>
        <div className="space-y-3">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full animate-[shimmer_2s_infinite]" />
          </div>
          <div className="h-2 w-5/6 bg-slate-100 rounded-full" />
          <div className="h-2 w-4/6 bg-slate-100 rounded-full" />
        </div>
        <div className="mt-6 flex gap-2">
          <div className="px-2.5 py-1 bg-indigo-50 rounded text-[9px] font-bold text-indigo-600">SUMMARY</div>
          <div className="px-2.5 py-1 bg-blue-50 rounded text-[9px] font-bold text-blue-600">ACTION</div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

// ── 2. GroupTherapyVisual (Online Group - White Mode) ────────────────
export const GroupTherapyVisual = () => {
  return (
    <div className="relative w-full h-[350px] flex justify-center items-center overflow-hidden bg-slate-50 rounded-3xl border border-slate-200 shadow-sm">

      {/* Central Video Feed */}
      <div className="absolute z-20 w-36 h-28 bg-slate-800 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-white overflow-hidden">
        <Icons.Video />
        <span className="mt-2 text-[8px] font-bold text-slate-400 tracking-widest uppercase">Live Session</span>
        <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
      </div>

      {/* Orbit Rings (Visual Guide) */}
      <div className="absolute w-[220px] h-[220px] rounded-full border border-slate-200" />
      <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-slate-200 opacity-50" />

      {/* Orbiting Container */}
      <div className="absolute w-[250px] h-[250px] animate-[spin_15s_linear_infinite] z-10">
        {/* Participant 1 */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
            <Icons.Patient />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Participant 2 */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
            <Icons.Patient />
          </div>
        </div>

        {/* Participant 3 */}
        <div className="absolute top-1/2 -left-6 -translate-y-1/2">
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
            <Icons.Patient />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Participant 4 */}
        <div className="absolute top-1/2 -right-6 -translate-y-1/2">
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
            <Icons.Patient />
          </div>
        </div>
      </div>

      {/* Floating Sparkles for "Online" feel */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-200 rounded-full animate-bounce" />
      <div className="absolute bottom-10 right-20 w-3 h-3 bg-blue-100 rounded-full animate-pulse" />
    </div>
  );
};