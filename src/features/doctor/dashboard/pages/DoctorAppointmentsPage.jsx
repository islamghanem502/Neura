import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Hourglass, TrendingUp, TrendingDown,
  RefreshCcw, Loader2, Calendar, ChevronRight,
  SlidersHorizontal, Building2, CheckCircle2, MoreVertical, FileText,
} from 'lucide-react';
import {
  useDoctorAppointments, resolveAppointments,
  useConfirmAppointment, useCheckinAppointment,
  useCompleteAppointment, useCancelAppointmentMutation,
} from '../../../../hooks/useAppointments';

const getPatientId = (appt) => {
  const p = appt?.patient;
  if (!p) return null;
  return typeof p === 'string' ? p : (p._id || p.id);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt12 = (t = '') => {
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return t;
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`;
};

const getPatientName = (appt) => {
  const p = appt?.patient;
  if (!p || typeof p === 'string') return 'Patient';
  return p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
};

const getPatientAvatar = (appt) => {
  const p = appt?.patient;
  if (!p || typeof p === 'string') return null;
  return p.profileImage?.imageUrl || (typeof p.profileImage === 'string' ? p.profileImage : null);
};

const visitLabel = (appt) => {
  const v = appt?.patientProvidedInfo?.visitType;
  const map = { newPatient: 'New Patient', followUp: 'Follow-up', routine: 'Routine Checkup' };
  if (map[v]) return map[v];
  return appt?.appointmentType === 'inPerson' ? 'In-person' : 'Telehealth';
};

const getClinicName = (appt) =>
  appt?.clinic?.clinicName || appt?.clinic?.name || 'Main Clinic';

const AVATAR_COLORS = [
  'bg-blue-500','bg-violet-500','bg-emerald-500',
  'bg-amber-500','bg-rose-500','bg-cyan-500','bg-indigo-500',
];
const avatarBg   = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials   = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

// ─── Patient Avatar ────────────────────────────────────────────────────────────
const PatientAvatar = ({ appt, size = 'md' }) => {
  const name = getPatientName(appt);
  const url  = getPatientAvatar(appt);
  const s = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-sm';
  return url ? (
    <img src={url} alt={name} className={`${s} rounded-full object-cover shrink-0 ring-2 ring-white`} />
  ) : (
    <div className={`${s} rounded-full ${avatarBg(name)} text-white font-bold flex items-center justify-center shrink-0 ring-2 ring-white`}>
      {initials(name)}
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const BADGE_MAP = {
  pending:    { label: 'Pending',     cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  confirmed:  { label: 'Confirmed',   cls: 'bg-blue-50 text-blue-600 border border-blue-100' },
  checkedIn:  { label: 'Checked In',  cls: 'bg-[#EFF6FF] text-[#2563EB] border border-blue-100' },
  inProgress: { label: 'In Session',  cls: 'bg-blue-600 text-white border border-blue-600' },
  completed:  { label: 'Completed',   cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  cancelled:  { label: 'Cancelled',   cls: 'bg-red-50 text-red-500 border border-red-100' },
  noShow:     { label: 'No Show',     cls: 'bg-red-50 text-red-500 border border-red-100' },
};
const StatusBadge = ({ status }) => {
  const b = BADGE_MAP[status] || BADGE_MAP.pending;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${b.cls}`}>{b.label}</span>
  );
};

