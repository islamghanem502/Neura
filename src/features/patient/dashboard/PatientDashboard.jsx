import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, Calendar, Pill, Activity, ChevronRight, Plus, Zap,
  Stethoscope, Loader2, AlertCircle, Clock, MapPin, Video,
  User, HeartPulse, Droplets, Ruler, Weight, Shield, ArrowUpRight,
  BadgeCheck, PhoneCall, Building2, FileText,
} from 'lucide-react';
import { useAuthContext } from '../../../providers/AuthProvider';
import { patientService } from '../../../api/patientService';
import { getMyAppointments } from '../../../api/appointmentService';
import { bmiFromMetricKgCm } from '../digital-twin/digitalTwinUtils';

// ─── helpers ────────────────────────────────────────────────────────
const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
};

const statusColor = (s) => ({
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  completed: 'bg-blue-50 text-blue-600 border-blue-100',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  inProgress: 'bg-purple-50 text-purple-700 border-purple-100',
}[s] || 'bg-slate-50 text-slate-500 border-slate-100');

const bmiLabel = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-600' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' };
  return { label: 'Obese', color: 'text-rose-600' };
};

// ─── Small Reusable Stat Block ───────────────────────────────────────
const StatBlock = ({ icon: Icon, label, value, unit, color, bg }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-slate-900 leading-none mt-0.5">
        {value} <span className="text-sm font-medium text-slate-400">{unit}</span>
      </p>
    </div>
  </div>
);

