import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronDown, Plus, Trash2, Loader2, Upload, X, Award, GraduationCap,
  Building2, User, FileText, Grid3X3, Camera
} from 'lucide-react';
import {
  useDoctorData,
  useDoctorProfessionalInfo,
  useUpdateDoctorProfessionalInfo,
  useAddDoctorCertificate,
  useDeleteDoctorCertificate,
  useAddDoctorMembership,
  useDeleteDoctorMembership,
  useAddDoctorAward,
  useDeleteDoctorAward,
  useUploadProfileImage,
  useDeleteProfileImage,
} from '../../../../hooks/useDoctorData';

// ── Collapsible Section ────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[#EAEAEB] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3.5 px-6 py-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
          <Icon size={18} className="text-[#2563EB]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[#191C1E]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6 pt-1">{children}</div>
      </div>
    </div>
  );
};

// ── Shared Styles ──────────────────────────────────────────────────────────────
const labelClass = 'block text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5';
const inputClass =
  'w-full bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-[#9CA3AF]';

// ── Tag Input (inline) ────────────────────────────────────────────────────────
const InlineTagInput = ({ tags, onAdd, onRemove, placeholder }) => {
  const [val, setVal] = useState('');
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) { onAdd(t); setVal(''); }
    else setVal('');
  };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag, i) => (
        <span key={i} className="bg-[#2563EB] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          {tag}
          <button type="button" onClick={() => onRemove(i)} className="hover:bg-white/20 rounded p-0.5 transition-colors">
            <X size={11} strokeWidth={3} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => {
          const t = prompt(placeholder || 'Enter value');
          if (t?.trim() && !tags.includes(t.trim())) onAdd(t.trim());
        }}
        className="text-[12px] font-semibold text-[#2563EB] border border-[#2563EB] border-dashed rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
      >
        + Add New
      </button>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════════
