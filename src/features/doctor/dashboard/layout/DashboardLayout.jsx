import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { useDoctorData } from '../../../../hooks/useDoctorData';
import { useAuthContext } from '../../../../providers/AuthProvider';
import { Search, Bell, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { data: doctorRes } = useDoctorData();
  const doctorData = doctorRes?.data?.basicInfo || doctorRes || { firstName: 'Dr.', lastName: 'Richardson' };

  const profileImageUrl =
    doctorData?.profileImage?.imageUrl ||
    (typeof doctorData?.profileImage === 'string' ? doctorData.profileImage : null);
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent((doctorData.firstName || 'Dr') + ' ' + (doctorData.lastName || ''))}&background=e2e8f0&color=475569`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };
  
  return (
    <div className="flex h-screen bg-[#F7F9FC] font-sans overflow-hidden text-slate-800">
      <DashboardSidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-8 py-3 sticky top-0 bg-[#F7F9FC]/95 backdrop-blur-sm z-40 border-b border-[#EAEAEB]/50">
          <div className="flex-1 max-w-[420px]">
            <div className="relative flex items-center bg-white rounded-full h-[40px] px-4 shadow-sm border border-slate-200">
              <Search className="text-slate-400 mr-2.5" size={15} strokeWidth={2.5} />
              <input 
                type="text" 
                placeholder="Search patients, records, or files..." 
                className="w-full bg-transparent outline-none text-[13px] text-slate-700 placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5 ml-auto">
            <button className="relative p-1.5 text-[#191C1E] hover:text-slate-600 transition-colors">
              <Bell size={20} strokeWidth={2} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></div>
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center bg-white rounded-full h-[40px] pl-1.5 pr-3 shadow-sm border border-[#2563EB]/30 hover:shadow-md hover:border-[#2563EB]/50 transition-all gap-2"
              >
                <div className="w-[28px] h-[28px] rounded-full overflow-hidden flex items-center justify-center bg-slate-100 shrink-0 ring-2 ring-[#2563EB]/20">
                  <img 
                    src={profileImageUrl || avatarFallback} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = avatarFallback; }}
                  />
                </div>
                <span className="font-medium text-[13px] text-[#191C1E] tracking-tight">
                  {doctorData.firstName} {doctorData.lastName}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <Link 
                    to="/dashboard/doctor/profile" 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <UserIcon size={16} />
                    </div>
                    My Profile
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-4" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <LogOut size={16} />
                    </div>
                    Leave
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Account Status Banner — visible only when accountStatus !== 'active' */}
        {doctorData?.accountStatus && doctorData.accountStatus !== 'active' && (
          <div className="flex items-center gap-3 px-8 py-2.5 bg-amber-50 border-b border-amber-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            <p className="flex-1 text-[13px] text-amber-800">
              <strong>Your account is under review</strong> — status:{' '}
              <span className="font-bold capitalize px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                {doctorData.accountStatus}
              </span>
              . You won't appear in patient search until an administrator approves your account.
            </p>
            <a
              href="mailto:support@neura.health"
              className="text-[12px] font-bold text-amber-700 underline shrink-0 hover:text-amber-900"
            >
              Contact Support
            </a>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="px-8 pb-10 pt-6">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
