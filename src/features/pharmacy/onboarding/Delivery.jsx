import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Map as MapIcon, X, ChevronDown, MapPin, Plus 
} from 'lucide-react';
import { OnboardingLayout, OnboardingNavbar, useOnboardingForm } from '../OnboardingLayout';

const Delivery = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingForm();
  
  const deliveryEnabled = data.deliveryEnabled ?? true;
  const areas = data.serviceAreas || [
    { id: 1, label: "Downtown (90012)" },
    { id: 2, label: "Westside (90024)" },
    { id: 3, label: "Hollywood (90028)" }
  ];

  // Handlers
  const handleRemoveArea = (id) => {
    updateData({ serviceAreas: areas.filter(area => area.id !== id) });
  };

  const handleAddArea = () => {
    const areaName = prompt("Enter Area Name & Zip Code:");
    if (areaName && areaName.trim() !== "") {
      updateData({ serviceAreas: [...areas, { id: Date.now(), label: areaName }] });
    }
  };

  // Dynamic Calculation for Coverage
  const calculateCoverage = () => {
    return (areas?.length * 4.2).toFixed(1);
  };

  return (
    <OnboardingLayout 
      step={4} 
      prevPath="/dashboard/pharmacy/location" 
      nextPath="/dashboard/pharmacy/payment"
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Delivery & Logistics</h1>
        <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">Define your pharmacy's fulfillment capabilities and reach.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Delivery Settings Card */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-8 transition-all duration-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Enable Prescription Delivery</h3>
              <p className="text-sm text-slate-500 mt-1">Allow patients to request home delivery for their medications.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={deliveryEnabled}
                onChange={(e) => updateData({ deliveryEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Conditional Inputs */}
          {deliveryEnabled && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-[12px] text-slate-600 font-bold uppercase tracking-widest mb-2">Estimated Delivery Time</label>
                <div className="relative">
                  <select 
                    value={data.deliveryTime || 'Next day delivery'}
                    onChange={(e) => updateData({ deliveryTime: e.target.value })}
                    className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option>Next day delivery</option>
                    <option>Same day delivery</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-slate-600 font-bold uppercase tracking-widest mb-2">Standard Delivery Fee</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400">$</span>
                  <input 
                    type="text" 
                    value={data.deliveryFee || '5.00'} 
                    onChange={(e) => updateData({ deliveryFee: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-8 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Card */}
        <div className="col-span-1 bg-[#153886] text-white rounded-xl p-8 flex flex-col justify-between shadow-lg">
          <div>
            <span className="inline-block bg-white/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-4 border border-white/10">Service Status</span>
            <h3 className="text-xl font-bold mb-4 leading-tight">Delivery Engine Ready</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6 opacity-80">
              Your pharmacy will be tagged as "Delivery Available" in the network.
            </p>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center text-sm font-medium">
              <CheckCircle2 size={18} className="text-emerald-400 mr-3 shrink-0" /> 
              <span>Real-time tracking active</span>
            </li>
            <li className="flex items-center text-sm font-medium">
              <CheckCircle2 size={18} className="text-emerald-400 mr-3 shrink-0" /> 
              <span>Secure signature required</span>
            </li>
          </ul>
        </div>

        {/* Serviceable Areas Card */}
        <div className="col-span-3 bg-[#F2F4F9] rounded-xl border border-gray-100 shadow-sm flex overflow-hidden min-h-[350px]">
          {/* Tags and Dynamic Info */}
          <div className="flex-1 p-8 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Serviceable Areas</h3>
            <p className="text-sm text-gray-500 text-slate-700 mb-6">Define your delivery radius or enter specific zip codes to limit your reach.</p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {areas.map((area) => (
                <Tag 
                  key={area.id} 
                  label={area.label} 
                  onRemove={() => handleRemoveArea(area.id)} 
                />
              ))}
              <button 
                onClick={handleAddArea}
                className="flex items-center text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-1" /> Add Area
              </button>
            </div>

            {/* Dynamic Map Integration Info */}
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex items-center mt-auto">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-slate-600">
                <MapIcon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Map Integration Enabled</p>
                <p className="text-xs text-gray-500 font-medium">
                  Visualizing {calculateCoverage()} sq miles of coverage
                </p>
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="w-1/3 relative bg-slate-100 border-l border-gray-50 flex items-center justify-center overflow-hidden">
            <iframe
              title="Coverage Map"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, opacity: 0.7, filter: 'grayscale(0.4)' }}
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d110502.60385586032!2d31.2357116!3d30.0444196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2seg!4v1715000000000!5m2!1sen!2seg"
              allowFullScreen
            ></iframe>
            
            <div className="absolute pointer-events-none flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-white p-3 rounded-full shadow-2xl">
                <MapPin className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </OnboardingLayout>
  );
};

// Tag Component
const Tag = ({ label, onRemove }) => (
  <div className="flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg group hover:border-red-200 transition-all shadow-sm">
    <span className="text-xs font-semibold text-slate-700 mr-2">{label}</span>
    <button 
      onClick={onRemove}
      className="text-red-500 hover:text-red-600 transition-colors"
    >
      <X size={14} />
    </button>
  </div>
);

export default Delivery;