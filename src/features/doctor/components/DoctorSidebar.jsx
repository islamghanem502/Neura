// src/features/doctor/components/DoctorSidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home, FileText, Mail, Calendar,
    Folder, Settings, LogOut, AlertTriangle, Building2, Activity
} from 'lucide-react';
import { useLogout } from '../../../hooks/useAuth';

const DoctorSidebar = ({ isLocked = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { logout } = useLogout();

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
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            style={{
                width: isExpanded ? '240px' : '80px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1c 100%)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                gap: '8px',
                flexShrink: 0,
                zIndex: 50,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                borderRight: '1px solid rgba(59, 130, 246, 0.1)',
            }}
        >
            {/* Logo */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '4px 8px 24px 8px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '8px',
            }}>
                <div style={{
                    width: '40px', height: '40px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                {isExpanded && (
                    <span style={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '18px',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Neura
                    </span>
                )}
            </div>

            {/* Restricted banner */}
            {isLocked && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: isExpanded ? '12px' : '10px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                    <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0 }} />
                    {isExpanded && (
                        <div>
                            <p style={{ color: '#f87171', fontSize: '11px', fontWeight: 600, margin: 0, lineHeight: '1.4' }}>Profile Pending</p>
                            <p style={{ color: 'rgba(248, 113, 113, 0.7)', fontSize: '9px', margin: 0 }}>Complete your profile</p>
                        </div>
                    )}
                </div>
            )}

            {/* Nav items */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={(e) => isLocked && e.preventDefault()}
                        className="sidebar-link"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '14px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))' : 'transparent',
                            color: isActive ? '#60a5fa' : '#94a3b8',
                            fontWeight: isActive ? 500 : 400,
                            fontSize: '14px',
                            opacity: isLocked ? 0.5 : 1,
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <span style={{
                                    flexShrink: 0,
                                    color: isActive ? '#3b82f6' : 'inherit',
                                    display: 'flex',
                                    transition: 'color 0.2s ease',
                                }}>
                                    {item.icon}
                                </span>
                                {isExpanded && <span>{item.name}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Divider */}
            <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                margin: '12px 0'
            }} />

            {/* Settings */}
            <NavLink
                to="/dashboard/doctor/profile"
                className="sidebar-link"
                style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '14px',
                    textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))' : 'transparent',
                    color: isActive ? '#60a5fa' : '#94a3b8',
                    fontSize: '14px', fontWeight: 400,
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                })}
            >
                <Settings
                    size={20}
                    style={{
                        flexShrink: 0,
                        display: 'flex',
                        transition: 'all 0.3s ease',
                        ...(isLocked ? { color: '#60a5fa', animation: 'spin 4s linear infinite' } : {}),
                    }}
                />
                {isExpanded && <span style={isLocked ? { color: '#60a5fa' } : {}}>Settings</span>}
            </NavLink>

            {/* Logout */}
            <button
                onClick={logout}
                className="sidebar-logout"
                style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '14px', border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    color: '#f87171', fontSize: '14px', fontWeight: 400,
                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                    overflow: 'hidden', width: '100%',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                }}
            >
                <LogOut size={20} style={{ flexShrink: 0, display: 'flex' }} />
                {isExpanded && <span>Logout</span>}
            </button>

            <style>{`
                .sidebar-link:hover { 
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)) !important;
                    transform: translateX(2px);
                }
                .sidebar-logout:hover { 
                    background: rgba(239, 68, 68, 0.1) !important;
                    transform: translateX(2px);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </aside>
    );
};

export default DoctorSidebar;