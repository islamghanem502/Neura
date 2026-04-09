import React from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useLogout } from '../../../hooks/useAuth';
import { useDoctorData } from '../../../hooks/useDoctorData';
import { Navigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const { logout } = useLogout();
  const { data: doctorRes, isLoading } = useDoctorData();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const doctorData = doctorRes?.data?.basicInfo || doctorRes || {};
  
  if (doctorData.accountStatus === 'incomplete') {
    return <Navigate to="/dashboard/doctor/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Doctor Dashboard
        </h1>
        <p className="text-lg text-slate-500 font-medium pb-8 border-b border-slate-100">
          Welcome to your professional medical hub.
        </p>
        
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
          <p className="text-slate-400 font-medium text-[15px]">
            Dashboard metrics and widgets will be implemented here.
          </p>
        </div>

        <div className="pt-8">
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 mx-auto bg-red-50 text-red-600 rounded-full font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
