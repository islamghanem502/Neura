import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, FileText, Package, Gift, Settings, LogOut 
} from 'lucide-react';
import { useLogout } from '../../hooks/useAuth';
import { OnboardingNavbar } from './OnboardingLayout';

/**
 * NavItem - Reusable navigation item component for dashboard sidebar
 */
const NavItem = ({ icon, label, active = false, color = "text-gray-500", onClick }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
      active ? 'bg-blue-50 text-blue-600 shadow-sm' : `${color} hover:bg-gray-50`
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

/**
 * DashboardSidebar - Sidebar specifically for the pharmacy dashboard
 */
export const DashboardSidebar = ({ currentPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const { logout } = useLogout();

  return (
    <aside className="w-64 h-full flex-shrink-0 bg-white border-r border-gray-200 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-10 px-2">

        <div className="w-8 h-8 bg-gradient-to-br from-indigo-900 via-blue-900 to-[#0A0E1A] rounded-lg flex items-center justify-center text-white font-bold">N</div>
        <h1 className="text-2xl font-black tracking-tighter text-slate-900">NEURA</h1>
        </div>

      <nav className="flex-1 space-y-1">
        <NavItem 
          icon={<LayoutDashboard size={20}/>} 
          label="Dashboard" 
          active={currentPage === 'dashboard'}
          onClick={() => navigate('/dashboard/pharmacy/dashboard')}
        />
        <NavItem 
          icon={<ShoppingCart size={20}/>} 
          label="Orders" 
          active={currentPage === 'orders'}
          onClick={() => navigate('/dashboard/pharmacy/orders')}
        />
        <NavItem 
          icon={<FileText size={20}/>} 
          label="Prescription" 
          active={currentPage === 'prescription'}
          onClick={() => navigate('/dashboard/pharmacy/prescription')}
        />
        <NavItem 
          icon={<Package size={20}/>} 
          label="Inventory" 
          active={currentPage === 'inventory'}
          onClick={() => navigate('/dashboard/pharmacy/inventory')}
        />
        <NavItem 
          icon={<Gift size={20}/>} 
          label="Offers" 
          active={currentPage === 'offers'}
          onClick={() => navigate('/dashboard/pharmacy/offers')}
        />
      </nav>

      <div className="pt-6 border-t border-gray-100 space-y-1 mt-auto">
        <NavItem icon={<Settings size={20}/>} label="Settings" />
        <NavItem icon={<LogOut size={20}/>} label="Logout" color="text-red-500" onClick={logout} />
      </div>
    </aside>
  );
};

export const DashboardLayout = ({ children, currentPage }) => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      <DashboardSidebar currentPage={currentPage} />
      <main className="flex-1 overflow-y-auto">
        <OnboardingNavbar />
        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
