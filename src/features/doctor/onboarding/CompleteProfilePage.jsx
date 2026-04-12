import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDoctorData, useDoctorProfessionalInfo } from '../../../hooks/useDoctorData';
import { useLogout } from '../../../hooks/useAuth';
import { User, Briefcase, FileText, CheckCircle, Search, Bell, ChevronRight, LogOut, Loader2, MapPin, Calendar } from 'lucide-react';
import { ProfessionalIdentityStep } from './components/ProfessionalIdentityStep';
import { CredentialsStep } from './components/CredentialsStep';
import { DocumentsStep } from './components/DocumentsStep';
import { VerificationStep } from './components/VerificationStep';
import { PendingVerificationPage } from './components/PendingVerificationPage';

const TOTAL_STEPS = 4;

const SIDEBAR_STEPS = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Credentials', icon: Briefcase },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Verification', icon: CheckCircle },
];

const getProfileImageUrl = (doctorData) => {
  if (!doctorData) return null;
  if (typeof doctorData.profileImage === 'string') return doctorData.profileImage;
  return doctorData.profileImage?.imageUrl || null;
};

const SUBMITTED_KEY = 'neura_doctor_submitted';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showPending, setShowPending] = useState(
    () => localStorage.getItem(SUBMITTED_KEY) === 'true'
  );
  const queryClient = useQueryClient();
  const { data: doctorRes, isLoading } = useDoctorData();
  const { logout } = useLogout();

  const [docMeta, setDocMeta] = useState({
    medicalDegree: { university: '', graduationYear: '', degree: '' },
    syndicateCard: { syndicateNumber: '', issueDate: '' }
  });

  const doctorDataRaw = doctorRes?.data?.basicInfo || doctorRes || {};

  // Auto-redirect if already verified
  useEffect(() => {
    if (doctorDataRaw?.isVerified === true) {
      localStorage.removeItem(SUBMITTED_KEY);
      navigate('/dashboard/doctor', { replace: true });
    }
  }, [doctorDataRaw?.isVerified, navigate]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#f8fafc]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  if (showPending) {
    return <PendingVerificationPage />;
  }

  const displayStep = currentStep;

  const basicInfoExists = !!(doctorDataRaw?.phone || doctorDataRaw?.firstName);
  const doctorData = doctorDataRaw;

  const stepTitles = {
    1: 'Professional Identity',
    2: 'Academic & Professional Credentials',
    3: 'Required Documents',
    4: 'Final Verification'
  };

  const stepDescriptions = {
    1: "Welcome to Clinical Ethereal. Let's begin by establishing your professional profile within our secure medical network.",
    2: 'Please provide your official medical registration and university details. This information will be verified against global medical registries.',
    3: "Please upload your official medical registration and identity verification documents.",
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
          <h2 className="text-[14px] font-extrabold text-slate-800">Onboarding</h2>
          <p className="text-[12px] font-medium text-slate-500 mt-1">Step {displayStep} of {TOTAL_STEPS}</p>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(displayStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <nav className="flex-1 pl-4 space-y-1">
          {SIDEBAR_STEPS.map((step) => {
            const isActive = step.id === displayStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 py-3 rounded-l-full cursor-default transition-all ${isActive
                  ? 'bg-[#E9EFFD] text-blue-600 font-semibold shadow-[0px_1px_2px_rgba(0,0,0,0.05)] pl-6 pr-4'
                  : 'text-slate-500 hover:text-slate-700 font-medium pl-6 pr-4'
                  }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span className="text-[14px]">{step.title}</span>
              </div>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-[#F2F4F6] rounded-[24px] p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              {Math.round((displayStep / TOTAL_STEPS) * 100)}%
            </div>
            <span className="text-[12px] font-semibold text-[#434655]">Profile Strength</span>
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
        <div className="flex-1 overflow-auto p-4 md:p-10 pt-8">
          <div className="max-w-[1440px] mx-auto">
            {![4].includes(displayStep) && (
              <div className="mb-8 pl-8">
                <h2 className="text-[36px] font-bold tracking-tight text-slate-900 mb-2">{stepTitles[displayStep]}</h2>
                <p className="text-slate-500 font-medium text-[14px] max-w-2xl">{stepDescriptions[displayStep]}</p>
              </div>
            )}

            <div className="pb-20">
              {displayStep === 1 && (
                <ProfessionalIdentityStep
                  doctorData={doctorData}
                  basicInfoExists={basicInfoExists}
                  onNext={setCurrentStep}
                />
              )}
              {displayStep === 2 && (
                <CredentialsStep
                  docMeta={docMeta}
                  setDocMeta={setDocMeta}
                  onNext={setCurrentStep}
                  onPrev={setCurrentStep}
                />
              )}
              {displayStep === 3 && (
                <DocumentsStep
                  doctorData={doctorData}
                  docMeta={docMeta}
                  setDocMeta={setDocMeta}
                  onNext={setCurrentStep}
                  onPrev={setCurrentStep}
                />
              )}
              {displayStep === 4 && (
                <VerificationStep
                  doctorData={doctorData}
                  docMeta={docMeta}
                  onPrev={setCurrentStep}
                  onSubmitted={() => {
                    localStorage.setItem(SUBMITTED_KEY, 'true');
                    setShowPending(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
