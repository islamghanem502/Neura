import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, User, Loader2,
  AlertCircle, CheckCircle2, Building2, ChevronLeft,
  ChevronRight, Wallet, Filter, RefreshCw, FileText,
  Paperclip, ExternalLink, History
} from 'lucide-react';
import { getDoctorAppointments, confirmAppointment, checkinAppointment } from '../../api/appointmentService';
import { useClinicInfo } from '../../hooks/useDoctorData';
import PatientHistoryModal from './components/PatientHistoryModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
};

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
};

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  checkedIn: { label: 'Checked In', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  inProgress: { label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  completed: { label: 'Completed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' },
  noShow: { label: 'No Show', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-400' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

// ─── AppointmentCard ──────────────────────────────────────────────────────────
const AppointmentCard = ({ appt, onConfirm, isConfirming, onViewHistory }) => {
  const { patient, clinic, scheduledDate, scheduledTime, status, appointmentNumber, payment, appointmentType } = appt;
  const apptId = appt._id || appt.id;
  const canConfirm = status === 'pending';
  const canCheckIn = status === 'confirmed';
  const todayAppt = isToday(scheduledDate);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 ${todayAppt ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-100'
      } ${status === 'cancelled' ? 'opacity-60' : ''}`}>

      {todayAppt && (
        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Today
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Patient avatar */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md">
          {(patient?.fullName || patient?.name || 'P')
            .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex flex-wrap items-start gap-2 justify-between mb-2">
            <div>
              <p className="font-bold text-slate-900 text-base leading-tight">
                {patient?.fullName || patient?.name || 'Unknown Patient'}
              </p>
              {patient?.phone && (
                <p className="text-slate-400 text-xs mt-0.5">{patient.phone}</p>
              )}
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(scheduledDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatTime(scheduledTime?.startTime)}
              {scheduledTime?.endTime && ` – ${formatTime(scheduledTime.endTime)}`}
            </span>
            {clinic?.clinicName && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {clinic.clinicName}
                {clinic.address?.city && `, ${clinic.address.city}`}
              </span>
            )}
          </div>

          {/* Patient Provided Info (Reason/Notes/Attachments) */}
          {(appt.patientProvidedInfo?.reasonForVisit || appt.patientProvidedInfo?.patientNotes || (appt.patientProvidedInfo?.attachments && appt.patientProvidedInfo.attachments.length > 0)) && (
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <FileText size={12} /> Patient Provided Info
              </div>

              {appt.patientProvidedInfo?.reasonForVisit && (
                <div className="mb-2 last:mb-0">
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">Reason for Visit:</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {appt.patientProvidedInfo.reasonForVisit}
                  </p>
                </div>
              )}

              {appt.patientProvidedInfo?.patientNotes && (
                <div className="mb-3 last:mb-0">
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">Patient Notes:</p>
                  <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                    "{appt.patientProvidedInfo.patientNotes}"
                  </p>
                </div>
              )}

              {appt.patientProvidedInfo?.attachments && appt.patientProvidedInfo.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {appt.patientProvidedInfo.attachments.map((file, i) => (
                    <a
                      key={i}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                    >
                      <Paperclip size={12} className="text-blue-400" />
                      <span className="truncate max-w-[120px]">{file.fileName || 'Attachment'}</span>
                      <ExternalLink size={10} className="text-slate-300" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-50 mt-4">
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              {appointmentNumber && (
                <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  {appointmentNumber}
                </span>
              )}
              {appointmentType && (
                <span className="capitalize bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  {appointmentType === 'inPerson' ? 'In-Person' : appointmentType}
                </span>
              )}
              {payment?.totalAmount != null && (
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  {payment.totalAmount} EGP
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* History button */}
              {['confirmed', 'checkedIn', 'inProgress'].includes(status) && (
                <button
                  onClick={() => onViewHistory({ id: patient?._id || patient?.id, name: patient?.fullName || patient?.name })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm transition-all active:scale-95"
                >
                  <History className="w-3.5 h-3.5" />
                  View History
                </button>
              )}

              {/* Confirm button */}
              {canConfirm && (
                <button
                  onClick={() => onConfirm(apptId, 'confirmed')}
                  disabled={isConfirming}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isConfirming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Confirm
                </button>
              )}

              {/* Check-in button */}
              {canCheckIn && (
                <button
                  onClick={() => onConfirm(apptId, 'checkedIn')}
                  disabled={isConfirming}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isConfirming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  Check-in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Status filter tabs ───────────────────────────────────────────────────────
const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'checkedIn', 'completed', 'cancelled'];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClinicId, setSelectedClinicId] = useState('all');
  const [page, setPage] = useState(1);
  const [confirmingId, setConfirmingId] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);
  const LIMIT = 10;

  // Fetch doctor's clinics for the filter dropdown
  const { data: clinicsData } = useClinicInfo();
  const clinics = clinicsData?.data?.clinicInfo || [];

  // Query params — only what the API supports
  const queryParams = {
    page,
    limit: LIMIT,
    sortBy: 'scheduledDate',
    sortOrder: 'asc',
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['doctorAppointments', queryParams],
    queryFn: () => getDoctorAppointments(queryParams),
    keepPreviousData: true,
  });

  // Confirm/Checkin mutation
  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => action === 'checkedIn' ? checkinAppointment(id) : confirmAppointment(id),
    onMutate: ({ id }) => setConfirmingId(id),
    onSuccess: (_, { action }) => {
      if (action === 'checkedIn') {
        toast.success('Patient checked in! You can now start the session.');
      } else {
        toast.success('Appointment confirmed! Patient has been notified.');
      }
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      setConfirmingId(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update appointment');
      setConfirmingId(null);
    },
  });

  // The API returns { data: [...], meta: {...} }
  // data.data is the appointments array
  const allAppointments = data?.data || [];

  // Client-side clinic filter (API doesn't support clinicId param)
  const appointments = selectedClinicId === 'all'
    ? allAppointments
    : allAppointments.filter(a => a.clinic?.clinicId === selectedClinicId);

  const meta = data?.meta || {};
  const totalPages = meta.totalPages || meta.pages || 1;

  // Count pending from current page results
  const pendingCount = allAppointments.filter(a => a.status === 'pending').length;

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage patient bookings across all your clinics.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin text-blue-500' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4 animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-bold text-amber-800">
              {pendingCount} appointment{pendingCount > 1 ? 's' : ''} waiting for confirmation
            </p>
            <p className="text-amber-600 text-xs mt-0.5">Confirm them so patients receive a notification</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        {/* Status chips */}
        <div className="flex flex-wrap gap-2 flex-1">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${statusFilter === s
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {s === 'all' ? 'All' : STATUS_CFG[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Clinic filter — only show if doctor has multiple clinics */}
        {clinics.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedClinicId}
              onChange={e => { setSelectedClinicId(e.target.value); setPage(1); }}
              className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10"
            >
              <option value="all">All Clinics</option>
              {clinics.map(c => (
                <option key={c._id} value={c._id}>{c.clinicName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading appointments…</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="font-bold text-slate-800">Failed to load appointments</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {error?.response?.data?.message || 'Please try again later.'}
          </p>
          <button onClick={() => refetch()} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
            <Calendar size={36} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No appointments found</h3>
          <p className="text-slate-500 text-sm">
            {statusFilter === 'all'
              ? "You don't have any patient appointments yet."
              : `No ${STATUS_CFG[statusFilter]?.label || statusFilter} appointments found.`}
          </p>
        </div>
      )}

      {/* Appointments list */}
      {!isLoading && !error && appointments.length > 0 && (
        <>
          {/* Results header */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing <span className="font-semibold text-slate-800">{appointments.length}</span>
              {meta.total && <> of <span className="font-semibold text-slate-800">{meta.total}</span></>} appointments
              {isFetching && <Loader2 className="inline w-3.5 h-3.5 animate-spin ml-2 text-blue-400" />}
            </p>
          </div>

          <div className="space-y-3">
            {appointments.map((appt, idx) => (
              <AppointmentCard
                key={appt._id || appt.id || idx}
                appt={appt}
                onConfirm={(id, action) => actionMutation.mutate({ id, action })}
                isConfirming={confirmingId === (appt._id || appt.id) && actionMutation.isPending}
                onViewHistory={setHistoryPatient}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!meta.hasPrevPage || page === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2)
                .map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!meta.hasNextPage || page === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* History Modal */}
      <PatientHistoryModal 
        patientId={historyPatient?.id}
        patientName={historyPatient?.name}
        isOpen={!!historyPatient}
        onClose={() => setHistoryPatient(null)}
      />
    </div>
  );
}