export default function DoctorCompleteProfilePage() {
  const { data: doctorRes } = useDoctorData();
  const { data: profRes, isLoading } = useDoctorProfessionalInfo();
  const updateMutation = useUpdateDoctorProfessionalInfo();
  const addCertMutation = useAddDoctorCertificate();
  const delCertMutation = useDeleteDoctorCertificate();
  const addMemberMutation = useAddDoctorMembership();
  const delMemberMutation = useDeleteDoctorMembership();
  const addAwardMutation = useAddDoctorAward();
  const delAwardMutation = useDeleteDoctorAward();
  const uploadImageMutation = useUploadProfileImage();
  const deleteImageMutation = useDeleteProfileImage();

  const doctorData = doctorRes?.data?.basicInfo || doctorRes || {};
  const prof = profRes?.data?.professionalInfo || {};

  const profileImageUrl =
    doctorData?.profileImage?.imageUrl ||
    (typeof doctorData?.profileImage === 'string' ? doctorData.profileImage : null);
  const fullName = [doctorData?.firstName, doctorData?.lastName].filter(Boolean).join(' ') || 'Doctor';
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e2e8f0&color=475569&size=128`;

  const imageInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    const fd = new FormData();
    fd.append('image', file);
    uploadImageMutation.mutate(fd);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // ── Form state for PATCH-able fields ─────────────────────────────────────────
  const [primarySpec, setPrimarySpec] = useState('');
  const [subSpecs, setSubSpecs] = useState([]);
  const [highestDegree, setHighestDegree] = useState('');
  const [medicalSchool, setMedicalSchool] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [hospitalAff, setHospitalAff] = useState([]);
  const [bio, setBio] = useState('');

  // Sync from server
  useEffect(() => {
    if (!prof.primarySpecialization && !prof.highestDegree) return;
    setPrimarySpec(prof.primarySpecialization || '');
    setSubSpecs(prof.subSpecializations || []);
    setHighestDegree(prof.highestDegree || '');
    setMedicalSchool(prof.medicalSchool || '');
    setYearsExp(prof.yearsOfExperience ?? '');
    setCurrentPosition(prof.currentPosition || '');
    setHospitalAff(prof.hospitalAffiliation || []);
    setBio(prof.bio || '');
  }, [profRes]);

  // ── Certificate add form ─────────────────────────────────────────────────────
  const [certForm, setCertForm] = useState({ name: '', institution: '', Year: '' });
  const [certFile, setCertFile] = useState(null);
  const certFileRef = useRef(null);

  // ── Award add form ───────────────────────────────────────────────────────────
  const [awardForm, setAwardForm] = useState({ name: '', awardedBy: '', year: '' });
  const [awardFile, setAwardFile] = useState(null);
  const awardFileRef = useRef(null);

  // ── Membership add form ──────────────────────────────────────────────────────
  const [memberForm, setMemberForm] = useState({ nameOfAssociation: '', Since: '' });

  // ── Save handler ─────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        primarySpecialization: primarySpec,
        subSpecializations: subSpecs,
        highestDegree,
        medicalSchool,
        yearsOfExperience: Number(yearsExp) || 0,
        currentPosition,
        hospitalAffiliation: hospitalAff,
        bio,
      });
    } catch { /* toast handled by hook */ }
    setSaving(false);
  };

  // ── Cert handlers ────────────────────────────────────────────────────────────
  const handleAddCert = () => {
    if (!certForm.name.trim()) return toast.error('Certificate name is required');
    if (!certFile) return toast.error('Please attach a file');
    const fd = new FormData();
    fd.append('name', certForm.name.trim());
    fd.append('institution', certForm.institution.trim());
    if (certForm.Year) fd.append('Year', String(certForm.Year));
    fd.append('file', certFile);
    addCertMutation.mutate(fd, {
      onSuccess: () => { setCertForm({ name: '', institution: '', Year: '' }); setCertFile(null); if (certFileRef.current) certFileRef.current.value = ''; }
    });
  };

  // ── Award handlers ──────────────────────────────────────────────────────────
  const handleAddAward = () => {
    if (!awardForm.name.trim()) return toast.error('Award name is required');
    if (!awardFile) return toast.error('Please attach a file');
    const fd = new FormData();
    fd.append('name', awardForm.name.trim());
    fd.append('awardedBy', awardForm.awardedBy.trim());
    if (awardForm.year) fd.append('year', String(awardForm.year));
    fd.append('file', awardFile);
    addAwardMutation.mutate(fd, {
      onSuccess: () => { setAwardForm({ name: '', awardedBy: '', year: '' }); setAwardFile(null); if (awardFileRef.current) awardFileRef.current.value = ''; }
    });
  };

  // ── Membership handlers ──────────────────────────────────────────────────────
  const handleAddMembership = () => {
    if (!memberForm.nameOfAssociation.trim()) return toast.error('Association name is required');
    addMemberMutation.mutate({
      nameOfAssociation: memberForm.nameOfAssociation.trim(),
      Since: Number(memberForm.Since) || new Date().getFullYear(),
    }, {
      onSuccess: () => setMemberForm({ nameOfAssociation: '', Since: '' }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  const certificates = prof.certificates || [];
  const awards = prof.awards || [];
  const memberships = prof.medicalMemberships || [];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 max-w-[900px]">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-[24px] font-bold text-[#191C1E] tracking-tight">Complete Your Profile</h1>
        <p className="text-[14px] text-[#64748B] mt-1">
          Update your professional information to ensure patients can find and trust your expertise.
        </p>
      </div>

      {/* ── Profile Image Card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#EAEAEB] shadow-sm p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-slate-100 ring-4 ring-[#EFF6FF] shrink-0">
              <img
                src={profileImageUrl || avatarFallback}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = avatarFallback; }}
              />
            </div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-blue-700 transition-colors"
            >
              {uploadImageMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-bold text-[#191C1E] truncate">{fullName}</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              {prof.primarySpecialization || doctorData?.specialization || 'Specialist'}
              {prof.currentPosition ? ` · ${prof.currentPosition}` : ''}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadImageMutation.isPending}
              className="text-[12px] font-semibold text-[#2563EB] border border-[#2563EB] rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              Upload Photo
            </button>
            {profileImageUrl && (
              <button
                type="button"
                onClick={() => deleteImageMutation.mutate()}
                disabled={deleteImageMutation.isPending}
                className="text-[12px] font-semibold text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleteImageMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 1. Specialization ──────────────────────────────────────────────── */}
      <Section icon={Grid3X3} title="Specialization" subtitle="Define your clinical focus" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Primary Specialization</label>
            <input className={inputClass} value={primarySpec} onChange={e => setPrimarySpec(e.target.value)} placeholder="e.g. Cardiology" />
          </div>
          <div>
            <label className={labelClass}>Sub-Specializations</label>
            <InlineTagInput
              tags={subSpecs}
              onAdd={t => setSubSpecs(p => [...p, t])}
              onRemove={i => setSubSpecs(p => p.filter((_, idx) => idx !== i))}
              placeholder="Enter sub-specialization"
            />
          </div>
        </div>
      </Section>

      {/* ── 2. Education & Experience ──────────────────────────────────────── */}
      <Section icon={GraduationCap} title="Education & Experience" subtitle="Academic background and career history">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Highest Degree</label>
            <input className={inputClass} value={highestDegree} onChange={e => setHighestDegree(e.target.value)} placeholder="e.g. PhD in Cardiovascular Medicine" />
          </div>
          <div>
            <label className={labelClass}>Medical School</label>
            <input className={inputClass} value={medicalSchool} onChange={e => setMedicalSchool(e.target.value)} placeholder="e.g. Cairo University" />
          </div>
          <div>
            <label className={labelClass}>Years of Experience</label>
            <input type="number" className={inputClass} value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="e.g. 15" min="0" />
          </div>
          <div>
            <label className={labelClass}>Current Position</label>
            <input className={inputClass} value={currentPosition} onChange={e => setCurrentPosition(e.target.value)} placeholder="e.g. Senior Consultant" />
          </div>
        </div>
      </Section>

      {/* ── 3. Work & Affiliations ─────────────────────────────────────────── */}
      <Section icon={Building2} title="Work & Affiliations" subtitle="Current hospital and laboratory ties">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] text-[#64748B]">Hospital affiliations</span>
          <button
            type="button"
            onClick={() => {
              const v = prompt('Enter hospital / affiliation name');
              if (v?.trim()) setHospitalAff(p => [...p, v.trim()]);
            }}
            className="text-[12px] font-semibold text-[#2563EB] border border-[#2563EB] rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            + Add Affiliation
          </button>
        </div>
        {hospitalAff.length === 0 && (
          <p className="text-[13px] text-[#9CA3AF] italic">No affiliations added yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {hospitalAff.map((h, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-3">
              <Building2 size={16} className="text-[#64748B] shrink-0" />
              <span className="flex-1 text-[13px] font-medium text-[#191C1E]">{h}</span>
              <button
                type="button"
                onClick={() => setHospitalAff(p => p.filter((_, idx) => idx !== i))}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. About ───────────────────────────────────────────────────────── */}
      <Section icon={User} title="About" subtitle="Your professional biography for patients">
        <textarea
          className={`${inputClass} min-h-[100px] resize-y`}
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Write a brief professional bio..."
          rows={4}
        />
      </Section>

      {/* ── 5. Awards & Certificates (side by side at bottom) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Awards + Certificates */}
        <div className="bg-white rounded-2xl border border-[#EAEAEB] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-[#2563EB]" />
              <h3 className="text-[15px] font-bold text-[#191C1E]">Awards & Certificates</h3>
            </div>
            <button type="button" className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] hover:bg-blue-100 transition-colors"
              onClick={() => document.getElementById('cert-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <Plus size={16} />
            </button>
          </div>

          {/* Existing awards */}
          {awards.map(a => (
            <div key={a._id} className="flex items-center justify-between bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-2.5 mb-2 group">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#191C1E] truncate">{a.name} {a.year ? `(${a.year})` : ''}</p>
                <p className="text-[11px] text-[#64748B]">{a.awardedBy}</p>
              </div>
              <button onClick={() => delAwardMutation.mutate(a._id)} disabled={delAwardMutation.isPending}
                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0 ml-2 disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Existing certificates */}
          {certificates.map(c => (
            <div key={c._id} className="flex items-center justify-between bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-2.5 mb-2 group">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#191C1E] truncate">{c.name} {c.Year ? `(${c.Year})` : ''}</p>
                <p className="text-[11px] text-[#64748B]">{c.institution}</p>
              </div>
              <button onClick={() => delCertMutation.mutate(c._id)} disabled={delCertMutation.isPending}
                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0 ml-2 disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {awards.length === 0 && certificates.length === 0 && (
            <div className="border-2 border-dashed border-[#EAEAEB] rounded-xl py-8 flex flex-col items-center justify-center text-center">
              <FileText size={28} className="text-[#CBD5E1] mb-2" />
              <p className="text-[13px] text-[#9CA3AF]">Drag and drop certificate files here</p>
              <p className="text-[11px] text-[#CBD5E1] mt-0.5">PDF, JPG, or PNG (Max 5MB)</p>
            </div>
          )}

          {/* Add Award Form */}
          <div id="cert-section" className="mt-4 border-t border-[#EAEAEB] pt-4 space-y-3">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Add Award</p>
            <input className={inputClass} placeholder="Award name *" value={awardForm.name} onChange={e => setAwardForm(p => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Awarded by" value={awardForm.awardedBy} onChange={e => setAwardForm(p => ({ ...p, awardedBy: e.target.value }))} />
              <input type="number" className={inputClass} placeholder="Year" value={awardForm.year} onChange={e => setAwardForm(p => ({ ...p, year: e.target.value }))} min="1950" max={new Date().getFullYear()} />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-2.5 cursor-pointer hover:border-blue-300 transition-colors text-[12px] text-[#64748B]">
                <Upload size={14} className="shrink-0" />
                <span className="truncate">{awardFile ? awardFile.name : 'Attach file'}</span>
                <input ref={awardFileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => setAwardFile(e.target.files?.[0] || null)} />
              </label>
              <button type="button" onClick={handleAddAward} disabled={addAwardMutation.isPending}
                className="shrink-0 bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {addAwardMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} Add
              </button>
            </div>
          </div>

          {/* Add Certificate Form */}
          <div className="mt-4 border-t border-[#EAEAEB] pt-4 space-y-3">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Add Certificate</p>
            <input className={inputClass} placeholder="Certificate name *" value={certForm.name} onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Institution" value={certForm.institution} onChange={e => setCertForm(p => ({ ...p, institution: e.target.value }))} />
              <input type="number" className={inputClass} placeholder="Year" value={certForm.Year} onChange={e => setCertForm(p => ({ ...p, Year: e.target.value }))} min="1950" max={new Date().getFullYear()} />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-2.5 cursor-pointer hover:border-blue-300 transition-colors text-[12px] text-[#64748B]">
                <Upload size={14} className="shrink-0" />
                <span className="truncate">{certFile ? certFile.name : 'Attach file'}</span>
                <input ref={certFileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => setCertFile(e.target.files?.[0] || null)} />
              </label>
              <button type="button" onClick={handleAddCert} disabled={addCertMutation.isPending}
                className="shrink-0 bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {addCertMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} Add
              </button>
            </div>
          </div>
        </div>

        {/* Memberships */}
        <div className="bg-white rounded-2xl border border-[#EAEAEB] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Grid3X3 size={16} className="text-[#2563EB]" />
              <h3 className="text-[15px] font-bold text-[#191C1E]">Memberships</h3>
            </div>
            <button type="button" className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] hover:bg-blue-100 transition-colors"
              onClick={() => document.getElementById('member-add')?.scrollIntoView({ behavior: 'smooth' })}>
              <Plus size={16} />
            </button>
          </div>

          {memberships.length === 0 && (
            <p className="text-[13px] text-[#9CA3AF] italic mb-4">No memberships added yet.</p>
          )}

          {memberships.map(m => (
            <div key={m._id} className="flex items-center justify-between bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-3 mb-2">
              <span className="text-[13px] font-medium text-[#191C1E]">{m.nameOfAssociation}</span>
              <button onClick={() => delMemberMutation.mutate(m._id)} disabled={delMemberMutation.isPending}
                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0 ml-2 disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Add Membership Form */}
          <div id="member-add" className="mt-4 border-t border-[#EAEAEB] pt-4 space-y-3">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Add Membership</p>
            <input className={inputClass} placeholder="Association name *" value={memberForm.nameOfAssociation}
              onChange={e => setMemberForm(p => ({ ...p, nameOfAssociation: e.target.value }))} />
            <div className="flex items-center gap-2">
              <input type="number" className={`${inputClass} flex-1`} placeholder="Member since (year)" value={memberForm.Since}
                onChange={e => setMemberForm(p => ({ ...p, Since: e.target.value }))} min="1950" max={new Date().getFullYear()} />
              <button type="button" onClick={handleAddMembership} disabled={addMemberMutation.isPending}
                className="shrink-0 bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {addMemberMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save Button ────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2 pb-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2563EB] hover:bg-blue-700 text-white text-[14px] font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2 disabled:opacity-60 active:scale-95"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Save Profile
        </button>
      </div>
    </div>
  );
}
