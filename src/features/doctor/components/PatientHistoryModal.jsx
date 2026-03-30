import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X, Loader2, AlertCircle, Calendar, Stethoscope,
  Activity, Pill, FileText, ChevronRight, History,
  User, ClipboardList, Thermometer, Maximize2, Minimize2
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Reset full-screen state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setIsFullScreen(false), 300); // Wait for exit animation if any
    }
  }, [isOpen]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['patientHistory', patientId],
    queryFn: () => getPatientMedicalHistory(patientId, { limit: 50 }),
    enabled: !!patientId && isOpen,
  });

  if (!isOpen) return null;

  const records = data?.data || [];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${isFullScreen ? 'p-0' : 'p-4 md:p-8'}`}>
      {/* Backdrop with stronger blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className={`relative flex flex-col bg-white/95 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-400 transition-all ${
        isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[85vh] rounded-[2.5rem]'
      }`}>

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="group w-11 h-11 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all duration-300"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
            <button
              onClick={onClose}
              className="group w-11 h-11 rounded-full bg-slate-100 hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all duration-300"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
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
            <div className="max-w-2xl mx-auto relative pl-4 md:pl-0 pt-6">
              {/* Vertical Timeline Line */}
              <div className="absolute left-[4.5rem] md:left-[5.5rem] top-0 bottom-0 w-[1px] bg-slate-200/80 z-0 hidden sm:block" />

              {records.map((record, idx) => {
                const dateObj = new Date(record.visitDate);
                const day = dateObj.getDate();
                const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
                const docName = record.doctorId ? `${record.doctorId.firstName} ${record.doctorId.lastName}` : 'General Consultant';
                const ai = record.aiSummary || {};
                
                // Mock visual statuses to match the reference image colors (Teal, Red, Yellow)
                const mockStatuses = [
                  { label: 'Positive', bg: 'bg-[#00a693]', border: 'border-[#00a693]' },
                  { label: 'Negative', bg: 'bg-[#e14b43]', border: 'border-[#e14b43]' },
                  { label: 'Neutral', bg: 'bg-[#eab308]', border: 'border-[#eab308]' },
                  { label: 'Positive', bg: 'bg-[#00a693]', border: 'border-[#00a693]' }
                ];
                const statusTheme = mockStatuses[idx % mockStatuses.length];

                return (
                  <div key={record._id} className="relative flex flex-col sm:flex-row items-start w-full mb-8 group z-10">
                    
                    {/* Date Column (Left) */}
                    <div className="hidden sm:flex flex-col items-center justify-start w-16 md:w-20 shrink-0 pt-5 pr-2">
                       <span className="text-lg font-extrabold text-[#1e293b] leading-none mb-0.5">{day}</span>
                       <span className="text-sm font-bold text-slate-400 capitalize">{monthStr}</span>
                    </div>

                    {/* Timeline Center Dot */}
                    <div className={`hidden sm:flex absolute left-[4.5rem] md:left-[5.5rem] w-3 h-3 rounded-full bg-white border-2 ${statusTheme.border} -translate-x-1/2 top-7 z-10 ring-4 ring-white transition-transform group-hover:scale-125`} />

                    {/* Main Card (Right) */}
                    <div className="flex-1 w-full sm:ml-6 relative">
                      {/* Mobile Date Bubble */}
                      <div className="sm:hidden flex items-center gap-2 mb-2">
                         <span className="font-bold text-slate-800 text-base">{day}</span>
                         <span className="font-semibold text-slate-500 text-sm">{monthStr}</span>
                      </div>

                      <div className="w-full bg-white rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#f1f5f9] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
                        
                        {/* Status Badge */}
                        <div className="mb-3">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-sm tracking-wide ${statusTheme.bg}`}>
                            {statusTheme.label}
                          </span>
                        </div>

                        {/* Title (e.g. Encounter Type or Diagnosis) */}
                        <h3 className="text-[17px] font-bold text-[#0f172a] mb-4 tracking-tight">
                          {ai.diagnosis || 'General Consultation'}
                        </h3>

                        {/* Footer area inside card */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          {/* Given By ... */}
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-semibold text-[#64748b]">
                              Given By {docName}
                            </span>
                          </div>

                          {/* Classification Pill */}
                          <div className="px-3 py-1 rounded-full border border-slate-200/80 bg-slate-50/50">
                            <span className="text-[11px] font-semibold text-slate-500">
                              Management
                            </span>
                          </div>
                        </div>

                      </div>
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