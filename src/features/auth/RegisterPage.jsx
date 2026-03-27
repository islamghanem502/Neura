import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, UserPlus, Check, ArrowRight, ArrowLeft,
  Stethoscope, User, Syringe, Pill, Calendar, Mail, Lock
} from 'lucide-react';
import { useRegister } from '../../hooks/useAuth';
import LoadingOverlay from '../../components/LoadingOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/Header';

const ROLES = [
  { id: 'patient', label: 'Patient', icon: User, color: 'blue', theme: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200', desc: 'Access your health records and digital twin.' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'emerald', theme: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Manage patients and monitor health data.' },
  { id: 'nurse', label: 'Nurse', icon: Syringe, color: 'violet', theme: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-200', desc: 'Provide care and track patient vitals.' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'amber', theme: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200', desc: 'Process prescriptions and inventory.' },
];

const GENDERS = ['male', 'female', 'other'];

export default function RegisterPage() {
  const { mutate: register, isPending } = useRegister();
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Form Data
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: '', dateOfBirth: '', gender: 'male',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const activeRole = ROLES.find(r => r.id === form.role);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRoleSelect = (roleId) => {
    setForm(f => ({ ...f, role: roleId }));
    setTimeout(() => setStep(2), 300); // انتقال تلقائي بعد الاختيار
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters';
    if (!form.dateOfBirth) errs.dateOfBirth = 'Required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    register(form);
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Header />
      <div className="min-h-[80vh] flex items-center justify-center p-4 pt-24 lg:pt-32">
        {isPending && <LoadingOverlay message="Creating your secure Neura account..." />}

        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">

            {/* STEP 1: ROLE SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="text-center"
              >
                <h2 className="text-4xl font-black text-slate-900 mb-2">Welcome to NEURA</h2>
                <p className="text-slate-500 mb-10 text-lg">Who are you joining as today?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-1
                          ${form.role === role.id ? `${role.border} ${role.light}` : 'border-slate-100 bg-white hover:border-slate-300'}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                          ${form.role === role.id ? role.theme + ' text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{role.label}</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{role.desc}</p>
                        <ArrowRight className={`absolute bottom-6 right-6 w-5 h-5 transition-all 
                          ${form.role === role.id ? role.text : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: REGISTRATION FORM */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to roles
                </button>

                <div className={`p-8 rounded-[2.5rem] bg-white border shadow-2xl transition-colors duration-500 ${activeRole.border}`}>
                  <header className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`p-3 rounded-xl ${activeRole.theme} text-white shadow-lg`}>
                        <activeRole.icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 leading-none">
                        Join as a <span className={activeRole.text}>{activeRole.label}</span>
                      </h2>
                    </div>
                    <p className="text-slate-400 pl-16">Please fill in your professional details to continue.</p>
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">First Name</label>
                        <input name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Jane"
                          className={`neura-input !bg-slate-50 border-none focus:ring-2 focus:ring-${activeRole.color}-500 transition-all ${errors.firstName && 'ring-2 ring-red-400'}`} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Last Name</label>
                        <input name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Smith"
                          className={`neura-input !bg-slate-50 border-none focus:ring-2 focus:ring-${activeRole.color}-500 transition-all ${errors.lastName && 'ring-2 ring-red-400'}`} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@neura.com"
                          className={`neura-input !pl-11 !bg-slate-50 border-none focus:ring-2 focus:ring-${activeRole.color}-500 transition-all ${errors.email && 'ring-2 ring-red-400'}`} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                          className={`neura-input !pl-11 !bg-slate-50 border-none focus:ring-2 focus:ring-${activeRole.color}-500 transition-all ${errors.password && 'ring-2 ring-red-400'}`} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Birthday</label>
                        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
                          className={`neura-input !bg-slate-50 border-none focus:ring-2 focus:ring-${activeRole.color}-500 transition-all ${errors.dateOfBirth && 'ring-2 ring-red-400'}`} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Gender</label>
                        <div className="flex p-1 bg-slate-50 rounded-xl">
                          {GENDERS.map((g) => (
                            <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: g }))}
                              className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all
                                ${form.gender === g ? `bg-white ${activeRole.text} shadow-sm` : 'text-slate-400'}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={isPending}
                      className={`w-full py-4 mt-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-white shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99]
                      ${isPending ? 'bg-slate-400' : `${activeRole.theme} shadow-${activeRole.color}-200`}`}>
                      <UserPlus className="w-5 h-5" />
                      Complete Registration
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-slate-900 font-bold hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}