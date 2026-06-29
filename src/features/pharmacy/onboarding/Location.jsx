import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Info, ArrowLeft, ArrowRight, Map as MapIcon, ChevronDown, MapPin
} from 'lucide-react';
import { OnboardingLayout, useOnboardingForm, OnboardingNavbar } from '../OnboardingLayout';

const Location = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingForm();

  return (
    <OnboardingLayout 
      step={3} 
      prevPath="/dashboard/pharmacy/credentials" 
      nextPath="/dashboard/pharmacy/delivery"
    >
      
      
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Where is your pharmacy located?</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
              Please provide the physical address of your registered premises. This will be used for regulatory verification and delivery logistics.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Address Form Section */}
            <div className="col-span-7 space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Street Address */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">Street Address</label>
                  <input 
                    type="text" 
                      value={data.street || ''}
                      onChange={(e) => updateData({ street: e.target.value })}
                    placeholder="e.g. PH-9928374-X" 
                    className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 focus:bg-white focus:border-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* City */}
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">City</label>
                    <input 
                      type="text" 
                      value={data.city || ''}
                      onChange={(e) => updateData({ city: e.target.value })}
                      placeholder="Boston" 
                      className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 focus:bg-white focus:border-blue-500/20 outline-none"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">Postal Code</label>
                    <input 
                      type="text" 
                      value={data.postalCode || ''}
                      onChange={(e) => updateData({ postalCode: e.target.value })}
                      placeholder="02108" 
                      className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 focus:bg-white focus:border-blue-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Country Selection */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">Country</label>
                  <div className="relative">
                    <select 
                      value={data.country || 'United States'}
                      onChange={(e) => updateData({ country: e.target.value })}
                      className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 appearance-none focus:bg-white focus:border-blue-500/20 outline-none cursor-pointer text-slate-400">
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Map & Info Section */}
            <div className="col-span-5 space-y-6">
              
              {/* Map Container */}
<div className="relative h-[447px] rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
  

  <a 
    href="https://www.google.com/maps?q=42.3601,-71.0589" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="absolute inset-0 z-20"
  >
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
  </a>

 
  <iframe
    title="Pharmacy Map"
    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12000!2d-71.0589!3d42.3601!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1625000000000!5m2!1sen!2sus"
    className="absolute inset-0 w-full h-full grayscale-[30%] opacity-60"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
  ></iframe>


  <div className="absolute inset-0 flex items-center justify-center p-6 z-30 pointer-events-none">
    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl max-w-[280px] text-center border border-white">
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-600">
        <MapIcon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-800">Optional Map Pin</h3>
      <p className="text-sm text-slate-700 mb-6 leading-relaxed max-w-[280px] mx-auto text-center">
        Drag the pin to mark your pharmacy entrance for precise delivery drops.
      </p>
      <button 
        onClick={() => window.open(`https://www.google.com/maps?q=${data.lat || 42.3601},${data.lng || -71.0589}`, '_blank')}
        className="bg-[#153886]  text-sm text-white w-full py-3 rounded-full font-bold hover:bg-blue-700 transition-colors pointer-events-auto"
      >
        Activate Precise Location
      </button>
    </div>
  </div>

  
  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white px-4 py-2 rounded-full shadow-md border border-slate-100 flex items-center gap-2 pointer-events-none">
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
    <span className="text-[10px] font-bold text-slate-600 tracking-wider">
      LAT: 42.3601 N, LON: 71.0589 W
    </span>
  </div>
</div>
              {/* Info Card */}
              <div className="bg-[#D4E3FF4D] p-6 rounded-2xl border border-blue-100 flex gap-4">
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Info size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-1">Why do we need this?</h4>
                  <p className="text-xs text-slate-900 leading-relaxed text-justify max-w-[350px]">
                    This information helps us verify your license with the state board and ensures that temperature-sensitive shipments arrive at the correct loading dock.
                  </p>
                </div>
              </div>

            </div>
          </div>
    </OnboardingLayout>
  );
};

export default Location;