import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createMedicalRecord,
  getMyMedicalRecords,
  getMedicalRecordById,
  getPatientMedicalHistory,
} from '../api/medicalRecordService';

const KEYS = {
  myRecords: 'myMedicalRecords',
  single: (id) => ['medicalRecord', id],
  patient: (patientId) => ['patientMedicalHistory', patientId],
};

// ── Queries ────────────────────────────────────────────────────────────────────

export const useMyMedicalRecords = (params = { page: 1, limit: 50 }) =>
  useQuery({
    queryKey: [KEYS.myRecords, params],
    queryFn: () => getMyMedicalRecords(params),
  });

export const useMedicalRecordById = (id) =>
  useQuery({
    queryKey: KEYS.single(id),
    queryFn: () => getMedicalRecordById(id),
    enabled: !!id,
  });

export const usePatientMedicalHistory = (patientId, params = { page: 1, limit: 20 }) =>
  useQuery({
    queryKey: [...KEYS.patient(patientId), params],
    queryFn: () => getPatientMedicalHistory(patientId, params),
    enabled: !!patientId,
  });

// ── Mutations ──────────────────────────────────────────────────────────────────

export const useCreateMedicalRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMedicalRecord,
    onSuccess: () => {
      toast.success('Medical record saved successfully ✓');
      // Invalidate patient records so they refresh immediately
      qc.invalidateQueries({ queryKey: [KEYS.myRecords] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to save record'),
  });
};
