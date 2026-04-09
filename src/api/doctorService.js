import axiosInstance from './axiosInstance';

/**
 * Fetch a single doctor's full profile by ID.
 * GET /doctors/:id
 */
export const getDoctorById = async (doctorId) => {
  const response = await axiosInstance.get(`/doctors/${doctorId}`);
  return response.data;
};

// ── Profile Image ─────────────────────────────────────────────────────────────

export const uploadProfileImage = async (formData) => {
  const response = await axiosInstance.post('/profile/profile-image', formData);
  return response.data;
};

export const deleteProfileImage = async () => {
  const response = await axiosInstance.delete('/profile/profile-image');
  return response.data;
};

/**
 * Fetch the logged-in doctor's basic info.
 * GET /doctors/me/basic-info
 */
export const getDoctorBasicInfo = async () => {
  const response = await axiosInstance.get('/doctors/me/basic-info');
  return response.data;
};

/**
 * Create the logged-in doctor's basic info (first time).
 * POST /doctors/me/basic-info
 */
export const createDoctorBasicInfo = async (data) => {
  const response = await axiosInstance.post('/doctors/me/basic-info', data);
  return response.data;
};

/**
 * Update the logged-in doctor's basic info.
 * PATCH /doctors/me/basic-info
 */
export const updateDoctorBasicInfo = async (data) => {
  const response = await axiosInstance.patch('/doctors/me/basic-info', data);
  return response.data;
};

/**
 * Update the logged-in doctor's professional info.
 * PATCH /doctors/me/professional-info
 */
export const updateDoctorProfessionalInfo = async (data) => {
  const response = await axiosInstance.patch('/doctors/me/professional-info', data);
  return response.data;
};

/**
 * Upload a document (National ID, Medical Degree, etc.)
 * POST /doctors/me/documents/:type
 */
export const uploadDoctorDocument = async ({ documentType, formData }) => {
  const response = await axiosInstance.post(`/doctors/me/documents/${documentType}`, formData);
  return response.data;
};

/**
 * Submit doctor profile for admin review.
 * POST /doctors/me/submit-for-review
 */
export const submitDoctorProfileForReview = async () => {
  const response = await axiosInstance.post('/doctors/me/submit-for-review');
  return response.data;
};

// ─── Professional Info Extended ─────────────────────────────────────────────

export const getDoctorProfessionalInfo = async () => {
  const response = await axiosInstance.get('/doctors/me/professional-info');
  return response.data;
};

// Certificates
export const addDoctorCertificate = async (formData) => {
  const response = await axiosInstance.post('/doctors/me/professional-info/certificates', formData);
  return response.data;
};

export const deleteDoctorCertificate = async (id) => {
  const response = await axiosInstance.delete(`/doctors/me/professional-info/certificates/${id}`);
  return response.data;
};

// Memberships
export const addDoctorMembership = async (data) => {
  const response = await axiosInstance.post('/doctors/me/professional-info/memberships', data);
  return response.data;
};

export const deleteDoctorMembership = async (id) => {
  const response = await axiosInstance.delete(`/doctors/me/professional-info/memberships/${id}`);
  return response.data;
};

// Awards
export const addDoctorAward = async (formData) => {
  const response = await axiosInstance.post('/doctors/me/professional-info/awards', formData);
  return response.data;
};

export const deleteDoctorAward = async (id) => {
  const response = await axiosInstance.delete(`/doctors/me/professional-info/awards/${id}`);
  return response.data;
};

// ─── Clinic Info ──────────────────────────────────────────────────────────────

export const getClinicInfo = async () => {
  const response = await axiosInstance.get('/doctors/me/clinic-info');
  return response.data;
};

export const addClinicInfo = async (data) => {
  const response = await axiosInstance.post('/doctors/me/clinic-info', data);
  return response.data;
};

export const updateClinicInfo = async ({ clinicId, data }) => {
  const response = await axiosInstance.patch(`/doctors/me/clinic-info/${clinicId}`, data);
  return response.data;
};

export const deleteClinicInfo = async (clinicId) => {
  const response = await axiosInstance.delete(`/doctors/me/clinic-info/${clinicId}`);
  return response.data;
};
