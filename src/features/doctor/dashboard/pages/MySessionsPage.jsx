import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Hourglass, Play, CheckCircle2, XCircle, Phone,
  Clock, UserCheck, Loader2, SlidersHorizontal, RefreshCcw,
} from 'lucide-react';
import {
  useDoctorAppointments, resolveAppointments,
  useStartSession, useCompleteAppointment, useCancelAppointmentMutation,
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
  const map = { newPatient: 'New Patient', followUp: 'Follow-up', routine: 'Routine Checkup' };
  return map[appt?.patientProvidedInfo?.visitType] || (appt?.appointmentType === 'inPerson' ? 'In-person' : 'Telehealth');
};

const COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
const avatarColor = (n = '') => COLORS[n.charCodeAt(0) % COLORS.length];
const initials = (n = '') => n.split(' ').map(c => c[0]).join('').slice(0, 2).toUpperCase() || '?';

const sinceText = (appt) => {
  if (!appt.updatedAt) return '';
  const diff = Math.round((Date.now() - new Date(appt.updatedAt).getTime()) / 60000);
  return diff < 60 ? `Started ${diff}m ago` : `Started ${Math.round(diff / 60)}h ago`;
};

// ─── Patient Avatar ───────────────────────────────────────────────────────────
const PatientAvatar = ({ appt, size = 'md' }) => {
  const name = getPatientName(appt);
  const url  = getPatientAvatar(appt);
  const s = size === 'lg' ? 'w-14 h-14 text-base' : 'w-11 h-11 text-sm';
  return url ? (
    <img src={url} alt={name} className={`${s} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${s} rounded-full ${avatarColor(name)} text-white font-bold flex items-center justify-center shrink-0`}>
      {initials(name)}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const BADGES = {
  checkedIn:  { label: 'CHECKED IN',  cls: 'bg-amber-50 text-amber-600 border border-amber-200' },
  inProgress: { label: 'IN SESSION',  cls: 'bg-[#EFF6FF] text-[#2563EB] border border-blue-200' },
  completed:  { label: 'COMPLETED',   cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  cancelled:  { label: 'CANCELLED',   cls: 'bg-red-50 text-red-500 border border-red-200' },
  noShow:     { label: 'NO SHOW',     cls: 'bg-red-50 text-red-500 border border-red-200' },
};

const Badge = ({ status }) => {
  const b = BADGES[status];
  if (!b) return null;
  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest ${b.cls}`}>
      {b.label}
    </span>
  );
};

// ─── Session Card ─────────────────────────────────────────────────────────────
const SessionCard = ({ appt, startMut, completeMut, cancelMut, onStart, onContinue }) => {
  const { status } = appt;
  const name = getPatientName(appt);
  const visit = visitLabel(appt);

  // Border color by status
  const borderLeft = {
    inProgress: 'border-l-4 border-l-[#2563EB]',
    cancelled:  'border-l-4 border-l-red-400',
    noShow:     'border-l-4 border-l-red-400',
  }[status] || '';

  return (
    <div className={`bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm overflow-hidden ${borderLeft}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <PatientAvatar appt={appt} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-bold text-[#191C1E]">{name}</p>
                <p className={`text-[13px] font-semibold mt-0.5 ${status === 'inProgress' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                  {visit}
                </p>
              </div>
              <Badge status={status} />
            </div>

            {/* Status-specific meta */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#64748B]">
              {status === 'inProgress' && (
                <>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-blue-400" />
                    Goal: {visit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {sinceText(appt)}
                  </span>
                </>
              )}
              {(status === 'checkedIn' || status === 'confirmed') && (
                <>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Scheduled: {fmt12(appt.scheduledTime?.startTime)}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    Queue #{appt.queueNumber || '—'}
                  </span>
                </>
              )}
              {status === 'completed' && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {fmt12(appt.scheduledTime?.startTime)} – {fmt12(appt.scheduledTime?.endTime)}
                </span>
              )}
              {(status === 'cancelled' || status === 'noShow') && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Scheduled: {fmt12(appt.scheduledTime?.startTime)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          {status === 'inProgress' && (
            <>
              <button
                onClick={() => onContinue(appt)}
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-[12px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Play size={13} /> Continue Session
              </button>
              <Link to={`/dashboard/doctor/patients/${getPatientId(appt)}`} className="px-4 py-2 rounded-xl border border-[#EAEAEB] text-[12px] font-semibold text-[#64748B] hover:bg-slate-50 transition-colors">
                View Profile
              </Link>
            </>
          )}

          {status === 'checkedIn' && (
            <>
              <button
                onClick={() => onStart(appt)}
                disabled={startMut.isPending}
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-[12px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-60 shadow-md shadow-blue-200"
              >
                {startMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                Start Session
              </button>
              <Link to={`/dashboard/doctor/patients/${getPatientId(appt)}`} className="px-4 py-2 rounded-xl border border-[#EAEAEB] text-[12px] font-semibold text-[#64748B] hover:bg-slate-50 transition-colors">
                View Profile
              </Link>
              <button
                onClick={() => cancelMut.mutate(appt.id)}
                disabled={cancelMut.isPending}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {status === 'completed' && (
            <>
              <button className="px-5 py-2 rounded-xl border border-[#EAEAEB] text-[12px] font-bold text-[#191C1E] hover:bg-slate-50 transition-colors">
                View Summary
              </button>
              <button className="px-4 py-2 rounded-xl border border-[#EAEAEB] text-[12px] font-semibold text-[#64748B] hover:bg-slate-50 transition-colors">
                Add Note
              </button>
            </>
          )}

          {(status === 'cancelled' || status === 'noShow') && (
            <>
              <button className="px-5 py-2 rounded-xl bg-red-500 text-white text-[12px] font-bold hover:bg-red-600 transition-colors">
                Mark as No-Show
              </button>
              <button className="px-4 py-2 rounded-xl border border-[#EAEAEB] text-[12px] font-semibold text-[#64748B] hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                <Phone size={12} /> Call Patient
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'checkedIn', label: 'Waiting' },
  { key: 'inProgress',label: 'In Session' },
  { key: 'completed', label: 'Completed' },
  { key: 'noShow',    label: 'Missed' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MySessionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { data, isLoading, refetch } = useDoctorAppointments({ limit: 100 });

  const startMut    = useStartSession();
  const completeMut = useCompleteAppointment();
  const cancelMut   = useCancelAppointmentMutation();

  // Start session → transition status then navigate to session page
  const handleStartSession = async (appt) => {
    try {
      await startMut.mutateAsync(appt.id);
      navigate(`/dashboard/doctor/sessions/${appt.id}`);
    } catch (_) {
      // error already toasted by the mutation
    }
  };

  // Continue opens the session page for an already-inProgress session
  const handleContinueSession = (appt) => {
    navigate(`/dashboard/doctor/sessions/${appt.id}`);
  };

  const all = resolveAppointments(data);

  // My Sessions = checkedIn onward (not pending/confirmed)
  const sessions = all.filter(a =>
    ['checkedIn', 'inProgress', 'completed', 'cancelled', 'noShow'].includes(a.status)
  ).sort((a, b) => (a.scheduledTime?.startTime || '').localeCompare(b.scheduledTime?.startTime || ''));

  const filtered = activeTab === 'all'
    ? sessions
    : sessions.filter(a => a.status === activeTab);

  // Counts for stats
  const counts = {
    checkedIn:  sessions.filter(a => a.status === 'checkedIn').length,
    inProgress: sessions.filter(a => a.status === 'inProgress').length,
    completed:  sessions.filter(a => a.status === 'completed').length,
    cancelled:  sessions.filter(a => ['cancelled', 'noShow'].includes(a.status)).length,
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#191C1E] tracking-tight">My Sessions</h1>
          <p className="text-[14px] text-[#64748B] mt-0.5">Review and manage your daily patient clinical queue.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors mt-1"
        >
          <RefreshCcw size={15} />
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {/* Checked In */}
        <div
          onClick={() => setActiveTab('checkedIn')}
          className="bg-white rounded-[16px] border border-[#EAEAEB] p-4 cursor-pointer hover:border-amber-300 transition-colors"
        >
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Checked In</p>
          <div className="flex items-end justify-between">
            <p className="text-[32px] font-black text-[#191C1E] leading-none">{String(counts.checkedIn).padStart(2, '0')}</p>
            <Hourglass size={22} className="text-amber-400 mb-1" />
          </div>
        </div>

        {/* In Session — highlighted */}
        <div
          onClick={() => setActiveTab('inProgress')}
          className="rounded-[16px] p-4 cursor-pointer text-white"
          style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)' }}
        >
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-2">In Session</p>
          <div className="flex items-end justify-between">
            <p className="text-[32px] font-black leading-none">{String(counts.inProgress).padStart(2, '0')}</p>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <Play size={15} className="text-white" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setActiveTab('completed')}
          className="bg-white rounded-[16px] border border-[#EAEAEB] p-4 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Completed</p>
          <div className="flex items-end justify-between">
            <p className="text-[32px] font-black text-[#191C1E] leading-none">{String(counts.completed).padStart(2, '0')}</p>
            <CheckCircle2 size={22} className="text-emerald-400 mb-1" />
          </div>
        </div>

        {/* Cancelled */}
        <div
          onClick={() => setActiveTab('noShow')}
          className="bg-white rounded-[16px] border border-[#EAEAEB] p-4 cursor-pointer hover:border-red-300 transition-colors"
        >
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Cancelled</p>
          <div className="flex items-end justify-between">
            <p className="text-[32px] font-black text-[#191C1E] leading-none">{String(counts.cancelled).padStart(2, '0')}</p>
            <XCircle size={22} className="text-red-300 mb-1" />
          </div>
        </div>
      </div>

      {/* ── Filter Tabs + Sort ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#191C1E] shadow-sm'
                  : 'text-[#64748B] hover:text-[#191C1E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B] hover:text-[#191C1E] transition-colors">
          <SlidersHorizontal size={14} /> Sort by Time
        </button>
      </div>

      {/* ── Sessions List ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#2563EB]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[20px] border border-[#EAEAEB]">
          <CheckCircle2 size={36} className="text-slate-200 mb-3" />
          <p className="text-[14px] font-semibold text-[#64748B]">No sessions found</p>
          <p className="text-[12px] text-[#94A3B8] mt-1">
            {activeTab === 'all' ? 'No sessions recorded yet today' : `No ${activeTab} sessions`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(appt => (
            <SessionCard
              key={appt.id}
              appt={appt}
              startMut={startMut}
              completeMut={completeMut}
              cancelMut={cancelMut}
              onStart={handleStartSession}
              onContinue={handleContinueSession}
            />
          ))}
        </div>
      )}
    </div>
  );
}
