import React from 'react';
import { Outlet } from 'react-router-dom';
import PatientNavbar from './PatientNavbar';

export default function PatientLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <PatientNavbar />
      {/* pt-16 offsets the fixed 64px navbar */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