// ─── Appointment Card ────────────────────────────────────────────────
const AppointmentRow = ({ appt, navigate }) => {
  const doctor = appt.doctor || {};
  const doctorName = doctor.fullName || doctor.name || 'Doctor';
  const specialization = doctor.specialization || '—';
  const avatar = doctor.profileImage?.imageUrl || doctor.profileImage;
  const isTelemedicine = appt.appointmentType === 'telemedicine';
  const dateStr = fmtDate(appt.scheduledDate);
  const time = appt.scheduledTime?.startTime || '';

  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate('/dashboard/patient/appointments')}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shrink-0 border border-slate-100">
        {avatar ? (
          <img src={avatar} alt={doctorName} className="w-full h-full object-cover" />
        ) : (
          <User size={20} className="text-blue-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-black text-slate-800 truncate">Dr. {doctorName}</p>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${statusColor(appt.status)}`}>
            {appt.status}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{specialization}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <Calendar size={11} /> {dateStr}
          </span>
          {time && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock size={11} /> {time}
            </span>
          )}
          <span className={`flex items-center gap-1 text-[10px] font-bold ${isTelemedicine ? 'text-blue-500' : 'text-emerald-600'}`}>
            {isTelemedicine ? <Video size={11} /> : <Building2 size={11} />}
            {isTelemedicine ? 'Telemedicine' : 'In-Clinic'}
          </span>
        </div>
      </div>

      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
    </div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function PatientDashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['patientBasicInfo'],
    queryFn: patientService.getBasicInfo,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch upcoming appointments (pending + confirmed, limit 5)
  const { data: apptData, isLoading: apptLoading } = useQuery({
    queryKey: ['myAppointments', 'upcoming'],
    queryFn: () => getMyAppointments({ limit: 5, sortBy: 'scheduledDate', sortOrder: 'asc' }),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch medications
  const { data: medications = [], isLoading: medsLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: patientService.getMedications,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch chronic diseases
  const { data: chronicDiseases = [] } = useQuery({
    queryKey: ['chronicDiseases'],
    queryFn: patientService.getChronicDiseases,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch allergies
  const { data: allergies = [] } = useQuery({
    queryKey: ['allergies'],
    queryFn: patientService.getAllergies,
    staleTime: 10 * 60 * 1000,
  });

  const appointments = useMemo(() => {
    return apptData?.data?.appointments || apptData?.appointments || [];
  }, [apptData]);

  const upcomingAppts = useMemo(
    () => appointments.filter(a => ['pending', 'confirmed', 'inProgress'].includes(a.status)).slice(0, 3),
    [appointments]
  );

  const bmi = bmiFromMetricKgCm(profile?.weight, profile?.height);
  const bmiInfo = bmiLabel(bmi);

  // Profile completion
  const completionPct = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      profile.phone, profile.height, profile.weight, profile.bloodType,
      profile.address?.city, medications.length > 0, allergies.length > 0,
      chronicDiseases.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile, medications, allergies, chronicDiseases]);

  return (
    <div className="p-4 md:p-8 bg-slate-50/40 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── WELCOME HEADER ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {greet()}, {user?.firstName || 'there'} 👋
            </h1>
            <p className="text-slate-400 font-medium mt-1 text-sm">
              Here's a live overview of your health today.
            </p>
          </div>
          {!profileLoading && completionPct < 100 && (
            <button
              onClick={() => navigate('/dashboard/patient/profile')}
              className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-5 py-2.5 rounded-2xl text-xs font-black shadow-sm hover:bg-blue-50 transition-all active:scale-95"
            >
              <Shield size={14} />
              Profile {completionPct}% complete — finish it
              <ArrowUpRight size={14} />
            </button>
          )}
        </header>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT + CENTER (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. PROFILE HERO CARD */}
            {profileLoading ? (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex items-center justify-center h-36">
                <Loader2 className="animate-spin text-blue-500" size={28} />
              </div>
            ) : profile ? (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/60 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                    <img
                      src={
                        profile.profileImage?.imageUrl ||
                        profile.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=DBEAFE&color=1d4ed8&bold=true`
                      }
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {completionPct === 100 && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <BadgeCheck size={14} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2 relative z-10 text-center sm:text-left">
                  <h2 className="text-2xl font-black text-slate-900">{profile.fullName}</h2>
                  <p className="text-slate-400 text-sm font-semibold">
                    {profile.age ? `${profile.age} years old` : ''} {profile.gender ? `• ${profile.gender}` : ''} {profile.maritalStatus ? `• ${profile.maritalStatus}` : ''}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                    {profile.bloodType && (
                      <span className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-black">
                        <Droplets size={12} /> {profile.bloodType}
                      </span>
                    )}
                    {profile.address?.city && (
                      <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        <MapPin size={12} /> {profile.address.city}
                        {profile.address.governorate ? `, ${profile.address.governorate}` : ''}
                      </span>
                    )}
                    {profile.phone && (
                      <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        <PhoneCall size={12} /> {profile.phone}
                      </span>
                    )}
                    {chronicDiseases.length > 0 && chronicDiseases.slice(0, 2).map(d => (
                      <span key={d._id} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                        <HeartPulse size={12} /> {d.nameOfDisease}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2 shrink-0 relative z-10">
                  <button
                    onClick={() => navigate('/dashboard/patient/appointments')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all active:scale-95"
                  >
                    <Calendar size={14} /> Book Appointment
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/patient/profile')}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95"
                  >
                    <User size={14} /> View Profile
                  </button>
                </div>
              </div>
            ) : null}

            {/* 2. VITALS STATS (from real profile data) */}
            {profile && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBlock
                  icon={Weight}
                  label="Weight"
                  value={profile.weight ? `${profile.weight}` : '—'}
                  unit={profile.weight ? 'kg' : ''}
                  color="text-blue-600"
                  bg="bg-blue-50"
                />
                <StatBlock
                  icon={Ruler}
                  label="Height"
                  value={profile.height ? `${profile.height}` : '—'}
                  unit={profile.height ? 'cm' : ''}
                  color="text-indigo-600"
                  bg="bg-indigo-50"
                />
                <StatBlock
                  icon={Activity}
                  label="BMI Index"
                  value={bmi ? bmi.toFixed(1) : '—'}
                  unit={bmiInfo?.label || ''}
                  color={bmiInfo?.color || 'text-slate-400'}
                  bg="bg-slate-50"
                />
                <StatBlock
                  icon={Heart}
                  label="Blood Type"
                  value={profile.bloodType || '—'}
                  unit=""
                  color="text-rose-500"
                  bg="bg-rose-50"
                />
              </div>
            )}

            {/* 3. UPCOMING APPOINTMENTS */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <h3 className="font-black text-slate-900">Upcoming Appointments</h3>
                </div>
                <button
                  onClick={() => navigate('/dashboard/patient/appointments')}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight size={12} />
                </button>
              </div>

              {apptLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-blue-400" size={24} />
                </div>
              ) : upcomingAppts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppts.map(appt => (
                    <AppointmentRow key={appt._id} appt={appt} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-semibold">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/dashboard/patient/appointments')}
                    className="flex items-center gap-1.5 text-xs font-black text-blue-600 border border-dashed border-blue-200 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <Plus size={14} /> Schedule a Visit
                  </button>
                </div>
              )}
            </div>

            {/* 4. MEDICATIONS */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Pill size={16} />
                  </div>
                  <h3 className="font-black text-slate-900">Current Medications</h3>
                </div>
                <button
                  onClick={() => navigate('/dashboard/patient/profile')}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  Manage <ChevronRight size={12} />
                </button>
              </div>

              {medsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-emerald-400" size={22} />
                </div>
              ) : medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.slice(0, 4).map(med => (
                    <div key={med._id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <Pill size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">{med.name}</p>
                        {med.dosage && (
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{med.dosage}</p>
                        )}
                        {med.reason && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">{med.reason}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-[9px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Active
                      </span>
                    </div>
                  ))}
                  {medications.length > 4 && (
                    <p className="text-xs text-center text-slate-400 font-semibold pt-1">
                      +{medications.length - 4} more medications in profile
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                  <Pill size={28} className="text-slate-200" />
                  <p className="text-sm text-slate-400 font-semibold">No medications recorded</p>
                  <button
                    onClick={() => navigate('/dashboard/patient/profile')}
                    className="text-xs font-black text-blue-600 hover:underline"
                  >
                    Add medications →
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* 5. QUICK ACTIONS */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Book Doctor', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50', path: '/dashboard/patient/appointments' },
                  { label: 'My Records', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', path: '/dashboard/patient/records' },
                  { label: 'Digital Twin', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/dashboard/patient/digital-twin' },
                  { label: 'Group Therapy', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50', path: '/dashboard/patient/therapy-groups' },
                ].map(({ label, icon: Icon, color, bg, path }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. MEDICAL SUMMARY */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-5">
              <h3 className="font-black text-slate-900">Medical Summary</h3>

              {/* Chronic Diseases */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chronic Conditions</p>
                {chronicDiseases.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {chronicDiseases.map(d => (
                      <span key={d._id} className="text-xs bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-lg font-bold">
                        {d.nameOfDisease}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic font-medium">None recorded</p>
                )}
              </div>

              {/* Allergies */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Known Allergies</p>
                {allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map(a => (
                      <span key={a._id} className="text-xs bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-1 rounded-lg font-bold">
                        {a.allergen}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic font-medium">None recorded</p>
                )}
              </div>

              <button
                onClick={() => navigate('/dashboard/patient/profile')}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-xs font-black text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                View Full Medical Profile →
              </button>
            </div>

            {/* 7. DIGITAL TWIN TEASER */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 opacity-10 p-4">
                <Zap size={80} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  <Zap size={12} fill="currentColor" /> AI Digital Twin
                </div>
                <div>
                  <h3 className="text-xl font-black">Your Health Model</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1 leading-relaxed">
                    Your physiological twin is ready. Sync new data to get predictive health insights.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/patient/digital-twin')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl font-black text-sm shadow-lg shadow-blue-900/30 active:scale-95"
                >
                  Open Digital Twin
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}