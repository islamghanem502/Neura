import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import drFifteenYearsImg from '../assets/dr_fifteen_years.jpg';

export const FeaturesSection = () => {
  const checkItems = [
    "Medical Records",
    "Therapy Groups",
    "Nurses 24/7",
    "Nearby pharmacies",
    "Digital Twin"
  ];

  return (
    <section className="py-24 px-6 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-[70rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left Column: Image with Outline & Floating Card */}
        <div className="relative reveal-on-scroll flex justify-center lg:justify-start pt-8 pl-8 lg:pt-0 lg:pl-0 lg:ml-8">
          <div className="relative w-full max-w-[420px]">
            {/* Decorative outline frame offset to top left */}
            <div className="absolute -top-6 -left-6 w-full h-full border-[1.5px] border-blue-600 rounded-[2rem] z-0 hidden sm:block"></div>
            
            <img 
              src={drFifteenYearsImg} 
              alt="Experienced Doctors" 
              className="w-full h-auto aspect-[4/5] object-cover rounded-[2rem] relative z-10 shadow-lg"
            />
            
            {/* 15 Years of Experience Floating Card */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white px-6 py-5 rounded-2xl shadow-[0_15px_40px_-5px_rgb(0,0,0,0.08)] w-[90%] max-w-[300px] z-20">
              <div className="flex items-center gap-3 mb-3">
                 <CheckCircle2 size={18} className="text-blue-600" />
                 <span className="font-bold text-slate-800 text-[15px]">15 Years of experience</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                We have proudly served the community with excellence and compassion for over 15 years.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="reveal-on-scroll mt-12 lg:mt-0">
          <h2 className="text-[2.5rem] md:text-[3.25rem] font-bold text-slate-900 leading-[1.1] mb-2 tracking-tight">
            We Are Fully Available to <br className="hidden md:block"/> 
            <span className="text-[#2563EB]">Support With You</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 mb-10 mt-12">
            {checkItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[#2563EB]" strokeWidth={1.5} />
                <span className="text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-lg text-slate-700 mb-10 max-w-md leading-relaxed">
            Start your journey with trusted healthcare professionals today.
          </p>

          <button className="px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
            Get Started <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};
