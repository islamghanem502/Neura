import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dna, HeartPulse, Ruler, Weight, Droplets, Pill, AlertTriangle,
  ChevronRight, ChevronLeft, Sparkles, Check, Loader2, Activity,
  Shield, Brain, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../../providers/AuthProvider';
import { patientService } from '../../../api/patientService';
import { bmiFromMetricKgCm } from './digitalTwinUtils';

// ─── Steps config ───────────────────────────────────────────────────────────
const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Dna },
  { id: 'body', label: 'Body Metrics', icon: Ruler },
  { id: 'conditions', label: 'Conditions', icon: HeartPulse },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'launch', label: 'Launch', icon: Sparkles },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ─── Step Components ────────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <Dna size={48} className="text-white" />
        </div>
        {/* orbiting dots */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg">
          <HeartPulse size={12} className="text-white" />
        </div>
        <div className="absolute -bottom-1 -left-3 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
          <Brain size={10} className="text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-3">
        Activate Your Digital Twin
      </h2>
      <p className="text-zinc-500 max-w-md leading-relaxed text-[15px]">
        Your Digital Twin is an AI-powered health model that mirrors your body.
        We need a few details to build your personalized twin — it only takes 2 minutes.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {[
          { icon: Activity, label: 'Real-time health score', color: 'bg-blue-50 text-blue-600' },
          { icon: Shield, label: 'Risk predictions', color: 'bg-emerald-50 text-emerald-600' },
          { icon: Sparkles, label: '"What-If" simulations', color: 'bg-purple-50 text-purple-600' },
        ].map((f) => (
          <div key={f.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${f.color}`}>
            <f.icon size={14} /> {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function BodyMetricsStep({ form, setForm }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 max-w-lg mx-auto w-full">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Body Metrics</h2>
        <p className="text-zinc-400 text-sm mt-1">These help calculate your BMI and baseline health model</p>
      </div>

      {/* Weight */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
          <Weight size={14} /> Weight (kg) <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          min="20"
          max="300"
          value={form.weight || ''}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
          placeholder="e.g. 75"
          className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-lg font-medium text-zinc-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-zinc-300"
        />
      </div>

      {/* Height */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
          <Ruler size={14} /> Height (cm) <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          min="50"
          max="250"
          value={form.height || ''}
          onChange={(e) => setForm({ ...form, height: e.target.value })}
          placeholder="e.g. 170"
          className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-lg font-medium text-zinc-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-zinc-300"
        />
      </div>

      {/* Blood type */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
          <Droplets size={14} /> Blood Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {BLOOD_TYPES.map((bt) => (
            <button
              key={bt}
              type="button"
              onClick={() => setForm({ ...form, bloodType: bt })}
              className={`h-11 rounded-xl font-bold text-sm transition-all ${
                form.bloodType === bt
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:border-blue-300'
              }`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function ConditionsStep({ form, setForm }) {
  const [newCondition, setNewCondition] = useState('');

  const addCondition = () => {
    const val = newCondition.trim();
    if (!val) return;
    setForm({ ...form, conditions: [...(form.conditions || []), val] });
    setNewCondition('');
  };

  const removeCondition = (idx) => {
    setForm({ ...form, conditions: (form.conditions || []).filter((_, i) => i !== idx) });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 max-w-lg mx-auto w-full">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Chronic Conditions</h2>
        <p className="text-zinc-400 text-sm mt-1">List any chronic diseases you have (optional)</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newCondition}
          onChange={(e) => setNewCondition(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
          placeholder="e.g. Diabetes, Hypertension..."
          className="flex-1 h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-zinc-300"
        />
        <button
          type="button"
          onClick={addCondition}
          className="h-12 px-5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
        >
          Add
        </button>
      </div>

      {(form.conditions || []).length > 0 ? (
        <div className="space-y-2">
          {form.conditions.map((c, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-zinc-700">{c}</span>
              <button onClick={() => removeCondition(i)} className="text-zinc-300 hover:text-red-500 transition-colors text-lg font-bold">×</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-2xl">
          <AlertTriangle size={28} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 font-medium">No conditions added</p>
          <p className="text-xs text-zinc-300 mt-1">Skip this step if you don't have any</p>
        </div>
      )}

      {/* Quick-add common conditions */}
      <div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Kidney Disease', 'Thyroid'].map((c) => {
            const exists = (form.conditions || []).includes(c);
            return (
              <button
                key={c}
                type="button"
                disabled={exists}
                onClick={() => setForm({ ...form, conditions: [...(form.conditions || []), c] })}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  exists
                    ? 'bg-blue-100 text-blue-600 cursor-default'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {exists ? <Check size={12} className="inline mr-1" /> : '+'} {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MedicationsStep({ form, setForm }) {
  const [newMed, setNewMed] = useState('');

  const addMedication = () => {
    const val = newMed.trim();
    if (!val) return;
    setForm({ ...form, medications: [...(form.medications || []), val] });
    setNewMed('');
  };

  const removeMedication = (idx) => {
    setForm({ ...form, medications: (form.medications || []).filter((_, i) => i !== idx) });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 max-w-lg mx-auto w-full">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Current Medications</h2>
        <p className="text-zinc-400 text-sm mt-1">Add any medications you're currently taking (optional)</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMed}
          onChange={(e) => setNewMed(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
          placeholder="e.g. Metformin, Lisinopril..."
          className="flex-1 h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-zinc-300"
        />
        <button
          type="button"
          onClick={addMedication}
          className="h-12 px-5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
        >
          Add
        </button>
      </div>

      {(form.medications || []).length > 0 ? (
        <div className="space-y-2">
          {form.medications.map((m, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Pill size={14} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-zinc-700">{m}</span>
              </div>
              <button onClick={() => removeMedication(i)} className="text-zinc-300 hover:text-red-500 transition-colors text-lg font-bold">×</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-2xl">
          <Pill size={28} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 font-medium">No medications added</p>
          <p className="text-xs text-zinc-300 mt-1">Skip if you're not on any medication</p>
        </div>
      )}
    </div>
  );
}

function LaunchStep({ form, isSubmitting }) {
  const calc = bmiFromMetricKgCm(form.weight, form.height);
  const bmi = calc != null ? calc.toFixed(1) : '—';

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center max-w-lg mx-auto w-full">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mx-auto">
          {isSubmitting ? (
            <Loader2 size={32} className="text-white animate-spin" />
          ) : (
            <Zap size={32} className="text-white fill-white/20" />
          )}
        </div>
      </div>

      <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
        {isSubmitting ? 'Building Your Twin...' : 'Ready to Launch!'}
      </h2>
      <p className="text-zinc-400 text-sm mb-8">Review your data and launch your Digital Twin</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 text-left mb-6">
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Weight</p>
          <p className="text-xl font-black text-zinc-900">{form.weight || '—'} <span className="text-sm font-medium text-zinc-400">kg</span></p>
        </div>
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Height</p>
          <p className="text-xl font-black text-zinc-900">{form.height || '—'} <span className="text-sm font-medium text-zinc-400">cm</span></p>
        </div>
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">BMI</p>
          <p className="text-xl font-black text-blue-600">{bmi}</p>
        </div>
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Blood Type</p>
          <p className="text-xl font-black text-zinc-900">{form.bloodType || '—'}</p>
        </div>
      </div>

      {(form.conditions?.length > 0 || form.medications?.length > 0) && (
        <div className="text-left space-y-3 mb-4">
          {form.conditions?.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Chronic Conditions</p>
              <div className="flex flex-wrap gap-1.5">
                {form.conditions.map((c, i) => (
                  <span key={i} className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
          {form.medications?.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Medications</p>
              <div className="flex flex-wrap gap-1.5">
                {form.medications.map((m, i) => (
                  <span key={i} className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SETUP PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function DigitalTwinSetup() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [form, setForm] = useState({
    weight: '',
    height: '',
    bloodType: '',
    conditions: [],
    medications: [],
  });

  // Pre-fill from existing profile if data exists
  useEffect(() => {
    const loadExisting = async () => {
      try {
        const [basicInfo, medProfile] = await Promise.allSettled([
          patientService.getBasicInfo(),
          patientService.getMedicalProfile(),
        ]);

        const bio = basicInfo.status === 'fulfilled' ? basicInfo.value : {};
        const med = medProfile.status === 'fulfilled' ? medProfile.value : {};

        setForm((prev) => ({
          ...prev,
          weight: bio?.weight || prev.weight,
          height: bio?.height || prev.height,
          bloodType: bio?.bloodType || prev.bloodType,
          conditions: (med?.chronicDiseases || []).map((d) => d.nameOfDisease || d.name || d.disease || (typeof d === 'string' ? d : '')).filter(Boolean),
          medications: (med?.currentMedications || []).map((m) => m.name || (typeof m === 'string' ? m : '')).filter(Boolean),
        }));
      } catch (err) {
        console.warn('Could not pre-fill DT setup:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadExisting();
  }, []);

  const canAdvance = () => {
    if (step === 1) return form.weight && form.height;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast.error('Please fill in the required fields');
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      // Save body metrics — weight, height, and optional bloodType
      const updatePayload = {};
      if (form.weight) updatePayload.weight = Number(form.weight);
      if (form.height) updatePayload.height = Number(form.height);
      if (form.bloodType) updatePayload.bloodType = form.bloodType;

      if (Object.keys(updatePayload).length > 0) {
        await patientService.updateBasicInfo(updatePayload);
      }

      for (const condition of form.conditions) {
        try {
          await patientService.addChronicDisease({ nameOfDisease: condition });
        } catch (err) {
          if (!err?.response?.data?.message?.includes('duplicate')) {
            console.warn('Could not save condition:', condition, err);
          }
        }
      }

      for (const med of form.medications) {
        try {
          await patientService.addMedication({ name: med });
        } catch (err) {
          if (!err?.response?.data?.message?.includes('duplicate')) {
            console.warn('Could not save medication:', med, err);
          }
        }
      }

      localStorage.setItem('neura_dt_setup_done', 'true');
      toast.success('Digital Twin activated! 🧬');
      navigate('/dashboard/patient/digital-twin');
    } catch (err) {
      console.error('DT setup save error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save profile data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-zinc-400 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-4 md:p-8 pb-32 font-sans">
      {/* Progress Header */}
      <div className="w-full max-w-xl mb-10">
        <div className="flex items-center justify-between mb-4 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isCurrent = i === step;
            return (
              <div key={s.id} className="flex items-center gap-0 flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : isCurrent
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                    }`}
                  >
                    {isDone ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-600' : isDone ? 'text-emerald-500' : 'text-zinc-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full mx-2 mb-5 transition-all duration-500 ${isDone ? 'bg-emerald-400' : 'bg-zinc-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-xl bg-white rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 md:p-10 mb-8">
        {step === 0 && <WelcomeStep />}
        {step === 1 && <BodyMetricsStep form={form} setForm={setForm} />}
        {step === 2 && <ConditionsStep form={form} setForm={setForm} />}
        {step === 3 && <MedicationsStep form={form} setForm={setForm} />}
        {step === 4 && <LaunchStep form={form} isSubmitting={isSubmitting} />}
      </div>

      {/* Navigation */}
      <div className="w-full max-w-xl flex items-center justify-between gap-4">
        {step > 0 ? (
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 h-12 rounded-xl bg-zinc-100 text-zinc-600 font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <ChevronLeft size={18} /> Back
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex items-center gap-2 px-8 h-12 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Building Twin...</>
            ) : (
              <><Zap size={18} /> Launch Digital Twin</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
