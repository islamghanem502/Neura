import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, FileText, Calendar, Pill,
  Loader2, Clock, PenLine, Play, AlertTriangle,
} from 'lucide-react';
import { usePatientById, usePatientMedicalProfile, usePatientAppointments } from '../../../../hooks/usePatientData';
import { usePatientMedicalHistory } from '../../../../hooks/useMedicalRecords';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcAge = (dob) => {
  if (!dob) return 30;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmt12 = (t = '') => {
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return t;
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`;
};

// Mini bar chart — 7 bars, last one highlighted
const MiniBar = ({ color = 'bg-blue-500', highlightColor = 'bg-blue-600' }) => {
  const heights = [30, 50, 40, 60, 35, 55, 80];
  return (
    <div className="flex items-end gap-[3px] h-[40px] mt-3">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[10px] rounded-sm ${i === heights.length - 1 ? highlightColor : color}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

// ─── Tab: Records ─────────────────────────────────────────────────────────────
function RecordsTab({ patientId, medicalProfile }) {
  const { data, isLoading } = usePatientMedicalHistory(patientId, { page: 1, limit: 20 });

  // Normalize record list from API shape
  const records = data?.data?.records
    || data?.data?.medicalRecords
    || (Array.isArray(data?.data) ? data.data : []);

  // Static uploaded files (not in API)
  const staticFiles = [
    { name: 'Blood_Work_Oct_23.pdf', size: '2.4 MB', type: 'LAB RESULTS', icon: '📄', color: 'text-red-400 bg-red-50' },
    { name: 'Chest_XRay_Digital.jpg', size: '5.1 MB', type: 'IMAGING', icon: '🖼️', color: 'text-blue-400 bg-blue-50' },
  ];

  // Medical profile for chronic diseases
  const mp = medicalProfile?.data?.medicalProfile || medicalProfile?.medicalProfile || {};
  const chronicDiseases = mp?.chronicDiseases || [];
  const allergies = mp?.allergies || [];

  // Static diagnosis history if API is empty
  const staticDiagnoses = [
    { title: 'Type 2 Diabetes Mellitus', date: 'Oct 2023', desc: 'Confirmed via HbA1c testing (7.4%) and fasting plasma glucose.', active: true },
    { title: 'Mild Hypertension', date: 'Jan 2023', desc: 'Initial diagnosis during routine screening. Monitoring initiated.', active: false },
  ];

  const diagnoses = records.length > 0
    ? records.map((r) => ({
        title: r.aiSummary?.diagnosis || 'Session Record',
        date: fmtDate(r.visitDate || r.createdAt),
        desc: r.aiSummary?.summary || r.doctorNotes || '',
        active: true,
      }))
    : staticDiagnoses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Diagnosis History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[#2563EB]" />
          <h3 className="text-[15px] font-bold text-[#191C1E]">Diagnosis History</h3>
        </div>
        <div className="flex flex-col gap-4">
          {diagnoses.map((d, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${d.active ? 'bg-[#2563EB]' : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-[#191C1E]">{d.title}</p>
                  <span className="text-[12px] text-[#94A3B8] shrink-0">{d.date}</span>
                </div>
                <p className="text-[12px] text-[#64748B] mt-0.5 leading-[1.6]">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Files */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-[#2563EB]" />
          <h3 className="text-[15px] font-bold text-[#191C1E]">Uploaded Files</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {staticFiles.map((f, i) => (
            <button
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-[14px] bg-[#F8FAFC] border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#191C1E] truncate">{f.name}</p>
                <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wide mt-0.5">
                  {f.size} • {f.type}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Allergies (from medical profile) */}
      {allergies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-500" />
            <h3 className="text-[14px] font-bold text-[#191C1E]">Allergies</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((a, i) => {
              const name = a.allergen || a.nameOfAllergy || a.name || 'Unknown';
              const sev = a.types?.[0]?.severity || a.severity || 'mild';
              const cls = sev === 'severe' ? 'bg-red-50 text-red-500 border-red-100'
                : sev === 'moderate' ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100';
              return (
                <span key={i} className={`px-3 py-1 rounded-full border text-[11px] font-semibold ${cls}`}>
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Doctor Notes ────────────────────────────────────────────────────────
function DoctorNotesTab({ patientId }) {
  const { data, isLoading } = usePatientMedicalHistory(patientId, { page: 1, limit: 20 });
  const records = data?.data?.records || data?.data?.medicalRecords || (Array.isArray(data?.data) ? data.data : []);

  const notes = records
    .filter((r) => r.doctorNotes)
    .map((r) => ({ note: r.doctorNotes, date: fmtDate(r.visitDate || r.createdAt), diagnosis: r.aiSummary?.diagnosis }));

  const staticNotes = [
    {
      note: 'Patient presented with persistent headaches, dizziness, and sensitivity to light. Probable migraine with possible hypertension. New medication prescribed to manage symptoms. Patient advised to improve sleep quality and reduce stress.',
      date: 'Oct 24, 2023',
      diagnosis: 'Probable migraine with hypertension',
    },
  ];

  const displayNotes = notes.length > 0 ? notes : staticNotes;

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#2563EB]" /></div>;

  return (
    <div className="flex flex-col gap-4">
      {displayNotes.map((n, i) => (
        <div key={i} className="bg-[#F8FAFC] rounded-[16px] border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#2563EB] uppercase tracking-wide">{n.diagnosis || 'Doctor Note'}</p>
            <span className="text-[11px] text-[#94A3B8]">{n.date}</span>
          </div>
          <p className="text-[13px] text-[#334155] leading-[1.7]">{n.note}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Appointments ────────────────────────────────────────────────────────
function AppointmentsTab({ patientId }) {
  const { data, isLoading } = usePatientAppointments(patientId);
  const appointments = data?.data?.appointments || (Array.isArray(data?.data) ? data.data : []);

  const STATUS_BADGE = {
    pending:    'bg-slate-100 text-slate-600',
    confirmed:  'bg-blue-50 text-blue-600',
    checkedIn:  'bg-[#EFF6FF] text-[#2563EB]',
    inProgress: 'bg-blue-600 text-white',
    completed:  'bg-emerald-50 text-emerald-600',
    cancelled:  'bg-red-50 text-red-500',
    noShow:     'bg-red-50 text-red-500',
  };

  const staticAppts = [
    { date: 'Oct 12, 2023', time: '10:00 AM', type: 'In-person', status: 'completed' },
    { date: 'Oct 18, 2023', time: '2:30 PM', type: 'Follow-up', status: 'completed' },
  ];

  const displayAppts = appointments.length > 0 ? appointments : staticAppts;

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#2563EB]" /></div>;

  return (
    <div className="flex flex-col gap-3">
      {displayAppts.map((appt, i) => {
        const status = appt.status || 'completed';
        const type = appt.appointmentType === 'inPerson' ? 'In-person' : appt.type || 'In-person';
        const dateStr = appt.scheduledDate ? fmtDate(appt.scheduledDate) : appt.date || '—';
        const timeStr = appt.scheduledTime?.startTime ? fmt12(appt.scheduledTime.startTime) : appt.time || '—';
        return (
          <div key={i} className="flex items-center gap-4 p-3.5 rounded-[14px] bg-[#F8FAFC] border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar size={15} className="text-[#2563EB]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#191C1E]">{dateStr}</p>
              <p className="text-[11px] text-[#64748B]">{timeStr} · {type}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[status] || STATUS_BADGE.completed}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Medications ─────────────────────────────────────────────────────────
function MedicationsTab({ medicalProfile }) {
  const mp = medicalProfile?.data?.medicalProfile || medicalProfile?.medicalProfile || {};
  const meds = mp?.currentMedications || [];

  const staticMeds = [
    { name: 'Brustemol', dose: '500mg', frequency: '1x daily', notes: 'Morning with food' },
    { name: 'Lisinopril', dose: '10mg', frequency: '1x daily', notes: 'For blood pressure' },
  ];

  const displayMeds = meds.length > 0 ? meds : staticMeds;

  return (
    <div className="flex flex-col gap-3">
      {displayMeds.map((m, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 rounded-[14px] bg-[#F8FAFC] border border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Pill size={15} className="text-[#2563EB]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#191C1E]">{m.name || m.medication}</p>
            <p className="text-[11px] text-[#64748B]">
              {[m.dose || m.dosage, m.frequency].filter(Boolean).join(' · ') || m.notes || 'No details'}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB]">Active</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'records', label: 'Records' },
  { key: 'notes', label: 'Doctor Notes' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'medications', label: 'Medications' },
];

export default function PatientFilePage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('records');

  const { data: patientRes, isLoading } = usePatientById(patientId);
  const { data: medProfileRes } = usePatientMedicalProfile(patientId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  // Unwrap patient — handle multiple API shapes
  const raw = patientRes?.data?.basicInfo
    || patientRes?.data?.patient
    || patientRes?.data
    || patientRes
    || {};

  const patient = {
    fullName: raw.fullName || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || 'Patient',
    gender: raw.gender || 'Male',
    age: raw.age || calcAge(raw.dateOfBirth) || 30,
    height: raw.height || 175,
    weight: raw.weight || 70,
    bmi: raw.bmi || 22.9,
    bloodType: raw.bloodType || 'A+',
    profileImage: raw.profileImage?.imageUrl || (typeof raw.profileImage === 'string' ? raw.profileImage : null),
    patientId: raw._id || raw.id || patientId,
    phone: raw.phone || raw.phoneNumber || '+20 155 574 3246',
    nextAppt: 'In 2 days',
    status: 'EMERGENCY', // static — not in API
    condition: raw.bloodType ? `Blood Type ${raw.bloodType}` : 'Type 2 Diabetes',
  };

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.fullName)}&background=e2e8f0&color=475569&size=200`;

  // BMI status
  const bmiStatus = patient.bmi > 25 ? { label: 'HIGH', cls: 'bg-red-50 text-red-500' }
    : patient.bmi < 18.5 ? { label: 'LOW', cls: 'bg-amber-50 text-amber-500' }
    : { label: 'NORMAL', cls: 'bg-emerald-50 text-emerald-600' };

  const weightStatus = patient.weight > 90 ? { label: 'HIGH', cls: 'bg-red-50 text-red-500' } : null;

  return (
    <div className="animate-in fade-in duration-500">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B] hover:text-[#191C1E] transition-colors mb-5"
      >
        <ArrowLeft size={16} /> Back to Patients
      </button>

      {/* ── Main 2-column layout ──────────────────────────────────────────── */}
      <div className="flex gap-5 items-start">

        {/* ══ LEFT PANEL ═══════════════════════════════════════════════════ */}
        <div className="w-[260px] shrink-0 bg-white rounded-[24px] border border-[#EAEAEB] shadow-sm p-6 flex flex-col gap-5">

          {/* Avatar + status badge */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-[110px] h-[110px] rounded-[20px] overflow-hidden bg-slate-100 mx-auto">
                <img
                  src={patient.profileImage || avatarFallback}
                  alt={patient.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = avatarFallback; }}
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold tracking-wider whitespace-nowrap shadow-md">
                {patient.status}
              </span>
            </div>

            <h2 className="text-[18px] font-bold text-[#191C1E] mt-3 tracking-tight">{patient.fullName}</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              {patient.age} Years • {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
            </p>
          </div>

          {/* Condition + Next appt chips */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              {patient.condition}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-[#64748B] text-[11px] font-semibold border border-slate-100">
              <Calendar size={11} />
              {patient.nextAppt}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Link
              to="/dashboard/doctor/messages"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-[13px] font-semibold text-[#191C1E] hover:bg-slate-50 transition-colors"
            >
              <MessageSquare size={15} className="text-[#2563EB]" />
              Message Patient
            </Link>
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-[13px] font-semibold text-[#191C1E] hover:bg-slate-50 transition-colors">
              <PenLine size={15} className="text-[#2563EB]" />
              Add Note
            </button>
          </div>

          {/* Meta info */}
          <div className="flex flex-col gap-3 pt-3 border-t border-[#F5F5F5]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Patient ID</span>
              <span className="text-[12px] font-mono font-bold text-[#191C1E]">
                #{patient.patientId?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Last Sync</span>
              <span className="text-[12px] font-semibold text-[#64748B]">14 mins ago</span>
            </div>
          </div>

          {/* Start Session */}
          <button className="w-full py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
            style={{ background: 'linear-gradient(135deg, #a0b4d6 0%, #c0cfe6 100%)' }}>
            <span className="flex items-center justify-center gap-2">
              <Play size={14} className="fill-white" />
              Start Session
            </span>
          </button>
        </div>

        {/* ══ RIGHT PANEL ══════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* ── Vitals Row ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">
            {/* Height */}
            <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Height</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[32px] font-black text-[#191C1E] leading-none">{patient.height}</span>
                <span className="text-[13px] font-bold text-[#94A3B8]">cm</span>
              </div>
              <MiniBar color="bg-blue-200" highlightColor="bg-[#2563EB]" />
            </div>

            {/* Weight */}
            <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Weight</p>
                {weightStatus && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${weightStatus.cls}`}>
                    {weightStatus.label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[32px] font-black text-[#191C1E] leading-none">{patient.weight}</span>
                <span className="text-[13px] font-bold text-[#94A3B8]">kg</span>
              </div>
              <MiniBar color="bg-red-100" highlightColor="bg-red-400" />
            </div>

            {/* BMI */}
            <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">BMI</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bmiStatus.cls}`}>
                  {bmiStatus.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[32px] font-black text-[#191C1E] leading-none">
                  {Number(patient.bmi || 0).toFixed(1)}
                </span>
              </div>
              <MiniBar color="bg-teal-100" highlightColor="bg-teal-400" />
            </div>
          </div>

          {/* ── Tab Panel ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center border-b border-[#F0F0F0] px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-4 text-[13px] font-semibold transition-all relative ${
                    activeTab === tab.key
                      ? 'text-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#191C1E]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'records' && (
                <RecordsTab patientId={patientId} medicalProfile={medProfileRes} />
              )}
              {activeTab === 'notes' && (
                <DoctorNotesTab patientId={patientId} />
              )}
              {activeTab === 'appointments' && (
                <AppointmentsTab patientId={patientId} />
              )}
              {activeTab === 'medications' && (
                <MedicationsTab medicalProfile={medProfileRes} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
