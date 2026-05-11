import axiosInstance from './axiosInstance';

/** Coerce API scalars: number, numeric string, or `{ value }` / `{ score }`. */
function coerceNumber(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof raw === 'object') {
    if (raw.value != null) return coerceNumber(raw.value);
    if (raw.score != null) return coerceNumber(raw.score);
  }
  return null;
}

/** Normalize `vitals.bmi` to `{ value: number, category?: string }` when possible. */
function normalizeBmiField(bmi) {
  if (bmi == null) return bmi;
  if (typeof bmi === 'number' || typeof bmi === 'string') {
    const v = coerceNumber(bmi);
    return v != null ? { value: v, category: '' } : bmi;
  }
  if (typeof bmi === 'object') {
    const v = coerceNumber(bmi);
    if (v == null) return bmi;
    return {
      ...bmi,
      value: v,
      category: typeof bmi.category === 'string' ? bmi.category : '',
    };
  }
  return bmi;
}

function normalizeWeightField(weight) {
  if (weight == null) return weight;
  if (typeof weight === 'number' || typeof weight === 'string') {
    const v = coerceNumber(weight);
    return v != null ? { value: v, trend: 'unknown' } : weight;
  }
  if (typeof weight === 'object') {
    const v = coerceNumber(weight);
    if (v == null) return weight;
    return { ...weight, value: v };
  }
  return weight;
}

/** Deep-merge safe vitals so UI always sees consistent twin shapes. */
export function normalizeDigitalTwinPayload(twin) {
  if (!twin || typeof twin !== 'object') return twin;
  const cs = twin.currentState;
  if (!cs?.vitals) return twin;
  const vitals = { ...cs.vitals };
  if ('bmi' in vitals) vitals.bmi = normalizeBmiField(vitals.bmi);
  if ('weight' in vitals) vitals.weight = normalizeWeightField(vitals.weight);
  if ('height' in vitals && vitals.height != null) {
    const h = coerceNumber(vitals.height);
    if (h != null) vitals.height = h;
  }
  return {
    ...twin,
    currentState: {
      ...cs,
      vitals,
    },
  };
}

function normalizeSimulation(sim) {
  if (!sim || typeof sim !== 'object') return sim;
  const next = { ...sim };
  if (next.bmi != null) {
    const n = coerceNumber(next.bmi);
    if (n != null) next.bmi = n;
  }
  return next;
}

/**
 * Get the current patient's digital twin data.
 * Endpoint: GET /digital-twin/my-twin
 * Auth: Bearer token (resolved from session)
 */
export const getDigitalTwin = async () => {
  const response = await axiosInstance.get('/digital-twin/my-twin');
  const envelope = response.data;
  if (envelope?.data) {
    return { ...envelope, data: normalizeDigitalTwinPayload(envelope.data) };
  }
  return envelope;
};

/**
 * Run a "What-If" simulation scenario for the current patient.
 * Endpoint: POST /digital-twin/what-if
 * Auth: Bearer token (resolved from session)
 */
export const simulateWhatIf = async (scenario) => {
  const response = await axiosInstance.post('/digital-twin/what-if', { scenario });
  const envelope = response.data;
  if (envelope?.data?.simulation) {
    return {
      ...envelope,
      data: {
        ...envelope.data,
        simulation: normalizeSimulation(envelope.data.simulation),
      },
    };
  }
  return envelope;
};
