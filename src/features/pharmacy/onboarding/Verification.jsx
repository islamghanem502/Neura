import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, 
  Rocket, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  MoreHorizontal
} from 'lucide-react';
import { OnboardingLayout, useOnboardingForm, OnboardingNavbar } from '../OnboardingLayout';

const Verification = () => {
  const navigate = useNavigate();
  
  const { data, clearData } = useOnboardingForm();

  const handleSubmit = async () => {
    try {
      console.log("Submitting Final Data:", data);
      
      // clearData(); 
      navigate('/dashboard/pharmacy/dashboard'); 
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const DataField = ({ label, value, subValue, icon: Icon }) => (
    <div className="group">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</p>
      <div className="flex items-start gap-2">
        {Icon && <Icon size={14} className="text-slate-400 mt-1" />}
        <div>
          <p className="font-semibold text-slate-800 leading-tight">{value || 'Not specified'}</p>
          {subValue && <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>}
        </div>
      </div>
    </div>
  );

  const getActiveServices = () => {
    const services = [];
    if (data.deliveryEnabled !== false) {
      services.push(`Home Delivery (${data.deliveryTime || 'Next day'})`);
      if (data.serviceAreas?.length > 0) {
        services.push(`${data.serviceAreas.length} Coverage Areas`);
      }
    }
    return services.length > 0 ? services : ['No services configured'];
  };

  
  const getPaymentSummary = () => {
    const methods = [];
    if (data.cashAccepted !== false) methods.push('Cash');
    if (data.cardAccepted) methods.push('Card (Visa/Mastercard)');
    
    let summary = methods.join(' & ') || 'No method selected';
    if (data.installmentsEnabled) {
      summary += ' • Installments Enabled';
    }
    return summary;
  };

  return (
    <OnboardingLayout 
      step={6} 
      prevPath="/dashboard/pharmacy/payment" 
      onNext={handleSubmit}
      nextLabel="Submit Application"
      nextIcon={Rocket}
      footerExtra={
        <p className="text-[12px] text-slate-700 max-w-[280px] text-right hidden md:block leading-relaxed">
          By clicking submit, you agree to the Pharmacy Network <span className="text-indigo-600 font-medium cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 font-medium cursor-pointer">HIPAA compliance</span> guidelines.
        </p>
      }
    >
      <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Review & Submit</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
              Please verify all details provided in the previous steps. Once submitted, your
              application will enter the clinical verification phase.
            </p>
          </div>
      <div className="grid lg:grid-cols-12 gap-6 pb-20">
        
        
        <div className="lg:col-span-8 space-y-6">
          
          {/*Pharmacy Identity */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900">Pharmacy Identity</h3>
                <p className="text-xs text-slate-900 mt-0.5">Basic information and core credentials</p>
              </div>
              <button 
                onClick={() => navigate('/dashboard/pharmacy/basic-info')}
                className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <DataField label={<span className="text-slate-500 text-xs ">Pharmacy Name</span>} value={data.pharmacyName} />
                <DataField 
                  label={<span className="text-slate-500 text-xs ">License Number</span>} 
                  value={data.licenseNumber} 
                  subValue={data.issuingAuthority}
                />
                <DataField 
                  label={<span className="text-slate-500 text-xs ">NPI Number</span>} 
                  value={data.npiNumber} 
                />
                <DataField 
                  label={<span className="text-slate-500 text-xs ">Primary Contact</span>} 
                  value={data.contactName} 
                  subValue={data.email}
                  icon={Mail}
                />
                <DataField 
                  label={<span className="text-slate-500 text-xs ">Phone Number</span>} 
                  value={data.phone} 
                  icon={Phone}
                />
              </div>

              {/* Verification Documents */}
              <div className="mt-12">
                <div className="w-24 h-px bg-slate-200 mx-auto mb-8"></div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[12px] font-bold text-slate-700 uppercase tracking-widest">Verification Documents</p>
                  <button 
                onClick={() => navigate('/dashboard/pharmacy/credentials')}
                className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {/*data */}
                  {(data.files || ['No documents uploaded']).map((fileName, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-indigo-50/40 hover:bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100/50 transition-all cursor-pointer group">
                      {fileName.includes('License') ? <FileText size={16} className="text-indigo-600" /> : <ShieldCheck size={16} className="text-indigo-600" />}
                      <span className="text-[11px] font-bold text-indigo-900/70">{fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Method */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-9 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
                <CreditCard className="text-slate-400" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Billing Method</p>
                <p className="text-[13px] text-slate-600 font-medium">{getPaymentSummary()}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/pharmacy/payment')}
              className="text-[11px] font-bold border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
            >
              Change Method
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          
          {/*Location */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 flex justify-between items-center border-b border-slate-50">
              <span className="text-[13px] font-bold text-slate-700">Location</span>
               <button 
                onClick={() => navigate('/dashboard/pharmacy/location')}
                className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>
            
         
            <div className="h-48 relative overflow-hidden group">
              <iframe
                title="Verification Map"
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12000!2d${data.lng || -71.0589}!3d${data.lat || 42.3601}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1625000000000!5m2!1sen!2sus`}
                className="absolute inset-0 w-full h-full grayscale-[20%] opacity-80 transition-all group-hover:grayscale-0 group-hover:opacity-100"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>

              {/* Pin Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/20 rounded-full animate-pulse"></div>
                  <MapPin className="text-indigo-600 relative z-10" size={24} fill="white" />
                </div>
              </div>

              {/* Coordinate Badge*/}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-slate-100 flex items-center gap-1.5 pointer-events-none">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                <span className="text-[9px] font-bold text-slate-600 tracking-tight">
                  {data.lat || '42.3601'}° N, {data.lng || '-71.0589'}° W
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm mt-0.5">
                  <MapPin size={14} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight">{data.street || 'Address not provided'}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {data.city || 'City'}, {data.country || 'Country'} {data.postalCode || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-[#153886] text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
             <div className="flex justify-between items-center mb-5 rounded-xl p-6 shadow-xl relative overflow-hidden h-fit">
                <span className="text-[13px] font-bold tracking-tight">Services</span>
                <button 
                onClick={() => navigate('/dashboard/pharmacy/delivery')}
                className="flex items-center gap-1.5 text-indigo-600 text-white/80 text-xs font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
              </div>
              <ul className="space-y-3.5">
                {getActiveServices().map((service, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-300">
                    <div className="bg-indigo-500/20 p-1 rounded">
                      <CheckCircle2 size={13} className="text-white" />
                    </div>
                    {service}
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 opacity-20 flex justify-center">
                <MoreHorizontal size={20} />
              </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Verification;