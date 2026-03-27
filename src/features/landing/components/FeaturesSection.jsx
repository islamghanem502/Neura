import React from 'react';
import { Shield, Zap, Globe, Heart } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      title: "Enterprise Security",
      desc: "HIPAA-compliant end-to-end encryption for all patient data and communications.",
      icon: Shield,
      color: "blue"
    },
    {
      title: "Real-time Sync",
      desc: "Instant updates across all devices and departments within seconds.",
      icon: Zap,
      color: "amber"
    },
    {
      title: "Global Reach",
      desc: "Connect with patients and specialists across the globe effortlessly.",
      icon: Globe,
      color: "emerald"
    },
    {
      title: "Human Centered",
      desc: "Interactions designed to prioritize the patient experience first.",
      icon: Heart,
      color: "rose"
    }
  ];

  return (
    <section className="py-32 px-6 bg-zinc-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 reveal-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">Designed for Reliability</h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">Infrastructure that never fails, when life is on the line.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className={`w-14 h-14 rounded-2xl bg-${f.color}-50 flex items-center justify-center text-${f.color}-600 mb-6`}>
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
