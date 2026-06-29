import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Zap,
  AlertCircle,
  Activity,
  Heart,
  Brain,
  Wind,
  Droplets,
  FlaskConical,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../providers/AuthProvider";
import {
  getDigitalTwin,
  simulateWhatIf,
} from "../../../api/digitalTwinService";
import { patientService } from "../../../api/patientService";
import { bmiFromMetricKgCm, getBmiCategory } from "./digitalTwinUtils";

function weightKgFromVitals(vitals) {
  const w = vitals?.weight;
  if (w == null) return 70;
  if (typeof w === "number" && Number.isFinite(w)) return w;
  if (typeof w === "object" && w.value != null) {
    const n = Number(w.value);
    return Number.isFinite(n) ? n : 70;
  }
  const n = Number(w);
  return Number.isFinite(n) ? n : 70;
}

function bmiScalarForModel(bmi) {
  if (bmi == null) return null;
  if (typeof bmi === "number" && Number.isFinite(bmi)) return bmi;
  if (typeof bmi === "object" && bmi.value != null) {
    const n = Number(bmi.value);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(bmi);
  return Number.isFinite(n) ? n : null;
}
import TwinViewer from "./components/TwinViewer";
import OrganNavBar from "./components/OrganNavBar";
import HealthCards from "./components/HealthCards";
import WhatIfChat from "./components/WhatIfChat";

const ORGAN_DATA = {
  heart: {
    title: "Heart",
    icon: Heart,
    color: "text-red-500",
  },
  brain: {
    title: "Brain",
    icon: Brain,
    color: "text-purple-500",
  },
  lung: {
    title: "Lungs",
    icon: Wind,
    color: "text-sky-500",
  },
  kidneys: {
    title: "Kidneys",
    icon: Droplets,
    color: "text-blue-500",
  },
  liver: {
    title: "Liver",
    icon: FlaskConical,
    color: "text-orange-500",
  },
};

function FloatingTag({ organ, organsList }) {
  const info = ORGAN_DATA[organ];
  if (!info) return null;
  const Icon = info.icon;

  const normalizedKey = organ.toLowerCase().replace(/s$/, "");
  const dynamicStats = organsList?.find((o) =>
    o.organ.toLowerCase().replace(/s$/, "") === normalizedKey
  );

  const riskVal = dynamicStats ? Math.round((Number(dynamicStats.risk_level) || 0) * 100) : 0;
  const isHigh = riskVal > 60;
  const isMedium = riskVal > 35;
  const isAffected = dynamicStats && riskVal >= 20;

  const borderColor = isHigh
    ? "border-l-red-500"
    : isMedium
    ? "border-l-amber-500"
    : isAffected
    ? "border-l-yellow-400"
    : "border-l-emerald-400";

  const pillStyle = isHigh
    ? "bg-red-50 text-red-600 border border-red-100"
    : isMedium
    ? "bg-amber-50 text-amber-600 border border-amber-100"
    : isAffected
    ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
    : "bg-emerald-50 text-emerald-600 border border-emerald-100";

  return (
    <div
      className={`absolute top-5 left-5 z-10 bg-white/95 backdrop-blur-xl border border-l-4 ${borderColor} border-zinc-100 rounded-2xl shadow-2xl min-w-[220px] max-w-[260px] overflow-hidden animate-fadeIn`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            isAffected ? "bg-red-50 border border-red-100" : "bg-slate-50 border border-slate-100"
          }`}
        >
          <Icon size={16} className={info.color} />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-extrabold text-zinc-900 block truncate">{info.title}</span>
          <span className="text-[10px] text-zinc-400 font-medium">
            {isAffected ? "Health Alert" : "Organ Status"}
          </span>
        </div>
        {isAffected && (
          <span
            className={`ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${
              isHigh
                ? "bg-red-500 text-white animate-pulse"
                : isMedium
                ? "bg-amber-500 text-white"
                : "bg-yellow-400 text-zinc-900"
            }`}
          >
            Affected
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Risk Level</span>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${pillStyle}`}>
            {isAffected ? `${riskVal}%` : "Low Risk"}
          </span>
        </div>

        {dynamicStats?.primary_symptom && (
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-0.5">Primary Effect</p>
            <p className="text-xs text-zinc-700 font-semibold capitalize leading-snug">
              {dynamicStats.primary_symptom}
            </p>
          </div>
        )}

        {dynamicStats?.explanation && (
          <p className="text-[10px] text-zinc-500 italic leading-relaxed line-clamp-2">
            {dynamicStats.explanation}
          </p>
        )}

        {!isAffected && (
          <p className="text-[11px] text-emerald-600 font-bold">✓ Optimal / Healthy</p>
        )}
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
  const [simNarrative, setSimNarrative] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const weight = weightKgFromVitals(twin?.currentState?.vitals);
  const defaultModelWeight = Math.min(Math.max((weight - 50) / 100, 0), 1);
  const [modelWeight, setModelWeight] = useState(defaultModelWeight);

  // Fetch digital twin data
  useEffect(() => {
    const fetchTwin = async () => {
      setLoading(true);
      try {
        const res = await getDigitalTwin();
        if (res?.status === "error") {
          throw { response: { data: res } };
        }
        setTwin(res?.data || null);
        const w = weightKgFromVitals(res?.data?.currentState?.vitals);
        setModelWeight(Math.min(Math.max((w - 50) / 100, 0), 1));
      } catch (err) {
        console.error("Digital Twin fetch error:", err);
        const resData = err?.response?.data;
        const msg =
          resData?.message ||
          resData?.error ||
          err?.message ||
          "";

        // Only redirect to setup if twin genuinely doesn't exist
        const isNotFound =
          err?.response?.status === 404 ||
          /not found|no digital twin/i.test(msg);
          
        if (isNotFound) {
          const setupDone = localStorage.getItem("neura_dt_setup_done") === "true";
          if (!setupDone) {
            navigate("/dashboard/patient/digital-twin/setup", { replace: true });
            return;
          }
          // If setup is done but still not found, load fallback instead of looping
          console.warn("Digital Twin not found despite setup — loading fallback");
        }

        // Backend BMI crash or "Not Found" after setup — load page with fallback data
        const isBmiBug =
          /bmi.*toFixed|toFixed.*bmi/i.test(msg) ||
          (msg.includes("toFixed") && msg.includes("function"));

        if (isBmiBug || isNotFound) {
          console.warn("Loading with fallback data due to:", isBmiBug ? "BMI bug" : "Not found after setup");
          try {
            const basicInfo = await patientService.getBasicInfo();
            const w = Number(basicInfo?.weight) || 70;
            const h = Number(basicInfo?.height) || 170;
            // Build a minimal twin so the page renders
            setTwin({
              isActive: true,
              currentState: {
                vitals: { weight: { value: w, trend: "unknown" }, height: h },
                overallHealthScore: { score: 0, category: "pending" },
                affectedOrgans: [],
              },
              riskScores: {},
              riskPredictions: [],
              recommendations: [],
              alerts: [],
            });
            setModelWeight(Math.min(Math.max((w - 50) / 100, 0), 1));
            toast(
              isNotFound 
                ? "Digital Twin not generated yet — showing profile data" 
                : "Digital Twin loaded with limited data — backend BMI issue", 
              { icon: isNotFound ? "ℹ️" : "⚠️" }
            );
          } catch (profileErr) {
            console.error("Profile fetch failed during fallback:", profileErr);
            setError("Could not load your health data. Please try again later.");
          }
          return;
        }

        setError(msg || "Failed to load your Digital Twin");
      } finally {
        setLoading(false);
      }
    };
    fetchTwin();
  }, [navigate]);

  const handleSimulate = useCallback(
    async (prompt) => {
      if (!prompt) {
        setSimData(null);
        setSimNarrative("");
        setModelWeight(Math.min(Math.max((weight - 50) / 100, 0), 1));
        return;
      }
      setIsSimulating(true);
      try {
        const res = await simulateWhatIf(prompt);
        const sim = res?.data?.simulation || {};
        setSimData(sim);
        setSimNarrative(
          sim.narrative_summary || "Simulation complete. Results displayed.",
        );
        const simBmi = bmiScalarForModel(sim.bmi);
        if (simBmi != null) {
          setModelWeight(Math.min(Math.max((simBmi - 18) / 15, 0), 1));
        }
        toast.success("Simulation Complete");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Simulation failed");
      } finally {
        setIsSimulating(false);
      }
    },
    [weight],
  );

  const handleReset = () => {
    setSimData(null);
    setSimNarrative("");
    setModelWeight(Math.min(Math.max((weight - 50) / 100, 0), 1));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">
          Loading your Digital Twin...
        </p>
      </div>
    );
  }

  if (error && !twin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">
            Digital Twin Not Available
          </h3>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-zinc-500 mt-4">
            Complete your medical profile to activate your Digital Twin.
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/digital-twin/setup")}
            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
          >
            Setup Digital Twin
          </button>
        </div>
      </div>
    );
  }

  const cs = twin?.currentState || {};
  const weightKg = weightKgFromVitals(cs.vitals);
  const heightCm = cs.vitals?.height ? (typeof cs.vitals.height === 'object' ? Number(cs.vitals.height.value) : Number(cs.vitals.height)) : 170;
  const calcBmi = bmiFromMetricKgCm(weightKg, heightCm) ?? 22;

  const bmi =
    simData?.bmi != null && Number.isFinite(Number(simData.bmi))
      ? Number(simData.bmi)
      : calcBmi;
  const bmiCat =
    simData?.bmi_category ||
    (bmi > 0 ? getBmiCategory(bmi).toLowerCase() : "normal");

  const score =
    simData?.projected_health_score?.score || cs.overallHealthScore?.score || 80;
  const scoreCat =
    simData?.projected_health_score?.category ||
    cs.overallHealthScore?.category ||
    "good";
  const scoreChange = simData?.projected_health_score?.change || null;
  const bmiWarn = bmiCat === "overweight" || bmiCat === "obese";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6 px-2">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              Hi, {user?.firstName || "there"}!
            </h1>
            {twin?.isActive && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                <Zap size={12} fill="currentColor" /> Twin Active
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">Let's monitor your health!</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: 3D Model */}
          <div className="lg:w-[42%] w-full flex flex-col gap-3 shrink-0">
            <div
              className="relative rounded-3xl overflow-hidden h-[540px]"
              style={{ background: "transparent" }}
            >
              {selectedOrgan && (
                <FloatingTag
                  organ={selectedOrgan}
                  organsList={simData?.affected_organs || twin?.currentState?.affectedOrgans || []}
                />
              )}
              <TwinViewer
                selectedOrgan={selectedOrgan}
                weight={modelWeight}
                organsList={simData?.affected_organs || twin?.currentState?.affectedOrgans || []}
              />
              {isSimulating && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-sm font-black text-blue-600 animate-pulse uppercase tracking-wider">
                      AI Simulating...
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-2 border border-zinc-100 shadow-sm">
              <OrganNavBar
                selectedOrgan={selectedOrgan}
                onSelectOrgan={setSelectedOrgan}
              />
            </div>
          </div>

          {/* Right: Dashboard Analytics & Chat */}
          <div className="lg:flex-1 w-full flex flex-col gap-6">
            {/* Top Stats: BMI & Health Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Health Score */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-blue-100" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                      <Shield size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400 font-extrabold uppercase tracking-wider">
                        Overall Health Score
                      </p>
                      <span className="text-xs font-semibold text-zinc-500 capitalize">
                        Status: {scoreCat || "Normal"}
                      </span>
                    </div>
                  </div>
                  {scoreChange && (
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-0.5 ${
                      scoreChange > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                      {scoreChange > 0 ? "+" : ""}
                      {scoreChange} points
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-light text-zinc-950 tracking-tight">
                    {score}
                  </span>
                  <span className="text-sm font-bold text-zinc-400">/ 100</span>
                </div>

                <div className="w-full">
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-700"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* BMI */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-teal-100" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                      <Activity size={20} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400 font-extrabold uppercase tracking-wider">
                        Body Mass Index (BMI)
                      </p>
                      <span className="text-xs font-semibold text-zinc-500 capitalize">
                        Category: {bmiCat || "N/A"}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    bmiWarn ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {bmiCat || "Unknown"}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-light text-zinc-950 tracking-tight">
                    {Number.isFinite(bmi) ? bmi.toFixed(1) : "—"}
                  </span>
                </div>

                <div className="w-full mt-2">
                  <div className="relative w-full h-1.5 bg-zinc-100 rounded-full">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white shadow-md transition-all duration-700"
                      style={{ left: `${Math.min(Math.max(((bmi - 15) / 20) * 100, 0), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-400 font-medium mt-1">
                    <span>15 (Under)</span>
                    <span>22 (Normal)</span>
                    <span>27 (Over)</span>
                    <span>35 (Obese)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: What-If Chat and Simulation Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
              {/* What-If Chat */}
              <div className="h-[460px] flex flex-col">
                <WhatIfChat
                  onSimulate={handleSimulate}
                  isLoading={isSimulating}
                  isSimulating={!!simData}
                  simResult={simNarrative}
                  onReset={handleReset}
                />
              </div>

              {/* Health Cards (scrollable Insights) */}
              <div className="h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                <HealthCards twin={twin} simData={simData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
