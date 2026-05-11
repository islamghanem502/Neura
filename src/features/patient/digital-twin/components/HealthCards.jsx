import React from 'react';
import { Activity, Shield, TrendingUp, Brain, MessageCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const riskColor = (val) => val > 60 ? 'bg-red-400' : val > 35 ? 'bg-amber-400' : 'bg-emerald-400';
const riskText = (val) => val > 60 ? 'text-red-500' : val > 35 ? 'text-amber-500' : 'text-emerald-500';

/** API may send organ risk as 0–1 (0.6) or 0–100 (60). */
function organRiskFraction(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n > 1 ? Math.min(n, 100) / 100 : n;
}

/**
 * Twin sometimes returns `score: 0` with a meaningful `level` (e.g. very_high).
 * Use numeric score when > 0; otherwise infer bar + color from `level`.
 */
function riskLevelToScore(level) {
  const key = String(level || '').toLowerCase().replace(/\s+/g, '_');
  const map = {
    minimal: 12,
    low: 22,
    moderate: 45,
    medium: 45,
    high: 72,
    very_high: 88,
    critical: 95,
  };
  return map[key] ?? 0;
}

function formatRiskLevelLabel(level) {
  if (!level) return '—';
  return String(level).replace(/_/g, ' ');
}

function riskScoreUi(risk) {
  if (!risk) return { barPct: 0, headline: '—', colorVal: 0 };
  const raw = Number(risk.score);
  const hasNumeric = Number.isFinite(raw) && raw > 0;
  const barPct = hasNumeric ? Math.min(100, raw) : riskLevelToScore(risk.level);
  const colorVal = hasNumeric ? raw : barPct;
  const headline = hasNumeric ? `${Math.round(raw)}%` : formatRiskLevelLabel(risk.level);
  return { barPct, headline, colorVal };
}

/** Twin API may send bmi as a number, string, or `{ value, category }`. */
function extractBmiValue(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof raw === 'object' && raw.value != null) {
    const n = Number(raw.value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function extractBmiCategory(vitalsBmi) {
  if (vitalsBmi && typeof vitalsBmi === 'object' && typeof vitalsBmi.category === 'string') return vitalsBmi.category;
  return '';
}

/** When API sends bmi as a plain number, derive WHO-style label for display. */
function bmiCategoryFromValue(val) {
  if (!Number.isFinite(val) || val <= 0) return '';
  if (val < 18.5) return 'underweight';
  if (val < 25) return 'normal';
  if (val < 30) return 'overweight';
  return 'obese';
}

export default function HealthCards({ twin, simData }) {
  const cs = twin?.currentState || {};
  const rs = twin?.riskScores || {};
  const preds = twin?.riskPredictions || [];
  const alerts = twin?.alerts || [];
  const recs = twin?.recommendations || [];

  const bmi = extractBmiValue(simData?.bmi ?? cs.vitals?.bmi) ?? 0;
  const bmiCat =
    simData?.bmi_category ||
    extractBmiCategory(cs.vitals?.bmi) ||
    bmiCategoryFromValue(bmi) ||
    '';

  const score = simData?.projected_health_score?.score || cs.overallHealthScore?.score || 0;
  const scoreCat = simData?.projected_health_score?.category || cs.overallHealthScore?.category || '';
  const organs = simData?.affected_organs || cs.affectedOrgans || [];
  const narrative = simData?.narrative_summary || null;
  const scoreChange = simData?.projected_health_score?.change || null;

  const bmiWarn = bmiCat === 'overweight' || bmiCat === 'obese';

  return (
    <div className="flex flex-col gap-3">
      {/* BMI */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center">
            <Activity size={18} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">BMI</p>
            <p className="text-3xl font-light text-zinc-900 mt-0.5">
              {Number.isFinite(bmi) ? bmi.toFixed(1) : '—'}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${bmiWarn ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {bmiCat || 'N/A'}
          </span>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center">
            <Shield size={18} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Health Score</p>
            <p className="text-3xl font-light text-zinc-900 mt-0.5">
              {score}
              <span className="text-[13px] text-zinc-400 ml-1 capitalize">{scoreCat}</span>
              {scoreChange && (
                <span className={`text-sm font-bold ml-2 ${scoreChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {scoreChange > 0 ? '+' : ''}{scoreChange}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="mt-4 w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-300 transition-all duration-700" style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Risk / Affected Organs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center">
            <TrendingUp size={18} className="text-zinc-400" />
          </div>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
            {simData ? 'Simulated Impact' : 'Risk Assessment'}
          </p>
        </div>
        <div className="space-y-4">
          {organs.length > 0 ? (
            organs.slice(0, 4).map((o, i) => {
              const organPct = Math.round(organRiskFraction(o.risk_level) * 100);
              return (
              <div key={o.id || o._id || i}>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-zinc-500 font-medium capitalize">{o.organ}</span>
                  <span className="font-bold text-zinc-700">{organPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${riskColor(organPct)}`}
                    style={{ width: `${Math.min(100, organPct)}%` }}
                  />
                </div>
                {o.primary_symptom && <p className="text-[10px] text-zinc-400 mt-1 italic">{o.primary_symptom}</p>}
              </div>
              );
            })
          ) : (
            <>
              {[
                { key: 'diabetesRisk', label: 'Diabetes Risk' },
                { key: 'cardiovascularRisk', label: 'Cardiovascular' },
                { key: 'strokeRisk', label: 'Stroke Risk' },
              ].map(({ key, label }) => {
                const r = rs[key];
                if (!r) return null;
                const { barPct, headline, colorVal } = riskScoreUi(r);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="text-zinc-500 font-medium">{label}</span>
                      <span className={`font-bold capitalize ${riskText(colorVal)}`}>{headline}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${riskColor(colorVal)}`} style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Narrative (simulation only) */}
      {narrative && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle size={18} className="text-blue-600" />
            </div>
            <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">AI Narrative</p>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed italic">"{narrative}"</p>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-[11px] text-red-600 font-bold uppercase tracking-wider">Alerts</p>
          </div>
          {alerts.map((a, i) => (
            <p key={i} className="text-sm text-red-700 mb-1 leading-relaxed">• {a.message}</p>
          ))}
        </div>
      )}

      {/* Predictions */}
      {preds.length > 0 && !simData && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center">
              <Brain size={18} className="text-zinc-400" />
            </div>
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">AI Predictions</p>
          </div>
          {preds.map((p, i) => (
            <div key={i} className="flex justify-between text-[12px] border-b border-zinc-50 pb-2 mb-2 last:border-0 last:mb-0">
              <span className="text-zinc-500">{p.condition}</span>
              <span className="font-bold text-amber-500">{p.timeframe}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recs.length > 0 && !simData && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-blue-500" />
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Recommendations</p>
          </div>
          {recs.map((r, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-sm font-bold text-zinc-800 capitalize">{r.recommendation}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{r.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
