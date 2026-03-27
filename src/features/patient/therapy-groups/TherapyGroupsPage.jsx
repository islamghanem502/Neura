import React from 'react';
import { useAuthContext } from '../../../providers/AuthProvider';
import { Users, Video, Plus } from 'lucide-react';

export default function TherapyGroupsPage() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tight">
              Therapy Groups
            </h1>
            <p className="text-zinc-500 font-medium mt-1">Connect with others in secure, moderated support sessions.</p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center gap-2">
            <Plus size={18} /> Join New Group
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="group bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Users size={24} />
                   </div>
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                      <Video size={12} /> Live Now
                   </span>
                </div>
                <h3 className="text-2xl font-black text-zinc-950 mb-2">Morning Mindfulness</h3>
                <p className="text-zinc-500 text-sm mb-6 leading-relaxed">Weekly collective meditation and anxiety management session led by Dr. Sarah Jenkins.</p>
                <button className="w-full py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all text-sm uppercase tracking-widest shadow-lg shadow-zinc-200">
                   Enter Session
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
