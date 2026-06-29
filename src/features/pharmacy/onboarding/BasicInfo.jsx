import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, ArrowRight, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { OnboardingLayout, useOnboardingForm, OnboardingNavbar } from '../OnboardingLayout';

const BasicInfo = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { data, updateData } = useOnboardingForm();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <OnboardingLayout step={1} nextPath="/dashboard/pharmacy/credentials">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to ApothecaryOS</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">Let's start with the essentials. Tell us about your pharmacy brand and how we can reach you.</p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Form Section */}
            <div className="col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-slate-700">Pharmacy Name</label>
                    <input 
                      type="text" 
                      value={data.pharmacyName || ''}
                      onChange={(e) => updateData({ pharmacyName: e.target.value })}
                      placeholder="e.g. PH-9928374-X" 
                      className="w-full bg-[#F2F4F6] border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-slate-700">Business Phone Number</label>
                    <input 
                      type="text" 
                      value={data.businessPhone || ''}
                      onChange={(e) => updateData({ businessPhone: e.target.value })}
                      placeholder="10-digit numerical identifier" 
                      className="w-full bg-[#F2F4F6] border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Widgets */}
            <div className="col-span-5 space-y-6">
              
              {/* Logo Upload Card */}
              <div 
                onClick={() => fileInputRef.current.click()}
                className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group hover:border-blue-300 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                />
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {selectedFile ? selectedFile.name : 'Upload Pharmacy Logo'}
                </h3>
                <p className="text-sm text-[#43474F] mb-6">PNG, JPG or SVG (max. 5MB)</p>
                <button type="button" className="bg-gray-100 text-slate-800 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Browse Files
                </button>
                <p className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Recommended: 400x400px</p>
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

export default BasicInfo;