import React from 'react';
import { 
  ShoppingBag, Package, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Pill, ChevronRight, Search, 
  Bell, Settings, Zap, Plus, Activity, Truck
} from 'lucide-react';
import { useAuthContext } from '../../providers/AuthProvider';
import { DashboardHeader } from '../../components/DashboardHeader';

const STATS = [
  { label: 'Orders Today',       value: '47',  icon: ShoppingBag,   color: 'text-amber-600',  bg: 'bg-amber-50' },
  { label: 'Pending Dispensing', value: '12',  icon: Clock,         color: 'text-blue-600',   bg: 'bg-blue-50' },
  { label: 'Items Low Stock',    value: '3',   icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50' },
  { label: 'Revenue Today',      value: '$2.4K',icon: TrendingUp,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
];

const ORDERS = [
  { id: '#RX-7821', patient: 'Alice Johnson', medication: 'Metformin 500mg × 30', status: 'Ready',      time: '09:12' },
  { id: '#RX-7822', patient: 'Robert Chen',   medication: 'Lisinopril 10mg × 60', status: 'Processing', time: '09:45' },
  { id: '#RX-7823', patient: 'Maria Garcia',  medication: 'Atorvastatin 20mg × 30',status:'Ready',      time: '10:02' },
  { id: '#RX-7824', patient: 'James Wilson',  medication: 'Amoxicillin 500mg × 21',status:'Dispensed',  time: '10:30' },
  { id: '#RX-7825', patient: 'Emma Thompson', medication: 'Omeprazole 20mg × 28', status: 'Processing', time: '11:00' },
];

const STATUS_STYLE = {
  Ready:      'bg-emerald-50 text-emerald-700 border-emerald-100',
  Processing: 'bg-blue-50 text-blue-700 border-blue-100',
  Dispensed:  'bg-zinc-50 text-zinc-500 border-zinc-100',
};

const LOW_STOCK = [
  { name: 'Insulin Glargine', stock: 8,  threshold: 20 },
  { name: 'Adrenaline 1mg/mL', stock: 3,  threshold: 15 },
  { name: 'Morphine Sulfate',  stock: 12, threshold: 25 },
];

export default function PharmacyDashboard() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 p-4 md:p-8 font-sans">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tight">
              {user?.firstName || 'Main'} Pharmacy
            </h1>
            <p className="text-zinc-500 font-medium mt-1">Dispensing queue and inventory intelligence dashboard.</p>
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 font-black text-sm rounded-2xl hover:bg-zinc-50 transition-all uppercase tracking-widest shadow-sm flex items-center gap-2">
                <Package size={18} className="text-zinc-400" /> Inventory
             </button>
             <button className="px-6 py-3 bg-amber-600 text-white font-black text-sm rounded-2xl hover:bg-amber-700 transition-all uppercase tracking-widest shadow-lg shadow-amber-200 flex items-center gap-2">
                <Plus size={18} /> New Rx
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-zinc-950 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Prescription Queue Area */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={24} className="text-amber-600" />
                  <h2 className="text-xl font-black text-zinc-950">Prescription Queue</h2>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-100">
                  {ORDERS.filter(o => o.status === 'Processing').length} In Progress
                </span>
              </div>

              <div className="space-y-4">
                {ORDERS.map((o, i) => (
                  <div key={i} className="group p-5 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-between hover:bg-white hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-amber-500 shadow-sm"><Pill size={24} /></div>
                      <div>
                        <h4 className="font-bold text-zinc-950 leading-tight">{o.medication}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-1">{o.patient} • {o.id} • {o.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-tighter ${STATUS_STYLE[o.status]}`}>
                        {o.status}
                      </span>
                      <ChevronRight size={18} className="text-zinc-300 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Inventory Alerts Card */}
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Package size={80} /></div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Zap size={14} fill="currentColor" /> Supply Intelligence
                </div>
                
                <div className="space-y-6">
                  {LOW_STOCK.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-zinc-200">{item.name}</span>
                        <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{item.stock} LEFT</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${(item.stock / item.threshold) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 transition-all rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                  <Truck size={18} /> Bulk Restock All
                </button>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                <h3 className="text-xl font-black text-zinc-950 mb-6 font-sans">Network Status</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 rounded-3xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={18} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">Delivery Service Online</span>
                      </div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-3xl bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-3 text-blue-600">
                        <Activity size={18} />
                        <span className="text-xs font-bold text-blue-900">Health Bridge Active</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-blue-400">99.9%</span>
                   </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
