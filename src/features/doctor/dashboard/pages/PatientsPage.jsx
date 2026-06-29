import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Loader2, Users, Mail, SlidersHorizontal,
  AlertCircle, Clock, CheckCircle2, ChevronLeft, ChevronRight,
  UserPlus,
} from 'lucide-react';
import { useDoctorAppointments, resolveAppointments } from '../../../../hooks/useAppointments';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPatientId = (appt) => {
  const p = appt?.patient;
  if (!p) return null;
  return typeof p === 'string' ? p : (p._id || p.id);
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

const calcAge = (dob) => {
  if (!dob) return '—';
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AVATAR_COLORS = [
  'bg-blue-400', 'bg-violet-400', 'bg-emerald-400',
  'bg-amber-400', 'bg-rose-400', 'bg-cyan-400', 'bg-indigo-400',
];
const avatarBg = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const avatarInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

// Appointment type badge config — matches design exactly
const TYPE_BADGE = {
  inPerson: {
    label: 'INPERSON CONSULTATION',
    dot: 'bg-emerald-500',
    cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  },
  telemedicine: {
    label: 'TELEMEDICINE',
    dot: 'bg-amber-400',
    cls: 'bg-amber-50 text-amber-600 border border-amber-100',
  },
  followUp: {
    label: 'FOLLOW-UP',
    dot: 'bg-blue-500',
    cls: 'bg-blue-50 text-blue-600 border border-blue-100',
  },
  emergency: {
    label: 'EMERGENCY',
    dot: 'bg-red-500',
    cls: 'bg-red-50 text-red-500 border border-red-100',
  },
};

const getTypeBadge = (appt) => {
  const vt = appt?.patientProvidedInfo?.visitType;
  if (vt === 'followUp') return TYPE_BADGE.followUp;
  if (appt?.appointmentType === 'telemedicine') return TYPE_BADGE.telemedicine;
  return TYPE_BADGE.inPerson;
};

const PAGE_SIZE = 10;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDoctorAppointments({ limit: 500 });

  const allAppts = resolveAppointments(data);

  // Deduplicate patients — keep most recent appointment per patient
  const patientMap = new Map();
  allAppts.forEach((appt) => {
    const pid = getPatientId(appt);
    if (!pid) return;
    const existing = patientMap.get(pid);
    if (!existing || new Date(appt.scheduledDate) > new Date(existing.scheduledDate)) {
      patientMap.set(pid, appt);
    }
  });

  let patients = Array.from(patientMap.values());

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    patients = patients.filter((appt) => getPatientName(appt).toLowerCase().includes(q));
  }

  // Pagination
  const totalPatients = patients.length;
  const totalPages = Math.max(1, Math.ceil(totalPatients / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = patients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#191C1E] tracking-tight">Patient Directory</h1>
          <p className="text-[14px] text-[#64748B] mt-0.5 max-w-lg">
            Manage your clinical roster, monitor critical updates, and access patient history with precision.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#64748B] hover:bg-slate-50 transition-colors shadow-sm">
            <SlidersHorizontal size={15} className="text-[#2563EB]" />
            Advanced Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
            <UserPlus size={15} />
            Register Patient
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Critical Cases */}
        <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" strokeWidth={2.5} />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-bold">8 Active</span>
          </div>
          <h3 className="text-[16px] font-bold text-[#191C1E] mb-1">Critical Cases</h3>
          <p className="text-[12px] text-[#64748B] leading-[1.6]">
            Patients requiring immediate review or stabilization follow-up.
          </p>
        </div>

        {/* Recently Viewed */}
        <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-full bg-violet-50 flex items-center justify-center">
              <Clock size={20} className="text-violet-400" strokeWidth={2.5} />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-500 text-[11px] font-bold">Last 24h</span>
          </div>
          <h3 className="text-[16px] font-bold text-[#191C1E] mb-1">Recently Viewed</h3>
          <p className="text-[12px] text-[#64748B] leading-[1.6]">
            Continue where you left off with your most recent patient profiles.
          </p>
        </div>

        {/* Recovering */}
        <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">Stable</span>
          </div>
          <h3 className="text-[16px] font-bold text-[#191C1E] mb-1">Recovering</h3>
          <p className="text-[12px] text-[#64748B] leading-[1.6]">
            Post-op patients currently in the stable recovery phase.
          </p>
        </div>
      </div>

      {/* ── Patient Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm overflow-hidden">

        {/* Table Header Row */}
        <div className="grid items-center px-6 py-3.5 border-b border-[#F0F0F0] bg-[#FAFBFC]"
          style={{ gridTemplateColumns: '2.5fr 0.5fr 1fr 1.4fr 1fr' }}>
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Patient Identity</span>
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Age</span>
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Last Visit</span>
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Appointment Type</span>
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest text-right">Actions</span>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#2563EB]" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users size={40} className="text-slate-200 mb-3" />
            <p className="text-[14px] font-semibold text-[#64748B]">No patients found</p>
            <p className="text-[12px] text-[#94A3B8] mt-1">
              {search ? 'Try a different search term' : 'Patients appear here after booking appointments'}
            </p>
          </div>
        ) : (
          paginated.map((appt) => {
            const pid = getPatientId(appt);
            const name = getPatientName(appt);
            const url = getPatientAvatar(appt);
            const age = calcAge(appt?.patient?.dateOfBirth);
            const badge = getTypeBadge(appt);

            return (
              <div
                key={pid}
                className="grid items-center px-6 py-4 border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAFBFC] transition-colors"
                style={{ gridTemplateColumns: '2.5fr 0.5fr 1fr 1.4fr 1fr' }}
              >
                {/* Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  {url ? (
                    <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-100" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${avatarBg(name)} text-white text-[13px] font-bold flex items-center justify-center shrink-0 ring-1 ring-white`}>
                      {avatarInitials(name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#191C1E] truncate">{name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">PID-{pid?.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                {/* Age */}
                <span className="text-[14px] font-bold text-[#191C1E]">{age}</span>

                {/* Last Visit */}
                <span className="text-[13px] text-[#64748B]">{fmtDate(appt.scheduledDate)}</span>

                {/* Badge */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${badge.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                    {badge.label}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end">
                  <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <Mail size={14} />
                  </button>
                  <Link
                    to={`/dashboard/doctor/patients/${pid}`}
                    className="px-3.5 py-1.5 rounded-lg border border-[#2563EB]/30 text-[12px] font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[13px] text-[#64748B]">
        <span>
          Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalPatients)}–{Math.min(currentPage * PAGE_SIZE, totalPatients)} of {totalPatients} patients
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all ${
                n === currentPage
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-200'
                  : 'border border-slate-200 text-[#64748B] hover:bg-slate-50'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
