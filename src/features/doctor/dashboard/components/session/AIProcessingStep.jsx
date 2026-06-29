import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Clock, ShieldX } from 'lucide-react';

export default function AIProcessingStep({ appt }) {
  const apptId = appt?.id || appt?._id || '8291';
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => (p >= 88 ? p : Math.min(p + Math.random() * 5, 88)));
    }, 700);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] overflow-hidden relative rounded-[32px] py-8">
      
      {/* ── Background Effects ────────────────────────────────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2563EB]/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/20 rounded-full blur-[120px]"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-100/30 rounded-full blur-[80px]"></div>

      <div className="relative flex flex-col items-center justify-center w-full max-w-3xl px-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* ── Main Glass Card ──────────────────────────────────────────────── */}
        <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center relative overflow-hidden mb-6">
          
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-transparent blur-2xl"></div>

          {/* Icon Area */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#2563EB]/20 rounded-[24px] blur-xl animate-pulse"></div>
            <div className="relative w-[80px] h-[80px] rounded-[24px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]">
               <Sparkles size={32} className="text-white fill-white/20 animate-pulse" />
               
               {/* Orbital Ring */}
               <div className="absolute inset-[-8px] border border-[#2563EB]/20 rounded-[32px] animate-spin-slow"></div>
               <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#2563EB] rounded-full blur-[1px]"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-[24px] font-black text-[#0F172A] tracking-tight mb-2">
              Generating Intelligence...
            </h2>
            <p className="text-[14px] text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              Neura AI is processing your clinical dialogue to extract symptoms, diagnoses, and insights.
            </p>
          </div>

          {/* ── Progress Section ───────────────────────────────────────────── */}
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping"></div>
                <span className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-[0.2em]">Neural Synthesis</span>
              </div>
              <span className="text-[12px] font-black text-[#2563EB] tabular-nums">{Math.round(progress)}%</span>
            </div>
            
            <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                {/* Moving Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
            <ShieldX size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted Analysis</span>
          </div>

        </div>

        {/* ── Sub-Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            { Icon: FileText, label: 'Source Stream', value: `Consultation #${apptId.slice(-4).toUpperCase()}`, color: 'text-blue-500 bg-blue-50' },
            { Icon: Sparkles, label: 'AI Model', value: 'Neura Clinical v4', color: 'text-violet-500 bg-violet-50' },
            { Icon: Clock, label: 'Time Elapsed', value: `${Math.floor(progress/8)} seconds`, color: 'text-emerald-500 bg-emerald-50' },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="bg-white/80 backdrop-blur-md border border-white rounded-[20px] p-5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.03)] hover:translate-y-[-2px] transition-transform duration-300">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3 shadow-sm`}>
                <Icon size={16} />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
              <p className="text-[13px] font-bold text-[#0F172A]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}} />
    </div>
  );
}
