import React, { useEffect, useState } from 'react';
import { Header } from '../../components/Header';
import { FeaturesSection } from './components/FeaturesSection';
import { DoctorsSection } from './components/DoctorsSection';
import { DigitalTwinVisual } from './components/DigitalTwinVisual';
import { AISummaryVisual, GroupTherapyVisual } from './components/FeatureVisuals';
import { Icons } from './components/Icons';
import { ArrowRight, Check, Activity, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Particles imports
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

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
        {/* HERO SECTION - GOOGLE ANTIGRAVITY STYLE */}
        <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden bg-white">

          {/* Particles Background Layer (The Drifting Dots/Dashes) */}
          {init && (
            <Particles
              id="tsparticles"
              className="absolute inset-0 z-0"
              options={{
                fullScreen: { enable: false },
                fpsLimit: 120,
                interactivity: {
                  events: {
                    onHover: {
                      enable: true,
                      mode: "repulse", // التنافر عند اقتراب الماوس
                    },
                    resize: { enable: true },
                  },
                  modes: {
                    repulse: {
                      distance: 120,
                      duration: 0.4,
                      speed: 1,
                    },
                  },
                },
                particles: {
                  color: {
                    // مصفوفة الألوان من الصور اللي بعتها (أزرق، لبني، بنفسجي)
                    value: ["#2563eb", "#60a5fa", "#a855f7", "#3b82f6"],
                  },
                  move: {
                    direction: "none",
                    enable: true,
                    outModes: {
                      default: "out",
                    },
                    random: true,
                    speed: 0.5, // حركة هادئة تشبه انعدام الجاذبية
                    straight: false,
                  },
                  number: {
                    density: {
                      enable: true,
                      area: 800,
                    },
                    value: 170, // كثافة مشابهة للصورة
                  },
                  opacity: {
                    value: { min: 0.3, max: 0.7 },
                  },
                  shape: {
                    type: "char", // استخدام الرموز لعمل شكل "الشرطة"
                    options: {
                      char: {
                        value: ["—", "-"],
                        font: "Verdana",
                        weight: "800"
                      }
                    }
                  },
                  size: {
                    value: { min: 2, max: 5 },
                  },
                  rotate: {
                    value: { min: 0, max: 360 },
                    direction: "random",
                    animation: {
                      enable: true,
                      speed: 5
                    }
                  },
                  links: {
                    enable: false, // بدون خطوط متصلة تماماً
                  },
                },
                detectRetina: true,
              }}
            />
          )}

          {/* Floating Contextual Cards (Glassmorphism) */}
          <div className="absolute top-1/4 left-[12%] hidden lg:block animate-[bounce_6s_infinite] z-10">
            <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl flex items-center gap-3 w-48 transition-transform duration-500 hover:scale-105">
              <div className="bg-red-500/10 p-2 rounded-lg text-red-500"><Activity size={20} className="animate-pulse" /></div>
              <div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Vitals</div>
                <div className="text-sm font-black text-zinc-900">72 BPM</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1/4 right-[12%] hidden lg:block animate-[bounce_8s_infinite_reverse] z-10">
            <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl flex items-center gap-3 w-52 transition-transform duration-500 hover:scale-105">
              <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Calendar size={20} /></div>
              <div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Next Appointment</div>
                <div className="text-sm font-black text-zinc-900">Dr. Ahmed</div>
              </div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
            <h1 className="text-[7rem] md:text-[10rem] font-black tracking-tighter text-black leading-[0.8] mb-4 reveal-on-scroll">
              NEURA
            </h1>

            <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] uppercase text-blue-600 mb-8 reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
              The Intelligent Ecosystem
            </h2>

            <p className="text-zinc-500 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-medium reveal-on-scroll" style={{ transitionDelay: '400ms' }}>
              Redefining medical connectivity through real-time digital twins and professional AI documentation.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center pt-4 reveal-on-scroll" style={{ transitionDelay: '600ms' }}>
              <button onClick={() => navigate('/auth/register')} className="px-10 py-5 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 hover:-translate-y-1 flex items-center gap-3">
                Join the Network <ArrowRight size={20} />
              </button>
              <button className="px-10 py-5 rounded-full bg-white border border-zinc-200 text-zinc-900 font-bold text-lg hover:bg-zinc-50 transition-all hover:-translate-y-1">
                View Architecture
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: USER ROLES */}
        <section className="py-24 bg-zinc-50 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 reveal-on-scroll">
              <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Unified Platform</span>
              <h3 className="text-4xl md:text-5xl font-bold mt-2 text-zinc-900">Built for Every Member of Care</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Patient", icon: Icons.Patient, desc: "Personal records & predictive insights" },
                { name: "Doctor", icon: Icons.Doctor, desc: "AI Summaries & smart dashboards" },
                { name: "Pharmacy", icon: Icons.Pharmacy, desc: "Instant e-prescriptions" },
                { name: "Nurse", icon: Icons.NurseIcon, desc: "Real-time vitals monitoring" }
              ].map((role, i) => (
                <div key={i} className="group flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-zinc-100 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:-translate-y-2 reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                    <role.icon size={28} />
                  </div>
                  <h4 className="font-semibold text-xl text-zinc-900 mb-2">{role.name}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed font-medium">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: DIGITAL TWIN */}
        <section className="py-32 px-6 relative bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-8 uppercase tracking-wider">
                <Icons.Twin size={16} />
                <span>Core Technology</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-zinc-900 mb-8 tracking-tight">
                Your Living <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 font-black">Digital Replica.</span>
              </h2>
              <p className="text-xl text-zinc-600 font-light mb-10 leading-relaxed max-w-lg">
                Updates in real-time with every visit, lab result, and prescription. Visualize risks, track trends, and predict outcomes before they happen.
              </p>

              <button className="px-8 py-4 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 font-semibold hover:-translate-y-1">
                Explore The Architecture
              </button>
            </div>

            <div className="order-1 lg:order-2 reveal-on-scroll">
              <div className="relative rounded-[2.5rem] bg-zinc-50 border border-zinc-100 p-4 shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-shadow duration-700">
                <DigitalTwinVisual />
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
                <span>Encrypted Flow</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-zinc-900 mb-8 tracking-tight">
                Instantly <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 font-black">Synchronized.</span>
              </h2>
              <p className="text-xl text-zinc-600 font-light mb-10 leading-relaxed max-w-lg">
                Whenever a physician updates a diagnosis, nurses and the pharmacy receive immediate secure alerts. Complete continuity of care.
              </p>
              <button className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1">
                Explore Routing
              </button>
            </div>

            <div className="order-1 lg:order-2 reveal-on-scroll">
              <div className="relative rounded-[2.5rem] bg-zinc-50 border border-zinc-100 p-8 shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.15)] transition-shadow duration-700">
                <GroupTherapyVisual />
              </div>
            </div>
          </div>
        </section>

        <DoctorsSection />
        <FeaturesSection />

        {/* CALL TO ACTION */}
        <section className="py-32 relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10 reveal-on-scroll">
            <h2 className="text-[5rem] md:text-[8rem] font-black tracking-tighter mb-8 text-zinc-900 leading-[0.85]">
              NEURA
            </h2>
            <p className="text-xl text-zinc-600 max-w-xl mx-auto mb-12 font-medium">
              The future of healthcare is connected, intelligent, and human-centric. Built exclusively for excellence.
            </p>
            <button onClick={() => navigate('/auth/register')} className="group px-12 py-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] hover:-translate-y-2 flex items-center justify-center gap-3 mx-auto">
              Get Started Free <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-zinc-50 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div>
            <span className="text-4xl font-black tracking-tight text-zinc-900 block mb-6">NEURA.</span>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-medium">
              Enterprise medical infrastructure designed for privacy, speed, and elegance. Transform the way your clinic operates today.
            </p>
          </div>

          <div className="flex gap-16 text-sm text-zinc-600">
            <div className="flex flex-col gap-5">
              <span className="text-zinc-900 font-bold uppercase tracking-wider text-xs">Platform</span>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Digital Twin</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">AI Scribe</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Security</a>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-zinc-900 font-bold uppercase tracking-wider text-xs">Legal</span>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">HIPAA Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors font-medium">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 font-semibold tracking-wide">
          <p>&copy; {new Date().getFullYear()} NEURA Health Systems. All rights reserved.</p>
          <p>Engineered for excellence.</p>
        </div>
      </footer>
    </div>
  );
}