import React from 'react';
import { 
  Users, ClipboardList, Clock, CheckCircle, TrendingUp,
  AlertTriangle, Activity, ChevronRight, 
  Plus, Search, Bell, Settings, Zap, 
  Footprints, MessageSquare, AlertCircle
} from 'lucide-react';
import { useAuthContext } from '../../providers/AuthProvider';
import { DashboardHeader } from '../../components/DashboardHeader';

const STATS = [
  { label: 'Patients Under Care', value: '18',  icon: Users,         color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Tasks Pending',       value: '6',   icon: ClipboardList, color: 'text-amber-600',  bg: 'bg-amber-50' },
  { label: 'Tasks Completed',     value: '22',  icon: CheckCircle,   color: 'text-emerald-600',bg: 'bg-emerald-50' },
  { label: 'Shift Remaining',     value: '4h',  icon: Clock,         color: 'text-blue-600',   bg: 'bg-blue-50' },
];

const TASKS = [
  { patient: 'Alice Johnson',  task: 'Administer IV medication',     priority: 'High',   done: false, room: "Bed 04" },
  { patient: 'Robert Chen',    task: 'Record post-op vitals',         priority: 'High',   done: false, room: "Bed 12" },
  { patient: 'Maria Garcia',   task: 'Wound dressing change',         priority: 'Medium', done: false, room: "Bed 08" },
  { patient: 'James Wilson',   task: 'Patient education — discharge', priority: 'Low',    done: true, room: "Bed 15" },
  { patient: 'Emma Thompson',  task: 'Blood pressure monitoring',     priority: 'Medium', done: true, room: "Bed 02" },
];

const PRIORITY_STYLE = {
  High:   'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-amber-50 text-amber-600 border-amber-100',
  Low:    'bg-zinc-50 text-zinc-500 border-zinc-100',
};

export default function NurseDashboard() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 p-4 md:p-8 font-sans">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-zinc-950 tracking-tight">
            Station Active: {user?.firstName || 'Alex'}
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Shift in progress — Central Wing B. Monitoring {TASKS.filter(t => !t.done).length} active tasks.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Priority Alert Banner */}
            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-rose-50 border border-rose-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={60} className="text-rose-600" /></div>
               <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 animate-pulse">
                 <AlertTriangle size={24} />
               </div>
               <div className="flex-1 relative z-10">
                 <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Immediate Attention</p>
                 <p className="text-sm font-bold text-zinc-950 mt-1">Patient Robert Chen (Bed 12) heart rate spike — 102 bpm. AI recommends checking IV flow.</p>
               </div>
               <button className="px-6 py-2 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-700 transition-colors uppercase tracking-widest relative z-10">Acknowledge</button>
            </div>

            {/* Task Area */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <ClipboardList size={24} className="text-violet-600" />
                  <h2 className="text-xl font-black text-zinc-950">Shift Tasks</h2>
                </div>
                <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                  {TASKS.filter(t => !t.done).length} Active Tasks
                </span>
              </div>

              <div className="space-y-4">
                {TASKS.map((t, i) => (
                  <div key={i} className={`group p-4 rounded-3xl border border-zinc-100 flex items-center justify-between transition-all duration-500 ${t.done ? 'bg-zinc-50 opacity-50' : 'bg-white hover:shadow-xl hover:shadow-zinc-200/40'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-200'}`}>
                        {t.done && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-zinc-950 ${t.done ? 'line-through text-zinc-400' : ''}`}>{t.task}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">{t.patient} • {t.room}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-tighter ${PRIORITY_STYLE[t.priority]}`}>
                        {t.priority}
                      </span>
                      <ChevronRight size={18} className="text-zinc-300 group-hover:text-violet-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 text-sm font-bold hover:border-violet-500/50 hover:text-violet-500 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-black">
                 <Plus size={18} /> Add Note or Task
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Real-time Dashboard Vitals */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
              <h3 className="text-xl font-black text-zinc-950 mb-8">Live Vitals</h3>
              <div className="space-y-8">
                {STATS.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                        <stat.icon size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-zinc-950 leading-none mt-1">{stat.value}</p>
                      </div>
                    </div>
                    {i % 2 === 0 ? (
                      <TrendingUp size={16} className="text-emerald-500" />
                    ) : (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={80} /></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Zap size={14} fill="currentColor" /> Quick Nurse Tools
                </div>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { l: 'IV Check', i: Activity },
                     { l: 'Wound Care', i: Footprints },
                     { l: 'Handover', i: MessageSquare },
                     { l: 'Medication', i: ClipboardList }
                   ].map((item, idx) => (
                      <button key={idx} className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
                        <item.i size={20} className="text-blue-400" />
                        <span className="text-[10px] font-black tracking-widest uppercase">{item.l}</span>
                      </button>
                   ))}
                </div>
                <button className="w-full py-4 bg-violet-600 hover:bg-violet-500 transition-all rounded-2xl font-black text-sm uppercase tracking-widest">
                   Report Incident
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
