import React, { useEffect, useState } from 'react';
import { Header } from '../../components/Header';
import { FeaturesSection } from './components/FeaturesSection';
import { DoctorsSection } from './components/DoctorsSection';
import { AISummaryVisual, GroupTherapyVisual } from './components/FeatureVisuals';
import { Icons } from './components/Icons';
import { ArrowRight, Check, Activity, Calendar, Mic, Pill, UserCheck, Users, HelpCircle, AlertCircle, RefreshCw, ChevronsRight, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Particles imports
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import heroBg from './assets/landing_hero_image.png';
import digitalTwinImg from './assets/landing_digital_twin.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const [init, setInit] = useState(false);

  // Initialize particles engine for Antigravity effect
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-20');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      el.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-20');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500/30 selection:text-blue-900 bg-white text-zinc-900 overflow-x-hidden">
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-20 overflow-hidden bg-slate-950">

          {/* Background Image Layer with 70% Opacity */}
          <div
            className="absolute inset-0 z-0 opacity-70 pointer-events-none"
            style={{
              backgroundImage: `url(${heroBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />

          {/* Overlay to ensure text readability if needed */}
          <div className="absolute inset-0 bg-slate-900/10 z-10 pointer-events-none" />

          {/* Main Hero Content */}
          <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">

            <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] mb-6 reveal-on-scroll">
              <span className="text-white">Smarter Healthcare</span><br />
              <span className="text-white">Starts </span>
              <span className="text-blue-300">With You</span>
            </h1>

            <p className="text-white/95 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
              A new way to monitor, understand, and improve your health through real-time data, smart insights, and seamless doctor booking.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center reveal-on-scroll w-full sm:w-auto" style={{ transitionDelay: '400ms' }}>
              <button
                onClick={() => navigate('/auth/register')}
                className="px-8 py-3.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-base transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Book an Appointment
              </button>
              <button
                className="px-8 py-3.5 rounded-xl bg-transparent text-white font-bold text-base hover:bg-white/10 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Create your Digital Twin <span className="text-xl leading-none">»</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: OUR SERVICES */}
        <section className="py-24 bg-[#f8fafc] relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 reveal-on-scroll">
              <span className="text-blue-600 font-bold text-base block mb-3">Our Services</span>
              <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">Your Healthcare, All in One Place</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                {
                  name: "Medical records",
                  icon: Mic,
                  desc: "AI summarizes and record sessions,history, and helps doctors with smart suggestions."
                },
                {
                  name: "Pharmacy",
                  icon: Pill,
                  desc: "Fast access to prescribed medicines with expert support."
                },
                {
                  name: "Nursing Care",
                  icon: UserCheck,
                  desc: "Professional nursing care at your home with trusted specialists."
                },
                {
                  name: "Therapy Groups",
                  icon: Users,
                  desc: "Connect, heal, and grow with guided group therapy programs."
                }
              ].map((service, i) => (
                <div key={i} className="group flex flex-col p-8 rounded-[2rem] bg-white shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow duration-300 reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 mb-6">
                    <service.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-bold text-xl text-zinc-900 mb-3">{service.name}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center reveal-on-scroll" style={{ transitionDelay: '400ms' }}>
              <button className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                Explore more <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: STATS */}
        <section className="py-28 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            {/* Header Text */}
            <h2 className="text-xl sm:text-2xl text-center text-zinc-900 font-medium leading-relaxed mb-20 px-4 reveal-on-scroll">
              Our platform continues to grow, serving thousands of patients<br className="hidden md:block" /> with trusted and advanced healthcare services every day.
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Stat 1 */}
              <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-100 reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
                <div className="text-4xl md:text-5xl font-bold text-zinc-900 mb-3 tracking-tight">15k+</div>
                <div className="text-gray-500 font-medium text-sm md:text-base">Patient Records</div>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-100 reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
                <div className="text-4xl md:text-5xl font-bold text-zinc-900 mb-3 tracking-tight">200+</div>
                <div className="text-gray-500 font-medium text-sm md:text-base">Smart Diagnoses</div>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-100 reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
                <div className="text-4xl md:text-5xl font-bold text-zinc-900 mb-3 tracking-tight">99+</div>
                <div className="text-gray-500 font-medium text-sm md:text-base">Data Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: AI VISIT SUMMARY */}
        <section className="py-32 px-6 bg-zinc-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="reveal-on-scroll">
              <div className="relative rounded-[2.5rem] bg-white border border-zinc-100 p-4 shadow-2xl overflow-hidden group hover:shadow-[0_30px_60px_-15px_rgba(168,85,247,0.15)] transition-shadow duration-700">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <AISummaryVisual />
              </div>
            </div>

            <div className="reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-bold mb-8 uppercase tracking-wider">
                <Icons.AI size={16} />
                <span>AI Documentation</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-zinc-900 mb-8 tracking-tight">
                Zero <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 font-black">Paperwork.</span>
              </h2>
              <p className="text-xl text-zinc-600 font-light mb-10 leading-relaxed max-w-lg">
                Our LLM converts doctor voice notes instantly into structured medical reports (SOAP notes). Focus on the patient, not the screen.
              </p>
              <ul className="space-y-5 mb-8">
                {["Voice-to-Text Transcription", "Auto-coded Diagnostic Data", "Instant Multi-Dashboard Sync"].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-zinc-800 font-semibold text-lg reveal-on-scroll" style={{ transitionDelay: `${i * 150}ms` }}>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Check size={16} strokeWidth={3} /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: COLLABORATION */}
        <section className="py-32 px-6 bg-white relative">
          <div className="absolute right-0 top-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold uppercase tracking-wider mb-8">
                <Icons.Group size={16} />
                <span>Online Therapy</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-zinc-900 mb-8 tracking-tight">
                Connect & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 font-black">Heal Together.</span>
              </h2>
              <p className="text-xl text-zinc-600 font-light mb-10 leading-relaxed max-w-lg">
                Join secure online therapy sessions with other patients, expertly guided and controlled by specialized doctors. A safe, supportive space to share, listen, and recover together.
              </p>
              <button className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1">
                Join a Session
              </button>
            </div>

            <div className="order-1 lg:order-2 reveal-on-scroll">
              <div className="relative rounded-[2.5rem] bg-zinc-50 border border-zinc-100 p-8 shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.15)] transition-shadow duration-700">
                <GroupTherapyVisual />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: DIGITAL TWIN DETAILS */}
        <section className="py-24 px-6 bg-[#f8fafc] relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

            {/* Left Column: Text & Features */}
            <div className="lg:w-1/2 order-2 lg:order-1 reveal-on-scroll">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-blue-100/50 text-blue-600 text-sm font-semibold mb-6 shadow-sm border border-blue-100">
                Core Technology
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
                Your Personal <span className="text-blue-700">Digital Twin</span>
              </h2>

              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                Experience a virtual version of your health. Track your progress, understand your symptoms, and receive personalized care recommendations.
              </p>

              <div className="space-y-8 mb-10">
                {/* Feature 1 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#f0f5fa] flex items-center justify-center text-slate-700 shadow-sm border border-slate-100">
                    <HelpCircle size={22} strokeWidth={1.5} className="text-blue-900" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">What-If Simulations</h4>
                    <p className="text-slate-500 text-sm">Visualize health outcomes from lifestyle changes</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#f0f5fa] flex items-center justify-center text-slate-700 shadow-sm border border-slate-100">
                    <AlertCircle size={22} strokeWidth={1.5} className="text-blue-900" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Contraindication Detection</h4>
                    <p className="text-slate-500 text-sm">Instant allergy and side effects warnings</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#f0f5fa] flex items-center justify-center text-slate-700 shadow-sm border border-slate-100">
                    <RefreshCw size={22} strokeWidth={1.5} className="text-blue-900" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Real-Time Updates</h4>
                    <p className="text-slate-500 text-sm">Sync with smart devices and medical records</p>
                  </div>
                </div>
              </div>

              <button className="px-6 py-3.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 group">
                Create Your Digital Twin <ChevronsRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Column: Image */}
            <div className="lg:w-1/2 order-1 lg:order-2 reveal-on-scroll relative">
              {/* Decorative background blocks behind the image */}
              <div className="absolute top-0 left-0 w-3/4 h-3/4 bg-[#99b4d6] rounded-[2rem] -translate-x-6 -translate-y-6 z-0 mix-blend-multiply opacity-50 hidden md:block"></div>
              <div className="absolute bottom-0 right-0 w-4/5 h-4/5 bg-[#e8f0fe] rounded-[2.5rem] translate-x-10 translate-y-10 z-0 hidden md:block"></div>

              {/* The Image */}
              <div className="relative z-10 p-2">
                <img
                  src={digitalTwinImg}
                  alt="Personal Digital Twin Example"
                  className="w-full h-auto rounded-[1.5rem] shadow-2xl ring-1 ring-slate-900/5 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <DoctorsSection />
        <FeaturesSection />

      </main>

      {/* FOOTER */}
      <footer className="w-full">
        {/* Top Subscribe Section */}
        <div className="bg-[#2563eb] py-16 px-6">
          <div className="max-w-[70rem] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 reveal-on-scroll">
            <h3 className="text-white text-2xl md:text-[1.75rem] font-medium tracking-wide max-w-[42rem] md:leading-[1.4]">
              Subscribe to receive important updates, new services, and medical tips straight to your email.
            </h3>
            <div className="w-full max-w-md bg-white rounded-xl p-2.5 flex items-center shadow-lg">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent px-4 border-none outline-none text-slate-700 placeholder-slate-400 text-sm"
              />
              <button className="bg-[#1e3a8a] hover:bg-[#172b66] text-white px-8 py-3.5 rounded-[10px] font-semibold text-sm transition-colors shadow-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Section */}
        <div className="bg-[#0f172a] pt-24 pb-12 px-6">
          <div className="max-w-[70rem] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 reveal-on-scroll">

              {/* Column 1: Brand & Contact */}
              <div className="flex flex-col">
                <span className="text-3xl font-bold tracking-tight text-white mb-8">Neura</span>
                <p className="text-slate-300 text-sm leading-relaxed mb-8 pr-4 font-medium">
                  A smart healthcare platform connecting patients with trusted medical services.
                </p>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-[1.125rem] h-[1.125rem] rounded-full bg-white flex items-center justify-center text-[#0f172a]">
                      <Mail size={10} strokeWidth={3} />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">info@medicare.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-[1.125rem] h-[1.125rem] rounded-full bg-white flex items-center justify-center text-[#0f172a]">
                      <Phone size={10} strokeWidth={3} />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">+20 100 000 0000</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Quick Links */}
              <div className="flex flex-col lg:pl-4">
                <h4 className="text-white font-semibold mb-8 tracking-wide text-[15px]">Quick Links</h4>
                <div className="flex flex-col gap-5 text-sm font-medium">
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Home</a>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Services</a>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Digital Twin</a>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Our Doctors</a>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Contact Us</a>
                </div>
              </div>

              {/* Column 3: Our Services */}
              <div className="flex flex-col">
                <h4 className="text-white font-semibold mb-8 tracking-wide text-[15px]">Our Services</h4>
                <div className="flex flex-col gap-5 text-sm font-medium">
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Pharmacy</a>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Therapy Groups</a>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Nursing Care</a>
                  <a href="#" className="text-slate-300 hover:text-white transition-colors">Medical Booking</a>
                </div>
              </div>

              {/* Column 4: Appointment */}
              <div className="flex flex-col">
                <h4 className="text-white font-semibold mb-8 tracking-wide text-[15px]">Book An Appointment</h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium pr-2">
                  The doctorate staff members are well trained professionals.
                </p>
                <button className="flex items-center justify-center lg:justify-start gap-3 bg-transparent border border-[#334155] rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all w-max md:w-full lg:w-max group">
                  <Phone size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold tracking-wide">Call:+012 345 6789</span>
                </button>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#1e293b] pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6 reveal-on-scroll">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300/80">
                <span>All Rights Reserved © Medicare 2025</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
                <span className="hidden sm:inline text-slate-600">|</span>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white hover:bg-slate-800 transition-all">
                  <Facebook size={14} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white hover:bg-slate-800 transition-all">
                  <Twitter size={14} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white hover:bg-slate-800 transition-all">
                  <Instagram size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}