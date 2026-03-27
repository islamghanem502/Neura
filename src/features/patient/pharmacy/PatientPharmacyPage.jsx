import React from 'react';
import { useAuthContext } from '../../../providers/AuthProvider';
import { Pill, Plus, ShoppingBag } from 'lucide-react';

export default function PatientPharmacyPage() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tight">
              Pharmacy &amp; Medications
            </h1>
            <p className="text-zinc-500 font-medium mt-1">Manage your active prescriptions and order refills.</p>
          </div>
          <button className="px-6 py-3 bg-zinc-900 text-white font-black text-sm rounded-2xl hover:bg-zinc-800 transition-all uppercase tracking-widest shadow-lg flex items-center gap-2">
            <ShoppingBag size={18} /> Pharmacy Store
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Pill size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-2">Lisinopril</h3>
              <p className="text-sm text-zinc-500 mb-6">10mg • Daily for Hypertension</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Active</span>
                <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Refill</button>
              </div>
           </div>

           <button className="h-full min-h-[200px] border-2 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-zinc-400 hover:border-blue-500/50 hover:text-blue-500 transition-all">
              <Plus size={32} />
              <span className="font-bold">Add Medication Note</span>
           </button>
        </div>
      </div>
    </div>
  );
}
