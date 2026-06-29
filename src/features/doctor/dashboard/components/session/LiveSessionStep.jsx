import React from 'react';
import { 
  PlayCircle, Pause, Play, Phone, FileText, 
  ActivitySquare, Pill, Sparkles 
} from 'lucide-react';

const formatTimerText = (timeInSecs) => {
  const h = Math.floor(timeInSecs / 3600);
  const m = Math.floor((timeInSecs % 3600) / 60);
  const s = timeInSecs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getPatientName = (appt) => {
  const p = appt?.patient;
  if (!p || typeof p === 'string') return 'Alex Rivera';
  return (
    p.fullName ||
    `${p.firstName || ''} ${p.lastName || ''}`.trim() ||
    'Alex Rivera'
  );
};

const getPatientMeta = (appt) => {
  const p = appt?.patient;
  if (!p || typeof p === 'string') return { age: '—', gender: '—', imgUrl: null };
  
  const dob = p.dateOfBirth;
  const calculatedAge = dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
    
  const age = p.age || calculatedAge || '—';
  const gender = p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : '—';
  
  return { 
    age, 
    gender, 
    imgUrl: p.profileImage?.imageUrl || (typeof p.profileImage === 'string' ? p.profileImage : null) 
  };
};

export default function LiveSessionStep({ appt, isRecording, isPaused, recordingTime, onStartSession, onPauseResume, onEndSession }) {
  const name = getPatientName(appt);
  const meta = getPatientMeta(appt);
  const apptId = appt?.id || appt?._id || 'AR-9920';

  const initials = name.split(' ').map((c) => c[0]).join('').slice(0, 2).toUpperCase();
  const complaint = appt?.patientProvidedInfo?.primaryComplaint || appt?.reason || "Persistent tightness in the upper chest following moderate physical activity. Occasional shortness of breath during morning routines.";

  return (
    <div className="relative flex flex-col h-full min-h-[calc(100vh-120px)] animate-in fade-in duration-300">
      
      {/* Timer Header */}
      <div className="text-center mb-6">
        <p className="text-[52px] font-bold text-[#191C1E] tracking-tight leading-none mb-1 font-sans tabular-nums">
          {formatTimerText(recordingTime)}
        </p>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          {isRecording ? (
            isPaused ? (
              <span className="text-amber-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> SESSION PAUSED</span>
            ) : (
              <span className="text-red-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> ELAPSED SESSION TIME</span>
            )
          ) : (
            'SESSION NOT STARTED'
          )}
        </p>
      </div>

      {/* Patient Banner */}
      <div className="bg-white rounded-[24px] px-8 py-5 flex items-center justify-between mb-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-[52px] h-[52px] rounded-full bg-[#E5EDFF] flex items-center justify-center shrink-0 overflow-hidden">
            {meta.imgUrl ? (
              <img src={meta.imgUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#3B82F6] font-bold text-lg">{initials}</span>
            )}
          </div>
          <div>
            <p className="text-[20px] font-bold text-[#191C1E] tracking-tight">{name}</p>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              {[`${meta.age} Years Old`, meta.gender].filter(Boolean).join('  •  ')}
            </p>
          </div>
        </div>
        <span className="px-4 py-2 rounded-full text-[#047857] text-[11px] font-bold uppercase tracking-widest bg-[#ECFDF5]">
          Stable Status
        </span>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-[1fr_340px] gap-6 flex-1 mb-24">
        {/* Left Col */}
        <div className="bg-white rounded-[24px] p-8 flex flex-col h-full border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Complaint</p>
            <p className="text-[16px] text-[#334155] font-medium leading-[1.6]">"{complaint}"</p>
          </div>

          <div className="w-full h-px bg-slate-100 my-8"></div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vital Signs (Live)</p>
            <div className="flex items-center gap-12">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Heart Rate</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[26px] font-bold text-[#3B82F6]">72</span>
                  <span className="text-[11px] font-bold text-[#93C5FD]">BPM</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">SPO2</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[26px] font-bold text-[#10B981]">98</span>
                  <span className="text-[11px] font-bold text-[#6EE7B7]">%</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Blood Pressure</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[26px] font-bold text-[#1E293B]">124/82</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[24px] p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Recent History</p>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><ActivitySquare size={16} className="text-[#3B82F6]" /></div>
                <div>
                  <p className="text-[13px] font-bold text-[#1E293B]">EKG Normal</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Feb 12, 2024</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><Pill size={16} className="text-[#3B82F6]" /></div>
                <div>
                  <p className="text-[13px] font-bold text-[#1E293B]">Lisinopril 10mg</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Prescribed Jan 2024</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-[24px] p-6 border relative overflow-hidden transition-colors ${isRecording && !isPaused ? 'bg-[#EFF6FF] border-[#BFDBFE]/50' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className={isRecording && !isPaused ? "text-[#3B82F6]" : "text-slate-400"} />
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isRecording && !isPaused ? "text-[#3B82F6]" : "text-slate-500"}`}>
                AI Copilot
              </span>
            </div>
            <p className={`text-[13px] font-medium leading-[1.6] ${isRecording && !isPaused ? 'text-[#2563EB]' : 'text-slate-500'}`}>
              {!isRecording 
                ? "Click 'Start Session' to activate the AI medical scribe and begin analysis."
                : isPaused 
                  ? "AI Scribe paused. Resume session to continue listening." 
                  : "Listening for symptoms... Mentioning 'family history' will trigger genetic risk profile."}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="sticky bottom-6 left-0 right-0 z-50 mt-12">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[32px] px-8 py-4 flex items-center justify-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] mx-auto max-w-fit">
          {!isRecording ? (
            <button
              onClick={onStartSession}
              className="flex items-center justify-center gap-3 px-12 h-[60px] rounded-full text-white font-bold text-[16px] hover:bg-[#1D4ED8] transition-all hover:scale-105 active:scale-95 bg-[#2563EB] shadow-[0_8px_24px_rgba(37,99,235,0.3)]"
            >
              <PlayCircle size={22} className="fill-white/20" /> Start AI Session
            </button>
          ) : (
            <>
              <button 
                onClick={onPauseResume}
                className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity group"
              >
                <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all ${isPaused ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-[#334155] border border-slate-200 shadow-sm group-hover:bg-slate-200'}`}>
                  {isPaused ? <Play size={18} className="fill-current ml-1" /> : <Pause size={18} className="fill-current" />}
                </div>
                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={onEndSession}
                className="flex items-center justify-center gap-3 px-10 h-[56px] rounded-full text-white font-bold text-[15px] hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 bg-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.3)] mx-2"
              >
                End Session <Phone size={18} className="rotate-[135deg] opacity-90" />
              </button>

              <button className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity group">
                <div className="w-[44px] h-[44px] rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-slate-200 transition-all">
                  <FileText size={18} className="text-[#334155]" />
                </div>
                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Add Note</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
