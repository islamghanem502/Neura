import axiosInstance from './axiosInstance';

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
  const response = await axiosInstance.get('/medical-records/my-records', { params });
  return response.data;
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
  const response = await axiosInstance.get(`/medical-records/patient/${patientId}`, { params });
  return response.data;
};

