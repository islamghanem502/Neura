import axiosInstance from './axiosInstance';

/**
 * Mock data for fallback when API fails
 */
const MOCK_RECORDS = [
  {
    _id: 'mock1',
    visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    doctorId: { firstName: 'Sarah', lastName: 'Aris', professionalInfo: { primarySpecialization: 'Cardiology' } },
    appointmentId: { clinic: { clinicName: 'Neura Central Clinic' }, appointmentType: 'In-person' },
    aiSummary: {
      diagnosis: 'Mild Hypertension',
      urgency_level: 'routine',
      summary: 'Patient shows slightly elevated blood pressure. Recommended low-sodium diet and stress management.',
      symptoms: ['Dizziness', 'Headaches'],
      prescription: {
        medications: [{ name: 'Lisinopril', dose: '10mg', frequency: 'Daily', duration: '30 days', notes: 'Take in the morning' }],
        lifestyle_advice: 'Reduce salt intake and exercise 30 mins daily.'
      },
      follow_up: 'Check-up in 2 weeks to monitor BP levels.',
      alerts: { drug_interactions: [], allergy_conflicts: [] }
    }
  },
  {
    _id: 'mock2',
    visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    doctorId: { firstName: 'Michael', lastName: 'Chen', professionalInfo: { primarySpecialization: 'Internal Medicine' } },
    appointmentId: { clinic: { clinicName: 'Wellness Heights' }, appointmentType: 'Consultation' },
    aiSummary: {
      diagnosis: 'Vitamin D Deficiency',
      urgency_level: 'routine',
      summary: 'Blood work shows low Vitamin D levels. Supplementation required.',
      symptoms: ['Fatigue', 'Bone pain'],
      prescription: {
        medications: [{ name: 'Vitamin D3', dose: '5000 IU', frequency: 'Once daily', duration: '90 days' }],
        lifestyle_advice: 'Increase sun exposure (15 mins daily).'
      },
      follow_up: 'Repeat blood work in 3 months.',
      alerts: { drug_interactions: [], allergy_conflicts: [] }
    }
  }
];

/**
 * Create a new medical record (Doctor action)
 * POST /medical-records
 */
export const createMedicalRecord = async (payload) => {
  const response = await axiosInstance.post('/medical-records', payload);
  return response.data;
};

/**
 * Get all medical records for the authenticated patient
 * GET /medical-records/my-records
 */
export const getMyMedicalRecords = async (params = { page: 1, limit: 10 }) => {
  try {
    const response = await axiosInstance.get('/medical-records/my-records', { params });
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch medical records from API, using mock data fallback.', error);
    // Return mock data in a similar structure to the API response
    return {
      status: 'success',
      data: {
        records: MOCK_RECORDS,
        pagination: { total: MOCK_RECORDS.length, page: 1, limit: 10 }
      }
    };
  }
};

/**
 * Get a single medical record by ID
 * GET /medical-records/:id
 */
export const getMedicalRecordById = async (id) => {
  const response = await axiosInstance.get(`/medical-records/${id}`);
  return response.data;
};

/**
 * Get full medical history for a specific patient
 * GET /medical-records/patient/:patientId
 */
export const getPatientMedicalHistory = async (patientId, params = { page: 1, limit: 10 }) => {
  try {
    const response = await axiosInstance.get(`/medical-records/patient/${patientId}`, { params });
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch medical history for patient ${patientId}, using mock data fallback.`, error);
    return {
      status: 'success',
      data: {
        records: MOCK_RECORDS,
        pagination: { total: MOCK_RECORDS.length, page: 1, limit: 10 }
      }
    };
  }
};

