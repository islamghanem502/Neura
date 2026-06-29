import React, { useState } from "react";
import {
  TrendingUp,
  Brain,
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  ChevronRight,
} from "lucide-react";



const riskColor = (val) =>
  val > 60 ? "bg-red-400" : val > 35 ? "bg-amber-400" : "bg-emerald-400";
const riskTextColor = (val) =>
  val > 60 ? "text-red-600" : val > 35 ? "text-amber-600" : "text-emerald-600";
const riskBgColor = (val) =>
  val > 60
    ? "bg-red-50 border-red-100"
    : val > 35
    ? "bg-amber-50 border-amber-100"
    : "bg-emerald-50 border-emerald-100";

export default function HealthCards({ twin, simData }) {
  const [activeTab, setActiveTab] = useState("risk");

  const cs = twin?.currentState || {};
  const rs = twin?.riskScores || {};
  const preds = twin?.riskPredictions || [];
  const alerts = twin?.alerts || [];
  const recs = twin?.recommendations || [];

  const organs = simData?.affected_organs || cs.affectedOrgans || [];
  const narrative = simData?.narrative_summary || null;
  const simRecs = simData?.recommendations_summary || [];

  // Derive risk items from riskScores if no organ data
  const riskItems = organs.length > 0
    ? organs.map((o) => ({
        label: o.organ,
        value: Math.round((Number(o.risk_level) || 0) * 100),
        symptom: o.primary_symptom || null,
        isOrgan: true,
      }))
    : [
        rs.diabetesRisk && { label: "Diabetes", value: rs.diabetesRisk.score, isOrgan: false },
        rs.cardiovascularRisk && { label: "Cardiovascular", value: rs.cardiovascularRisk.score, isOrgan: false },
        rs.strokeRisk && { label: "Stroke", value: rs.strokeRisk.score, isOrgan: false },
      ].filter(Boolean);

  const insightItems = [
    ...(narrative ? [{ type: "narrative", content: narrative }] : []),
    ...(alerts.map((a) => ({ type: "alert", content: a.message }))),
    ...(preds.map((p) => ({ type: "pred", label: p.condition, timeframe: p.timeframe }))),
  ];

  const recItems = simData
    ? simRecs.map((r) => ({ text: r }))
    : recs.map((r) => ({ text: r.recommendation, sub: r.reason }));

  const TABS = [
    {
      id: "risk",
      label: simData ? "Impact" : "Risk",
      icon: TrendingUp,
      count: riskItems.length,
      color: "text-indigo-600",
      activeBg: "bg-indigo-600",
    },
    {
      id: "insights",
      label: "Insights",
      icon: Brain,
      count: insightItems.length,
      color: "text-purple-600",
      activeBg: "bg-purple-600",
    },
    {
      id: "recs",
      label: "Tips",
      icon: Lightbulb,
      count: recItems.length,
      color: "text-emerald-600",
      activeBg: "bg-emerald-600",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex border-b border-zinc-100 px-2 pt-2 gap-1 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? `${tab.activeBg} text-white shadow-sm`
                  : `text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50`
              }`}
            >
              <Icon size={13} />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                    isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {tab.count > 9 ? "9+" : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* ── RISK TAB ── */}
        {activeTab === "risk" && (
          <div className="space-y-3">
            {riskItems.length === 0 ? (
              <EmptyState icon={CheckCircle} text="No active risks detected" color="text-emerald-500" />
            ) : (
              riskItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-2xl border ${riskBgColor(item.value)}`}
                >
                  <div className="shrink-0 flex flex-col items-center gap-0.5">
                    <span
                      className={`text-lg font-black leading-none ${riskTextColor(item.value)}`}
                    >
                      {item.value}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${riskTextColor(item.value)}`}>
                      %
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          item.value > 60
                            ? "bg-red-500 animate-pulse"
                            : item.value > 35
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-sm font-bold text-zinc-800 capitalize truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${riskColor(item.value)}`}
                        style={{ width: `${Math.min(100, item.value)}%` }}
                      />
                    </div>
                    {item.symptom && (
                      <p className="text-[10px] text-zinc-500 mt-1 italic truncate capitalize">
                        {item.symptom}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {activeTab === "insights" && (
          <div className="space-y-3">
            {insightItems.length === 0 ? (
              <EmptyState icon={Brain} text="No insights available yet" color="text-purple-400" />
            ) : (
              insightItems.map((item, i) => {
                if (item.type === "narrative") {
                  return (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle size={13} className="text-blue-500 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                          AI Summary
                        </span>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed italic">
                        "{item.content}"
                      </p>
                    </div>
                  );
                }
                if (item.type === "alert") {
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-2xl p-3.5"
                    >
                      <AlertTriangle
                        size={13}
                        className="text-red-500 shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-red-800 leading-relaxed font-medium">
                        {item.content}
                      </p>
                    </div>
                  );
                }
                if (item.type === "pred") {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-2xl px-3.5 py-3"
                    >
                      <span className="text-xs font-bold text-zinc-700 capitalize">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-black text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        {item.timeframe}
                      </span>
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>
        )}

        {/* ── RECOMMENDATIONS TAB ── */}
        {activeTab === "recs" && (
          <div className="space-y-2.5">
            {recItems.length === 0 ? (
              <EmptyState icon={Lightbulb} text="No recommendations yet" color="text-emerald-400" />
            ) : (
              recItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl px-3.5 py-3"
                >
                  <ChevronRight
                    size={13}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 capitalize leading-snug">
                      {item.text}
                    </p>
                    {item.sub && (
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                        {item.sub}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, color }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <Icon size={30} className={`${color} opacity-40`} />
      <p className="text-xs font-semibold text-zinc-400">{text}</p>
    </div>
  );
}
