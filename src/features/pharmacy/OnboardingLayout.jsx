import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Info, ShieldCheck, MapPin, Truck, CreditCard, CheckCircle, LogOut, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLogout } from '../../hooks/useAuth';
import { useAuthContext } from '../../providers/AuthProvider';

// Step definitions
const STEPS = [
  { id: 1, label: 'Basic info', icon: Info },
  { id: 2, label: 'Credentials', icon: CheckCircle },
  { id: 3, label: 'Location', icon: MapPin },
  { id: 4, label: 'Delivery', icon: Truck },
  { id: 5, label: 'Payment', icon: CreditCard },
  { id: 6, label: 'Verification', icon: ShieldCheck },
];

/**
 * OnboardingSidebar - Dynamic sidebar that updates based on current step
 * @param {number} currentStep - Current step number (1-6)
 */
export const OnboardingSidebar = ({ currentStep = 1 }) => {
  if (!currentStep || currentStep < 1 || currentStep > 6) {
    console.warn(`Invalid step: ${currentStep}. Using default step 1.`);
  }
  
  const validStep = Math.max(1, Math.min(6, currentStep || 1));
  const progressPercent = (validStep / STEPS.length) * 100;

  return (
    <aside className="w-64 h-full flex-shrink-0 bg-white border-r border-slate-200 p-6 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-black tracking-tighter text-slate-900">NEURA</h1>
      </div>

      {/* Progress Section */}
      <div className="mb-12 space-y-2">
        <h2 className="text-lg font-bold text-slate-900">Onboarding</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Step {validStep} of {STEPS.length}
        </p>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {STEPS.map((step) => {
          const isActive = step.id === validStep;
          const isCompleted = step.id < validStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-4 p-4 rounded-2xl cursor-default transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : isCompleted
                    ? 'text-slate-400 hover:bg-slate-50'
                    : 'text-slate-400 hover:bg-slate-50'
                }
              `}
            >
              <div className={`${isActive ? 'text-blue-600' : isCompleted ? 'text-blue-400' : 'text-slate-300'}`}>
                <Icon size={18} />
              </div>
              <span className="text-sm">{step.label}</span>
              {isCompleted && !isActive && <CheckCircle size={14} className="ml-auto text-blue-400" />}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

/**
 * OnboardingNavbar - Navigation header with search, notifications, and user menu
 */
export const OnboardingNavbar = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
  };

  try {
    return (
      <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto h-full px-8 flex items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patients, records, or files..."
              className="w-full bg-slate-50 border-none rounded-full py-2 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:text-slate-400 transition-all text-sm"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative text-slate-400 hover:text-blue-600 transition-colors focus:outline-none">
              <Bell size={22} />
              <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 pl-6 border-l border-slate-100 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none group"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">Dr. {user?.lastName || 'Richardson'}</p>
                </div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                />
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''} group-hover:text-blue-600`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">
                        Dr. {user?.firstName || 'User'} {user?.lastName || ''}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || 'pharmacy@example.com'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 focus:outline-none"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Error rendering OnboardingNavbar:', error);
    return (
      <header className="h-20 bg-red-50 border-b border-red-200 flex items-center justify-center px-12">
        <p className="text-red-600 text-sm font-semibold">Error loading navbar</p>
      </header>
    );
  }
};
/**
 * OnboardingLayout - Main layout wrapper for all onboarding steps
 * @param {number} step - Current step number (1-6)
 * @param {React.ReactNode} children - Page content
 * 
 * Usage:
 * <OnboardingLayout step={2}>
 *   <YourPageContent />
 * </OnboardingLayout>
 */
export const OnboardingLayout = ({ 
  step = 1, 
  children, 
  nextPath, 
  prevPath, 
  onNext, 
  nextLabel = "Save and Continue", 
  nextIcon: NextIcon = ArrowRight,
  footerExtra 
}) => {
  const navigate = useNavigate();
  try {
    if (!children) {
      console.error('OnboardingLayout requires children prop');
      return (
        <div className="flex h-screen items-center justify-center bg-red-50">
          <p className="text-red-600 text-lg font-semibold">Error: No content provided</p>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
        {/* Sidebar */}
        <OnboardingSidebar currentStep={step} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Navbar */}
          <OnboardingNavbar />

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>

          {/* Fixed Footer Navigation */}
          {(nextPath || prevPath || onNext) && (
            <footer className="bg-[#F8FAFC] p-1 px-12 flex items-center justify-between z-40">
              {prevPath ? (
                <button onClick={() => navigate(prevPath)} className="flex items-center gap-2 text-[#153886] font-bold hover:gap-3 transition-all duration-300">
                  <ArrowLeft size={18} /> Previous Step
                </button>
              ) : <div />}
              
              <div className="flex items-center gap-6">
                {footerExtra}
                {(nextPath || onNext) && (
                  <button 
                    onClick={() => onNext ? onNext() : navigate(nextPath)} 
                    className="bg-[#153886] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 group"
                  >
                    {nextLabel} <NextIcon size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </footer>
          )}
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error rendering OnboardingLayout:', error);
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-2">Layout Error</p>
          <p className="text-red-500 text-sm">{error?.message}</p>
        </div>
      </div>
    );
  }
};

/**
 * Custom hook to manage pharmacy onboarding state across pages
 */
export const useOnboardingForm = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('pharmacy_onboarding_data');
    return saved ? JSON.parse(saved) : {};
  });

  const updateData = (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    localStorage.setItem('pharmacy_onboarding_data', JSON.stringify(updated));
  };

  const clearData = () => {
    localStorage.removeItem('pharmacy_onboarding_data');
    setData({});
  };

  return { data, updateData, clearData };
};
