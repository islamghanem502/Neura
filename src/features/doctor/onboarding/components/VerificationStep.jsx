import React from 'react';
import { useSubmitDoctorProfile } from '../../../../hooks/useDoctorData';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export const VerificationStep = ({ onPrev }) => {
  const submitDoctorProfileMutation = useSubmitDoctorProfile();

  return (
    <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100/60 animate-in fade-in duration-500 max-w-2xl">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Verification (Coming Soon)</h3>
      <p className="text-slate-500 mb-8 text-[14px]">This section is currently under development.</p>

      <div className="flex justify-between items-center pt-8 border-t border-slate-100">
        <button type="button" onClick={() => onPrev(3)} className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition-all text-sm">
          <ArrowLeft size={16} /> Previous Step
        </button>
        <button
          onClick={() => submitDoctorProfileMutation.mutate()}
          disabled={submitDoctorProfileMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[13px] shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {submitDoctorProfileMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Complete Setup Early
        </button>
      </div>
    </div>
  );
};
