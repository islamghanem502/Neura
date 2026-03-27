import axiosInstance from './axiosInstance';

/**
 * Browse / filter doctors
 */
export const getDoctors = async (params = {}) => {
  const response = await axiosInstance.get('/doctors', { params });
  return response.data;
};

/**
 * Get available appointment slots for a doctor on a given date.
 * GET /appointments/available-slots/:doctorId
 * Query params: { date: 'YYYY-MM-DD', clinicId: string, isTelemedicine: boolean }
 */
export const getAvailableSlots = async (doctorId, params = {}) => {
  const response = await axiosInstance.get(
    `/appointments/available-slots/${doctorId}`,
    { params }
  );
  return response.data;
};

/**
 * Book a new appointment.
 * POST /appointments
 * Body: { doctorId, clinicId, appointmentType, scheduledDate,
 *         scheduledTime: { startTime, endTime }, paymentMethod }
 */
export const createAppointment = async (payload) => {
  const response = await axiosInstance.post('/appointments', payload);
  return response.data;
};

/**
 * Get the authenticated patient's own appointments.
 * GET /appointments
 * Query params: { page, limit, sortBy, sortOrder, status, appointmentType,
 *                 startDate, endDate }
 */
export const getMyAppointments = async (params = {}) => {
  const response = await axiosInstance.get('/appointments', { params });
  return response.data;
};

/**
 * Cancel a pending appointment.
 * POST /appointments/:id/cancel
 */
export const cancelAppointment = async (appointmentId) => {
  const response = await axiosInstance.post(`/appointments/${appointmentId}/cancel`, {});
  return response.data;
};

/**
 * Get appointments for the logged-in doctor.
 * Uses the same GET /appointments endpoint — the backend returns
 * the correct list based on the token's role (doctor).
 * Query params: { page, limit, sortBy, sortOrder, status, appointmentType, startDate, endDate }
 */
export const getDoctorAppointments = async (params = {}) => {
  const response = await axiosInstance.get('/appointments', { params });
  return response.data;
};

/**
 * Confirm a pending appointment (doctor action).
 * Endpoint: PATCH /appointments/:id/status
 */
export const confirmAppointment = async (appointmentId) => {
  const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, {
    status: 'confirmed'
  });
  return response.data;
};

/**
 * Check-in a confirmed appointment (doctor action).
 * Endpoint: PATCH /appointments/:id/status
 */
export const checkinAppointment = async (appointmentId) => {
  const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, {
    status: 'checkedIn'
  });
  return response.data;
};

export const startSessionAppointment = async (appointmentId) => {
  const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, {
    status: 'inProgress'
  });
  return response.data;
};

/**
 * Complete an inProgress appointment (doctor action).
 * Endpoint: PATCH /appointments/:id/status
 */
export const completeAppointment = async (appointmentId) => {
  const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, {
    status: 'completed'
  });
  return response.data;
};

/**
 * Update visit info (patient provided info, notes, etc.)
 * Endpoint: PATCH /appointments/:id/visit-info
 */
export const updateVisitInfo = async ({ appointmentId, data }) => {
  const response = await axiosInstance.patch(`/appointments/${appointmentId}/visit-info`, data);
  return response.data;
};

/**
 * AI Medical Scribe — Transcribe Arabic medical audio and generate structured summary.
 * POST /ai-voice/transcribe
 * FormData: { audio: File, patientId: string, appointmentId: string }
 */
export const transcribeAudio = async ({ audioBlob, patientId, appointmentId }) => {
  const form = new FormData();
  // Name the file properly so multer or the backend parses it as audio
  form.append('audio', audioBlob, 'recording.webm');
  form.append('patientId', patientId);
  form.append('appointmentId', appointmentId);
  
  // Transcription + Summarization takes time. Increase timeout to 120 seconds.
  const response = await axiosInstance.post('/ai-voice/transcribe', form, {
    timeout: 120000, 
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};
