import React from 'react';
import { Facebook, Twitter, Linkedin, ArrowLeft, ArrowRight } from 'lucide-react';
import drMarwaImg from '../assets/dr_marwa_selim.jpg';
import drHamzaImg from '../assets/dr_hamza_emam.jpg';
import drAhmedImg from '../assets/dr_ahmed_nabil.jpg';

const DOCTORS = [
  { name: 'Dr.Marwa Sliem', spec: 'Surgeon', img: drMarwaImg, specialtyColor: 'text-[#3BDCB1]' },
  { name: 'Dr.Hamza Emam', spec: 'Neurology', img: drHamzaImg, specialtyColor: 'text-[#3BDCB1]' },
  { name: 'Dr.Ahmed Nabil', spec: 'Cancer Specialist', img: drAhmedImg, specialtyColor: 'text-[#3BDCB1]' },
];

export const DoctorsSection = () => (
  <section className="py-24 px-6 bg-[#f8fafc]">
    <div className="max-w-[70rem] mx-auto">
      {/* Headings */}
      <div className="mb-14 reveal-on-scroll">
        <span className="text-blue-600 font-bold block mb-3 text-sm md:text-base tracking-wide">Doctors</span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Meet Our Specialist Doctors</h2>
      </div>

      {/* Grid of Doctors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {DOCTORS.map((doc, i) => (
          <div key={i} className="flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-slate-100 reveal-on-scroll hover:-translate-y-2 transition-transform duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
            
            {/* Image Section */}
            <div className="relative h-[22rem] w-full bg-slate-100 overflow-hidden">
              <img 
                src={doc.img} 
                alt={doc.name} 
                className="w-full h-full object-cover object-top"
              />
              
              {/* Social Icons Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm">
                  <Facebook size={15} fill="currentColor" strokeWidth={0} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:bg-[#1a8cd3] transition-colors shadow-sm">
                  <Twitter size={15} fill="currentColor" strokeWidth={0} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#0077b5] text-white flex items-center justify-center hover:bg-[#005e91] transition-colors shadow-sm">
                  <Linkedin size={15} fill="currentColor" strokeWidth={0} />
                </a>
              </div>
            </div>

            {/* Text Section */}
            <div className="p-8 text-center bg-white flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{doc.name}</h3>
              <p className={`${doc.specialtyColor} font-medium`}>{doc.spec}</p>
            </div>
            
          </div>
        ))}
      </div>

      {/* Carousel Navigation Placeholder */}
      <div className="flex items-center justify-center gap-4 reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
        <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors bg-white">
          <ArrowLeft size={20} />
        </button>
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-[#0e61d8] hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
          <ArrowRight size={20} />
        </button>
      </div>

    </div>
  </section>
);
