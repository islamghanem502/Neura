import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Zap, AlertCircle, Activity, Heart, Brain, Wind, Droplets, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../../providers/AuthProvider';
import { getDigitalTwin, simulateWhatIf } from '../../../api/digitalTwinService';
import TwinViewer from './components/TwinViewer';
import OrganNavBar from './components/OrganNavBar';
import HealthCards from './components/HealthCards';
import WhatIfChat from './components/WhatIfChat';

function weightKgFromVitals(vitals) {
  const w = vitals?.weight;
  if (w == null) return 70;
  if (typeof w === 'number' && Number.isFinite(w)) return w;
  if (typeof w === 'object' && w.value != null) {
    const n = Number(w.value);
    return Number.isFinite(n) ? n : 70;
  }
  const n = Number(w);
  return Number.isFinite(n) ? n : 70;
}

function bmiScalarForModel(bmi) {
  if (bmi == null) return null;
  if (typeof bmi === 'number' && Number.isFinite(bmi)) return bmi;
  if (typeof bmi === 'object' && bmi.value != null) {
    const n = Number(bmi.value);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(bmi);
  return Number.isFinite(n) ? n : null;
}

const ORGAN_DATA = {
  heart: { title: 'Heart Rate', value: '108', unit: 'Bpm', icon: Heart, color: 'text-red-500' },
  brain: { title: 'Brain Activity', value: '92', unit: '%', icon: Brain, color: 'text-purple-500' },
  lung: { title: 'Respiratory', value: '15', unit: 'br/min', icon: Wind, color: 'text-sky-500' },
  kidneys: { title: 'Blood Glucose', value: '89', unit: 'mmol/L', icon: Droplets, color: 'text-blue-500' },
  liver: { title: 'Liver Enzymes', value: '52', unit: 'IU/L', icon: FlaskConical, color: 'text-orange-500' },
};

function FloatingTag({ organ }) {
  const info = ORGAN_DATA[organ];
  if (!info) return null;
  const Icon = info.icon;
  return (
    <div className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-xl min-w-[220px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <Icon size={24} className={info.color} />
        </div>
        <span className="text-[15px] font-bold text-zinc-900">{info.title}</span>
      </div>
      <div className="flex items-baseline">
        <span className="text-[42px] font-light text-zinc-900 tracking-tight leading-none">{info.value}</span>
        <span className="text-[15px] text-zinc-500 font-medium ml-1.5">{info.unit}</span>
      </div>
    </div>
  );
}

export default function DigitalTwinPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [simData, setSimData] = useState(null);
  const [simNarrative, setSimNarrative] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const weight = weightKgFromVitals(twin?.currentState?.vitals);
  const defaultModelWeight = Math.min(Math.max((weight - 50) / 100, 0), 1);
  const [modelWeight, setModelWeight] = useState(defaultModelWeight);

  // Fetch digital twin data
  useEffect(() => {
    setLoading(true);
    getDigitalTwin()
      .then((res) => {
        setTwin(res?.data || null);
        const w = weightKgFromVitals(res?.data?.currentState?.vitals);
        setModelWeight(Math.min(Math.max((w - 50) / 100, 0), 1));
      })
      .catch((err) => {
        console.error('Digital Twin fetch error:', err);
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          '';
        // Only redirect to setup if twin genuinely doesn't exist (404)
        const isNotFound = err?.response?.status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no digital twin');
        if (isNotFound) {
          localStorage.removeItem('neura_dt_setup_done');
          navigate('/dashboard/patient/digital-twin/setup', { replace: true });
          return;
        }
        const backendBmiBug =
          /bmi.*toFixed|toFixed.*bmi/i.test(msg) ||
          (msg.includes('toFixed') && msg.includes('bmi'));
        setError(
          backendBmiBug
            ? `${msg} This usually means the server expects patient BMI as a number but received an object (for example { value, category }). Ask the backend to coerce BMI before calling toFixed, or store a numeric BMI on the patient profile.`
            : msg || 'Failed to load your Digital Twin'
        );
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSimulate = useCallback(async (prompt) => {
    if (!prompt) {
      setSimData(null);
      setSimNarrative('');
      setModelWeight(Math.min(Math.max((weight - 50) / 100, 0), 1));
      return;
    }
    setIsSimulating(true);
    try {
      const res = await simulateWhatIf(prompt);
      const sim = res?.data?.simulation || {};
      setSimData(sim);
      setSimNarrative(sim.narrative_summary || 'Simulation complete. Results displayed.');
      const simBmi = bmiScalarForModel(sim.bmi);
      if (simBmi != null) {
        setModelWeight(Math.min(Math.max((simBmi - 18) / 15, 0), 1));
      }
      toast.success('Simulation Complete');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  }, [weight]);

  const handleReset = () => {
    setSimData(null);
    setSimNarrative('');
    setModelWeight(Math.min(Math.max((weight - 50) / 100, 0), 1));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Loading your Digital Twin...</p>
      </div>
    );
  }

  if (error && !twin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Digital Twin Not Available</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-zinc-500 mt-4">Complete your medical profile to activate your Digital Twin.</p>
          <button
            onClick={() => navigate('/dashboard/patient/digital-twin/setup')}
            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
          >
            Setup Digital Twin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6 px-2">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              Hi, {user?.firstName || 'there'}!
            </h1>
            {twin?.isActive && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                <Zap size={12} fill="currentColor" /> Twin Active
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">Let's monitor your health!</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Left: 3D Model */}
          <div className="lg:w-[45%] flex flex-col gap-0 shrink-0">
            <div className="relative rounded-3xl overflow-hidden h-[520px]" style={{ background: '#f0f1f5' }}>
              {selectedOrgan && <FloatingTag organ={selectedOrgan} />}
              <TwinViewer selectedOrgan={selectedOrgan} weight={modelWeight} />
              {isSimulating && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-bold text-blue-600 animate-pulse">AI Simulating...</p>
                  </div>
                </div>
              )}
            </div>
            <OrganNavBar selectedOrgan={selectedOrgan} onSelectOrgan={setSelectedOrgan} />
          </div>

          {/* Right: Cards & Chat */}
          <div className="lg:w-[55%] flex flex-col gap-4 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vitals + Chat */}
              <div className="flex flex-col gap-4">
                {/* Heart Rate card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center">
                      <Activity size={18} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Heart Rate</p>
                      <p className="text-3xl font-light text-zinc-900 mt-0.5">108<span className="text-[13px] text-zinc-400 ml-1">Bpm</span></p>
                    </div>
                  </div>
                  <div className="h-12 mt-4 w-full">
                    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="w-full h-full">
                      <polyline points="0,20 15,20 25,5 35,35 45,20 60,20" fill="none" stroke="#e5e7eb" strokeWidth="1.5" strokeLinejoin="round" />
                      <polyline points="60,20 70,20 80,0 90,40 100,20 110,20 115,10 125,30 135,20" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
                      <polyline points="135,20 150,20 160,5 170,35 180,20 200,20" fill="none" stroke="#e5e7eb" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Blood Pressure card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center">
                      <Droplets size={18} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Blood Pressure</p>
                      <p className="text-3xl font-light text-zinc-900 mt-0.5">116<span className="text-[13px] text-zinc-400 ml-1">/70</span></p>
                    </div>
                  </div>
                </div>

                {/* What-If Chat */}
                <div className="min-h-[280px]">
                  <WhatIfChat
                    onSimulate={handleSimulate}
                    isSimulating={!!simData}
                    simResult={simNarrative}
                    onReset={handleReset}
                  />
                </div>
              </div>

              {/* Health Cards (scrollable) */}
              <div className="overflow-y-auto max-h-[800px] pr-1">
                <HealthCards twin={twin} simData={simData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
