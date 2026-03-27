import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  User, Briefcase, FileText, CheckCircle2, ChevronRight, UploadCloud, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react';
import {
  useDoctorData,
  useUpdateDoctorBasicInfo,
  useUpdateDoctorProfessionalInfo,
  useUploadDoctorDocument,
  useSubmitDoctorProfile
} from '../../hooks/useDoctorData';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Professional Info', icon: Briefcase },
  { id: 3, title: 'Documents', icon: FileText }
];

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { data: doctorRes, isLoading } = useDoctorData();
  const basicInfoMutation = useUpdateDoctorBasicInfo();
  const profInfoMutation = useUpdateDoctorProfessionalInfo();
  const uploadDocMutation = useUploadDoctorDocument();
  const submitDoctorProfileMutation = useSubmitDoctorProfile();

  const doctorData = doctorRes || {};

  // Form Configurations
  const { register: registerBasic, handleSubmit: handleSubmitBasic } = useForm({
    values: {
      firstName: doctorData.firstName || '',
      lastName: doctorData.lastName || '',
      phone: doctorData.phone || '',
      gender: doctorData.gender || 'male',
      dateOfBirth: doctorData.dateOfBirth ? doctorData.dateOfBirth.split('T')[0] : '',
      nationalId: doctorData.nationalId || '',
      'address.governorate': doctorData.address?.governorate || '',
      'address.city': doctorData.address?.city || '',
      'address.street': doctorData.address?.street || '',
    }
  });

  const { register: registerProf, handleSubmit: handleSubmitProf } = useForm({
    values: {
      yearsOfExperience: doctorData.professionalInfo?.yearsOfExperience || 0,
      primarySpecialization: doctorData.professionalInfo?.primarySpecialization || '',
    }
  });

  // Metadata State for Documents
  const [docMeta, setDocMeta] = useState({
    medicalLicense: { licenseNumber: '', issueDate: '', expiryDate: '' },
    medicalDegree: { university: '', graduationYear: '', degree: '' },
    syndicateCard: { syndicateNumber: '', issueDate: '' }
  });

  const handleDocMetaChange = (docKey, field, value) => {
    setDocMeta(prev => ({
      ...prev,
      [docKey]: { ...prev[docKey], [field]: value }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  const onBasicSubmit = (data) => {
    // Format nested objects and numbers
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      nationalId: data.nationalId,
      address: {
        governorate: data['address.governorate'],
        city: data['address.city'],
        street: data['address.street']
      }
    };
    basicInfoMutation.mutate(payload, { onSuccess: () => setCurrentStep(2) });
  };

  const onProfSubmit = (data) => {
    const payload = {
      yearsOfExperience: Number(data.yearsOfExperience),
      primarySpecialization: data.primarySpecialization
    };
    profInfoMutation.mutate(payload, { onSuccess: () => setCurrentStep(3) });
  };

  const handleFileUpload = (e, documentType) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    // Validation & Appending Metadata
    if (documentType === 'medicalLicense') {
      const meta = docMeta.medicalLicense;
      if (!meta.licenseNumber || !meta.issueDate || !meta.expiryDate) {
        toast.error('Please fill all license details first');
        return;
      }
      formData.append('licenseNumber', meta.licenseNumber);
      formData.append('issueDate', meta.issueDate);
      formData.append('expiryDate', meta.expiryDate);
    }
    else if (documentType === 'medicalDegree') {
      const meta = docMeta.medicalDegree;
      if (!meta.university || !meta.graduationYear || !meta.degree) {
        toast.error('Please fill all degree details first');
        return;
      }
      formData.append('university', meta.university);
      formData.append('graduationYear', String(meta.graduationYear));
      formData.append('degree', meta.degree);
    }
    else if (documentType === 'syndicateCard') {
      const meta = docMeta.syndicateCard;
      if (!meta.syndicateNumber || !meta.issueDate) {
        toast.error('Please fill all syndicate card details first');
        return;
      }
      formData.append('syndicateNumber', meta.syndicateNumber);
      formData.append('issueDate', meta.issueDate);
    }

    const kebabCaseType = documentType.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    uploadDocMutation.mutate({ documentType: kebabCaseType, formData });
    e.target.value = null;
  };

  const reqDocs = doctorData.requiredDocuments || {};
  const checklist = [
    { key: 'nationalIdFront', label: 'National ID (Front)', status: reqDocs.nationalId?.front?.status },
    { key: 'nationalIdBack', label: 'National ID (Back)', status: reqDocs.nationalId?.back?.status },
    { key: 'medicalDegree', label: 'Medical Degree', status: reqDocs.medicalDegree?.status },
    { key: 'syndicateCard', label: 'Syndicate Card', status: reqDocs.syndicateCard?.status },
    { key: 'medicalLicense', label: 'Medical License', status: reqDocs.medicalLicense?.status },
  ];

  const inputClass = "w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-3.5 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-600/50 focus:ring-4 focus:ring-emerald-600/5 transition-all text-sm";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase ml-1 tracking-wider";

  return (
    <div className="min-h-full bg-[#0a0f1d] text-slate-300 p-4 md:p-8 rounded-[2.5rem] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">

        <header className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Complete Profile</h1>
          <p className="text-slate-500 text-sm">Follow the steps to verify your medical account</p>
        </header>

        {/* Minimal Stepper */}
        <div className="flex items-center justify-between mb-12 px-2 md:px-10">
          {STEPS.map((step, index) => {
            const isActive = currentStep >= step.id;
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900 text-slate-600 border border-slate-800'
                    }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-black ${isActive ? 'text-emerald-500' : 'text-slate-700'}`}>
                    {step.title}
                  </span>
                </div>
                {index !== STEPS.length - 1 && (
                  <div className={`h-[1px] flex-1 mx-2 md:mx-4 transition-colors duration-700 ${currentStep > step.id ? 'bg-emerald-600/40' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 md:p-10 rounded-[2rem]">

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmitBasic(onBasicSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>First Name</label>
                  <input {...registerBasic('firstName')} className={inputClass} placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Last Name</label>
                  <input {...registerBasic('lastName')} className={inputClass} placeholder="Enter last name" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Phone Number</label>
                  <input {...registerBasic('phone')} className={inputClass} placeholder="010..." />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Gender</label>
                  <select {...registerBasic('gender')} className={inputClass}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" {...registerBasic('dateOfBirth')} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>National ID</label>
                  <input {...registerBasic('nationalId')} className={inputClass} placeholder="14 Digits" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Governorate</label>
                  <input {...registerBasic('address.governorate')} className={inputClass} placeholder="e.g. Cairo" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>City</label>
                  <input {...registerBasic('address.city')} className={inputClass} placeholder="e.g. Nasr City" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Street</label>
                  <input {...registerBasic('address.street')} className={inputClass} placeholder="e.g. 10 Makram Ebeid" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={basicInfoMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95">
                  {basicInfoMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>Next Step <ChevronRight size={18} /></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Professional Info */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmitProf(onProfSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Years of Experience</label>
                  <input type="number" {...registerProf('yearsOfExperience')} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Primary Specialization</label>
                  <input {...registerProf('primarySpecialization')} className={inputClass} placeholder="e.g. Cardiology" />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setCurrentStep(1)} className="text-slate-500 hover:text-white font-bold flex items-center gap-2 transition-all">
                  <ArrowLeft size={18} /> Back
                </button>
                <button type="submit" disabled={profInfoMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95">
                  {profInfoMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>Next Step <ChevronRight size={18} /></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {checklist.map((doc) => {
                const isUploaded = doc.status === 'uploaded' || doc.status === 'pending' || doc.status === 'verified';
                return (
                  <div key={doc.key} className="bg-slate-950/20 border border-slate-800/40 rounded-2xl p-5 hover:border-emerald-600/20 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isUploaded ? 'bg-emerald-600/10 text-emerald-500' : 'bg-slate-900 text-slate-700'}`}>
                          {isUploaded ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{doc.label}</h4>
                          <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">{doc.status?.replace('_', ' ') || 'Action Required'}</span>
                        </div>
                      </div>

                      {!isUploaded && (
                        <label className="relative overflow-hidden cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-black transition-all active:scale-95 shadow-lg shadow-emerald-900/10">
                          {uploadDocMutation.isPending && uploadDocMutation.variables?.documentType === doc.key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
                            ? <Loader2 size={14} className="animate-spin" />
                            : 'UPLOAD NOW'}
                          <input type="file" className="hidden" disabled={uploadDocMutation.isPending} onChange={(e) => handleFileUpload(e, doc.key)} />
                        </label>
                      )}
                    </div>

                    {/* Metadata Inputs for specific docs */}
                    {!isUploaded && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/30">
                        {doc.key === 'medicalDegree' && (
                          <>
                            <input placeholder="University" className={inputClass + " py-2 px-4"} onChange={(e) => handleDocMetaChange(doc.key, 'university', e.target.value)} />
                            <input type="number" placeholder="Graduation Year" className={inputClass + " py-2 px-4"} onChange={(e) => handleDocMetaChange(doc.key, 'graduationYear', e.target.value)} />
                            <input placeholder="Degree (MBBCh)" className={inputClass + " py-2 px-4"} onChange={(e) => handleDocMetaChange(doc.key, 'degree', e.target.value)} />
                          </>
                        )}
                        {doc.key === 'medicalLicense' && (
                          <>
                            <input placeholder="License #" className={inputClass + " py-2 px-4"} onChange={(e) => handleDocMetaChange(doc.key, 'licenseNumber', e.target.value)} />
                            <input type="date" className={inputClass + " py-2 px-4"} onChange={(e) => handleDocMetaChange(doc.key, 'issueDate', e.target.value)} />
                            <input type="date" className={inputClass + " py-2 px-4"} onChange={(e) => handleDocMetaChange(doc.key, 'expiryDate', e.target.value)} />
                          </>
                        )}
                        {doc.key === 'syndicateCard' && (
                          <>
                            <input placeholder="Syndicate #" className={inputClass + " py-2 px-4 col-span-2"} onChange={(e) => handleDocMetaChange(doc.key, 'syndicateNumber', e.target.value)} />
                            <input type="date" className={inputClass + " py-2 px-4"} onChange={(e) => handleDocMetaChange(doc.key, 'issueDate', e.target.value)} />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-8 border-t border-slate-800/50">
                <button type="button" onClick={() => setCurrentStep(2)} className="text-slate-500 hover:text-white font-bold flex items-center gap-2 transition-all">
                  <ArrowLeft size={18} /> Back
                </button>
                <button
                  onClick={() => submitDoctorProfileMutation.mutate()}
                  disabled={submitDoctorProfileMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitDoctorProfileMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Complete Setup
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}