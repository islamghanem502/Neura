import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Upload, ArrowLeft, ArrowRight, Calendar, ChevronDown
} from 'lucide-react';
import { OnboardingLayout, useOnboardingForm, OnboardingNavbar } from '../OnboardingLayout';

const Credentials = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingForm();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      updateData({ files: [file.name] }); 
    }
  };

  return (
    <OnboardingLayout 
      step={2} 
      prevPath="/dashboard/pharmacy/basic-info" 
      nextPath="/dashboard/pharmacy/location"
    >
          <div className="mb-10 relative">
            <span className="absolute -top-7 left-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-md tracking-widest uppercase">
              Secure Verification
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">License & Credentialing</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
              To maintain clinical standards, please provide your pharmacy's primary operating license and supporting documentation for verification.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8 items-start">
            
            {/* Form Section */}
            <div className="col-span-7 space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                
                {/* State License Number */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">State License Number</label>
                  <input 
                    type="text" 
                      value={data.licenseNumber || ''}
                      onChange={(e) => updateData({ licenseNumber: e.target.value })}
                    placeholder="e.g. PH-9928374-X" 
                    className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Issuing Authority */}
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">Issuing Authority</label>
                    <div className="relative">
                      <select 
                        value={data.issuingAuthority || ''}
                        onChange={(e) => updateData({ issuingAuthority: e.target.value })}
                        className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 appearance-none focus:bg-white focus:border-blue-500/20 outline-none cursor-pointer">
                        <option>Select Board of Pharmacy</option>
                        <option>California State Board</option>
                        <option>New York State Board</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  {/* Expiration Date */}
                <div className="relative group">
  <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">
    Expiration Date
  </label>
  <div className="relative">
    <input 
      type="date" 
      value={data.expiryDate || ''}
      // appearance-none
      className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 focus:bg-white focus:border-blue-500/20 outline-none text-slate-600 block
                 cursor-pointer [color-scheme:light]"
      onChange={(e) => updateData({ expiryDate: e.target.value })}
    />
 
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
      <Calendar size={18} />
    </div>
  </div>
</div>
                </div>

                {/* NPI Number */}
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-widest mb-2.5">NPI Number (National Provider Identifier)</label>
                  <input 
                    type="text" 
                      value={data.npiNumber || ''}
                      onChange={(e) => updateData({ npiNumber: e.target.value })}
                    placeholder="10-digit numerical identifier" 
                    className="w-full bg-[#F2F4F6] border border-transparent rounded-xl p-4 focus:bg-white focus:border-blue-500/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Side Widgets */}
            <div className="col-span-5 space-y-6">
              
              {/* Document Upload Card */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white p-10 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:border-blue-400 transition-all duration-300 cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Upload size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {selectedFile ? selectedFile.name : 'Upload Verification Document'}
                </h3>
                <p className="text-sm text-slate-600 mb-8 px-6 leading-relaxed">
                  Drag and drop your State License (PDF, JPG, or PNG) or browse your files.
                </p>
                <button type="button" className="bg-slate-100 text-slate-700 px-8 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  Browse Files
                </button>
                <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Maximum file size: 10MB</p>
              </div>

              {/* Compliance Card */}
               <div className="bg-[#153886] text-white p-8 rounded-2xl relative overflow-hidden">
                              <div className="relative z-10">
                                 <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-green-500/20 p-1.5 rounded-md">
                                      <ShieldCheck size={20} className="text-green-400" />
                                    </div>
                                    <h4 className="font-bold text-sm tracking-wide uppercase">Compliance & Privacy</h4>
                                 </div>
                                 <p className="text-slate-400 text-sm leading-relaxed text-justify max-w-[440px]">
                                   All uploaded documents are encrypted and handled in compliance with HIPAA and SOC2 standards. We never share sensitive licensing data with third parties.
                                 </p>
                                 
                              </div>
                              {/* Decorative circle */}
                              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                            </div>
              

            </div>
          </div>
    </OnboardingLayout>
  );
};

export default Credentials;