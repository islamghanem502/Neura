import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Loader2, CheckCircle2, User, Activity, MapPin, Briefcase, Phone, 
  ChevronRight, Award, FileText, Bookmark, Trash2, Plus, 
  GraduationCap, Building2, Calendar as CalendarIcon, Link as LinkIcon
} from 'lucide-react';

import { 
  useDoctorData,
  useDoctorProfessionalInfo,
  useUpdateDoctorBasicInfo, 
  useUpdateDoctorProfessionalInfo,
  useAddDoctorCertificate,
  useDeleteDoctorCertificate,
  useAddDoctorMembership,
  useDeleteDoctorMembership,
  useAddDoctorAward,
  useDeleteDoctorAward
} from '../../hooks/useDoctorData';

// --- Shared Styles ---
const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm";
const labelClass = "text-[11px] font-black text-slate-500 uppercase ml-1 tracking-wider mb-1 block";
const tabBtn = (active) => `flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;

// --- Tabs Components ---

const BasicInfoTab = ({ doctorData }) => {
  const updateInfoMutation = useUpdateDoctorBasicInfo();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (doctorData) {
      reset({
        phone: doctorData.phone || '',
      });
    }
  }, [doctorData, reset]);

  const onSubmit = (data) => {
    updateInfoMutation.mutate({
      phone: data.phone
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Contact Information</h2>
        <p className="text-slate-500 text-sm mt-1">Update your basic contact details.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="md:w-1/2">
          <label className={labelClass}>Contact Phone</label>
          <input {...register('phone')} className={inputClass} placeholder="010..." />
        </div>
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={updateInfoMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70">
            {updateInfoMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>Save Changes <ChevronRight size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  );
};

const ProfessionalInfoTab = ({ profInfo }) => {
  const updateProfMutation = useUpdateDoctorProfessionalInfo();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (profInfo) {
      reset({
        primarySpecialization: profInfo.primarySpecialization || '',
        subSpecializations: profInfo.subSpecializations?.join(', ') || '',
        highestDegree: profInfo.highestDegree || '',
        medicalSchool: profInfo.medicalSchool || '',
        yearsOfExperience: profInfo.yearsOfExperience || '',
        currentPosition: profInfo.currentPosition || '',
        hospitalAffiliation: profInfo.hospitalAffiliation?.join(', ') || '',
        bio: profInfo.bio || '',
      });
    }
  }, [profInfo, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...data,
      yearsOfExperience: Number(data.yearsOfExperience),
      subSpecializations: data.subSpecializations ? data.subSpecializations.split(',').map(s => s.trim()).filter(Boolean) : [],
      hospitalAffiliation: data.hospitalAffiliation ? data.hospitalAffiliation.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    updateProfMutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Professional Background</h2>
        <p className="text-slate-500 text-sm mt-1">Update your medical qualifications and academic history.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Primary Specialization</label>
            <input {...register('primarySpecialization')} className={inputClass} placeholder="e.g. Cardiology" />
          </div>
          <div>
            <label className={labelClass}>Sub Specializations (Comma separated)</label>
            <input {...register('subSpecializations')} className={inputClass} placeholder="e.g. Interventional Cardiology, Echocardiography" />
          </div>
          <div>
            <label className={labelClass}>Highest Degree</label>
            <input {...register('highestDegree')} className={inputClass} placeholder="e.g. PhD in Cardiovascular Medicine" />
          </div>
          <div>
            <label className={labelClass}>Medical School</label>
            <input {...register('medicalSchool')} className={inputClass} placeholder="e.g. Cairo University" />
          </div>
          <div>
            <label className={labelClass}>Years Of Experience</label>
            <input type="number" {...register('yearsOfExperience')} className={inputClass} placeholder="e.g. 15" />
          </div>
          <div>
            <label className={labelClass}>Current Position</label>
            <input {...register('currentPosition')} className={inputClass} placeholder="e.g. Senior Consultant" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Hospital Affiliations (Comma separated)</label>
            <input {...register('hospitalAffiliation')} className={inputClass} placeholder="e.g. Al-Salam Hospital, Kasr Al-Ainy" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Professional Bio</label>
            <textarea {...register('bio')} rows="4" className={inputClass + " resize-none"} placeholder="Write a short professional biography..." />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={updateProfMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70">
            {updateProfMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>Save Changes <ChevronRight size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  );
};

const CertificatesTab = ({ certificates }) => {
  const addMutation = useAddDoctorCertificate();
  const deleteMutation = useDeleteDoctorCertificate();
  const { register, handleSubmit, reset } = useForm();
  
  const onSubmit = (data) => {
    if (!data.file?.[0]) return toast.error('Please upload a file');
    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('name', data.name);
    formData.append('institution', data.institution);
    formData.append('Year', data.Year);
    
    addMutation.mutate(formData, { onSuccess: () => reset() });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Certificates</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your medical certificates and board degrees.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={16}/> Add New Certificate</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Certificate Name</label>
              <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Board Certification" />
            </div>
            <div>
              <label className={labelClass}>Institution</label>
              <input {...register('institution', { required: true })} className={inputClass} placeholder="e.g. American Board" />
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <input type="number" {...register('Year', { required: true })} className={inputClass} placeholder="2020" />
            </div>
            <div>
              <label className={labelClass}>Document File (PDF/Image)</label>
              <input type="file" {...register('file', { required: true })} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
            </div>
            <button type="submit" disabled={addMutation.isPending} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all flex justify-center mt-2">
              {addMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Upload Certificate'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Your Certificates</h3>
          {certificates?.length === 0 && <p className="text-slate-400 text-sm italic">No certificates added yet.</p>}
          {certificates?.map(cert => (
            <div key={cert._id} className="bg-white border text-left border-slate-200 p-4 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{cert.name}</h4>
                  <p className="text-xs text-slate-500">{cert.institution} • {cert.Year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"><LinkIcon size={14} /></a>}
                <button onClick={() => deleteMutation.mutate(cert._id)} disabled={deleteMutation.isPending} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MembershipsTab = ({ memberships }) => {
  const addMutation = useAddDoctorMembership();
  const deleteMutation = useDeleteDoctorMembership();
  const { register, handleSubmit, reset } = useForm();
  
  const onSubmit = (data) => {
    addMutation.mutate({
      nameOfAssociation: data.nameOfAssociation,
      Since: Number(data.Since)
    }, { onSuccess: () => reset() });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Medical Memberships</h2>
        <p className="text-slate-500 text-sm mt-1">Add your professional societies and memberships.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={16}/> Add Membership</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Association Name</label>
              <input {...register('nameOfAssociation', { required: true })} className={inputClass} placeholder="e.g. Egyptian Society of Dermatology" />
            </div>
            <div>
              <label className={labelClass}>Member Since (Year)</label>
              <input type="number" {...register('Since', { required: true })} className={inputClass} placeholder="2017" />
            </div>
            <button type="submit" disabled={addMutation.isPending} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all flex justify-center mt-2">
              {addMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Save Membership'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Your Memberships</h3>
          {memberships?.length === 0 && <p className="text-slate-400 text-sm italic">No memberships added yet.</p>}
          {memberships?.map(mem => (
            <div key={mem._id} className="bg-white border text-left border-slate-200 p-4 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bookmark size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{mem.nameOfAssociation}</h4>
                  <p className="text-xs text-slate-500">Since {mem.Since}</p>
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(mem._id)} disabled={deleteMutation.isPending} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AwardsTab = ({ awards }) => {
  const addMutation = useAddDoctorAward();
  const deleteMutation = useDeleteDoctorAward();
  const { register, handleSubmit, reset } = useForm();
  
  const onSubmit = (data) => {
    if (!data.file?.[0]) return toast.error('Please upload a file');
    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('name', data.name);
    formData.append('awardedBy', data.awardedBy);
    formData.append('year', data.year);
    
    addMutation.mutate(formData, { onSuccess: () => reset() });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Awards & Honors</h2>
          <p className="text-slate-500 text-sm mt-1">Showcase your career highlights and official recognitions.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={16}/> Add Award</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Award Name</label>
              <input {...register('name', { required: true })} className={inputClass} placeholder="e.g. Best Doctor of the Year" />
            </div>
            <div>
              <label className={labelClass}>Awarded By</label>
              <input {...register('awardedBy', { required: true })} className={inputClass} placeholder="e.g. Ministry of Health" />
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <input type="number" {...register('year', { required: true })} className={inputClass} placeholder="2023" />
            </div>
            <div>
              <label className={labelClass}>Document/Photo (PDF/Image)</label>
              <input type="file" {...register('file', { required: true })} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
            </div>
            <button type="submit" disabled={addMutation.isPending} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all flex justify-center mt-2">
              {addMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Upload Award'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Your Awards</h3>
          {awards?.length === 0 && <p className="text-slate-400 text-sm italic">No awards added yet.</p>}
          {awards?.map(award => (
            <div key={award._id} className="bg-white border text-left border-slate-200 p-4 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">{award.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{award.awardedBy} • {award.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {award.url && <a href={award.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"><LinkIcon size={14} /></a>}
                <button onClick={() => deleteMutation.mutate(award._id)} disabled={deleteMutation.isPending} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---

export default function DoctorProfile() {
  const { data: doctorRes, isLoading: isDoctorLoading } = useDoctorData();
  const { data: profRes, isLoading: isProfLoading } = useDoctorProfessionalInfo();
  
  const [activeTab, setActiveTab] = useState('basic');

  const doctorData = doctorRes?.data?.basicInfo || {};
  const profInfo = profRes?.data?.professionalInfo || profRes?.professionalInfo || doctorData.professionalInfo || {};

  if (isDoctorLoading || isProfLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const TABS = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'professional', label: 'Professional Info', icon: Briefcase },
    { id: 'certificates', label: 'Certificates', icon: GraduationCap },
    { id: 'memberships', label: 'Memberships', icon: Bookmark },
    { id: 'awards', label: 'Awards', icon: Award },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10 fade-in animate-in slide-in-from-bottom-2 duration-500 font-sans">
      
      {/* ─── Top Verified Header ─── */}
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        {/* Avatar */}
        <div className="relative shrink-0 flex flex-col items-center w-full md:w-auto mt-2">
          <div className="relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${doctorData.firstName || 'Dr'}+${doctorData.lastName || 'Profile'}&background=0D8ABC&color=fff&size=200`}
              alt="Profile Logo"
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-xl object-cover relative z-10"
            />
            {doctorData.accountStatus !== 'incomplete' && doctorData.accountStatus !== 'pending_verification' && (
              <div className="absolute bottom-2 right-2 md:bottom-2 md:right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white z-20 shadow-md">
                <CheckCircle2 size={22} />
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-col items-center">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Phone size={14} /></div>
                <span className="text-sm font-bold text-slate-700">{doctorData.phone || '-'}</span>
             </div>
          </div>
        </div>

        {/* Read-only Data */}
        <div className="flex-1 w-full text-center md:text-left mt-2 md:mt-0 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
              Dr. {doctorData.firstName} {doctorData.lastName}
            </h1>
            <p className="text-blue-600 font-bold text-sm tracking-wide mt-1 uppercase">
              {profInfo.primarySpecialization || 'Specialization Not Set'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-6">
            <div className="flex gap-3 items-center text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
               <GraduationCap size={18} className="text-blue-500" />
               <div className="flex flex-col text-left">
                  <span className="font-bold">{profInfo.highestDegree || 'Degree Not Set'}</span>
                  <span className="text-xs text-slate-400">{profInfo.medicalSchool || 'Medical School Not Set'}</span>
               </div>
            </div>
            <div className="flex gap-3 items-center text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
               <Building2 size={18} className="text-purple-500" />
               <div className="flex flex-col text-left">
                  <span className="font-bold">{profInfo.currentPosition || 'Position Not Set'}</span>
                  <span className="text-xs text-slate-400">{profInfo.yearsOfExperience ? `${profInfo.yearsOfExperience} Years Experience` : 'Experience Not Set'}</span>
               </div>
            </div>
          </div>

          {profInfo.bio && (
             <div className="mt-6 pt-6 border-t border-slate-100/60">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">About Me</h3>
                <p className="text-sm text-slate-600 leading-relaxed md:max-w-3xl text-left bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                   {profInfo.bio}
                </p>
             </div>
          )}

          {profInfo.subSpecializations?.length > 0 && (
             <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                {profInfo.subSpecializations.map((spec, i) => (
                   <span key={i} className="bg-blue-50/80 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-wide border border-blue-100/50">
                      {spec}
                   </span>
                ))}
             </div>
          )}
          
          {profInfo.hospitalAffiliation?.length > 0 && (
             <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                {profInfo.hospitalAffiliation.map((hospital, i) => (
                   <span key={i} className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-wide border border-slate-200">
                      🏥 {hospital}
                   </span>
                ))}
             </div>
          )}

          {/* ----- Added Details (Certificates, Awards, Memberships) ----- */}
          {profInfo.certificates?.length > 0 && (
             <div className="mt-6 pt-6 border-t border-slate-100/60">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-2">
                   <FileText size={14} /> Certificates & Degrees
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {profInfo.certificates.map(cert => (
                      <div key={cert._id} className="flex gap-3 items-center text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                         <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <GraduationCap size={18} />
                         </div>
                         <div className="flex flex-col text-left">
                            <span className="font-bold">{cert.name}</span>
                            <span className="text-xs text-slate-500">{cert.institution} • {cert.Year}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {profInfo.awards?.length > 0 && (
             <div className="mt-4 pt-4 border-t border-slate-100/60">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-2">
                   <Award size={14} /> Awards & Honors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {profInfo.awards.map(award => (
                      <div key={award._id} className="flex gap-3 items-center text-sm text-slate-700 bg-amber-50/30 p-3 rounded-2xl border border-amber-100/50">
                         <div className="w-10 h-10 rounded-full bg-amber-100/50 text-amber-500 flex items-center justify-center shrink-0">
                            <Award size={18} />
                         </div>
                         <div className="flex flex-col text-left">
                            <span className="font-bold">{award.name}</span>
                            <span className="text-xs text-slate-500">{award.awardedBy} • {award.year}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {(profInfo.memberships?.length > 0 || profInfo.medicalMemberships?.length > 0) && (
             <div className="mt-4 pt-4 border-t border-slate-100/60">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-2">
                   <Bookmark size={14} /> Medical Memberships
                </h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                   {(profInfo.memberships || profInfo.medicalMemberships).map(mem => (
                      <span key={mem._id} className="bg-indigo-50/80 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100/50 flex items-center gap-2">
                         <Bookmark size={14} /> {mem.nameOfAssociation} 
                         <span className="text-[10px] text-indigo-400/80 font-black tracking-wide">(Since {mem.Since})</span>
                      </span>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* ─── Main Tabs Navigation ─── */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-2 custom-scrollbar hide-scrollbar-mobile">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={tabBtn(activeTab === tab.id)}
            >
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Tab Content Box ─── */}
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100 min-h-[400px]">
        {activeTab === 'basic' && <BasicInfoTab doctorData={doctorData} />}
        {activeTab === 'professional' && <ProfessionalInfoTab profInfo={profInfo} />}
        {activeTab === 'certificates' && <CertificatesTab certificates={profInfo.certificates} />}
        {activeTab === 'memberships' && <MembershipsTab memberships={profInfo.memberships || profInfo.medicalMemberships} />}
        {activeTab === 'awards' && <AwardsTab awards={profInfo.awards} />}
      </div>

    </div>
  );
}
