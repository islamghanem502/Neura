import React from 'react';
import {
  Heart, Calendar, Pill,
  Activity, Moon, Footprints,
  ChevronRight, Plus, Zap, Stethoscope
} from 'lucide-react';
import { useAuthContext } from '../../../providers/AuthProvider';

export default function PatientDashboard() {
  const { user } = useAuthContext();

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-black text-zinc-950 tracking-tight">
            Good morning, {user?.firstName || 'there'}
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Your health dashboard is up to date with the latest AI insights.</p>
        </header>

        {/* ─── MAIN GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT & CENTER COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. DIGITAL TWIN HERO CARD */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-10 items-center overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />

              {/* Twin Visualization Placeholder */}
              <div className="w-64 h-72 bg-zinc-50 rounded-[2rem] border border-zinc-100 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3b82f6_1px,transparent_1px)] bg-[size:10px_10px]" />
                <div className="relative z-10 text-blue-500/30">
                  <Activity size={120} strokeWidth={0.5} className="animate-pulse" />
                </div>
                {/* Floating Indicators */}
                <div className="absolute top-10 right-4 bg-white shadow-lg p-2 rounded-lg border border-zinc-100 flex items-center gap-2">
                  <Heart size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold">72 BPM</span>
                </div>
                <div className="absolute bottom-10 left-4 bg-white shadow-lg p-2 rounded-lg border border-zinc-100 flex items-center gap-2">
                  <Zap size={12} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-zinc-400">120/80</span>
                </div>
              </div>

              {/* Twin Info */}
              <div className="flex-1 space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  <Zap size={12} fill="currentColor" />
                  AI Twin Active
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-950 mb-1">Your Digital Twin</h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-blue-600">84</span>
                    <span className="text-zinc-400 font-bold">/ 100 Health Score</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                  Your physiological model is synced with your latest wearable data. <span className="text-emerald-600 font-bold">12% improvement</span> in cardiovascular efficiency detected this month.
                </p>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm">Sync New Data</button>
                  <button className="px-6 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all text-sm">View Analytics</button>
                </div>
              </div>
            </div>

            {/* 2. APPOINTMENTS & NURSE SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Book a Doctor */}
              <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <Calendar size={20} />
                  </div>
                  <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950">Book a Doctor</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Schedule specialists or view visits</p>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden border-2 border-white"><img src="https://i.pravatar.cc/150?u=sarah" alt="" /></div>
                    <div>
                      <p className="text-sm font-bold text-zinc-950 leading-none">Dr. Sarah Aris</p>
                      <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter">Cardiology • Tomorrow, 10:00 AM</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <button className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 text-sm font-bold hover:border-blue-500/50 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Schedule New Visit
                </button>
              </div>

              {/* Request a Nurse */}
              <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950">Request a Nurse</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">On-demand home care & testing</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all gap-2 group">
                    <div className="text-zinc-400 group-hover:text-emerald-600 transition-colors"><Footprints size={20} /></div>
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-emerald-700 transition-colors uppercase tracking-widest">Home Visit</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all gap-2 group">
                    <div className="text-zinc-400 group-hover:text-emerald-600 transition-colors"><Zap size={20} /></div>
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-emerald-700 transition-colors uppercase tracking-widest">Vaccination</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. MEDICATIONS SECTION */}
            <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Pill size={24} className="text-blue-500" />
                  <h3 className="text-xl font-black text-zinc-950">Your Medications</h3>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">3 Active Prescriptions</span>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-blue-600 shadow-sm"><Pill size={24} /></div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-lg leading-none">Lisinopril (10mg)</h4>
                      <p className="text-sm text-zinc-400 mt-1.5">Take once daily for Blood Pressure</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-1.5">12 Days Left</p>
                      <div className="w-32 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-white border-2 border-zinc-200 text-zinc-600 font-bold rounded-xl text-xs hover:border-blue-600 hover:text-blue-600 transition-all">Refill Now</button>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-zinc-950 rounded-2xl text-white shadow-xl shadow-zinc-900/10">
                  <Activity size={18} className="text-blue-400" />
                  <p className="text-xs font-bold">Next delivery: <span className="text-blue-400">Today by 6:00 PM</span></p>
                  <button className="ml-auto text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Track Package</button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-8">

            {/* 4. HEALTH OVERVIEW (Vitals Summary) */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-zinc-950">Health Overview</h3>
              <div className="space-y-8">
                {[
                  { label: 'Heart Rate', value: '72', unit: 'BPM', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', trend: 'normal' },
                  { label: 'Sleep', value: '7h 45m', unit: '', icon: Moon, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+8% Good' },
                  { label: 'Steps', value: '8,432', unit: '', icon: Footprints, color: 'text-amber-500', bg: 'bg-amber-50', pct: 84 },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                        <stat.icon size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-zinc-950 leading-none mt-1">{stat.value} <span className="text-sm font-medium text-zinc-400">{stat.unit}</span></p>
                      </div>
                    </div>
                    {stat.trend && <span className="text-[10px] font-bold text-emerald-500 uppercase">{stat.trend}</span>}
                    {stat.pct && (
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-100" />
                          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * stat.pct) / 100} className="text-amber-500 transition-all duration-1000" />
                        </svg>
                        <span className="absolute text-[10px] font-black text-zinc-900">{stat.pct}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. AI INSIGHTS CARD */}
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Zap size={80} /></div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Zap size={14} fill="currentColor" /> AI Insights
                </div>
                <div className="space-y-6">
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-sm leading-relaxed text-zinc-300">
                      "Your resting heart rate has lowered by 4 BPM over the last 14 days, indicating <span className="text-blue-400 font-bold">improved aerobic fitness.</span>"
                    </p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-sm leading-relaxed text-zinc-300">
                      "Moderate caffeine sensitivity detected after 4PM. Try herbal tea for better deep sleep cycles."
                    </p>
                  </div>
                </div>
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl font-black text-sm shadow-xl shadow-blue-900/50">
                  Generate Full Report
                </button>
              </div>
            </div>

            {/* 6. PHARMACY PARTNER CARD */}
            <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pharmacy Partners</span>
              <h3 className="text-2xl font-black text-zinc-950 mt-4 mb-2">20% Off Refills</h3>
              <p className="text-zinc-500 text-sm mb-6 leading-relaxed">Exclusive discount for Neura Health members at CVS and Walgreens.</p>
              <a href="#" className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-4 transition-all group">
                Claim Offer <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}