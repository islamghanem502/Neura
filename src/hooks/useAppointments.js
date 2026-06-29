import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getDoctorAppointments,
  confirmAppointment,
  checkinAppointment,
  startSessionAppointment,
  completeAppointment,
  cancelAppointment,
} from '../api/appointmentService';

const KEY = 'doctorAppointments';

// ── Fetch ──────────────────────────────────────────────────────────────────────
export const useDoctorAppointments = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => getDoctorAppointments(params),
    refetchInterval: 30_000, // live-refresh every 30s
  });

// ── Helper: resolve appointments array from any response shape ─────────────────
export const resolveAppointments = (data) => {
  const list = data?.data?.appointments || (Array.isArray(data?.data) ? data.data : []);
  // Normalize IDs: ensure each object has 'id' (some APIs return _id)
  return list.map(item => ({
    ...item,
    id: item.id || item._id
  }));
};

// ── Mutations ─────────────────────────────────────────────────────────────────
const invalidate = (qc) => qc.invalidateQueries({ queryKey: [KEY] });

export const useConfirmAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmAppointment,
    onSuccess: () => { toast.success('Appointment confirmed'); invalidate(qc); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to confirm'),
  });
};

export const useCheckinAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkinAppointment,
    onSuccess: () => { toast.success('Patient checked in'); invalidate(qc); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to check in'),
  });
};

export const useStartSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: startSessionAppointment,
    onSuccess: () => { toast.success('Session started'); invalidate(qc); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to start session'),
  });
};

export const useCompleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeAppointment,
    onSuccess: () => { toast.success('Session completed ✓'); invalidate(qc); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to complete'),
  });
};

export const useCancelAppointmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => { toast.success('Appointment cancelled'); invalidate(qc); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to cancel'),
  });
};
