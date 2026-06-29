import React from 'react';
import { useDoctorData } from '../../../../hooks/useDoctorData';
import { Navigate, Link } from 'react-router-dom';
import { 
  TrendingUp, Calendar as CalendarIcon, Clock, MessageSquare, 
  MoreHorizontal, FileText, PlusSquare, Users, CopyPlus, PlayCircle,
  CheckCircle2
} from 'lucide-react';
import { useDoctorAppointments, resolveAppointments } from '../../../../hooks/useAppointments';

const getPatientName = (appt) => {
  const p = appt?.patient;
  if (!p || typeof p === 'string') return 'Patient';
  return p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
};

const getPatientAvatar = (appt) => {
  const p = appt?.patient;
  if (!p || typeof p === 'string') return null;
  return p.profileImage?.imageUrl || (typeof p.profileImage === 'string' ? p.profileImage : null);
};

const calcAge = (dob) => {
  if (!dob) return '—';
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

const DoctorDashboard = () => {
  const { data: doctorRes, isLoading: isDoctorLoading } = useDoctorData();
  const { data: apptsRes, isLoading: isApptsLoading } = useDoctorAppointments({ limit: 50 });

  if (isDoctorLoading || isApptsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const doctorData = doctorRes?.data?.basicInfo || doctorRes || { firstName: 'Dr.', lastName: 'Richardson' };
  
  if (doctorData.accountStatus === 'incomplete') {
    return <Navigate to="/dashboard/doctor/profile" replace />;
  }

  const allAppts = resolveAppointments(apptsRes);
  const today = new Date().toISOString().split('T')[0];
  
  const todayAppts = allAppts.filter(a => a.scheduledDate?.startsWith(today));
  const upcomingAppts = allAppts.filter(a => a.status === 'confirmed' || a.status === 'checkedIn');
  const completedAppts = allAppts.filter(a => a.status === 'completed').sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  // Unique patients count
  const patientIds = new Set(allAppts.map(a => a.patient?._id || a.patient?.id).filter(Boolean));
  const totalPatients = patientIds.size || 0;

  // Next active appointment
  const nextAppt = upcomingAppts.find(a => a.status === 'checkedIn') || upcomingAppts[0];
  const nextPatientName = nextAppt ? getPatientName(nextAppt) : null;
  const nextPatientAvatar = nextAppt ? getPatientAvatar(nextAppt) : null;
  const nextPatientAge = nextAppt ? calcAge(nextAppt?.patient?.dateOfBirth) : null;
  const nextPatientGender = nextAppt?.patient?.gender || '—';

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-bold text-[#191C1E] tracking-tight">
          Good morning, {doctorData.firstName} {doctorData.lastName}
        </h1>
        <p className="text-[14px] text-[#434655]">
          You have {todayAppts.length} appointments scheduled for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Total Patients Card */}
        <div className="relative overflow-hidden rounded-[16px] p-5 text-white min-h-[130px] flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #004AC6 0%, #2563EB 100%)' }}>
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 blur-2xl rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full">
             <h3 className="text-[13px] font-medium text-white/80 mb-1">Total Patients</h3>
             <p className="text-[36px] font-extrabold leading-none mb-auto">{totalPatients.toLocaleString()}</p>
             <div className="flex items-center gap-1.5 self-start bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full mt-3">
                <TrendingUp size={11} className="text-white" strokeWidth={2.5} />
                <span className="text-[11px] font-medium">+5% from last month</span>
             </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-[16px] p-5 min-h-[130px] flex flex-col justify-between shadow-sm border border-[#EAEAEB] relative">
           <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#ACBCFF]/30 text-[#495C95]">
              <CalendarIcon size={16} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[13px] font-medium text-[#434655] mb-0.5">Today's Appointments</p>
              <p className="text-[22px] font-bold text-[#191C1E]">{todayAppts.length}</p>
           </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-[16px] p-5 min-h-[130px] flex flex-col justify-between shadow-sm border border-[#EAEAEB] relative">
           <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#007B71]/10 text-[#006058]">
              <Clock size={16} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[13px] font-medium text-[#434655] mb-0.5">Upcoming Sessions</p>
              <p className="text-[22px] font-bold text-[#191C1E]">{upcomingAppts.length}</p>
           </div>
        </div>

        {/* Unread Messages */}
        <div className="bg-white rounded-[16px] p-5 min-h-[130px] flex flex-col justify-between shadow-sm border border-[#EAEAEB] relative">
           <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FFDAD6]/30 text-[#BA1A1A]">
              <MessageSquare size={16} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[13px] font-medium text-[#434655] mb-0.5">Unread Messages</p>
              <p className="text-[22px] font-bold text-[#191C1E]">7</p>
           </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          
          {/* Next Appointment */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#191C1E]">Next Appointment</h3>
              <Link to="/dashboard/doctor/appointments" className="text-[13px] font-semibold text-[#2563EB] hover:underline">View Schedule</Link>
            </div>
            
            <div className="bg-white rounded-[16px] p-5 shadow-sm border border-[#EAEAEB]">
               {nextAppt ? (
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                    <img 
                      src={nextPatientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextPatientName)}&background=e2e8f0&color=475569`} 
                      alt="Patient" 
                      className="w-full h-full object-cover bg-slate-100" 
                    />
                   </div>
                   <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <h4 className="text-[15px] font-bold text-[#191C1E] truncate">{nextPatientName}</h4>
                         <span className="px-2 py-0.5 rounded-full bg-[#007B71]/10 text-[#006058] text-[11px] font-semibold">
                           {nextAppt.appointmentType === 'telemedicine' ? 'Telemedicine' : 'In-Person'}
                         </span>
                      </div>
                      <p className="text-[12px] text-[#434655]">
                        Patient ID: #{nextAppt.id?.slice(-6).toUpperCase()} • {nextPatientGender}, {nextPatientAge} years old
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                         <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#191C1E]">
                            <Clock size={12} className="text-[#2563EB]" strokeWidth={2.5} />
                            {nextAppt.scheduledTime?.startTime || 'TBD'} - {nextAppt.scheduledTime?.endTime || 'TBD'}
                         </div>
                         <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#191C1E]">
                            <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full"></span>
                            {nextAppt.appointmentType === 'telemedicine' ? 'Virtual Room' : (nextAppt.clinic?.clinicName || 'Clinic')}
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2 shrink-0">
                     <Link 
                      to={`/dashboard/doctor/sessions/${nextAppt.id}`}
                      className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-100"
                     >
                       <PlayCircle size={14} /> Start Session
                     </Link>
                     <Link 
                      to={`/dashboard/doctor/patients/${nextAppt.patient?._id || nextAppt.patient?.id}`}
                      className="bg-transparent border border-slate-200 text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-slate-50 transition-colors text-center"
                     >
                       View Profile
                     </Link>
                   </div>
                 </div>
               ) : (
                 <div className="py-6 text-center">
                    <p className="text-slate-400 text-sm font-medium">No appointments for today.</p>
                 </div>
               )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-[#191C1E]">Recent Activity</h3>
            
            <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-[#EAEAEB] flex flex-col">
              {completedAppts.length > 0 ? (
                completedAppts.slice(0, 3).map((appt) => (
                  <Link 
                    key={appt.id}
                    to={`/dashboard/doctor/patients/${appt.patient?._id || appt.patient?.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F5F5F5] hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#006058] shrink-0">
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h4 className="text-[13px] font-semibold text-[#191C1E]">Session Finalized</h4>
                        <p className="text-[12px] text-[#717381]">Patient {getPatientName(appt)} • {new Date(appt.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                   <p className="text-slate-400 text-xs">No recent clinical activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column / Quick Actions */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-[#EAEAEB] flex flex-col gap-4">
            <h3 className="text-[14px] font-bold text-[#191C1E]">Quick Actions</h3>
            
            <div className="flex flex-col gap-2">
               <Link to="/dashboard/doctor/appointments" className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F2F4F6] hover:bg-slate-200 transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#2563EB] shadow-sm shrink-0">
                     <FileText size={13} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-0">
                     <h4 className="text-[13px] font-semibold text-[#191C1E]">Add Notes</h4>
                     <p className="text-[11px] text-[#434655]">Update patient records</p>
                  </div>
               </Link>

               <Link to="/dashboard/doctor/patients" className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F2F4F6] hover:bg-slate-200 transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#2563EB] shadow-sm shrink-0">
                     <Users size={13} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-0">
                     <h4 className="text-[13px] font-semibold text-[#191C1E]">View All Patients</h4>
                     <p className="text-[11px] text-[#434655]">Browse your database</p>
                  </div>
               </Link>

               <Link to="/dashboard/doctor/sessions" className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F2F4F6] hover:bg-slate-200 transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#2563EB] shadow-sm shrink-0">
                     <PlusSquare size={13} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-0">
                     <h4 className="text-[13px] font-semibold text-[#191C1E]">E-Prescription</h4>
                     <p className="text-[11px] text-[#434655]">Send meds to pharmacy</p>
                  </div>
               </Link>
            </div>
          </div>

          {/* Clinic Vitals */}
          <div className="bg-[#F2F4F6] rounded-[16px] p-5 flex flex-col gap-4 border border-slate-100">
            <div className="flex items-center justify-between">
               <h3 className="text-[14px] font-bold text-[#191C1E]">Clinic Vitals</h3>
               <MoreHorizontal size={18} className="text-[#434655]" />
            </div>

            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[12px]">
                     <span className="font-semibold text-[#191C1E]">Patient Satisfaction</span>
                     <span className="font-bold text-[#006058]">94%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#E0E3E5] overflow-hidden">
                     <div className="h-full bg-[#006058] rounded-full" style={{ width: '94%' }}></div>
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[12px]">
                     <span className="font-semibold text-[#191C1E]">Efficiency Rate</span>
                     <span className="font-bold text-[#2563EB]">82%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#E0E3E5] overflow-hidden">
                     <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '82%' }}></div>
                  </div>
               </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
               <p className="text-[11px] text-[#434655] leading-[18px]">
                 "Dr. {doctorData.lastName}, your average wait time has decreased this week. Keep up the great flow!"
               </p>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
