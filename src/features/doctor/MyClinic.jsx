import React, { useState } from 'react';
import {
  Building2, MapPin, Phone, Clock, Plus,
  Trash2, Edit3, Loader2, X, Check,
  Star, Wallet, Calendar
} from 'lucide-react';
import {
  useClinicInfo,
  useAddClinicInfo,
  useUpdateClinicInfo,
  useDeleteClinicInfo,
} from '../../hooks/useDoctorData';

// ─── Constants ──────────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM = {
  clinicName: '',
  phone: '',
  isPrimary: false,
  address: { governorate: '', city: '', street: '' },
  consultationFee: '',
  followUpFee: '',
  consultationDuration: '30',
  availableHours: [],
};

// ─── ClinicModal ─────────────────────────────────────────────────────────────
const ClinicModal = ({ initial, onClose, onSave, isPending }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  // hours state: one row per day
  const [hoursRows, setHoursRows] = useState(
    initial?.availableHours?.length
      ? initial.availableHours.map(h => ({ day: h.day, startTime: h.startTime, endTime: h.endTime }))
      : []
  );

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const setAddr = (field, value) => setForm(p => ({ ...p, address: { ...p.address, [field]: value } }));

  const addRow = () => setHoursRows(p => [...p, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  const removeRow = (i) => setHoursRows(p => p.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) =>
    setHoursRows(p => p.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const handleSave = () => {
    const payload = {
      ...form,
      consultationFee: Number(form.consultationFee),
      followUpFee: Number(form.followUpFee),
      consultationDuration: String(form.consultationDuration),
      availableHours: hoursRows,
    };
    onSave(payload);
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm";
  const labelCls = "text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-8 py-5 flex items-center justify-between rounded-t-[2rem] z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800">{initial ? 'Edit Clinic' : 'Add New Clinic'}</h2>
            <p className="text-slate-500 text-xs mt-0.5">Fill in the clinic details below</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Clinic Name</label>
              <input className={inputCls} placeholder="e.g. Skin & Care Center" value={form.clinicName}
                onChange={e => set('clinicName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} placeholder="01XXXXXXXXX" value={form.phone}
                onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Consultation Duration (min)</label>
              <input type="number" className={inputCls} placeholder="30" value={form.consultationDuration}
                onChange={e => set('consultationDuration', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Consultation Fee (EGP)</label>
              <input type="number" className={inputCls} placeholder="500" value={form.consultationFee}
                onChange={e => set('consultationFee', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Follow-up Fee (EGP)</label>
              <input type="number" className={inputCls} placeholder="200" value={form.followUpFee}
                onChange={e => set('followUpFee', e.target.value)} />
            </div>

            {/* Primary toggle */}
            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('isPrimary', !form.isPrimary)}
                className={`w-11 h-6 rounded-full transition-all relative ${form.isPrimary ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.isPrimary ? 'left-5' : 'left-0.5'}`} />
              </button>
              <span className="text-sm font-semibold text-slate-700">Mark as Primary Clinic</span>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" /> Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Governorate</label>
                <input className={inputCls} placeholder="e.g. Cairo" value={form.address.governorate}
                  onChange={e => setAddr('governorate', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} placeholder="e.g. Sheikh Zayed" value={form.address.city}
                  onChange={e => setAddr('city', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Street</label>
                <input className={inputCls} placeholder="e.g. Al-Bustan St" value={form.address.street}
                  onChange={e => setAddr('street', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Available Hours */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Available Hours
              </h3>
              <button onClick={addRow}
                className="flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
                <Plus size={14} /> Add Day
              </button>
            </div>
            <div className="space-y-2">
              {hoursRows.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-3">No schedule added yet. Click "Add Day" to start.</p>
              )}
              {hoursRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <select value={row.day} onChange={e => updateRow(i, 'day', e.target.value)}
                    className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 flex-1">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input type="time" value={row.startTime} onChange={e => updateRow(i, 'startTime', e.target.value)}
                    className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400" />
                  <span className="text-slate-400 text-xs font-bold">to</span>
                  <input type="time" value={row.endTime} onChange={e => updateRow(i, 'endTime', e.target.value)}
                    className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400" />
                  <button onClick={() => removeRow(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-8 py-4 flex items-center justify-end gap-3 rounded-b-[2rem]">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !form.clinicName}
            className="px-8 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isPending ? 'Saving...' : 'Save Clinic'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── formatTime helper ─────────────────────────────────────────────────────────
const fmt = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`;
};

// ─── ClinicCard ───────────────────────────────────────────────────────────────
const ClinicCard = ({ clinic, onEdit, onDelete, isDeleting }) => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/40 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none group-hover:bg-blue-100/40 transition-colors" />

    {/* Header */}
    <div className="flex items-start justify-between mb-5 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
          <Building2 size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-800">{clinic.clinicName}</h3>
            {clinic.isPrimary && (
              <span className="text-[10px] font-black uppercase tracking-wide bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Primary
              </span>
            )}
          </div>
          {clinic.address && (
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
              <MapPin size={11} className="text-blue-400" />
              {[clinic.address.street, clinic.address.city, clinic.address.governorate].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onEdit} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
          <Edit3 size={16} />
        </button>
        <button onClick={onDelete} disabled={isDeleting} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 disabled:opacity-50">
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
        <div className="flex items-center justify-center mb-1"><Wallet size={14} className="text-emerald-500" /></div>
        <p className="text-xs text-slate-500 font-medium">Fee</p>
        <p className="font-black text-slate-800 text-sm">{clinic.consultationFee ?? 0} <span className="text-[10px] text-slate-400 font-bold">EGP</span></p>
      </div>
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
        <div className="flex items-center justify-center mb-1"><Star size={14} className="text-amber-400" /></div>
        <p className="text-xs text-slate-500 font-medium">Follow-up</p>
        <p className="font-black text-slate-800 text-sm">{clinic.followUpFee ?? 0} <span className="text-[10px] text-slate-400 font-bold">EGP</span></p>
      </div>
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
        <div className="flex items-center justify-center mb-1"><Clock size={14} className="text-blue-400" /></div>
        <p className="text-xs text-slate-500 font-medium">Duration</p>
        <p className="font-black text-slate-800 text-sm">{clinic.consultationDuration ?? 30} <span className="text-[10px] text-slate-400 font-bold">min</span></p>
      </div>
    </div>

    {/* Phone */}
    {clinic.phone && (
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 relative z-10">
        <Phone size={14} className="text-slate-400" /> {clinic.phone}
      </div>
    )}

    {/* Schedule */}
    {clinic.availableHours?.length > 0 && (
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
          <Calendar size={12} /> Schedule
        </p>
        <div className="space-y-1.5">
          {clinic.availableHours.map((h, i) => (
            <div key={i} className="flex items-center justify-between bg-blue-50/50 border border-blue-100/60 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-blue-700">{h.day}</span>
              <span className="text-xs text-slate-500 font-medium">{fmt(h.startTime)} – {fmt(h.endTime)}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ─── MyClinic Main Page ───────────────────────────────────────────────────────
export default function MyClinic() {
  const { data, isLoading } = useClinicInfo();
  const addMutation = useAddClinicInfo();
  const updateMutation = useUpdateClinicInfo();
  const deleteMutation = useDeleteClinicInfo();

  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null); // null = add mode, object = edit mode

  const clinics = data?.data?.clinicInfo || [];

  const handleOpenAdd = () => { setEditingClinic(null); setShowModal(true); };
  const handleOpenEdit = (clinic) => { setEditingClinic(clinic); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingClinic(null); };

  const handleSave = (payload) => {
    if (editingClinic) {
      updateMutation.mutate({ clinicId: editingClinic._id, data: payload }, { onSuccess: handleClose });
    } else {
      addMutation.mutate(payload, { onSuccess: handleClose });
    }
  };

  const isSavePending = addMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans">

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-800">My Clinics</h1>
          <p className="text-slate-500 text-sm mt-1">
            {clinics.length > 0
              ? `You have ${clinics.length} clinic${clinics.length > 1 ? 's' : ''} registered — patients can book from their available slots.`
              : 'Manage your clinic locations, working hours, and fees.'}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} /> Add Clinic
        </button>
      </div>

      {/* Empty State */}
      {clinics.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-16 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-300 mb-6">
            <Building2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Clinics Added Yet</h3>
          <p className="text-slate-500 max-w-sm mt-2 mb-8 text-sm">
            Add your first clinic with working hours so patients can find and book appointments with you.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus size={18} /> Add Your First Clinic
          </button>
        </div>
      )}

      {/* Clinics Grid */}
      {clinics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clinics.map(clinic => (
            <ClinicCard
              key={clinic._id}
              clinic={clinic}
              onEdit={() => handleOpenEdit(clinic)}
              onDelete={() => deleteMutation.mutate(clinic._id)}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === clinic._id}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ClinicModal
          initial={editingClinic}
          onClose={handleClose}
          onSave={handleSave}
          isPending={isSavePending}
        />
      )}
    </div>
  );
}
