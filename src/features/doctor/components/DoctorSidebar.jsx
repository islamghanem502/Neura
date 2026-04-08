// src/features/doctor/components/DoctorSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
    Home, FileText, Mail, Calendar,
    Folder, Settings, LogOut, AlertTriangle, Building2, Activity
} from 'lucide-react';
import { useLogout } from '../../../hooks/useAuth';
import { useDoctorData } from '../../../hooks/useDoctorData';

const DoctorSidebar = ({ isLocked = false }) => {
    const { logout } = useLogout();
    const { data: doctorRes } = useDoctorData();

    // Fallbacks just in case data isn't loaded yet
    const doctorData = doctorRes?.data?.basicInfo || doctorRes || { firstName: 'Dr.', lastName: 'Richardson' };
    const professionalInfo = doctorData?.professionalInfo || { primarySpecialization: 'Chief of Surgery' };

    const menuItems = [
        { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard/doctor', end: true },
        { name: 'My Clinic', icon: <Building2 size={20} />, path: '/dashboard/doctor/clinic', end: false },
        { name: 'Appointments', icon: <Calendar size={20} />, path: '/dashboard/doctor/appointments', end: false },
        { name: 'Start Session', icon: <Activity size={20} />, path: '/dashboard/doctor/start-session', end: false },
        { name: 'Medical Records', icon: <FileText size={20} />, path: '/dashboard/doctor/records', end: false },
        { name: 'Messages', icon: <Mail size={20} />, path: '/dashboard/doctor/messages', end: false },
        { name: 'Clinics', icon: <Folder size={20} />, path: '/dashboard/doctor/clinics', end: false },
    ];

    return (
        <aside className="w-[260px] bg-white flex flex-col h-full py-8 px-5 shrink-0 z-50 overflow-hidden border-r border-slate-100">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10 px-2">
                <span className="font-black text-[22px] tracking-tight text-slate-800 uppercase">NEURA</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <img
                    src={doctorData.profileImage || `https://ui-avatars.com/api/?name=${doctorData.firstName || 'Dr'}+${doctorData.lastName || 'Richardson'}&background=e2e8f0&color=475569`}
                    alt="Profile"
                    className="w-[42px] h-[42px] rounded-full object-cover border border-slate-200"
                />
                <div className="flex flex-col">
                    <h3 className="text-[14px] font-bold text-slate-900 leading-snug">
                        {doctorData.firstName} {doctorData.lastName}
                    </h3>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                        {professionalInfo.primarySpecialization}
                    </p>
                </div>
            </div>

            {/* Restricted banner */}
            {isLocked && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3 mb-6 flex items-start gap-3 relative mx-2">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-700 text-[13px] font-bold leading-tight">Profile Pending</p>
                        <p className="text-red-600/80 text-[11px] mt-0.5">Please complete your profile</p>
                    </div>
                </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 flex flex-col gap-1.5">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={(e) => isLocked && e.preventDefault()}
                        className={({ isActive }) => `
                            flex items-center gap-3.5 px-3 py-[12px] rounded-[1.2rem] font-semibold text-[14px] transition-all
                            ${isActive 
                                ? 'bg-[#f0f5ff] text-blue-600 shadow-sm border border-blue-100/30' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                            ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Settings & Logout (pushed to bottom) */}
            <div className="flex flex-col gap-1 mt-8">
                <NavLink
                    to="/dashboard/doctor/profile"
                    className={({ isActive }) => `
                        flex items-center gap-3.5 px-3 py-[12px] rounded-[1.2rem] font-semibold text-[14px] transition-all
                        ${isActive 
                            ? 'bg-[#f0f5ff] text-blue-600 shadow-sm border border-blue-100/30' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                    `}
                >
                    {({ isActive }) => (
                        <>
                            <Settings size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                            Settings
                        </>
                    )}
                </NavLink>

                <button
                    onClick={logout}
                    className="flex items-center gap-3.5 px-3 py-[12px] rounded-[1.2rem] font-semibold text-[14px] text-red-600 hover:bg-red-50 transition-all text-left w-full"
                >
                    <LogOut size={20} className="text-red-500" />
                    Sign out
                </button>
            </div>
        </aside>
    );
};

export default DoctorSidebar;
