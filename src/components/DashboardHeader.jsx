import React, { useState } from 'react';
import { Activity, Bell, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';

/**
 * DashboardHeader
 * A fixed top navbar shared by Doctor, Nurse, and Pharmacy dashboards.
 * Patient dashboard uses PatientNavbar instead.
 */
export function DashboardHeader() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout?.();
    navigate('/auth/login');
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Staff';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <Activity size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">
            Neura<span className="text-blue-600">.</span>
          </span>
          <span className="hidden sm:inline-block ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 rounded-full px-2 py-0.5">
            {roleLabel} Portal
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button
            className="relative p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          </button>

          {/* User avatar + name + dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 pl-3 border-l border-slate-100 hover:opacity-80 transition-opacity"
              onClick={() => setMenuOpen(o => !o)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-black shadow-sm">
                {user?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                {user?.firstName || 'User'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
