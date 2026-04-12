import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUploadDoctorDocument } from '../../../../hooks/useDoctorData';
import { ArrowLeft, ArrowRight, ShieldCheck, CloudUpload, Loader2, CheckCircle2 } from 'lucide-react';

export const CredentialsStep = ({ docMeta, setDocMeta, onNext, onPrev }) => {
  const uploadDocMutation = useUploadDoctorDocument();
  const [selectedFile, setSelectedFile] = useState(null);

  const [errors, setErrors] = useState({});
  const currentYear = new Date().getFullYear();

  const handleDocMetaChange = (field, value) => {
    setDocMeta((prev) => ({
      ...prev,
      medicalDegree: {
        ...prev.medicalDegree,
        [field]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {};
    const meta = docMeta.medicalDegree || {};

    if (!meta.university?.trim()) {
      newErrors.university = 'University is required';
      isValid = false;
    }
    if (!meta.graduationYear) {
      newErrors.graduationYear = 'Graduation Year is required';
      isValid = false;
    } else if (meta.graduationYear > currentYear) {
      newErrors.graduationYear = 'Cannot be in the future';
      isValid = false;
    }
    if (!meta.degree?.trim()) {
      newErrors.degree = 'Degree is required';
      isValid = false;
    }
    if (!selectedFile) {
      newErrors.file = 'Certificate file is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validate()) {
      toast.error('Please fill all required fields and select a file.');
      return;
    }

    const { university, graduationYear, degree } = docMeta.medicalDegree;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('university', university);
    formData.append('graduationYear', graduationYear);
    formData.append('degree', degree);

    uploadDocMutation.mutate(
      { documentType: 'medical-degree', formData },
      {
        onSuccess: () => {
          onNext(3);
        },
      }
    );
  };

  const degreeOptions = [
    { value: '', label: 'Select Degree' },
    { value: 'Doctor of Medicine (MD)', label: 'Doctor of Medicine (MD)' },
    { value: 'Doctor of Osteopathic Medicine (DO)', label: 'Doctor of Osteopathic Medicine (DO)' },
    { value: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)', label: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)' },
    { value: 'Doctor of Dental Surgery (DDS)', label: 'Doctor of Dental Surgery (DDS)' },
    { value: 'MBBCh', label: 'MBBCh' },
    { value: 'Other', label: 'Other Medical Degree' },
  ];

  // ─── Style Classes ────────────────────────────────────────────────────────
  const inputClass = (hasError) =>
    `w-full bg-[#f4f4f5] text-slate-700 px-5 py-4 rounded-[14px] border transition-all text-[14px] font-medium focus:outline-none ${
      hasError 
        ? 'border-red-300 focus:ring-2 focus:ring-red-100' 
        : 'border-transparent focus:border-blue-200 focus:ring-2 focus:ring-blue-100'
    }`;
    
  const labelClass = 'text-[11px] font-bold text-slate-800 mb-2.5 block uppercase tracking-widest opacity-80';

  return (
    <div className="flex flex-col lg:flex-row gap-16 animate-in fade-in duration-500">
      {/* LEFT FORM CONTENT */}
      <div className="flex-1">
        {/* Main White Card Container */}
        <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-sm border border-slate-100 space-y-10">
          
          <div>
            <label className={labelClass}>University / Medical School</label>
            <input
              className={inputClass(errors.university)}
              placeholder="e.g. Johns Hopkins School of Medicine"
              value={docMeta.medicalDegree?.university || ''}
              onChange={(e) => handleDocMetaChange('university', e.target.value)}
            />
            {errors.university && <span className="text-red-500 text-[11px] font-medium mt-3 block">{errors.university}</span>}
          </div>

          <div>
             <label className={labelClass}>Primary Degree / Specialization</label>
             <div className="relative">
               <select
                 className={`${inputClass(errors.degree)} appearance-none`}
                 value={docMeta.medicalDegree?.degree || ''}
                 onChange={(e) => handleDocMetaChange('degree', e.target.value)}
               >
                 {degreeOptions.map((opt) => (
                   <option key={opt.value} value={opt.value}>{opt.label}</option>
                 ))}
               </select>
               <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="14" height="10" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                 </svg>
               </div>
             </div>
             {errors.degree && <span className="text-red-500 text-[11px] font-medium mt-3 block">{errors.degree}</span>}
          </div>

          <div>
            <label className={labelClass}>Graduation Year</label>
            <input
              type="number"
              max={currentYear}
              className={inputClass(errors.graduationYear)}
              placeholder="e.g. 2017"
              value={docMeta.medicalDegree?.graduationYear || ''}
              onChange={(e) => handleDocMetaChange('graduationYear', e.target.value)}
            />
            {errors.graduationYear && <span className="text-red-500 text-[11px] font-medium mt-3 block">{errors.graduationYear}</span>}
          </div>

          <div>
             <label className={labelClass}>Upload Digital Certificates</label>
             <div className={`border-2 border-dashed rounded-[32px] p-16 flex flex-col items-center justify-center text-center transition-all bg-white ${errors.file ? 'border-red-300 bg-red-50' : 'border-slate-100 hover:border-blue-200'}`}>
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8">
                 <CloudUpload size={32} />
               </div>
               <h4 className="text-[18px] font-bold text-slate-900 mb-2">Drag and drop your certificates here</h4>
               <p className="text-[13px] font-medium text-slate-400 mb-12">PDF, PNG or JPG (Max 10MB per file)</p>
               
               <label className="cursor-pointer bg-white border border-slate-200 text-blue-600 hover:bg-slate-50 px-12 py-3.5 rounded-full text-[15px] font-bold shadow-sm transition-all active:scale-95">
                 {selectedFile ? selectedFile.name : 'Browse Files'}
                 <input
                   type="file"
                   className="hidden"
                   accept="image/*,.pdf"
                   onChange={(e) => {
                     if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                   }}
                 />
               </label>
               {errors.file && <span className="text-red-500 text-[11px] font-medium mt-4 block">{errors.file}</span>}
             </div>
          </div>
        </div>

        {/* Buttons below the card as in the mock */}
        <div className="flex justify-between items-center mt-12 px-4">
          <button
            type="button"
            onClick={() => onPrev(1)}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2 transition-all text-[16px] disabled:opacity-50"
            disabled={uploadDocMutation.isPending}
          >
            <ArrowLeft size={20} /> Previous Step
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={uploadDocMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-4.5 rounded-full font-bold text-[16px] shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadDocMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : 'Save and Continue'} 
            {!uploadDocMutation.isPending && <ArrowRight size={24} />}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div className="w-full lg:w-[420px] flex flex-col gap-8 shrink-0">
        <div className="bg-[#f8fafc] border border-slate-100 rounded-[32px] p-10 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[15px] mb-6 tracking-wider">
             <ShieldCheck size={20} />
            <span>Trust & Security</span>
          </div>
          <p className="text-[14px] text-slate-500 font-medium mb-10 leading-relaxed">
            Your professional credentials are the foundation of your clinical practice on our platform.
          </p>

          <div className="space-y-8">
            <div className="flex gap-5">
              <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[14px] font-bold text-slate-900">HIPAA Compliant</h5>
                <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">Your documents are encrypted using AES-256 standard and stored securely.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[14px] font-bold text-slate-900">Rapid Verification</h5>
                <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">AI-powered registration checks take less than 24 hours to complete.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8fafc] border border-slate-100 rounded-[32px] p-8 shadow-sm overflow-hidden relative group">
          <div className="mb-8 rounded-2xl overflow-hidden bg-slate-200 h-56 relative">
             <img 
               src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=600" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               alt="Customer Support" 
             />
             <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <h4 className="font-bold text-[18px] text-slate-900 mb-3">Need Help?</h4>
          <p className="text-[13px] text-slate-400 font-medium mb-8 leading-relaxed">
            If you are an International graduate or have multiple certifications, our onboarding specialists are here to assist you 24/7.
          </p>
          <button className="w-full bg-white border border-slate-100 text-slate-600 py-4 rounded-2xl text-[13px] font-bold hover:bg-slate-50 transition-all tracking-wide shadow-sm active:scale-95">
            CHAT WITH SUPPORT
          </button>
        </div>
      </div>
    </div>
  );
};
