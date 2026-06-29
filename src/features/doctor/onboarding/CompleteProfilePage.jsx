import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDoctorData, useDoctorProfessionalInfo } from '../../../hooks/useDoctorData';
import { useLogout } from '../../../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { ProfessionalIdentityStep } from './components/ProfessionalIdentityStep';
import { CredentialsStep } from './components/CredentialsStep';
import { DocumentsStep } from './components/DocumentsStep';
import { VerificationStep } from './components/VerificationStep';
import { PendingVerificationPage } from './components/PendingVerificationPage';
import OnboardingLayout from './layout/OnboardingLayout';

const TOTAL_STEPS = 4;

const SUBMITTED_KEY = 'neura_doctor_submitted';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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
    <OnboardingLayout 
      currentStep={currentStep} 
      totalSteps={TOTAL_STEPS} 
      doctorData={doctorData} 
      logout={logout}
      stepTitles={stepTitles}
      stepDescriptions={stepDescriptions}
    >
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
    </OnboardingLayout>
  );
}
