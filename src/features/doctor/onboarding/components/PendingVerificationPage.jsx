import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../../../api/authService';
import { FileText, Clock, HelpCircle, Mail, CheckCircle2, Shield, MoreHorizontal, FileBadge } from 'lucide-react';

export const PendingVerificationPage = () => {
  const navigate = useNavigate();

  // Helper to format date without dayjs
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Poll the profile API every 10 seconds to check if isActive becomes true
  const { data: profileRes } = useQuery({
    queryKey: ['profileMe'],
    queryFn: getProfile,
    refetchInterval: 10000,
  });

  const user = profileRes?.data?.user || profileRes?.user;

  useEffect(() => {
    if (user?.isActive === true || user?.isVerified === true) {
      navigate('/dashboard/doctor', { replace: true });
    }
  }, [user?.isActive, user?.isVerified, navigate]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex justify-center p-6 md:p-12 font-sans">
      <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          
          {/* Main Status Card */}
          <div className="bg-white rounded-[32px] p-12 flex flex-col items-center text-center shadow-sm">
            <div className="relative mb-8 mt-4">
               {/* Document Icon Circle */}
               <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
                  <div className="relative border-2 border-blue-600 rounded-lg p-2 bg-white">
                     <FileText size={40} className="text-blue-600" strokeWidth={1.5} />
                  </div>
               </div>
               {/* Small badge */}
               <div className="absolute right-0 bottom-0 bg-[#006058] rounded-full p-1.5 border-2 border-white shadow-sm">
                  <Clock size={16} className="text-white" />
               </div>
            </div>

            <h1 className="text-[32px] font-bold text-slate-900 mb-4 tracking-tight">Pending Verification</h1>
            <p className="text-[15px] font-medium text-slate-500 leading-relaxed max-w-md mx-auto mb-10">
              Your profile is under review. Our clinical compliance team is currently verifying your credentials. We will notify you once your information has been verified.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] px-8 py-3.5 rounded-full shell shadow-lg shadow-blue-200 transition-all active:scale-95">
                View Submitted Profile
              </button>
              <button className="bg-[#F2F4F6] hover:bg-slate-200 text-blue-600 font-bold text-[14px] px-8 py-3.5 rounded-full transition-all active:scale-95">
                Get Help
              </button>
            </div>
          </div>

          {/* Application Timeline Card */}
          <div className="bg-[#F2F4F6] rounded-[32px] p-10 shadow-sm border border-slate-100">
            <h3 className="font-bold text-[20px] text-slate-900 mb-8">Application Timeline</h3>
            
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
               
               {/* Step 1 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#006058] text-white shadow shrink-0 z-10 mr-4">
                     <CheckCircle2 size={18} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                     <h4 className="font-bold text-[14px] text-slate-900">Profile Submitted</h4>
                     <p className="text-[13px] text-slate-500 font-medium">Completed on {formatDate()}</p>
                  </div>
               </div>

               {/* Step 2 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow shrink-0 z-10 mr-4 border-4 border-[#F2F4F6]">
                     <MoreHorizontal size={18} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                     <h4 className="font-bold text-[14px] text-blue-600">Identity Verification</h4>
                     <p className="text-[13px] text-slate-500 font-medium">Currently in progress by our compliance team</p>
                  </div>
               </div>

               {/* Step 3 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-400 shadow shrink-0 z-10 mr-4 border-4 border-[#F2F4F6]">
                     <Shield size={18} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                     <h4 className="font-bold text-[14px] text-slate-800">Final Approval</h4>
                     <p className="text-[13px] text-slate-500 font-medium">Estimated 2-3 business days remaining</p>
                  </div>
               </div>

            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
           
           {/* Support Card */}
           <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-50">
              <div className="w-12 h-12 rounded-[14px] bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
                 <HelpCircle size={24} />
              </div>
              <h3 className="font-bold text-[18px] text-slate-900 mb-2">Need to update your info?</h3>
              <p className="text-[14px] font-medium text-slate-500 leading-relaxed mb-6">
                If you noticed a mistake in your submission or need to upload a renewed license, our support team can help.
              </p>
              <button className="w-full bg-[#F2F4F6] text-slate-800 font-bold text-[13px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                <Mail size={16} /> Contact Support
              </button>
           </div>

           {/* Documents Summaries */}
           <div className="bg-[#F9FAFB] rounded-[24px] p-8 border border-slate-100 flex flex-col gap-4">
              <h3 className="font-bold text-[16px] text-slate-900 mb-2">Verification Documents</h3>
              
              <div className="bg-white border text-left border-slate-100 rounded-[16px] px-5 py-4 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <FileText size={20} className="text-blue-500 shrink-0" />
                    <div>
                       <h5 className="text-[13px] font-bold text-slate-900">Medical License.pdf</h5>
                       <p className="text-[11px] font-medium text-slate-400">Primary Credential</p>
                    </div>
                 </div>
                 <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md">
                    Submitted
                 </span>
              </div>

              <div className="bg-white border text-left border-slate-100 rounded-[16px] px-5 py-4 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <FileBadge size={20} className="text-blue-500 shrink-0" />
                    <div>
                       <h5 className="text-[13px] font-bold text-slate-900">Board Certification.png</h5>
                       <p className="text-[11px] font-medium text-slate-400">Specialization</p>
                    </div>
                 </div>
                 <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md">
                    Submitted
                 </span>
              </div>
           </div>

           {/* Ad Banner */}
           <div className="relative bg-[#1A2E50] rounded-[24px] p-8 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#152540] to-transparent"></div>
              <div className="relative z-10 pt-16">
                 <h4 className="text-white font-bold text-[18px] mb-1">Trusted by 12,000+ Specialists</h4>
                 <p className="text-blue-200 text-[13px] font-medium">Join the leading network for clinical excellence.</p>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
