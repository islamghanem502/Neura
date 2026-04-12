import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSubmitDoctorProfile } from '../../../../hooks/useDoctorData';
import { User, ShieldCheck, GraduationCap, FileText, CheckCircle2, ChevronRight, Edit, Loader2, MapPin, Building, Activity, Send } from 'lucide-react';

export const VerificationStep = ({ doctorData, docMeta, onPrev, onSubmitted }) => {
  const submitDoctorProfileMutation = useSubmitDoctorProfile();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleCheck = () => {
    if (doctorData?.isVerified) {
      toast.success('Your profile is verified!');
      // Assuming the dashboard route is /dashboard or /doctor/dashboard. Let's use /doctor/dashboard or similar.
      // Usually, if there's a global redirect, we can go to /
      navigate('/');
    } else {
      toast.error('Your profile is still under review.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center max-w-lg text-center">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-[28px] font-bold text-slate-900 mb-4 tracking-tight">Application Submitted</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed text-[15px]">
            Your profile and documents have been successfully submitted and are currently pending review by our compliance team.
          </p>
          
          <button 
            onClick={handleCheck}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4.5 rounded-full font-bold text-[16px] shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1120px] mx-auto animate-in fade-in duration-500 pb-16">
      {/* Progress Header */}
      <div className="flex justify-between items-end mb-8">
        <h1 className="font-sans font-bold text-[36px] tracking-tight text-[#191C1E]">
          Final Verification
        </h1>
      </div>

      {/* Bento Grid Review Sections */}
      <div className="flex flex-col gap-8">
        
        {/* Top Split: Identity / Photo */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_390px] gap-8">
          
          {/* Primary Identity Card */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0px_12px_32px_-4px_rgba(0,74,198,0.08)] relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="flex items-center gap-2 font-bold text-[20px] text-[#191C1E]">
                <User size={20} className="text-blue-600" />
                Personal Identity
              </h3>
              <button className="text-blue-600 font-semibold text-[14px] hover:underline">Edit Section</button>
            </div>
            
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              <div>
                <p className="text-[12px] font-semibold tracking-wider uppercase text-[#434655] mb-1">Full Legal Name</p>
                <p className="text-[18px] font-medium text-[#191C1E]">Dr. {doctorData?.firstName || 'Julianne'} {doctorData?.lastName || 'Sterling'}, MD</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold tracking-wider uppercase text-[#434655] mb-1">Specialization</p>
                <p className="text-[18px] font-medium text-[#191C1E]">{doctorData?.specialization || 'Cardiovascular Surgery'}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold tracking-wider uppercase text-[#434655] mb-1">Email Address</p>
                <p className="text-[18px] font-medium text-[#191C1E]">{doctorData?.email || 'j.sterling@clinicalethereal.com'}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold tracking-wider uppercase text-[#434655] mb-1">Medical License ID</p>
                <p className="text-[18px] font-medium text-[#191C1E]">{docMeta?.medicalLicense?.licenseNumber || 'MD-9920-XQ-2024'}</p>
              </div>
            </div>
          </div>

          {/* Profile Image / Identity Proof */}
          <div className="bg-[#F2F4F6] rounded-[24px] p-8 flex flex-col justify-center items-center relative text-center">
             <div className="relative mb-4">
                <img 
                  src={typeof doctorData?.profileImage === 'string' ? doctorData.profileImage : doctorData?.profileImage?.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"} 
                  alt="Doctor" 
                  className="w-[128px] h-[128px] rounded-full object-cover border-4 border-white shadow-md relative z-0"
                />
                <div className="absolute right-1 bottom-1 bg-[#006058] border-2 border-white rounded-full p-1 z-10">
                   <ShieldCheck size={12} className="text-white" />
                </div>
             </div>
             <h4 className="font-bold text-[16px] text-[#191C1E] mb-2">Verified Identity Photo</h4>
             <p className="text-[12px] text-[#434655] max-w-[200px]">This photo matches your provided government ID and will be used for your clinician profile.</p>
          </div>
        </div>

        {/* Professional Credentials */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0px_12px_32px_-4px_rgba(0,74,198,0.08)]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="flex items-center gap-2 font-bold text-[20px] text-[#191C1E]">
              <ShieldCheck size={20} className="text-blue-600" />
              Academic & Clinical Credentials
            </h3>
            <button className="text-blue-600 font-semibold text-[14px] hover:underline">Edit Section</button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#F2F4F6] rounded-[24px] p-4 px-6 flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="bg-white shadow-sm rounded-2xl p-3 flex items-center justify-center">
                    <GraduationCap size={24} className="text-blue-600" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-[14px] text-[#191C1E]">Doctor of Medicine (MD)</h4>
                   <p className="text-[12px] text-[#434655]">{docMeta?.medicalDegree?.university || 'Johns Hopkins School of Medicine'} • {docMeta?.medicalDegree?.graduationYear || '2012'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 text-[#006058] font-medium text-[14px]">
                 <CheckCircle2 size={16} /> Transcript Verified
               </div>
            </div>

            <div className="bg-[#F2F4F6] rounded-[24px] p-4 px-6 flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="bg-white shadow-sm rounded-2xl p-3 flex items-center justify-center">
                    <Activity size={24} className="text-blue-600" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-[14px] text-[#191C1E]">{doctorData?.specialization ? `Board Certification in ${doctorData?.specialization}` : 'Board Certification in Cardiology'}</h4>
                   <p className="text-[12px] text-[#434655]">American Board of Internal Medicine • Active</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 text-[#006058] font-medium text-[14px]">
                 <CheckCircle2 size={16} /> Credential Active
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Split: Documents Only */}
        <div className="grid grid-cols-1 gap-8">
           
           {/* Documents Summary */}
           <div className="bg-white rounded-[24px] p-8 pb-10 border-l-4 border-[#006058] shadow-[0px_12px_32px_-4px_rgba(0,74,198,0.08)]">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-bold text-[18px] text-[#191C1E]">Uploaded Documents</h3>
                 <FileText size={20} className="text-[#434655]" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-[#F2F4F6] rounded-[16px] px-4 py-3 flex items-center gap-3">
                    <FileText size={14} className="text-[#434655] shrink-0" />
                    <span className="text-[12px] font-medium text-[#434655] truncate">Resume.pdf</span>
                 </div>
                 <div className="bg-[#F2F4F6] rounded-[16px] px-4 py-3 flex items-center gap-3">
                    <FileText size={14} className="text-[#434655] shrink-0" />
                    <span className="text-[12px] font-medium text-[#434655] truncate">Board_Cert.pdf</span>
                 </div>
                 <div className="bg-[#F2F4F6] rounded-[16px] px-4 py-3 flex items-center gap-3">
                    <FileText size={14} className="text-[#434655] shrink-0" />
                    <span className="text-[12px] font-medium text-[#434655] truncate">Govt_ID.jpg</span>
                 </div>
                 <div className="bg-[#F2F4F6] rounded-[16px] px-4 py-3 flex items-center gap-3">
                    <FileText size={14} className="text-[#434655] shrink-0" />
                    <span className="text-[12px] font-medium text-[#434655] truncate">Liability_Ins.pdf</span>
                 </div>
              </div>
           </div>

        </div>

        {/* Submission Confirmation Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-700 to-[#1E3A8A] rounded-[16px] p-10 flex flex-col md:flex-row items-center gap-10">
           <div className="flex-1">
             <h2 className="text-[24px] font-bold text-white mb-3 tracking-tight">Ready for Verification?</h2>
             <p className="text-[14px] text-blue-100 leading-relaxed mb-6 max-w-[500px]">
               By clicking 'Submit for Verification', you certify that all information provided is accurate and truthful. Our clinical review board will process your credentials within 24-48 business hours. You will be notified via email once your account is active.
             </p>
             <div className="flex items-center gap-3">
               <input type="checkbox" className="w-5 h-5 rounded-[4px] border-white/20 bg-white/10 accent-blue-500 cursor-pointer" />
               <span className="text-[12px] text-blue-100">I agree to the Professional Clinician Terms of Service and Privacy Policy.</span>
             </div>
           </div>
           
           <div className="flex flex-col gap-4 w-full md:w-[280px] shrink-0">
             <button 
                onClick={() => onSubmitted()}
                className="w-full bg-white text-[#1E3A8A] py-4 rounded-full font-bold text-[16px] shadow-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
             >
                Submit for Verification <Send size={18} />
             </button>
             <button 
                onClick={() => onSubmitted()}
                className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-full font-semibold text-[16px] hover:bg-white/20 transition-all"
             >
               Save as Draft
             </button>
           </div>
        </div>

        <p className="text-center text-[12px] text-[#434655] mt-4">
           All data is encrypted using 256-bit SSL protocols. Your privacy and security are our highest priority.
        </p>

      </div>
    </div>
  );
};
