import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';
import LoadingOverlay from '../../components/LoadingOverlay';
import { motion } from 'framer-motion';
import { Header } from '../../components/Header';

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    login(form);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <div className="min-h-[70vh] flex items-center justify-center p-4 pt-24 lg:pt-32">
        {isPending && <LoadingOverlay message="Authenticating secure access..." />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-4 transform -rotate-6">
              <LogIn className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 font-medium">
              Enter your credentials to access <span className="text-blue-600">NEURA</span>
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
            {/* Subtle Background Element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <form onSubmit={handleSubmit} noValidate className="space-y-6 relative">

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@hospital.com"
                    className={`neura-input !bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 font-medium ml-1">
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Password
                  </label>
                  <Link to="/auth/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`neura-input !bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 font-medium ml-1">
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 ml-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="remember" className="text-sm text-slate-500 font-medium select-none cursor-pointer">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Sign In to Neura
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              New to the platform?{' '}
              <Link to="/auth/register" className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}