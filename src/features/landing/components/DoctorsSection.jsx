import React from 'react';
import { Stethoscope, Award, Star } from 'lucide-react';

const DOCTORS = [
  { name: 'Dr. Sarah Jenkins', spec: 'Cardiology', rating: '4.9' },
  { name: 'Dr. Ahmed Youssef', spec: 'Neurology', rating: '5.0' },
  { name: 'Dr. Emily Chen', spec: 'Pediatrics', rating: '4.8' },
];

export const DoctorsSection = () => (
  <section className="py-32 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16 reveal-on-scroll">
        <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Elite Network</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-2 text-zinc-900">World-class Specialists</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {DOCTORS.map((doc, i) => (
          <div key={i} className="group p-8 rounded-[2rem] bg-zinc-50 border border-zinc-200 hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 text-center reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
              <Stethoscope size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-1">{doc.name}</h3>
            <p className="text-blue-600 font-medium text-sm mb-4">{doc.spec}</p>
            <div className="flex items-center justify-center gap-1 text-zinc-600 text-sm font-semibold mb-6">
              <Star className="text-amber-400" size={16} fill="currentColor" /> {doc.rating}
            </div>
            <button className="px-6 py-2 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);
