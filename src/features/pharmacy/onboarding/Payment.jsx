import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Calendar, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { OnboardingLayout, OnboardingNavbar, useOnboardingForm } from '../OnboardingLayout';

const Payment = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingForm();

  return (
    <OnboardingLayout 
      step={5} 
      prevPath="/dashboard/pharmacy/delivery" 
      nextPath="/dashboard/pharmacy/verification"
    >
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Define Your Payment Infrastructure</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
              Choose how your pharmacy will collect revenue. These settings will determine 
              the checkout experience for your patients and wholesale partners.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Left Card - Acceptance Methods */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Wallet size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Acceptance Methods</h3>
              <p className="text-sm text-slate-700 mb-6">Select the fundamental ways you'll accept tender at point-of-sale.</p>
              
              <div className="space-y-3">
                {/* Cash Payment Option */}
                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${data.cashAccepted ? 'border-blue-100 bg-slate-50' : 'border-transparent bg-[#F2F4F6]'}`}>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={data.cashAccepted ?? true}
                    onChange={(e) => updateData({ cashAccepted: e.target.checked })}
                  />
                  <div className="ml-4">
                    <p className="font-bold text-sm">Cash Payments</p>
                    <p className="text-xs text-slate-600">Standard in-person liquid tender</p>
                  </div>
                </label>

                {/* Card Payment Option */}
                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${data.cardAccepted ? 'border-blue-100 bg-slate-50' : 'border-transparent bg-[#F2F4F6]'}`}>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={data.cardAccepted ?? false}
                    onChange={(e) => updateData({ cardAccepted: e.target.checked })}
                  />
                  <div className="ml-4">
                    <p className="font-bold text-sm">Card Payments</p>
                    <p className="text-xs text-slate-600">Visa, Mastercard, & AMEX networks</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Card - Deferred Billing */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Deferred Billing</h3>
              <p className="text-sm text-slate-500 mb-6">Enable advanced billing features for high-value medication orders.</p>
              
              <div className="p-5  bg-[#F2F4F6] rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-sm text-slate-900">Installments Plan</p>
                    <p className="text-xs text-slate-700">Enable Buy Now, Pay Later</p>
                  </div>
                  <button 
                    onClick={() => updateData({ installmentsEnabled: !data.installmentsEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${data.installmentsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${data.installmentsEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg border border-slate-100 flex gap-3">
                  <div className="text-slate-400 mt-0.5">
                    <CheckCircle2 size={17} />
                  </div>
                  <p className="text-[12px] text-slate-800 leading-relaxed">
                    Enabling installments requires a certified partner agreement.
                  </p>
                </div>
              </div>
            </div>
          </div>

    </OnboardingLayout>
  );
};

export default Payment;