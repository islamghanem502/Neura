import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDoctorData, useDoctorProfessionalInfo } from '../../../hooks/useDoctorData';
import { useLogout } from '../../../hooks/useAuth';
import { User, Briefcase, FileText, CheckCircle, Search, Bell, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { ProfessionalIdentityStep } from './components/ProfessionalIdentityStep';
import { ProfessionalInfoStep } from './components/ProfessionalInfoStep';
import { CredentialsAndDocuments } from './components/CredentialsAndDocuments';
import { VerificationStep } from './components/VerificationStep';

const TOTAL_STEPS = 4;

const SIDEBAR_STEPS = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Professional Info', icon: Briefcase },
  { id: 3, title: 'Documents & Credentials', icon: FileText },
  { id: 4, title: 'Verification', icon: CheckCircle },
];

const getProfileImageUrl = (doctorData) => {
  if (!doctorData) return null;
  if (typeof doctorData.profileImage === 'string') return doctorData.profileImage;
  return doctorData.profileImage?.imageUrl || null;
};

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: doctorRes, isLoading } = useDoctorData();
  const { data: profInfoRes } = useDoctorProfessionalInfo();
  const { logout } = useLogout();

  // When returning to Professional Info, always reload from GET /professional-info.
  useEffect(() => {
    if (currentStep !== 2) return;
    queryClient.refetchQueries({ queryKey: ['doctorProfessionalInfo'] });
  }, [currentStep, queryClient]);

  const [docMeta, setDocMeta] = useState({
    medicalLicense: { licenseNumber: '', issueDate: '', expiryDate: '' },
    medicalDegree: { university: '', graduationYear: '', degree: '' },
    syndicateCard: { syndicateNumber: '', issueDate: '' }
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#f8fafc]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  const basicInfoExists = !!(doctorRes?.data?.basicInfo?.phone || doctorRes?.data?.basicInfo?.firstName);
  const doctorData = doctorRes?.data?.basicInfo || doctorRes || {};
  // GET /professional-info returns { data: { professionalInfo: { awards, certificates, ... } } }.
  // Spreading profInfoRes.data would put awards under profData.professionalInfo.awards, not profData.awards.
  const fromBasicProf =
    doctorRes?.data?.professionalInfo || doctorData.professionalInfo || {};
  const fromProfEndpoint = profInfoRes?.data?.professionalInfo;
  const profData = {
    ...fromBasicProf,
    ...(fromProfEndpoint && typeof fromProfEndpoint === 'object' ? fromProfEndpoint : {}),
  };

  const stepTitles = {
    1: 'Professional Identity',
    2: 'Professional Information',
    3: 'Documents & Credentials',
    4: 'Required Verification'
  };

  const stepDescriptions = {
    1: "Welcome to Clinical Ethereal. Let's begin by establishing your professional profile within our secure medical network.",
    2: 'Add your clinical profile, memberships, and professional awards and certificates with supporting documents.',
    3: "Please provide your official medical registration, identity verification documents, and upload supporting files. This information will be verified against global registries.",
    4: "Complete the remaining verification procedures."
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
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Step {currentStep} of {TOTAL_STEPS}</p>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
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
              {Math.round((currentStep / TOTAL_STEPS) * 100)}%
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
                  src={getProfileImageUrl(doctorData) || `https://ui-avatars.com/api/?name=${doctorData?.firstName || 'Dr'}+${doctorData?.lastName || 'U'}&background=e2e8f0&color=475569`}
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
              {currentStep === 1 && (
                <ProfessionalIdentityStep
                  doctorData={doctorData}
                  basicInfoExists={basicInfoExists}
                  onNext={setCurrentStep}
                />
              )}
              {currentStep === 2 && (
                <ProfessionalInfoStep
                  profData={profData}
                  onNext={setCurrentStep}
                  onPrev={setCurrentStep}
                />
              )}
              {currentStep === 3 && (
                <CredentialsAndDocuments
                  doctorData={doctorData}
                  docMeta={docMeta}
                  setDocMeta={setDocMeta}
                  onNext={setCurrentStep}
                  onPrev={setCurrentStep}
                />
              )}
              {currentStep === 4 && (
                <VerificationStep
                  onPrev={setCurrentStep}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
