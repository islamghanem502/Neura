import React, { useState, useEffect } from 'react';
import { Activity, Menu, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Doctors', path: '/doctors' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${scrolled
            ? 'py-2 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'py-4 bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-blue-200 shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 leading-none">NEURA</span>
                <span className="text-[9px] font-bold text-blue-600 tracking-tighter uppercase">Medical Center</span>
              </div>
            </div>

            {/* Desktop Nav - Simple CSS Hover */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${location.pathname === link.path
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-blue-500'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/auth/login" className="text-xs font-bold text-slate-600 hover:text-blue-600">
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                Get Started <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 text-slate-600"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Lightweight Animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-white lg:hidden flex flex-col p-6 pt-24"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-2xl font-bold text-slate-800 border-b border-gray-50 pb-2"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-3">
              <Link
                to="/auth/register"
                className="block w-full py-4 bg-blue-600 text-white text-center rounded-xl font-bold"
              >
                Join NEURA
              </Link>
              <Link
                to="/auth/login"
                className="block w-full py-4 bg-gray-100 text-slate-600 text-center rounded-xl font-bold"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};