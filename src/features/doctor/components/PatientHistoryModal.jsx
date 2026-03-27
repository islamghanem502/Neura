import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X, Loader2, AlertCircle, Calendar, Stethoscope,
  Activity, Pill, FileText, ChevronRight, History,
  User, ClipboardList, Thermometer
} from 'lucide-react';
import { getPatientMedicalHistory } from '../../../api/medicalRecordService';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    year: date.getFullYear(),
    full: date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  };
};

export default function PatientHistoryModal({ patientId, patientName, isOpen, onClose }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['patientHistory', patientId],
    queryFn: () => getPatientMedicalHistory(patientId, { limit: 50 }),
    enabled: !!patientId && isOpen,
  });

  if (!isOpen) return null;

  const records = data?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop with stronger blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-5xl h-[85vh] flex flex-col bg-white/95 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-400">

        {/* Header - More Elegant */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
              <History className="w-7 h-7 text-white -rotate-3" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                Medical Journey
              </h2>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <User className="w-3.5 h-3.5" />
                <span className="text-sm">{patientName || 'Patient Profile'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group w-11 h-11 rounded-full bg-slate-100 hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all duration-300"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse"></div>
              </div>
              <p className="text-slate-400 font-semibold text-lg animate-pulse">Syncing clinical records...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border-2 border-red-100">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-slate-800 text-xl font-bold mb-2">Connection Interrupted</p>
              <p className="text-slate-500 max-w-xs mx-auto">We couldn't retrieve the medical history at this moment.</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-indigo-50/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/30">
                <ClipboardList className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">A Clean Slate</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                No past medical encounters have been recorded for this patient yet.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-12 relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-100 via-indigo-200 to-transparent md:-translate-x-1/2 rounded-full hidden sm:block" />

              {records.map((record, idx) => {
                const dateInfo = formatDate(record.visitDate);
                const docName = record.doctorId ? `Dr. ${record.doctorId.firstName} ${record.doctorId.lastName}` : 'General Consultant';
                const ai = record.aiSummary || {};

                return (
                  <div key={record._id} className="relative group">
                    {/* Date Bubble - Desktop */}
                    <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 flex-col items-center z-10">
                      <span className="bg-white px-4 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-50 whitespace-nowrap">
                        {dateInfo.full}
                      </span>
                    </div>

                    <div className={`flex flex-col md:flex-row items-start gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                      {/* Left/Right Side Content */}
                      <div className={`w-full md:w-1/2 flex ${idx % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="w-full bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                          {/* Top accent line */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 rounded-lg">
                                <Stethoscope className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 leading-none">{docName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{dateInfo.full}</p>
                              </div>
                            </div>
                          </div>

                          {ai.diagnosis && (
                            <div className="mb-5">
                              <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Confirmed Diagnosis</span>
                              </div>
                              <p className="text-slate-700 font-bold text-lg leading-snug">{ai.diagnosis}</p>
                            </div>
                          )}

                          {ai.symptoms && ai.symptoms.length > 0 && (
                            <div className="mb-5 flex flex-wrap gap-2">
                              {ai.symptoms.map((sym, i) => (
                                <span key={i} className="px-3 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50/50 rounded-full border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-default">
                                  {sym}
                                </span>
                              ))}
                            </div>
                          )}

                          {(ai.prescription?.medications?.length > 0) && (
                            <div className="mt-4 pt-5 border-t border-dashed border-slate-200">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
                                  <Pill className="w-3.5 h-3.5 text-amber-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-500">Prescribed Regimen</span>
                              </div>
                              <div className="grid gap-2">
                                {ai.prescription.medications.map((m, i) => (
                                  <div key={i} className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 group/med">
                                    <span className="text-sm font-bold text-slate-700">{m.name}</span>
                                    {m.dose && <span className="text-[10px] font-bold text-indigo-500 bg-white px-2 py-0.5 rounded-md shadow-sm">{m.dose}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Spacer for MD screens to keep alignment with timeline */}
                      <div className="hidden md:block w-0" />
                    </div>

                    {/* Timeline Center Dot */}
                    <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-full border-4 border-[#f8fafc] bg-white shadow-md z-10 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 group-hover:bg-white transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}