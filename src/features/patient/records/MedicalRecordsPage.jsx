import React, { useState } from 'react';
import { useAuthContext } from '../../../providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { 
  ClipboardList, Search, Loader2, AlertCircle, Calendar, 
  MapPin, User, Stethoscope, Activity, Pill, HeartPulse, 
  FileText, ArrowDown, ArrowUp, ChevronDown, CheckCircle,
  AlertTriangle, FlaskConical, Watch, Sparkles, Share2, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyMedicalRecords } from '../../../api/medicalRecordService';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });
};

const MedicalRecordCard = ({ record }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { doctorId, appointmentId, aiSummary, doctorNotes, visitDate } = record;
  const doctorName = doctorId ? `Dr. ${doctorId.firstName} ${doctorId.lastName}` : 'Unknown Doctor';
  const specialty = doctorId?.professionalInfo?.primarySpecialization || 'General Practice';
  const clinicName = appointmentId?.clinic?.clinicName || 'Online Consultation';
  const apptType = appointmentId?.appointmentType || 'Consultation';

  const urgencyLevels = {
    routine: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
    urgent: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle },
    emergency: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle }
  };
  
  const urgency = urgencyLevels[aiSummary?.urgency_level] || urgencyLevels.routine;
  const UrgencyIcon = urgency.icon;

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: `Medical Record - ${formatDate(visitDate)}`,
      text: `Medical record from ${doctorName} at ${clinicName}. Diagnosis: ${aiSummary?.diagnosis || 'N/A'}`,
      url: window.location.href // Since I don't have a specific record URL yet, sharing the current page as reference
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Record shared successfully');
      } catch (err) {
        if (err.name !== 'AbortError') toast.error('Error sharing record');
      }
    } else {
      // Fallback: Copy summary to clipboard
      const textToCopy = `Medical Record\nDate: ${formatDate(visitDate)}\nDoctor: ${doctorName}\nClinic: ${clinicName}\nDiagnosis: ${aiSummary?.diagnosis || 'N/A'}\nSummary: ${aiSummary?.summary || 'N/A'}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Record summary copied to clipboard!', {
          icon: '📋',
          style: {
            borderRadius: '1rem',
            background: '#18181b',
            color: '#fff',
          },
        });
      } catch (err) {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header section */}
      <div 
        className="p-6 md:p-8 cursor-pointer relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-[2rem]"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
              <ClipboardList className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-black text-zinc-900 leading-tight">
                  {formatDate(visitDate)}
                </h3>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${urgency.bg} ${urgency.color} ${urgency.border} flex items-center gap-1 uppercase tracking-wide`}>
                  <UrgencyIcon className="w-3.5 h-3.5" />
                  {aiSummary?.urgency_level || 'Routine'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4 text-blue-500" /> {doctorName} • {specialty}</span>
                <span className="md:inline hidden text-zinc-300">•</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {clinicName}</span>
                <span className="md:inline hidden text-zinc-300">•</span>
                <span className="flex items-center gap-1.5"><Watch className="w-4 h-4 text-amber-500" /> {formatTime(visitDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
            {aiSummary?.diagnosis && (
              <div className="text-right mr-4 hidden md:block">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Diagnosis</p>
                <p className="font-semibold text-indigo-700 max-w-[200px] truncate">{aiSummary.diagnosis}</p>
              </div>
            )}
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all duration-200 border border-blue-100 group/share active:scale-90"
              title="Share record"
            >
              <Share2 className="w-5 h-5 text-blue-600 group-hover/share:scale-110" />
            </button>
            <button className="w-10 h-10 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center transition-colors border border-zinc-200">
              <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-6 md:p-8 pt-0 border-t border-zinc-100 bg-zinc-50/50">
            
            {/* Alerts Section */}
            {(aiSummary?.alerts?.allergy_conflicts?.length > 0 || aiSummary?.alerts?.drug_interactions?.length > 0) && (
              <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">Medical Alerts & Warnings</h4>
                    {aiSummary?.alerts?.drug_interactions?.map((alert, idx) => (
                      <p key={`drug-${idx}`} className="text-sm text-red-700">⚠️ {alert}</p>
                    ))}
                    {aiSummary?.alerts?.allergy_conflicts?.map((alert, idx) => (
                      <p key={`allergy-${idx}`} className="text-sm text-red-700">⚠️ {alert}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Left Column: Clinical Info */}
              <div className="space-y-6">
                
                {/* Diagnosis & Symptoms */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wide">
                    <Activity className="w-4 h-4 text-indigo-500" /> Diagnosis & Symptoms
                  </h4>
                  <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    {aiSummary?.diagnosis && (
                      <div className="mb-4">
                        <p className="text-xs text-zinc-400 font-bold mb-1">PRIMARY DIAGNOSIS</p>
                        <p className="font-semibold text-zinc-800 text-lg leading-snug">{aiSummary.diagnosis}</p>
                      </div>
                    )}
                    {aiSummary?.symptoms?.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-400 font-bold mb-2">REPORTED SYMPTOMS</p>
                        <div className="flex flex-wrap gap-2">
                          {aiSummary.symptoms.map((symptom, idx) => (
                            <span key={idx} className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium border border-zinc-200">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Notes Summary */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-blue-500" /> Clinical Notes
                  </h4>
                  <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
                    {aiSummary?.summary && (
                      <div>
                        <p className="text-xs text-zinc-400 font-bold mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-500" /> AI GENERATED SUMMARY</p>
                        <p className="text-sm text-zinc-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">{aiSummary.summary}</p>
                      </div>
                    )}
                    {doctorNotes && doctorNotes !== aiSummary?.summary && (
                      <div>
                        <p className="text-xs text-zinc-400 font-bold mb-2">DOCTOR'S ADDITIONS</p>
                        <p className="text-sm text-zinc-800 leading-relaxed font-medium">{doctorNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Treatment & Plan */}
              <div className="space-y-6">
                
                {/* Prescriptions */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wide">
                    <Pill className="w-4 h-4 text-emerald-500" /> Treatment Plan
                  </h4>
                  <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
                    {aiSummary?.prescription?.medications?.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400 font-bold">PRESCRIBED MEDICATIONS</p>
                        {aiSummary.prescription.medications.map((med, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/30 border border-emerald-100">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FlaskConical className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-zinc-800">{med.name}</p>
                              <div className="text-sm text-zinc-600 mt-1 space-y-0.5">
                                {med.dose && med.dose !== 'not specified' && <p>• Dose: <span className="font-medium text-zinc-800">{med.dose}</span></p>}
                                {med.frequency && med.frequency !== 'not specified' && <p>• Frequency: <span className="font-medium text-zinc-800">{med.frequency}</span></p>}
                                {med.duration && med.duration !== 'not specified' && <p>• Duration: <span className="font-medium text-zinc-800">{med.duration}</span></p>}
                                {med.notes && med.notes !== 'not specified' && <p className="text-zinc-500 italic text-xs mt-1">"{med.notes}"</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">No medications prescribed during this visit.</p>
                    )}

                    {aiSummary?.prescription?.lifestyle_advice && (
                      <div className="pt-3 border-t border-zinc-100">
                        <p className="text-xs text-zinc-400 font-bold mb-2">LIFESTYLE ADVICE</p>
                        <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100/50">{aiSummary.prescription.lifestyle_advice}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Follow-up */}
                {aiSummary?.follow_up && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wide">
                      <Calendar className="w-4 h-4 text-purple-500" /> Next Steps
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 shadow-sm text-purple-900">
                      <p className="font-semibold">{aiSummary.follow_up}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MedicalRecordsPage() {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['medicalRecords'],
    queryFn: () => getMyMedicalRecords({ page: 1, limit: 50 }),
  });

  const records = data?.data || [];

  const filteredRecords = records.filter(record => {
    const searchString = searchTerm.toLowerCase();
    const doctorMatch = record.doctorId?.firstName?.toLowerCase().includes(searchString) || record.doctorId?.lastName?.toLowerCase().includes(searchString);
    const diagnosisMatch = record.aiSummary?.diagnosis?.toLowerCase().includes(searchString);
    return doctorMatch || diagnosisMatch;
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
              Medical Records
            </h1>
            <p className="text-zinc-500 font-medium mt-2">Your complete health history, verified and secured.</p>
          </div>
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor or diagnosis..."
              className="bg-white border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm w-full md:w-80 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium shadow-sm"
            />
          </div>
        </header>

        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-32">
             <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
             <p className="text-zinc-500 font-medium animate-pulse">Retrieving your medical history...</p>
           </div>
        ) : error ? (
           <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 text-center max-w-2xl mx-auto">
             <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-red-900 mb-2">Failed to load records</h3>
             <p className="text-red-700">We couldn't retrieve your medical records right now. Please try again later.</p>
           </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 border border-zinc-100 shadow-xl shadow-zinc-200/40 text-center max-w-3xl mx-auto mt-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-6 shadow-inner">
              <ClipboardList size={40} />
            </div>
            <h2 className="text-2xl font-black text-zinc-950 mb-3">No Records Found</h2>
            {searchTerm ? (
              <p className="text-zinc-500 max-w-sm mx-auto">No results matching "{searchTerm}". Try adjusting your search criteria.</p>
            ) : (
              <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">Your medical sheet is currently empty. Clinical notes will appear here automatically after your doctor completes a visit.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRecords.map((record) => (
              <MedicalRecordCard key={record._id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