// ─── Three-dot Menu ────────────────────────────────────────────────────────────
const ActionsMenu = ({ appt, cancelMut }) => {
  const [open, setOpen] = useState(false);
  const canCancel = ['pending', 'confirmed'].includes(appt.status);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20"
          onMouseLeave={() => setOpen(false)}
        >
          <Link to={`/dashboard/doctor/patients/${getPatientId(appt)}`} className="w-full text-left px-4 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <FileText size={13} /> View Patient File
          </Link>
          {canCancel && (
            <button
              onClick={() => { cancelMut.mutate(appt.id); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[12px] font-medium text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
            >
              Cancel Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Queue Row ─────────────────────────────────────────────────────────────────
const QueueRow = ({ appt, confirmMut, checkinMut, cancelMut }) => {
  const name   = getPatientName(appt);
  const { status } = appt;
  const dateStr = appt.scheduledDate
    ? new Date(appt.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors border-b border-[#F5F5F5] last:border-0">
      {/* Avatar */}
      <PatientAvatar appt={appt} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-semibold text-[#191C1E]">{name}</p>
          {appt.isDelayed && (
            <span className="text-[11px] font-bold text-red-500">+10 min delay</span>
          )}
          <StatusBadge status={status} />
        </div>
        <p className="text-[12px] text-[#64748B] mt-0.5">
          {dateStr && <span className="font-medium text-slate-500 mr-1">{dateStr} ·</span>}
          {fmt12(appt.scheduledTime?.startTime)} · {visitLabel(appt)}
        </p>
      </div>

      {/* Action */}
      <div className="flex items-center gap-2 shrink-0">
        {status === 'pending' && (
          <button
            onClick={() => confirmMut.mutate(appt.id)}
            disabled={confirmMut.isPending}
            className="px-5 py-2 text-[13px] font-bold rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {confirmMut.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Confirm'}
          </button>
        )}
        {status === 'confirmed' && (
          <button
            onClick={() => checkinMut.mutate(appt.id)}
            disabled={checkinMut.isPending}
            className="px-5 py-2 text-[13px] font-bold rounded-xl bg-white text-[#2563EB] border border-[#2563EB] hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {checkinMut.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Check In'}
          </button>
        )}
        {status === 'checkedIn' && (
          <span className="px-4 py-2 text-[13px] font-bold rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            Waiting…
          </span>
        )}
        <ActionsMenu appt={appt} cancelMut={cancelMut} />
      </div>
    </div>
  );
};

// ─── In Progress Hero (info only — actions live in My Sessions) ───────────────
const InProgressCard = ({ appt }) => {
  const name     = getPatientName(appt);
  const clinic   = getClinicName(appt);
  return (
    <div
      className="mx-6 mb-4 rounded-[18px] px-6 py-4 text-white flex items-center gap-5 shadow-lg shadow-blue-200"
      style={{ background: 'linear-gradient(135deg, #1848C8 0%, #2563EB 60%, #3B82F6 100%)' }}
    >
      <PatientAvatar appt={appt} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-[18px] font-bold text-white leading-tight">{name}</p>
        <p className="text-[12px] text-white/75 mt-0.5">
          <Clock size={11} className="inline mr-1" />
          {fmt12(appt.scheduledTime?.startTime)} · {visitLabel(appt)}
        </p>
      </div>
      {/* Info badge — no actions */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Live Session
        </span>
        <span className="text-[11px] text-white/60">Manage from My Sessions →</span>
      </div>
    </div>
  );
};

// ─── Completed Mini Row ────────────────────────────────────────────────────────
const CompletedRow = ({ appt }) => {
  const name = getPatientName(appt);
  const now  = Date.now();
  const end  = appt.updatedAt ? new Date(appt.updatedAt).getTime() : now;
  const diff = Math.round((now - end) / 60000);
  const ago  = diff < 60 ? `${diff}m ago` : `${Math.round(diff / 60)}h ago`;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F5F5F5] last:border-0">
      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
        <CheckCircle2 size={15} className="text-emerald-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#191C1E] truncate">{name}</p>
        <p className="text-[11px] text-[#64748B]">
          {fmt12(appt.scheduledTime?.startTime)} · {visitLabel(appt)}
        </p>
      </div>
      <span className="text-[11px] text-[#94A3B8] font-medium shrink-0">{ago}</span>
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent, icon, tag, bar, barColor }) => (
  <div className="bg-white rounded-[18px] border border-[#EAEAEB] p-5 shadow-sm flex flex-col gap-2">
    <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">{label}</p>
    <div className="flex items-end justify-between">
      <div className="flex items-end gap-2">
        <p className={`text-[32px] font-black leading-none ${accent || 'text-[#191C1E]'}`}>{value}</p>
        {tag && (
          <span className={`mb-1 text-[11px] font-bold flex items-center gap-0.5 ${tag.color}`}>
            {tag.icon}{tag.text}
          </span>
        )}
      </div>
      {icon && <div className="mb-1 opacity-40">{icon}</div>}
    </div>
    {bar !== undefined && (
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
        <div className={`h-full rounded-full ${barColor || 'bg-[#2563EB]'}`} style={{ width: `${bar}%` }} />
      </div>
    )}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
  const [clinicFilter, setClinicFilter] = useState('all');

  const { data, isLoading, refetch } = useDoctorAppointments({ limit: 200 });
  const confirmMut  = useConfirmAppointment();
  const checkinMut  = useCheckinAppointment();
  const cancelMut   = useCancelAppointmentMutation();

  const appointments = resolveAppointments(data);

  // Collect unique clinic names for filter tabs
  const clinicNames = ['all', ...new Set(appointments.map(getClinicName))];

  // Filter appointments by selected clinic
  const filtered = clinicFilter === 'all'
    ? appointments
    : appointments.filter(a => getClinicName(a) === clinicFilter);

  const inProgress    = filtered.find(a => a.status === 'inProgress') || null;
  const queue         = filtered
    .filter(a => ['pending', 'confirmed', 'checkedIn'].includes(a.status))
    .sort((a, b) =>
      (a.scheduledDate || '').localeCompare(b.scheduledDate || '') ||
      (a.scheduledTime?.startTime || '').localeCompare(b.scheduledTime?.startTime || '')
    );
  const completedList = filtered.filter(a => a.status === 'completed');
  const cancelledList = filtered.filter(a => ['cancelled', 'noShow'].includes(a.status));

  const total     = filtered.length;
  const completed = completedList.length;
  const checkedIn = filtered.filter(a => a.status === 'checkedIn').length;
  const cancelled = cancelledList.length;
  const capacity  = total > 0 ? Math.round(((total - cancelled) / total) * 100) : 100;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Calendar size={18} className="text-[#2563EB]" />
          </div>
          <h1 className="text-[20px] font-bold text-[#191C1E]">{today}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            title="Refresh"
          >
            <RefreshCcw size={16} />
          </button>
          {/* Clinic filter icon */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EAEAEB] rounded-xl text-[13px] font-semibold text-slate-600 shadow-sm">
            <SlidersHorizontal size={14} />
            Filter
          </div>
        </div>
      </div>

      {/* ── Clinic Filter Tabs ─────────────────────────────────────────────── */}
      {clinicNames.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {clinicNames.map(name => (
            <button
              key={name}
              onClick={() => setClinicFilter(name)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
                clinicFilter === name
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-200'
                  : 'bg-white text-slate-600 border border-[#EAEAEB] hover:bg-slate-50'
              }`}
            >
              {name !== 'all' && <Building2 size={12} />}
              {name === 'all' ? 'All Clinics' : name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[24px] border border-dashed border-slate-200 gap-4">
          <Loader2 size={36} className="animate-spin text-[#2563EB]" />
          <p className="text-[14px] font-medium text-slate-400">Loading appointments…</p>
        </div>
      ) : (
        <>
          {/* ── Stats Row ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Total Appointments"
              value={String(total).padStart(2, '0')}
              bar={100}
              barColor="bg-[#2563EB]"
              tag={{ text: '+12%', color: 'text-emerald-500', icon: <TrendingUp size={11} /> }}
            />
            <StatCard
              label="Completed"
              value={String(completed).padStart(2, '0')}
              bar={total > 0 ? Math.round((completed / total) * 100) : 0}
              barColor="bg-emerald-500"
            />
            <StatCard
              label="Checked In"
              value={String(checkedIn).padStart(2, '0')}
              icon={<Hourglass size={24} />}
            />
            <StatCard
              label="Cancelled"
              value={String(cancelled).padStart(2, '0')}
              accent="text-red-500"
              tag={cancelled > 0 ? { text: '-4%', color: 'text-red-400', icon: <TrendingDown size={11} /> } : undefined}
            />
          </div>

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div className="flex gap-5 items-start">

            {/* Left — Queue ──────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">

              {/* In Progress */}
              {inProgress && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                    <p className="text-[11px] font-black text-[#2563EB] uppercase tracking-widest">
                      In Progress Now
                    </p>
                  </div>
                  <div className="bg-white rounded-[20px] border border-[#EAEAEB] overflow-hidden shadow-sm pb-1">
                    <InProgressCard appt={inProgress} />
                  </div>
                </div>
              )}

              {/* Queue List */}
              <div className="bg-white rounded-[20px] border border-[#EAEAEB] overflow-hidden shadow-sm">
                {/* Queue Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
                  <p className="text-[12px] font-black text-[#94A3B8] uppercase tracking-widest">Queue</p>
                  <span className="text-[13px] text-[#64748B] font-medium">
                    {queue.length} patient{queue.length !== 1 ? 's' : ''} waiting
                  </span>
                </div>

                {queue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                      <CheckCircle2 size={26} className="text-emerald-400" />
                    </div>
                    <p className="text-[14px] font-semibold text-[#64748B]">Queue is clear</p>
                    <p className="text-[12px] text-[#94A3B8] mt-1">No patients waiting right now</p>
                  </div>
                ) : (
                  <div>
                    {queue.map(appt => (
                      <QueueRow
                        key={appt.id}
                        appt={appt}
                        confirmMut={confirmMut}
                        checkinMut={checkinMut}
                        cancelMut={cancelMut}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel ─────────────────────────────────────────────────── */}
            <div className="w-[268px] shrink-0 flex flex-col gap-4">

              {/* Completed */}
              <div className="bg-white rounded-[20px] border border-[#EAEAEB] overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F5F5]">
                  <p className="text-[12px] font-black text-[#94A3B8] uppercase tracking-widest">Completed</p>
                  <button className="text-[12px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5">
                    View All <ChevronRight size={13} />
                  </button>
                </div>
                <div className="px-5 pb-1">
                  {completedList.length === 0 ? (
                    <p className="py-6 text-center text-[12px] text-[#94A3B8]">No completed sessions yet</p>
                  ) : (
                    completedList.slice(0, 5).map(a => (
                      <CompletedRow key={a.id} appt={a} />
                    ))
                  )}
                </div>
              </div>

              {/* Daily Insights */}
              <div className="bg-white rounded-[20px] border border-[#EAEAEB] p-5 shadow-sm">
                <p className="text-[14px] font-bold text-[#191C1E] mb-4">Daily Insights</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#64748B]">Total Booked</span>
                    <span className="font-bold text-[#191C1E]">{total} Slots</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#64748B]">Availability</span>
                    <span className="font-bold text-[#2563EB]">{capacity}% Capacity</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-700"
                      style={{ width: `${capacity}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
