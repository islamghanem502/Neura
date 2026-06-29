import { useQuery } from '@tanstack/react-query';
import { patientService } from '../api/patientService';
import { getPatientMedicalHistory } from '../api/medicalRecordService';
import { getDoctorAppointments } from '../api/appointmentService';

// ── Doctor-side: Fetch a specific patient's basic info ────────────────────────
export const usePatientById = (patientId) =>
  useQuery({
    queryKey: ['patientProfile', patientId],
    queryFn: () => patientService.getPatientById(patientId),
    enabled: !!patientId,
  });

// ── Doctor-side: Fetch a specific patient's medical profile ───────────────────
export const usePatientMedicalProfile = (patientId) =>
  useQuery({
    queryKey: ['patientMedicalProfile', patientId],
    queryFn: () => patientService.getPatientMedicalProfileById(patientId),
    enabled: !!patientId,
  });

// ── Doctor-side: Fetch patient's medical records (history) ────────────────────
export const usePatientRecords = (patientId, params = { page: 1, limit: 50 }) =>
  useQuery({
    queryKey: ['patientRecords', patientId, params],
    queryFn: () => getPatientMedicalHistory(patientId, params),
    enabled: !!patientId,
  });

// ── Doctor-side: Fetch appointments for a specific patient ────────────────────
export const usePatientAppointments = (patientId) =>
  useQuery({
    queryKey: ['patientAppointments', patientId],
    queryFn: () => getDoctorAppointments({ patientId, limit: 50 }),
    enabled: !!patientId,
  });
