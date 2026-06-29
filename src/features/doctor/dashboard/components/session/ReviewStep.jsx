import React, { useState } from 'react';
import { 
  Sparkles, FileText, Calendar, Clock, Edit3, 
  CheckCircle2, X, Mic, Activity, Trash2, Loader2, ShieldX
} from 'lucide-react';

const getPatientName = (appt) => {
  const p = appt?.patient;
  if (!p || typeof p === 'string') return 'Alex Rivera';
  return (
    p.fullName ||
    `${p.firstName || ''} ${p.lastName || ''}`.trim() ||
    'Alex Rivera'
  );
};

const ReviewMedicationItem = ({ name, dose, details, onRemove }) => (
  <div className="bg-[#F8FAFC] border border-slate-100 rounded-[16px] p-4 flex justify-between items-center group mb-3 relative">
    <div>
      <p className="text-[14px] font-bold text-[#1E293B] mb-0.5">{name} {dose}</p>
      <p className="text-[12px] text-slate-400">{details}</p>
    </div>
    <button onClick={onRemove} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 absolute right-4">
      <X size={18} />
    </button>
  </div>
);

export default function ReviewStep({ appt, aiSummary, setAiSummary, doctorNotes, setDoctorNotes, suggestions, setSuggestions, onDiscard, onSave, isSaving }) {
  const name = getPatientName(appt);
  const apptId = appt?.id || appt?._id || '8821';
  const [newSug, setNewSug] = useState('');
  const [showInput, setShowInput] = useState(false);

  const [showTranscript, setShowTranscript] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: '', duration: '', notes: '' });

  const addSuggestion = () => {
    if (!newSug.trim()) return;
    setSuggestions(prev => [...prev, { text: newSug }]);
    setNewSug('');
    setShowInput(false);
  };

  const handleAddMed = () => {
    if (!newMed.name.trim()) return;
    setAiSummary(prev => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        medications: [...(prev.prescription?.medications || []), { ...newMed, dose: newMed.dose || 'not specified', frequency: newMed.frequency || 'not specified', duration: newMed.duration || 'not specified' }]
      }
    }));
    setNewMed({ name: '', dose: '', frequency: '', duration: '', notes: '' });
    setShowAddMed(false);
  };

  return (
    <div className="relative pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 -mt-2">
      
      {/* Transcript Modal */}
      {showTranscript && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Mic size={20} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Session Transcript</h3>
                  <p className="text-[12px] text-slate-500 font-medium">Full dialogue captured during clinical session</p>
                </div>
              </div>
              <button onClick={() => setShowTranscript(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[16px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap" dir={aiSummary.transcript?.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}>
                  {aiSummary.transcript || "No transcript available for this session."}
                </p>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowTranscript(false)} className="px-6 h-[44px] rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition-colors">
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="bg-white rounded-[24px] px-6 py-5 flex items-center justify-between mb-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-full bg-[#E5EDFF] flex items-center justify-center shrink-0">
             <div className="w-[52px] h-[52px] rounded-full bg-[#E5EDFF] flex items-center justify-center shrink-0 overflow-hidden">
              {appt?.patient?.profileImage?.imageUrl ? (
                <img src={appt.patient.profileImage.imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#3B82F6] font-bold text-lg">{name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <p className="text-[20px] font-bold text-[#0F172A]">{name}</p>
              <span className="px-2.5 py-1 rounded-full bg-[#E2E8F0] text-[#475569] text-[10px] font-bold uppercase tracking-wider">
                PAT-{apptId.slice(-4).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Session Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Alerts Section (If any) */}
          {(aiSummary.alerts?.drug_interactions?.length > 0 || aiSummary.alerts?.allergy_conflicts?.length > 0) && (
            <div className="bg-amber-50 border border-amber-100 rounded-[24px] p-5">
              <div className="flex items-center gap-2 mb-3 text-amber-700">
                <ShieldX size={18} className="fill-amber-50" />
                <span className="text-[14px] font-bold uppercase tracking-wider">Clinical Alerts</span>
              </div>
              <div className="flex flex-col gap-2">
                {aiSummary.alerts.drug_interactions.map((alert, i) => (
                  <p key={i} className="text-[13px] text-amber-800 font-medium flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400"></span> {alert}
                  </p>
                ))}
                {aiSummary.alerts.allergy_conflicts.map((alert, i) => (
                  <p key={i} className="text-[13px] text-amber-800 font-medium flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400"></span> {alert}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Diagnosis */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-[#3B82F6]" />
              <span className="text-[15px] font-bold text-[#0F172A]">Primary Diagnosis</span>
            </div>
            <input
              value={aiSummary.diagnosis || ''}
              onChange={(e) => setAiSummary((s) => ({ ...s, diagnosis: e.target.value }))}
              placeholder="Enter diagnosis..."
              className="w-full text-[14px] text-[#334155] font-medium bg-[#F8FAFC] border border-slate-100 rounded-[12px] px-4 py-3 outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* AI Generated Summary */}
          <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#3B82F6]" />
                <span className="text-[15px] font-bold text-[#0F172A]">AI Generated Summary</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold tracking-widest uppercase">
                DRAFT 1.0
              </span>
            </div>
            <div className="p-6">
              <div className="border-l-[3px] border-[#3B82F6] pl-5 rounded-sm">
                <textarea
                  value={aiSummary.summary}
                  onChange={(e) => setAiSummary((s) => ({ ...s, summary: e.target.value }))}
                  rows={8}
                  placeholder="Enter AI Generated Summary..."
                  className="w-full text-[15px] text-[#334155] leading-[1.7] font-medium bg-transparent outline-none resize-none placeholder:text-[#334155]/90"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row inside Left Column: Prescription & Notes */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Prescription */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#EF4444]" />
                  <span className="text-[15px] font-bold text-[#0F172A]">Prescription</span>
                </div>
                <button onClick={() => setShowAddMed(!showAddMed)} className="text-[13px] font-bold text-[#3B82F6] hover:text-[#2563EB]">
                  {showAddMed ? 'Cancel' : '+ Add New'}
                </button>
              </div>

              <div className="flex-1">
                {showAddMed && (
                  <div className="bg-blue-50/50 p-4 rounded-[16px] mb-4 border border-blue-100">
                    <input 
                      autoFocus
                      placeholder="Medication Name" 
                      value={newMed.name} 
                      onChange={e => setNewMed({...newMed, name: e.target.value})}
                      className="w-full text-[13px] p-2.5 rounded-xl border border-blue-200 outline-none focus:border-blue-400 mb-2 bg-white"
                    />
                    <div className="flex gap-2 mb-2">
                      <input 
                        placeholder="Dose (e.g. 500mg)" 
                        value={newMed.dose} 
                        onChange={e => setNewMed({...newMed, dose: e.target.value})}
                        className="w-1/2 text-[13px] p-2.5 rounded-xl border border-blue-200 outline-none focus:border-blue-400 bg-white"
                      />
                      <input 
                        placeholder="Frequency (e.g. 2 times a day)" 
                        value={newMed.frequency} 
                        onChange={e => setNewMed({...newMed, frequency: e.target.value})}
                        className="w-1/2 text-[13px] p-2.5 rounded-xl border border-blue-200 outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                    <button 
                      onClick={handleAddMed}
                      className="w-full py-2 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Add Medication
                    </button>
                  </div>
                )}

                {aiSummary.prescription?.medications?.length > 0 ? (
                  aiSummary.prescription.medications.map((m, i) => (
                    <ReviewMedicationItem 
                      key={i} 
                      name={m.name} 
                      dose={m.dose !== 'not specified' ? m.dose : ''} 
                      details={m.frequency !== 'not specified' ? `${m.frequency} • ${m.duration !== 'not specified' ? m.duration : 'As needed'}` : m.notes}
                      onRemove={() => {
                        const newMeds = aiSummary.prescription.medications.filter((_, idx) => idx !== i);
                        setAiSummary(prev => ({
                          ...prev,
                          prescription: { ...prev.prescription, medications: newMeds }
                        }));
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-[16px]">
                    <p className="text-[12px] text-slate-400 font-medium">No medications prescribed</p>
                  </div>
                )}
                
                {aiSummary.prescription?.lifestyle_advice && (
                  <div className="mt-4 p-4 bg-blue-50/50 rounded-[16px] border border-blue-100/50">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={12} /> Lifestyle Advice
                    </p>
                    <p className="text-[13px] text-blue-700 font-medium leading-relaxed">{aiSummary.prescription.lifestyle_advice}</p>
                  </div>
                )}
                
                {/* Follow up section inline with prescription */}
                <div className="mt-4 p-4 bg-[#F8FAFC] rounded-[16px] border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar size={12} /> Follow-up Plan
                    </p>
                    <input
                      value={aiSummary.follow_up || ''}
                      onChange={(e) => setAiSummary((s) => ({ ...s, follow_up: e.target.value }))}
                      placeholder="e.g. In 2 weeks"
                      className="w-full text-[13px] text-[#334155] font-medium bg-white border border-slate-200 rounded-[10px] px-3 py-2 outline-none focus:border-[#3B82F6] transition-colors"
                    />
                </div>
              </div>
            </div>

            {/* Doctor Notes */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <Edit3 size={18} className="text-[#3B82F6]" />
                <span className="text-[15px] font-bold text-[#0F172A]">Doctor Notes</span>
              </div>
              
              <div className="flex-1 rounded-[16px] bg-[#F1F5F9] p-4 mb-4">
                 <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    rows={4}
                    placeholder="Add your clinical observations, physical exam findings, or specific concerns here..."
                    className="w-full text-[13px] text-slate-600 bg-transparent outline-none resize-none placeholder:text-slate-400"
                  />
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold text-[#64748B] mt-auto">
                <span className="flex items-center gap-1.5"><Mic size={14}/> Voice Note Ready</span>
                <span className="flex items-center gap-1.5"><Activity size={14}/> Lab Report Linked</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full">
          {/* AI Suggestions Sidebar */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm h-full max-h-[800px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-[#3B82F6]" />
              <span className="text-[15px] font-bold text-[#0F172A]">AI Suggestions</span>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                  <div key={idx} className="bg-[#F8FAFC] rounded-[16px] p-4 flex items-start gap-3 relative group border border-slate-100">
                    <CheckCircle2 size={18} className="text-[#3B82F6] shrink-0 fill-blue-50 mt-0.5" />
                    <p className="text-[13px] text-[#334155] font-medium leading-[1.5] pr-2">{s.text}</p>
                    <button
                      onClick={() => setSuggestions((p) => p.filter((_, i) => i !== idx))}
                      className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 absolute right-3 top-4"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                   <p className="text-[12px] text-slate-400 font-medium">No suggestions available</p>
                </div>
              )}
            </div>

            {showInput ? (
              <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <input
                  autoFocus
                  value={newSug}
                  onChange={(e) => setNewSug(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSuggestion(); } }}
                  placeholder="Type suggestion..."
                  className="w-full text-[13px] bg-transparent p-2 outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button onClick={addSuggestion} className="px-4 py-1.5 bg-[#2563EB] text-white rounded-xl text-[12px] font-bold hover:bg-[#1D4ED8]">Add</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowInput(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[#CBD5E1] text-[#94A3B8] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-500 transition-all"
              >
                Add Suggestion
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-6 left-0 right-0 z-50 mt-12">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[32px] px-8 py-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.1)] mx-auto max-w-[calc(100%-1rem)]">
          <div className="flex items-center gap-6">
            <button
              onClick={onDiscard}
              className="text-[13px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Trash2 size={16} /> Discard Session
            </button>
            <div className="w-px h-6 bg-slate-200/60" />
            <button 
              onClick={() => setShowTranscript(true)}
              className="text-[13px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Clock size={16} /> Review Transcript
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 h-[48px] rounded-2xl bg-slate-100 text-slate-600 font-bold text-[13px] hover:bg-slate-200 transition-all active:scale-95">
              Export PDF
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 h-[48px] rounded-2xl text-white font-bold text-[13px] transition-all active:scale-95 disabled:opacity-60 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] shadow-lg"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {isSaving ? 'Saving...' : 'Finalize & Save Session'}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
