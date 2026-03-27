import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Activity,
  ClipboardList, Pill, Users, Bell, LogOut, Menu, X, BookOpen
} from 'lucide-react';
import { useAuthContext } from '../../../providers/AuthProvider';

const BASE = '/dashboard/patient';

const NAV_LINKS = [
  { to: BASE,                         label: 'Dashboard',      icon: LayoutDashboard, end: true },
  { to: `${BASE}/appointments`,        label: 'Find Doctors',   icon: Calendar },
  { to: `${BASE}/bookings`,            label: 'My Bookings',    icon: BookOpen },
  { to: `${BASE}/digital-twin`,        label: 'Digital Twin',   icon: Activity },
  { to: `${BASE}/records`,             label: 'Records',        icon: ClipboardList },
  { to: `${BASE}/pharmacy`,            label: 'Pharmacy',       icon: Pill },
  { to: `${BASE}/therapy-groups`,      label: 'Therapy',        icon: Users },
];

export default function PatientNavbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout?.();
    navigate('/auth/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
        : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <NavLink to={BASE} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Activity size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              Neura<span className="text-blue-600">.</span>
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            {/* Avatar → click goes to Profile page */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <button
                onClick={() => navigate(`${BASE}/profile`)}
                className="group relative flex items-center gap-2 hover:opacity-90 transition-opacity"
                title="View Profile"
                aria-label="Go to my profile"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-100 shadow-sm group-hover:border-blue-400 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-black shadow-sm group-hover:from-blue-600 group-hover:to-blue-800 transition-all">
                    {user?.firstName?.[0]?.toUpperCase() || 'P'}
                  </div>
                )}
                <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate group-hover:text-blue-600 transition-colors">
                  {user?.firstName || 'Patient'}
                </span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-3 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          {/* Profile link in mobile menu */}
          <NavLink
            to={`${BASE}/profile`}
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-black">
                {user?.firstName?.[0]?.toUpperCase() || 'P'}
              </div>
            )}
            My Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all mt-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
