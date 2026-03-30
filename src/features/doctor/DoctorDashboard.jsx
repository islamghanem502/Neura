// src/features/doctor/DoctorDashboard.jsx
import React from 'react';
import { Plus, ArrowRight, CheckCircle2, Clock, Activity, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDoctorData } from '../../hooks/useDoctorData';

// --- بيانات ثابتة (Static Data) مؤقتة لحد ما نربط الـ API ---
const APPOINTMENTS = [
  { time: '11:30 AM', name: 'Matt Smith', type: 'Emergency', status: 'done', avatar: 'https://i.pravatar.cc/150?u=matt' },
  { time: '1:30 PM', name: 'Angelika Krovets', type: 'Video consultation', status: 'done', avatar: 'https://i.pravatar.cc/150?u=angelika' },
  { time: '4:00 PM', name: 'Emily Blunt', type: 'Check-up', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=emily' },
  { time: '5:30 PM', name: 'John Krasinski', type: 'Consultation', status: 'done', avatar: 'https://i.pravatar.cc/150?u=john' },
];

export default function DoctorDashboard() {
  const { data: doctorRes, isLoading } = useDoctorData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const doctorData = doctorRes?.data?.basicInfo || {};
  const isComplete = doctorData.accountStatus === 'complete';
  const isPending = doctorData.accountStatus === 'pending_verification';

  return (
    <div className="flex flex-col xl:flex-row gap-8 pb-8 font-sans">

      {/* ─── الجزء الأيسر (الرئيسي - الإحصائيات والكروت) ─── */}
      <div className="flex-1 space-y-8">

        {/* الترحيب */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Good morning <span className="font-black">Dr {doctorData.lastName || 'Ghanem'}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Have great and productive day</p>
          </div>
          <div className="hidden md:flex bg-white rounded-full p-1 shadow-sm">
            {['Weekly', 'Monthly', 'All time'].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${i === 0 ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isPending && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <h3 className="text-amber-900 font-bold">Profile Under Verification</h3>
              <p className="text-amber-700 text-sm">Our admins are currently reviewing your submitted documents. This usually takes 24 hours.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">
                Pending Review
              </span>
            </div>
          </div>
        )}

        {!isComplete && !isPending && doctorData.accountStatus === 'incomplete' && (
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-3xl p-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <h3 className="text-blue-900 font-bold">Complete your professional profile</h3>
              <p className="text-blue-700 text-sm">Patients are 70% more likely to book with complete profiles.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-blue-600 uppercase">Action Required</span>
                <div className="w-32 h-2 bg-blue-200 rounded-full mt-1">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: '33.3%' }}></div>
                </div>
              </div>
              <Link
                to="/dashboard/doctor/my-profile"
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Complete Now
              </Link>
            </div>
          </div>
        )}

        {/* الكروت الثلاثة العلوية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* كارت عدد المواعيد */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col justify-between h-52">
            <div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-700">
                <FileText size={20} />
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-black text-slate-800">12</h2>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">↑ 2% today</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Patient appointments</p>
            </div>
            <button className="bg-slate-900 text-white w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
              <Plus size={18} /> Add new appointment
            </button>
          </div>

          {/* كارت الروشتة (الأخضر) */}
          <div className="bg-[#a7f3d0] p-6 rounded-[2rem] flex flex-col justify-between h-52 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
            <div className="absolute top-6 right-6 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-900 leading-tight">Write<br />Prescription</h3>
              <p className="text-emerald-700 text-sm mt-1">to patient</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase">Template</span>
              <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-emerald-900 transition-colors">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>

          {/* كارت التذكير (البنفسجي) */}
          <div className="bg-[#a78bfa] p-6 rounded-[2rem] flex flex-col justify-between h-52 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
            <div className="absolute top-6 right-6 w-10 h-10 bg-white/30 rounded-full overflow-hidden border-2 border-[#a78bfa]">
              <img src="https://i.pravatar.cc/150?u=anna" alt="Anna" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-tight">Anna Jonson</h3>
              <p className="text-indigo-100 text-sm mt-1">Continue to fill out new<br />patient profile</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-black tracking-widest text-indigo-100 uppercase">Reminder</span>
              <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-indigo-900 transition-colors">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>

        </div>

        {/* مساحة الرسم البياني للإحصائيات */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Patient statistics</h3>
            <div className="flex gap-4 text-sm font-semibold text-slate-400">
              <span className="text-slate-800 bg-slate-100 px-3 py-1 rounded-full">All</span>
              <span className="hover:text-slate-600 cursor-pointer">New</span>
              <span className="hover:text-slate-600 cursor-pointer">Insurance</span>
            </div>
          </div>

          <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50 text-slate-400">
            {/* هنا هيتحط الـ Chart الحقيقي لما نربط المكتبة (Recharts مثلا) */}
            <Activity size={32} className="opacity-50" />
            <span className="ml-2 font-medium">Chart Area (Coming Soon)</span>
          </div>
        </div>

      </div>

      {/* ─── الجزء الأيمن (الجدول الزمني والمواعيد) ─── */}
      <div className="w-full xl:w-80 space-y-6">

        {/* الكاليندر (شكل مبسط للمحاكاة) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">March 2026</h3>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100">&lt;</button>
              <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100">&gt;</button>
            </div>
          </div>

          <div className="flex justify-between text-center mb-6">
            {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((day, i) => (
              <div key={day} className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 2 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                  {16 + i}
                </span>
              </div>
            ))}
          </div>

          {/* قائمة المواعيد اليومية */}
          <div className="space-y-4">
            {APPOINTMENTS.map((appt, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={appt.avatar} alt={appt.name} className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{appt.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{appt.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">{appt.time}</span>
                  {appt.status === 'done' ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <Clock size={16} className="text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* كارت المقالات أو التنبيهات (Must to read) */}
        <div className="bg-[#f0fdf4] p-6 rounded-[2rem] relative overflow-hidden">
          <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase mb-4 block">Must to read</span>
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
            Patient testing<br />tracker feature
          </h3>
          <p className="text-slate-600 text-sm mb-6">
            How to enhance your<br />documental work
          </p>
          <div className="absolute bottom-6 right-6 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
            <ArrowRight size={18} />
          </div>
        </div>

      </div>

    </div>
  );
}