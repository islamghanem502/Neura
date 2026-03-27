import React from 'react';
import { useAuthContext } from '../../../providers/AuthProvider';
import { Activity, Zap, Info } from 'lucide-react';
import { DigitalTwinVisual } from '../../landing/components/DigitalTwinVisual';

export default function DigitalTwinPage() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-zinc-950 tracking-tight">
            Digital Twin Model
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Real-time physiological simulation based on your health data.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-zinc-950 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden h-[600px] flex items-center justify-center">
             <DigitalTwinVisual />
             <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                <Zap size={14} fill="currentColor" /> Live Syncing
             </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
               <h3 className="text-xl font-black text-zinc-950 mb-4">Model Insights</h3>
               <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-3">
                     <Info size={18} className="text-blue-500 shrink-0" />
                     <p className="text-xs text-zinc-600 leading-relaxed font-semibold">Your model suggests an 8% increase in metabolic efficiency after recent activity changes.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
