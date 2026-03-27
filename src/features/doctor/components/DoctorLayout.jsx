// src/features/doctor/components/DoctorLayout.jsx
import { Outlet, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import DoctorSidebar from './DoctorSidebar';
import { Search, Bell, ChevronDown, Loader2, User as UserIcon, LogOut } from 'lucide-react';
import { useDoctorData } from '../../../hooks/useDoctorData';
import { useLogout } from '../../../hooks/useAuth';

const DoctorLayout = () => {
    const { data: doctorRes, isLoading } = useDoctorData();
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useLogout();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#e2e8f0]">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    const doctorData = doctorRes?.data?.basicInfo || {};
    const isProfileIncomplete = doctorData.accountStatus === 'incomplete';

    // If account is incomplete and we're not already on the profile page, redirect there.
    if (isProfileIncomplete && location.pathname !== '/dashboard/doctor/profile') {
        return <Navigate to="/dashboard/doctor/profile" replace />;
    }

    return (
        // الخلفية الرمادي الفاتح اللي بتدي مساحة للعناصر تظهر
        <div className="flex h-screen bg-[#e2e8f0] p-4 gap-6 font-sans overflow-hidden relative">
            
            {/* Overlay if incomplete to show clear focus on completing profile */}
            {isProfileIncomplete && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 pointer-events-none rounded-[2rem] mx-4 my-4" />
            )}

            {/* السايد بار */}
            <DoctorSidebar isLocked={isProfileIncomplete} />

            {/* منطقة المحتوى الرئيسية */}
            <div className={`flex-1 flex flex-col overflow-hidden ${isProfileIncomplete ? 'relative z-50' : ''}`}>

                {/* الهيدر الجديد - شفاف ومودرن زي الصورة الأولى */}
                <header className="flex items-center justify-between mb-6 px-2 shrink-0">

                    {/* شريط البحث */}
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search patients, appointments..."
                            className="w-full bg-white rounded-full py-3 pl-12 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-slate-700"
                            disabled={isProfileIncomplete}
                        />
                    </div>

                    {/* التنبيهات والبروفايل */}
                    <div className="flex items-center gap-4">
                        <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm relative transition-all hover:shadow-md">
                            <Bell size={20} className="text-slate-600" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-all"
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${doctorData.firstName || 'Dr'}+${doctorData.lastName || 'Ghanem'}&background=0D8ABC&color=fff`}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-sm font-semibold text-slate-700">Dr. {doctorData.lastName || 'Ghanem'}</span>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2">
                                        <button 
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/dashboard/doctor/my-profile');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                                        >
                                            <UserIcon size={16} /> Profile
                                        </button>
                                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                        <button 
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                                        >
                                            <LogOut size={16} /> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* محتوى الصفحة نفسها (الداشبورد) */}
                <main className="flex-1 overflow-y-auto pb-4 pr-2 custom-scrollbar">
                    {/* الـ Outlet هو اللي بيعرض الـ DoctorDashboard.jsx */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DoctorLayout;