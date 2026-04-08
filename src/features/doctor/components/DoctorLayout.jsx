// src/features/doctor/components/DoctorLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import { useDoctorData } from '../../../hooks/useDoctorData';

export default function DoctorLayout() {
  const { data: doctorRes } = useDoctorData();
  const doctorData = doctorRes?.data?.basicInfo || doctorRes || {};
  
  // Checking if the profile is locked/pending verifying based on status
  const isLocked = doctorData?.accountStatus !== 'active' && doctorData?.accountStatus !== 'verified';

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden text-slate-800">
      <DoctorSidebar isLocked={isLocked} />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
}
