import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, LogOut, Menu, X, Search, User,
} from 'lucide-react';
import { useAuthContext } from '../../../providers/AuthProvider';

const BASE = '/dashboard/patient';

const NAV_LINKS = [
  { to: BASE, label: 'Home', end: true },
  { to: `${BASE}/appointments`, label: 'Doctors' },
  { to: `${BASE}/bookings`, label: 'Bookings' },
  { to: `${BASE}/digital-twin`, label: 'Digital Twin' },
  { to: `${BASE}/records`, label: 'Records' },
  { to: `${BASE}/pharmacy`, label: 'Pharmacy' },
  { to: `${BASE}/therapy-groups`, label: 'Therapy Groups' },
];

export default function PatientNavbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate('/auth/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm/5 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Brand */}
          <NavLink
            to={BASE}
            className="shrink-0 text-[19px] font-black text-gray-900 tracking-tight select-none flex items-center gap-1.5"
          >
            <span className="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[13px] font-black shadow-sm shadow-blue-500/30">N</span>
            Neura
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 text-[14px] font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/40'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Search + Bell + Avatar Dropdown */}
          <div className="hidden md:flex items-center gap-4 shrink-0">

            {/* Search */}
            <div
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-[13.5px] transition-all duration-200 ${
                searchFocused
                  ? 'border-blue-400 bg-white w-60 shadow-sm ring-2 ring-blue-100'
                  : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100/50 w-52'
              }`}
            >
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search medical records..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent outline-none text-gray-700 placeholder-gray-400 text-[13.5px] w-full font-medium"
              />
            </div>

            {/* Bell */}
            <button
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-100 hover:border-blue-500 hover:scale-105 transition-all shrink-0 flex items-center justify-center focus:outline-none"
                aria-label="User Menu"
                title={user?.firstName || 'Profile'}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black">
                    {user?.firstName?.[0]?.toUpperCase() || 'P'}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">Patient</p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(`${BASE}/profile`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2.5 font-medium"
                  >
                    <User size={15} className="text-gray-400" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors flex items-center gap-2.5 font-semibold border-t border-gray-50 mt-1"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden ml-auto p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-0.5">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Mobile Profile & Logout */}
          <div className="pt-3 border-t border-gray-100 mt-2 flex items-center justify-between">
            <button
              onClick={() => { navigate(`${BASE}/profile`); setMobileOpen(false); }}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                    {user?.firstName?.[0]?.toUpperCase() || 'P'}
                  </div>
                )}
              </div>
              {user?.firstName || 'Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}