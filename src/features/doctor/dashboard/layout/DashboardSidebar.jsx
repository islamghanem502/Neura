import { NavLink } from 'react-router-dom';
import {
    LayoutGrid, Calendar, Users, Activity, Building2,
    Mail, BarChart2, Settings, LogOut, HeartHandshake
} from 'lucide-react';
import { useLogout } from '../../../../hooks/useAuth';
import { useDoctorData, useDoctorProfessionalInfo } from '../../../../hooks/useDoctorData';

const DashboardSidebar = () => {
    const { logout } = useLogout();
    const { data: doctorRes } = useDoctorData();
    const { data: profRes } = useDoctorProfessionalInfo();

    // Unwrap API shape: { data: { basicInfo: { ... } } }
    const doctorData = doctorRes?.data?.basicInfo || doctorRes || {};

    // Specialization from GET /doctors/me/professional-info → data.professionalInfo.primarySpecialization
    const specialization =
        profRes?.data?.professionalInfo?.primarySpecialization ||
        doctorData?.professionalInfo?.primarySpecialization ||
        'Specialist';

    // Profile image is stored as profileImage.imageUrl from the upload during onboarding
    const profileImageUrl =
        doctorData?.profileImage?.imageUrl ||
        (typeof doctorData?.profileImage === 'string' ? doctorData.profileImage : null);

    const fullName = [doctorData?.firstName, doctorData?.lastName].filter(Boolean).join(' ') || 'Dr. Richardson';
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e2e8f0&color=475569`;

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutGrid size={16} />, path: '/dashboard/doctor', end: true },
        { name: 'Appointments', icon: <Calendar size={16} />, path: '/dashboard/doctor/appointments', end: false },
        { name: 'Patients', icon: <Users size={16} />, path: '/dashboard/doctor/patients', end: false },
        { name: 'My sessions', icon: <Activity size={16} />, path: '/dashboard/doctor/sessions', end: false },
        { name: 'My Clinic', icon: <Building2 size={16} />, path: '/dashboard/doctor/clinic', end: false },
        { name: 'Messages', icon: <Mail size={16} />, path: '/dashboard/doctor/messages', end: false },
        { name: 'Therapy Rooms', icon: <HeartHandshake size={16} />, path: '/dashboard/doctor/therapy-rooms', end: false },
        { name: 'Analytics', icon: <BarChart2 size={16} />, path: '/dashboard/doctor/analytics', end: false },
    ];

    return (
        <aside className="w-[220px] bg-white flex flex-col h-full pt-6 pb-4 px-3 shrink-0 z-50 overflow-y-auto border-r border-[#EAEAEB]">
            {/* Logo */}
            <div className="mb-6 px-3">
                <span className="font-extrabold text-[17px] tracking-tight text-[#0F172A] uppercase">NEURA</span>
            </div>

            {/* User Profile — image & specialization from API (set during onboarding) */}
            <div className="flex items-center gap-2.5 mb-6 px-3">
                <div className="w-9 h-9 rounded-full bg-[#E0E3E5] flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-slate-100">
                    <img
                        src={profileImageUrl || avatarFallback}
                        alt={fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = avatarFallback; }}
                    />
                </div>
                <div className="flex flex-col min-w-0">
                    <h3 className="text-[13px] font-semibold text-[#191C1E] leading-snug truncate">
                        {fullName}
                    </h3>
                    <p className="text-[11px] font-normal text-[#64748B] truncate">
                        {specialization}
                    </p>
                </div>
            </div>



            {/* Nav items */}
            <nav className="flex-1 flex flex-col gap-1 mt-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all duration-300 ${
                                isActive
                                    ? 'bg-blue-50/60 text-[#2563EB]'
                                    : 'text-[#64748B] hover:text-[#191C1E] hover:bg-slate-50'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Indicator Bar (Left) */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#2563EB] rounded-r-full" />
                                )}
                                
                                <span className={`transition-colors duration-300 ${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8] group-hover:text-[#64748B]'}`}>
                                    {item.icon}
                                </span>
                                <span className="tracking-tight">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Settings & Logout */}
            <div className="flex flex-col gap-0.5 mt-4 pt-4 border-t border-[#EAEAEB]">
                <NavLink
                    to="/dashboard/doctor/settings"
                    className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all duration-300 ${
                            isActive
                                ? 'bg-blue-50/60 text-[#2563EB]'
                                : 'text-[#64748B] hover:text-[#191C1E] hover:bg-slate-50'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {/* Active Indicator Bar (Left) */}
                            {isActive && (
                                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#2563EB] rounded-r-full" />
                            )}
                            
                            <span className={`transition-colors duration-300 ${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8] group-hover:text-[#64748B]'}`}>
                                <Settings size={16} />
                            </span>
                            <span className="tracking-tight">Settings</span>
                        </>
                    )}
                </NavLink>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-[#BA1A1A] hover:bg-red-50 transition-all text-left w-full"
                >
                    <span className="text-[#BA1A1A]">
                        <LogOut size={16} />
                    </span>
                    <span className="tracking-tight">Sign out</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
