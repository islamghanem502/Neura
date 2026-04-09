import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  User, ShieldCheck, MapPin, Calendar, CheckCircle, Search, Bell,
  Loader2, Lock, BadgeCheck, Shield, Headphones, AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, ArrowRight, Info, LogOut
} from 'lucide-react';
import { useLogout } from '../../../hooks/useAuth';
import {
  useDoctorData,
  useCreateDoctorBasicInfo,
  useUpdateDoctorBasicInfo,
  useUpdateDoctorProfessionalInfo,
  useUploadDoctorDocument,
  useSubmitDoctorProfile,
  useUploadProfileImage,
  useDeleteProfileImage,
  useAddClinicInfo,
  useAddDoctorCertificate,
  useAddDoctorMembership,
  useAddDoctorAward,
} from '../../../hooks/useDoctorData';

const SIDEBAR_STEPS = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Credentials', icon: ShieldCheck },
  { id: 3, title: 'Clinic Location', icon: MapPin },
  { id: 4, title: 'Verification', icon: CheckCircle },
];

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { data: doctorRes, isLoading } = useDoctorData();
  const { logout } = useLogout();
  const createBasicInfoMutation = useCreateDoctorBasicInfo();
  const updateBasicInfoMutation = useUpdateDoctorBasicInfo();
  const profInfoMutation = useUpdateDoctorProfessionalInfo();
  const addCertificateMutation = useAddDoctorCertificate();
  const addMembershipMutation = useAddDoctorMembership();
  const addAwardMutation = useAddDoctorAward();
  const uploadDocMutation = useUploadDoctorDocument();
  const submitDoctorProfileMutation = useSubmitDoctorProfile();
  const uploadProfileImageMutation = useUploadProfileImage();
  const deleteProfileImageMutation = useDeleteProfileImage();
  const clinicMutation = useAddClinicInfo();

  // Determine if basic info already exists (has been saved before)
  // We use the presence of firstName/phone populated from API as a signal
  const basicInfoExists = !!(doctorRes?.data?.basicInfo?.phone || doctorRes?.data?.basicInfo?.firstName);

  const [clinicForm, setClinicForm] = useState({
    clinicName: '',
    address: {
      governorate: '',
      city: '',
      street: '',
    },
    phone: '',
    availableHours: [
      { day: 'Friday', startTime: '15:00', endTime: '18:00' },
      { day: 'Saturday', startTime: '20:00', endTime: '22:00' }
    ],
    consultationDuration: 15,
    consultationFee: 500,
    followUpFee: 200
  });

  const doctorData = doctorRes?.data?.basicInfo || doctorRes || {};

  const { register: registerBasic, handleSubmit: handleSubmitBasic, formState: { isValid } } = useForm({
    mode: 'onChange',
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
      yearsOfExperience: doctorData.professionalInfo?.yearsOfExperience || 0,
      primarySpecialization: doctorData.professionalInfo?.primarySpecialization || '',
      awards: doctorData.professionalInfo?.awards?.join(', ') || '',
      certificates: doctorData.professionalInfo?.certificates?.join(', ') || '',
      hospitalAffiliation: doctorData.professionalInfo?.hospitalAffiliation?.join(', ') || '',
      medicalMemberships: doctorData.professionalInfo?.medicalMemberships?.join(', ') || '',
      subSpecializations: doctorData.professionalInfo?.subSpecializations?.join(', ') || '',
    }
  });

  const [docMeta, setDocMeta] = useState({
    medicalLicense: { licenseNumber: '', registrationNumber: '', issueDate: '', expiryDate: '' },
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
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const onBasicSubmit = async (data) => {
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

    // Fields the bulk professional-info PATCH endpoint supports directly
    const profPayload = {
      yearsOfExperience: Number(data.yearsOfExperience),
      primarySpecialization: data.primarySpecialization,
      hospitalAffiliation: data.hospitalAffiliation
        ? data.hospitalAffiliation.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      subSpecializations: data.subSpecializations
        ? data.subSpecializations.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

    // Fields that require individual POST calls to sub-resource endpoints
    const certificateNames = data.certificates
      ? data.certificates.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const membershipNames = data.medicalMemberships
      ? data.medicalMemberships.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const awardNames = data.awards
      ? data.awards.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const currentYear = new Date().getFullYear();

    // Use POST if creating for the first time, PATCH if updating
    const basicMutation = basicInfoExists ? updateBasicInfoMutation : createBasicInfoMutation;

    basicMutation.mutate(payload, {
      onSuccess: () => {
        profInfoMutation.mutate(profPayload, {
          onSuccess: async () => {
            try {
              // POST each certificate individually
              for (const name of certificateNames) {
                const fd = new FormData();
                fd.append('name', name);
                fd.append('institution', '');
                fd.append('Year', String(currentYear));
                await addCertificateMutation.mutateAsync(fd);
              }
              // POST each membership individually
              for (const nameOfAssociation of membershipNames) {
                await addMembershipMutation.mutateAsync({
                  nameOfAssociation,
                  Since: currentYear,
                });
              }
              // POST each award individually
              for (const name of awardNames) {
                const fd = new FormData();
                fd.append('name', name);
                fd.append('awardedBy', '');
                await addAwardMutation.mutateAsync(fd);
              }
              setCurrentStep(2);
            } catch {
              // Errors are toasted by individual hooks; still advance
              setCurrentStep(2);
            }
          },
        });
      },
    });
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    uploadProfileImageMutation.mutate(formData);
    e.target.value = null;
  };

  const handleProfileImageDelete = () => {
    if (confirm('Are you sure you want to delete your profile picture?')) {
      deleteProfileImageMutation.mutate();
    }
  };

  const handleFileUpload = (e, documentType) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    if (documentType === 'medicalLicense') {
      const meta = docMeta.medicalLicense;
      if (!meta.licenseNumber || !meta.issueDate || !meta.expiryDate) {
        toast.error('Please fill all license details first');
        e.target.value = null;
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
        e.target.value = null;
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
        e.target.value = null;
        return;
      }
      formData.append('syndicateNumber', meta.syndicateNumber);
      formData.append('issueDate', meta.issueDate);
    }

    const kebabCaseType = documentType.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    uploadDocMutation.mutate({ documentType: kebabCaseType, formData });
    e.target.value = null;
  };

  const handleCombinedUpload = (e) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const { licenseNumber, issueDate: licIssueDate, expiryDate: licExpiryDate } = docMeta.medicalLicense;
    const { university, degree, graduationYear } = docMeta.medicalDegree;

    if (!licenseNumber || !university || !degree) {
      toast.error('Please fill the text fields above before uploading certificates');
      e.target.value = null;
      return;
    }
    if (!licIssueDate || !licExpiryDate) {
      toast.error('Please fill the license issue and expiry dates');
      e.target.value = null;
      return;
    }
    if (!graduationYear) {
      toast.error('Please fill the graduation year');
      e.target.value = null;
      return;
    }

    // Upload as Medical License using actual user-provided dates
    const formDataLicense = new FormData();
    formDataLicense.append('file', file);
    formDataLicense.append('licenseNumber', licenseNumber);
    formDataLicense.append('issueDate', licIssueDate);
    formDataLicense.append('expiryDate', licExpiryDate);
    uploadDocMutation.mutate({ documentType: 'medical-license', formData: formDataLicense });

    // Also upload as Medical Degree using actual user-provided graduation year
    const formDataDegree = new FormData();
    formDataDegree.append('file', file);
    formDataDegree.append('university', university);
    formDataDegree.append('graduationYear', String(graduationYear));
    formDataDegree.append('degree', degree);
    uploadDocMutation.mutate({ documentType: 'medical-degree', formData: formDataDegree });

    e.target.value = null;
  };

  const reqDocs = doctorData.requiredDocuments || {};
  const credentialsChecklist = [
    { key: 'medicalDegree', label: 'Medical Degree', status: reqDocs.medicalDegree?.status },
    { key: 'medicalLicense', label: 'Medical License', status: reqDocs.medicalLicense?.status },
  ];

  const verificationChecklist = [
    { key: 'nationalIdFront', label: 'National ID (Front)', status: reqDocs.nationalId?.front?.status },
    { key: 'nationalIdBack', label: 'National ID (Back)', status: reqDocs.nationalId?.back?.status },
    { key: 'syndicateCard', label: 'Syndicate Card', status: reqDocs.syndicateCard?.status },
  ];

  const inputClass = "w-full bg-[#f3f4f6] text-slate-700 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400";
  const labelClass = "text-[11px] font-bold text-slate-700 mb-2 block";

  const stepTitles = {
    1: 'Professional Identity',
    2: 'Academic & Professional Credentials',
    3: 'Clinic Location',
    4: 'Required Verification'
  };

  const stepDescriptions = {
    1: "Welcome to Clinical Ethereal. Let's begin by establishing your professional profile within our secure medical network.",
    2: "Please provide your official medical registration and identity verification documents. This information will be verified against global registries.",
    3: "Set up your clinic locations for patient appointments.",
    4: "Complete the remaining verification procedures."
  };

  const isStep2Valid = docMeta.medicalLicense.licenseNumber &&
    docMeta.medicalLicense.registrationNumber &&
    docMeta.medicalLicense.issueDate &&
    docMeta.medicalLicense.expiryDate &&
    docMeta.medicalDegree.university &&
    docMeta.medicalDegree.graduationYear &&
    docMeta.medicalDegree.degree;

  const isStep3Valid = clinicForm.clinicName &&
    clinicForm.phone &&
    clinicForm.consultationDuration > 0 &&
    clinicForm.address.governorate &&
    clinicForm.address.city &&
    clinicForm.address.street &&
    clinicForm.consultationFee > 0 &&
    clinicForm.followUpFee > 0;

  const renderDocumentCard = (doc) => {
    const isUploaded = doc.status === 'uploaded' || doc.status === 'pending' || doc.status === 'verified';
    return (
      <div key={doc.key} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-blue-100 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isUploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-[#f3f4f6] text-slate-400'}`}>
              {isUploaded ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-800">{doc.label}</h4>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5 block">{doc.status?.replace('_', ' ') || 'Action Required'}</span>
            </div>
          </div>

          {!isUploaded && (
            <label className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-xl text-[11px] font-black transition-colors">
              {uploadDocMutation.isPending && uploadDocMutation.variables?.documentType === doc.key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
                ? <Loader2 size={14} className="animate-spin" />
                : 'UPLOAD'}
              <input type="file" className="hidden" disabled={uploadDocMutation.isPending} onChange={(e) => handleFileUpload(e, doc.key)} />
            </label>
          )}
        </div>

        {!isUploaded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-50">
            {doc.key === 'medicalDegree' && (
              <>
                <input placeholder="University" className={inputClass} onChange={(e) => handleDocMetaChange(doc.key, 'university', e.target.value)} />
                <input type="number" placeholder="Graduation Year" className={inputClass} onChange={(e) => handleDocMetaChange(doc.key, 'graduationYear', e.target.value)} />
                <input placeholder="Degree (MBBCh)" className={inputClass} onChange={(e) => handleDocMetaChange(doc.key, 'degree', e.target.value)} />
              </>
            )}
            {doc.key === 'medicalLicense' && (
              <>
                <input placeholder="License #" className={inputClass} onChange={(e) => handleDocMetaChange(doc.key, 'licenseNumber', e.target.value)} />
                <input type="date" className={inputClass} onChange={(e) => handleDocMetaChange(doc.key, 'issueDate', e.target.value)} />
                <input type="date" className={inputClass} onChange={(e) => handleDocMetaChange(doc.key, 'expiryDate', e.target.value)} />
              </>
            )}
            {doc.key === 'syndicateCard' && (
              <>
                <input placeholder="Syndicate #" className={`${inputClass} col-span-2`} onChange={(e) => handleDocMetaChange(doc.key, 'syndicateNumber', e.target.value)} />
                <input type="date" className={inputClass} onChange={(e) => handleDocMetaChange(doc.key, 'issueDate', e.target.value)} />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">

      {/* LEFT SIDEBAR */}
      <aside className="w-64 md:w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">NEURA</h1>
        </div>

        <div className="px-8 mb-6">
          <h2 className="text-[13px] font-bold text-slate-800">Onboarding</h2>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Step {currentStep} of 4</p>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {SIDEBAR_STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-default transition-all ${isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 font-medium'
                  }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span className="text-[13px]">{step.title}</span>
              </div>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-slate-50 rounded-3xl p-4 flex items-center gap-3 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm shadow-blue-200">
              {Math.round((currentStep / 4) * 100)}%
            </div>
            <span className="text-[11px] font-bold text-slate-600">Profile Strength</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header - Transparent/Clean matching mockup */}
        <header className="h-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-4 text-slate-400" />
              <input
                disabled
                type="text"
                placeholder="Search patients, records, or files..."
                className="w-full bg-white rounded-full pl-11 pr-4 py-2.5 text-sm outline-none shadow-sm text-slate-600 border border-slate-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-6">
            <button className="text-slate-500 hover:text-slate-800 transition-colors">
              <Bell size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${doctorData?.firstName || 'Dr'}+${doctorData?.lastName || 'U'}&background=e2e8f0&color=475569`}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  alt="Avatar"
                />
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Dr. {doctorData?.lastName || 'User'} <ChevronRight size={14} className={`text-slate-400 transition-transform ${profileMenuOpen ? '-rotate-90' : 'rotate-90'}`} />
                </span>
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-[12px] font-bold text-slate-800">Dr. {doctorData?.firstName} {doctorData?.lastName}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{doctorData?.email}</p>
                    </div>
                    <button
                      onClick={() => { setProfileMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-auto p-4 md:p-8 pt-6">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-blue-600 mb-2">Getting Started</h4>
              <h2 className="text-[32px] font-bold tracking-tight text-slate-900 mb-2">{stepTitles[currentStep]}</h2>
              <p className="text-slate-500 font-medium text-[14px] max-w-2xl">{stepDescriptions[currentStep]}</p>
            </div>

            <div className="pb-20">

              {/* Step 1: Basic Info Grid Match */}
              {currentStep === 1 && (
                <div className="animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 mb-6">

                    {/* Left Card: Profile Photo */}
                    <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center shadow-sm border border-slate-100/60">
                      <h3 className="w-full text-left font-bold text-slate-800 mb-8">Profile Photo</h3>

                      <div className="relative w-48 h-48 rounded-full bg-slate-200 mb-8 w-max h-max mx-auto group">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-white shadow-xl shadow-slate-200">
                          <img
                            src={doctorData?.profileImage || `https://ui-avatars.com/api/?name=${doctorData?.firstName || 'Dr'}+${doctorData?.lastName || 'U'}&background=e2e8f0&color=475569&size=200`}
                            alt="Doctor Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {doctorData?.profileImage && (
                          <button
                            onClick={handleProfileImageDelete}
                            disabled={deleteProfileImageMutation.isPending}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                            title="Remove image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        {uploadProfileImageMutation.isPending && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full z-10">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                          </div>
                        )}
                      </div>

                      <p className="text-center text-[13px] text-slate-500 font-medium px-2 mb-8 leading-relaxed">
                        Please provide a clear professional headshot. This will be visible to colleagues and verified during credentialing.
                      </p>

                      <label className="w-full py-3.5 bg-slate-100 text-blue-600 font-bold text-[13px] rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer text-center block">
                        {uploadProfileImageMutation.isPending ? 'Uploading...' : 'Upload New Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                          disabled={uploadProfileImageMutation.isPending}
                        />
                      </label>
                    </div>

                    {/* Right Card: Basic Information Form */}
                    <form onSubmit={handleSubmitBasic(onBasicSubmit)} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60 flex flex-col relative overflow-hidden">
                      <h3 className="font-bold text-slate-800 mb-8">Basic Information</h3>

                      <div className="space-y-6 flex-1">
                        <div>
                          <label className={labelClass}>Full Professional Name</label>
                          <div className="grid grid-cols-2 gap-3">
                            <input {...registerBasic('firstName', { required: true })} className={inputClass} placeholder="First Name" />
                            <input {...registerBasic('lastName', { required: true })} className={inputClass} placeholder="Last Name" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                            Email Address <Lock size={12} className="text-emerald-500" />
                          </label>
                          <input
                            disabled
                            value={doctorData?.email || 'N/A'}
                            className={`${inputClass} opacity-60 cursor-not-allowed`}
                          />
                          <p className="text-[10px] text-slate-400 mt-1.5 font-medium ml-1">Verified via invitation link</p>
                        </div>

                        <div>
                          <label className={labelClass}>Phone Number</label>
                          <input {...registerBasic('phone', { required: true })} className={inputClass} placeholder="+1 (555) 000-0000" />
                        </div>

                        {/* Technical Details (Collapsed aesthetics so it doesn't ruin the main flow visually) */}
                        <div className="pt-6 border-t border-slate-100 mt-6 !mb-2">
                          {/* <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">Additional Requirements</p> */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className={labelClass}>Gender</label>
                              <select {...registerBasic('gender', { required: true })} className={inputClass + ' appearance-none'}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Date of Birth</label>
                              <input type="date" {...registerBasic('dateOfBirth', { required: true })} className={inputClass} />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className={labelClass}>National ID</label>
                            <input {...registerBasic('nationalId', { required: true })} className={inputClass} placeholder="14 Digits" />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <input {...registerBasic('address.governorate', { required: true })} className={inputClass} placeholder="Gov." />
                            <input {...registerBasic('address.city', { required: true })} className={inputClass} placeholder="City" />
                            <input {...registerBasic('address.street', { required: true })} className={inputClass} placeholder="Street" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                            <div>
                              <label className={labelClass}>Years of Experience</label>
                              <input type="number" {...registerBasic('yearsOfExperience', { required: true })} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Primary Specialization</label>
                              <input {...registerBasic('primarySpecialization', { required: true })} className={inputClass} placeholder="e.g. Cardiology" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className={labelClass}>Sub Specializations (Comma separated)</label>
                              <input {...registerBasic('subSpecializations')} className={inputClass} placeholder="e.g. Interventional Cardiology, Echocardiography" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className={labelClass}>Hospital Affiliations (Comma separated)</label>
                              <input {...registerBasic('hospitalAffiliation')} className={inputClass} placeholder="e.g. Cairo University Hospital" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className={labelClass}>Medical Memberships (Comma separated)</label>
                              <input {...registerBasic('medicalMemberships')} className={inputClass} placeholder="e.g. Egyptian Society of Cardiology" />
                            </div>
                            <div>
                              <label className={labelClass}>Awards (Comma separated)</label>
                              <input {...registerBasic('awards')} className={inputClass} placeholder="e.g. Best Researcher 2023" />
                            </div>
                            <div>
                              <label className={labelClass}>Certificates (Comma separated)</label>
                              <input {...registerBasic('certificates')} className={inputClass} placeholder="e.g. ACLS, BLS" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-8 pt-4">
                        <p className="text-[10px] max-w-[200px] leading-relaxed text-slate-400 font-medium pb-2">
                          All information is stored securely in accordance with HIPAA standards.
                        </p>

                        <button
                          type="submit"
                          disabled={createBasicInfoMutation.isPending || updateBasicInfoMutation.isPending || !isValid}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[13px] flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:active:scale-100"
                        >
                          {(createBasicInfoMutation.isPending || updateBasicInfoMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <>Next Step <ArrowRight size={16} /></>}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Bottom Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                      <BadgeCheck size={20} className="text-emerald-600 mb-4" />
                      <h4 className="font-bold text-slate-800 text-[13px] mb-2">Verified Identity</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-4">
                        Your data is cross-referenced with NPI and medical board databases.
                      </p>
                    </div>

                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                      <Shield size={20} className="text-blue-600 mb-4" />
                      <h4 className="font-bold text-slate-800 text-[13px] mb-2">Data Privacy</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-4">
                        We use end-to-end encryption for all sensitive professional data.
                      </p>
                    </div>

                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                      <Headphones size={20} className="text-indigo-600 mb-4" />
                      <h4 className="font-bold text-slate-800 text-[13px] mb-2">Concierge Onboarding</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-4">
                        Need help? Our onboarding specialists are available 24/7.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Credentials & Licenses */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-500 max-w-2xl">
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60">

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Medical License Number</label>
                        <input
                          className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                          placeholder="MD-8829-XJ"
                          onChange={(e) => handleDocMetaChange('medicalLicense', 'licenseNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Registration Number</label>
                        <input
                          className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                          placeholder="REG-22910-00"
                          onChange={(e) => handleDocMetaChange('medicalLicense', 'registrationNumber', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">License Issue Date</label>
                        <input
                          type="date"
                          className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium"
                          onChange={(e) => handleDocMetaChange('medicalLicense', 'issueDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">License Expiry Date</label>
                        <input
                          type="date"
                          className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium"
                          onChange={(e) => handleDocMetaChange('medicalLicense', 'expiryDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">University / Medical School</label>
                        <input
                          className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                          placeholder="e.g. Johns Hopkins School of Medicine"
                          onChange={(e) => handleDocMetaChange('medicalDegree', 'university', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Graduation Year</label>
                        <input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                          placeholder="e.g. 2015"
                          onChange={(e) => handleDocMetaChange('medicalDegree', 'graduationYear', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Primary Degree / Specialization</label>
                      <select
                        className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400 appearance-none"
                        onChange={(e) => handleDocMetaChange('medicalDegree', 'degree', e.target.value)}
                      >
                        <option value="">Select Degree</option>
                        <option value="Doctor of Medicine (MD)">Doctor of Medicine (MD)</option>
                        <option value="Doctor of Osteopathic Medicine (DO)">Doctor of Osteopathic Medicine (DO)</option>
                        <option value="Bachelor of Medicine, Bachelor of Surgery (MBBS)">Bachelor of Medicine, Bachelor of Surgery (MBBS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-4 block uppercase tracking-wider">Upload Digital Certificates</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-[#fafbfc] transition-colors hover:bg-slate-50 relative group">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /><path d="M12 15v-6" /><path d="m9 12 3-3 3 3" /></svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-slate-800 mb-1">Drag and drop your certificates here</h4>
                        <p className="text-[12px] text-slate-500 font-medium mb-5">PDF, PNG or JPG (Max 10MB per file)</p>
                        <label className="bg-white border border-slate-200 text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 px-6 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-all shadow-sm">
                          {uploadDocMutation.isPending ? 'Uploading...' : 'Browse Files'}
                          <input
                            type="file"
                            className="hidden"
                            disabled={uploadDocMutation.isPending}
                            onChange={(e) => handleCombinedUpload(e)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {verificationChecklist.map(renderDocumentCard)}
                  </div>

                  <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition-all text-sm">
                      <ArrowLeft size={16} /> Previous Step
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!isStep2Valid}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[13px] shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                      Save and Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Clinic Location */}
              {currentStep === 3 && (
                <div className="animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

                    {/* Left Column: Form */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-bold text-slate-800 text-[16px] mb-1">Primary Practice</h3>
                            <p className="text-[13px] text-slate-500 font-medium">Provide details for your main consulting location.</p>
                          </div>
                          <div className="bg-[#e2f5ee] text-emerald-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md">
                            ACTIVE
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Clinic Name</label>
                              <input
                                className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                placeholder="e.g. Skin & Care Center"
                                value={clinicForm.clinicName}
                                onChange={(e) => setClinicForm({ ...clinicForm, clinicName: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Contact Phone</label>
                              <input
                                className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                placeholder="01069167252"
                                value={clinicForm.phone}
                                onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Duration (mins)</label>
                              <input
                                type="number"
                                className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                placeholder="e.g. 15"
                                value={clinicForm.consultationDuration}
                                onChange={(e) => setClinicForm({ ...clinicForm, consultationDuration: Number(e.target.value) || 0 })}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Clinic Address</label>
                            <div className="grid grid-cols-3 gap-3">
                              <input
                                className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                placeholder="Governorate"
                                value={clinicForm.address.governorate}
                                onChange={(e) => setClinicForm({ ...clinicForm, address: { ...clinicForm.address, governorate: e.target.value } })}
                              />
                              <input
                                className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                placeholder="City"
                                value={clinicForm.address.city}
                                onChange={(e) => setClinicForm({ ...clinicForm, address: { ...clinicForm.address, city: e.target.value } })}
                              />
                              <input
                                className="w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                placeholder="Street"
                                value={clinicForm.address.street}
                                onChange={(e) => setClinicForm({ ...clinicForm, address: { ...clinicForm.address, street: e.target.value } })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Consultation Fee</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[12px]">EGP</span>
                                <input
                                  type="number"
                                  className="w-full bg-[#f8fafc] text-slate-700 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                  placeholder="500"
                                  value={clinicForm.consultationFee}
                                  onChange={(e) => setClinicForm({ ...clinicForm, consultationFee: Number(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">Follow-up Fee</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[12px]">EGP</span>
                                <input
                                  type="number"
                                  className="w-full bg-[#f8fafc] text-slate-700 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400"
                                  placeholder="200"
                                  value={clinicForm.followUpFee}
                                  onChange={(e) => setClinicForm({ ...clinicForm, followUpFee: Number(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      <button className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 font-bold text-[13px] hover:bg-slate-50 hover:border-slate-300 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-slate-200 transition-colors text-slate-500">
                          <span className="text-[20px] font-light leading-none mb-0.5">+</span>
                        </div>
                        + Add Another Clinic
                      </button>

                      <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={() => setCurrentStep(2)} className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition-all text-[14px]">
                          <ArrowLeft size={18} /> Previous Step
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clinicMutation.mutate({
                              clinicName: clinicForm.clinicName,
                              address: clinicForm.address,
                              phone: clinicForm.phone,
                              availableHours: clinicForm.availableHours,
                              consultationDuration: clinicForm.consultationDuration,
                              consultationFee: clinicForm.consultationFee,
                              followUpFee: clinicForm.followUpFee
                            }, {
                              onSuccess: () => setCurrentStep(4)
                            });
                          }}
                          disabled={clinicMutation.isPending || !isStep3Valid}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[14px] shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                          {clinicMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>Continue to Verification <ArrowRight size={18} /></>}
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Info Cards */}
                    <div className="space-y-4">
                      <div className="bg-[#f8fafc] rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-[14px] mb-3">
                          <Info size={18} className="text-blue-600" />
                          <span>Why we need this</span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed pr-2">
                          This information will be used to populate your public profile and allow patients to book appointments at specific physical locations. You can always edit these later in your settings.
                        </p>
                      </div>

                      <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-300 h-48 shadow-sm shrink-0">
                        <div className="absolute inset-0 bg-slate-400 mix-blend-multiply opacity-20"></div>
                        {/* Pseudo map visual using pure CSS styling since image asset is missing */}
                        <div className="absolute inset-0 flex items-center justify-center translate-y-[-10px] scale-110">
                          <div className="w-full h-10 border-t border-b border-white/20 rotate-12 bg-slate-100/10"></div>
                          <div className="absolute w-10 h-full border-l border-r border-white/20 -rotate-12 bg-slate-100/10"></div>
                        </div>
                        <div className="absolute top-[40%] left-[30%]">
                          <MapPin size={24} className="text-slate-500" fill="currentColor" opacity="0.5" />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 flex items-center gap-2 shadow-sm border border-white/40">
                          <MapPin size={20} className="text-blue-600" />
                          <span className="text-[13px] font-bold text-slate-800">Clinic Map Verification</span>
                        </div>
                      </div>

                      <div className="bg-[#f0fbfa] border-l-[3px] border-emerald-500 rounded-r-[2rem] rounded-l-xl p-6 shadow-sm">
                        <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2">TIP</h4>
                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                          Adding multiple clinics can increase your visibility to patients in different neighborhoods by up to 45%.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Step 4: Verification Placeholder until implementation */}
              {currentStep === 4 && (
                <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100/60 animate-in fade-in duration-500 max-w-2xl">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Verification (Coming Soon)</h3>
                  <p className="text-slate-500 mb-8 text-[14px]">This section is currently under development.</p>

                  <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition-all text-sm">
                      <ArrowLeft size={16} /> Previous Step
                    </button>
                    <button
                      onClick={() => submitDoctorProfileMutation.mutate()}
                      disabled={submitDoctorProfileMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[13px] shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitDoctorProfileMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Complete Setup Early
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
