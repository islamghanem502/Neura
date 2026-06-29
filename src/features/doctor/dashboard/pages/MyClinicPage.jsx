import React, { useState } from 'react';
import {
  useClinicInfo,
  useAddClinicInfo,
  useUpdateClinicInfo,
  useDeleteClinicInfo,
} from '../../../../hooks/useDoctorData';
import {
  Plus, MapPin, Phone, Clock, Pencil, Trash2,
  Building2, X, Loader2, ChevronDown, ToggleLeft, ToggleRight,
  TrendingUp, Stethoscope, Star, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Days of Week ────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Empty form state ────────────────────────────────────────────────────────
const emptyForm = {
  clinicName: '',
  phone: '',
  isPrimary: false,
  consultationDuration: 30,
  consultationFee: '',
  followUpFee: '',
  address: { governorate: '', city: '', street: '' },
  availableHours: [],
};

// ─── Clinic Form Modal ───────────────────────────────────────────────────────
const ClinicFormModal = ({ initialData, onClose, onSubmit, isLoading }) => {
  const [form, setForm] = useState(
    initialData
      ? {
          clinicName: initialData.clinicName || '',
          phone: initialData.phone || '',
          isPrimary: initialData.isPrimary || false,
          consultationDuration: initialData.consultationDuration || 30,
          consultationFee: initialData.consultationFee || '',
          followUpFee: initialData.followUpFee || '',
          address: {
            governorate: initialData.address?.governorate || '',
            city: initialData.address?.city || '',
            street: initialData.address?.street || '',
          },
          availableHours: initialData.availableHours || [],
        }
      : emptyForm
  );

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const setAddress = (field, value) =>
    setForm((p) => ({ ...p, address: { ...p.address, [field]: value } }));

  const toggleDay = (day) => {
    const exists = form.availableHours.find((h) => h.day === day);
    if (exists) {
      setField('availableHours', form.availableHours.filter((h) => h.day !== day));
    } else {
      setField('availableHours', [
        ...form.availableHours,
        { day, startTime: '09:00', endTime: '17:00' },
      ]);
    }
  };

  const updateHours = (day, field, value) => {
    setField(
      'availableHours',
      form.availableHours.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clinicName.trim()) return toast.error('Clinic name is required');
    if (!form.phone.trim()) return toast.error('Phone number is required');
    if (!form.address.governorate.trim()) return toast.error('Governorate is required');
    if (!form.address.city.trim()) return toast.error('City is required');
    if (!form.consultationFee) return toast.error('Consultation fee is required');
    onSubmit(form);
  };

  const inputClass =
    'w-full bg-[#F7F9FC] border border-[#EAEAEB] rounded-xl px-4 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all';
  const labelClass = 'block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[680px] max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAEAEB]">
          <div>
            <h2 className="text-[18px] font-bold text-[#191C1E]">
              {initialData ? 'Edit Clinic' : 'Add New Clinic'}
            </h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              {initialData ? 'Update clinic information' : 'Fill in your clinic details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Clinic Name */}
          <div>
            <label className={labelClass}>Clinic Name *</label>
            <input
              className={inputClass}
              placeholder="e.g. Downtown Medical Center"
              value={form.clinicName}
              onChange={(e) => setField('clinicName', e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input
              className={inputClass}
              placeholder="e.g. 01069167252"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
            />
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Address *</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                className={inputClass}
                placeholder="Governorate"
                value={form.address.governorate}
                onChange={(e) => setAddress('governorate', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="City"
                value={form.address.city}
                onChange={(e) => setAddress('city', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Street"
                value={form.address.street}
                onChange={(e) => setAddress('street', e.target.value)}
              />
            </div>
          </div>

          {/* Fees & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Consultation Fee (EGP) *</label>
              <input
                type="number"
                className={inputClass}
                placeholder="500"
                value={form.consultationFee}
                onChange={(e) => setField('consultationFee', Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Follow-up Fee (EGP)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="200"
                value={form.followUpFee}
                onChange={(e) => setField('followUpFee', Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Duration (min)</label>
              <select
                className={inputClass}
                value={form.consultationDuration}
                onChange={(e) => setField('consultationDuration', Number(e.target.value))}
              >
                {[15, 20, 30, 45, 60].map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>

          {/* Available Hours */}
          <div>
            <label className={labelClass}>Available Days & Hours</label>
            <div className="space-y-3">
              {/* Day chips */}
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const active = form.availableHours.some((h) => h.day === day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                        active
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-slate-500 border-[#EAEAEB] hover:border-blue-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              {/* Time pickers for selected days */}
              {form.availableHours.map((h) => (
                <div key={h.day} className="flex items-center gap-3 bg-[#F7F9FC] rounded-xl px-4 py-2.5">
                  <span className="text-[12px] font-bold text-[#191C1E] w-24 shrink-0">{h.day}</span>
                  <input
                    type="time"
                    className="bg-white border border-[#EAEAEB] rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-300"
                    value={h.startTime}
                    onChange={(e) => updateHours(h.day, 'startTime', e.target.value)}
                  />
                  <span className="text-slate-400 text-[12px]">to</span>
                  <input
                    type="time"
                    className="bg-white border border-[#EAEAEB] rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-300"
                    value={h.endTime}
                    onChange={(e) => updateHours(h.day, 'endTime', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Primary Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#F7F9FC] rounded-xl border border-[#EAEAEB]">
            <div>
              <p className="text-[13px] font-semibold text-[#191C1E]">Set as Primary Clinic</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Patients will see this as your main location</p>
            </div>
            <button
              type="button"
              onClick={() => setField('isPrimary', !form.isPrimary)}
              className="transition-colors"
            >
              {form.isPrimary ? (
                <ToggleRight size={32} className="text-[#2563EB]" />
              ) : (
                <ToggleLeft size={32} className="text-slate-300" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 border border-[#EAEAEB] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
              {initialData ? 'Save Changes' : 'Add Clinic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ clinicName, onConfirm, onClose, isLoading }) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-[20px] w-full max-w-[380px] p-6 shadow-2xl">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <Trash2 size={20} className="text-red-500" />
      </div>
      <h3 className="text-[16px] font-bold text-[#191C1E] mb-1">Delete Clinic</h3>
      <p className="text-[13px] text-[#64748B] mb-6">
        Are you sure you want to delete <strong>{clinicName}</strong>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 border border-[#EAEAEB] hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Format hours display ─────────────────────────────────────────────────────
const formatHours = (availableHours = []) => {
  if (!availableHours.length) return 'No hours set';
  const first = availableHours[0];
  return `${first.startTime} – ${first.endTime}`;
};

const formatDays = (availableHours = []) => {
  if (!availableHours.length) return '';
  return availableHours.map((h) => h.day.slice(0, 3)).join(', ');
};

// ─── Primary Clinic Card ──────────────────────────────────────────────────────
const PrimaryClinicCard = ({ clinic, onEdit, onDelete }) => (
  <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm overflow-hidden relative">
    {/* Primary badge */}
    <div className="absolute top-4 right-4 z-10 bg-[#2563EB] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
      Primary Facility
    </div>

    <div className="flex flex-col md:flex-row">
      {/* Placeholder image */}
      <div className="w-full md:w-[260px] h-[200px] md:h-auto shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center">
          <Building2 size={28} className="text-slate-400" />
        </div>
      </div>

      <div className="flex-1 p-6">
        <h3 className="text-[22px] font-bold text-[#191C1E] mb-1">{clinic.clinicName}</h3>
        <div className="flex items-center gap-1.5 text-[13px] text-[#64748B] mb-4">
          <MapPin size={13} className="shrink-0" />
          <span>{[clinic.address?.street, clinic.address?.city, clinic.address?.governorate].filter(Boolean).join(', ')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-[13px] text-[#191C1E]">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Phone size={13} className="text-[#2563EB]" />
            </div>
            <span className="font-medium">{clinic.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#191C1E]">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
              <Stethoscope size={13} className="text-slate-500" />
            </div>
            <span className="font-medium">In-person</span>
          </div>
          {clinic.availableHours?.length > 0 && (
            <div className="flex items-center gap-2 text-[13px] text-[#191C1E] col-span-2">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <Clock size={13} className="text-green-600" />
              </div>
              <span className="font-medium">{formatDays(clinic.availableHours)} · {formatHours(clinic.availableHours)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#2563EB] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
            <span className="text-[12px] font-bold text-[#2563EB]">Primary Clinic</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Regular Clinic Card ──────────────────────────────────────────────────────
const ClinicCard = ({ clinic, onEdit, onDelete, onSetPrimary, isUpdating }) => (
  <div className="bg-white rounded-[20px] border border-[#EAEAEB] shadow-sm p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB]">
        <Building2 size={18} />
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>

    <h3 className="text-[15px] font-bold text-[#191C1E] mb-1">{clinic.clinicName}</h3>
    <div className="flex items-center gap-1 text-[12px] text-[#64748B] mb-4">
      <MapPin size={11} className="shrink-0" />
      <span className="truncate">{[clinic.address?.street, clinic.address?.city].filter(Boolean).join(', ')}</span>
    </div>

    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#64748B]">Phone</span>
        <span className="font-semibold text-[#191C1E]">{clinic.phone}</span>
      </div>
      {clinic.availableHours?.length > 0 && (
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#64748B]">Hours</span>
          <span className="font-semibold text-[#191C1E]">{formatHours(clinic.availableHours)}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#64748B]">Fee</span>
        <span className="font-semibold text-[#191C1E]">EGP {clinic.consultationFee}</span>
      </div>
    </div>

    {/* Set as Primary CTA */}
    <button
      onClick={onSetPrimary}
      disabled={isUpdating}
      className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold border-2 border-dashed border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
    >
      {isUpdating ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Star size={13} className="fill-amber-400 text-amber-400" />
      )}
      Set as Primary Clinic
    </button>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyClinicPage() {
  const { data: clinicRes, isLoading } = useClinicInfo();
  const addMutation    = useAddClinicInfo();
  const updateMutation = useUpdateClinicInfo();
  const deleteMutation = useDeleteClinicInfo();

  const [showAddModal, setShowAddModal]     = useState(false);
  const [editClinic, setEditClinic]         = useState(null);   // clinic object to edit
  const [deleteClinic, setDeleteClinic]     = useState(null);   // clinic object to delete
  const [updatingId, setUpdatingId]         = useState(null);   // id being set as primary

  const clinics = clinicRes?.data?.clinicInfo || [];
  const primaryClinic = clinics.find((c) => c.isPrimary);
  const otherClinics  = clinics.filter((c) => !c.isPrimary);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAdd = (formData) => {
    // If this is the first clinic, automatically make it primary so it
    // shows up in the patient-facing doctor listing (GET /doctors returns
    // only the primary clinic).
    const dataToSubmit = clinics.length === 0
      ? { ...formData, isPrimary: true }
      : formData;
    addMutation.mutate(dataToSubmit, {
      onSuccess: () => setShowAddModal(false),
    });
  };

  const handleEdit = (formData) => {
    updateMutation.mutate(
      { clinicId: editClinic._id, data: formData },
      { onSuccess: () => setEditClinic(null) }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(deleteClinic._id, {
      onSuccess: () => setDeleteClinic(null),
    });
  };

  const handleSetPrimary = (clinic) => {
    setUpdatingId(clinic._id);
    updateMutation.mutate(
      { clinicId: clinic._id, data: { isPrimary: true } },
      { onSettled: () => setUpdatingId(null) }
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#191C1E] tracking-tight">My Clinics</h1>
          <p className="text-[14px] text-[#64748B] mt-0.5">Manage your clinic locations and availability.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={16} />
          Add New Clinic
        </button>
      </div>

      {/* ── No-Primary Warning Banner ─────────────────────────────────────── */}
      {clinics.length > 0 && !primaryClinic && (
        <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-amber-800">
              Your clinic is hidden from patients
            </p>
            <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
              No primary clinic is set. Patients can only see your <strong>primary</strong> clinic
              in search results. Click&nbsp;<strong>"Set as Primary"</strong> on one of your
              clinics below to make it visible.
            </p>
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {clinics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-[#EAEAEB]">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Building2 size={28} className="text-[#2563EB]" />
          </div>
          <h3 className="text-[16px] font-bold text-[#191C1E] mb-1">No clinics yet</h3>
          <p className="text-[13px] text-[#64748B] mb-6">Add your first clinic to start accepting appointments.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add New Clinic
          </button>
        </div>
      )}

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      {clinics.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Left: Clinic cards */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Primary clinic (large card) */}
            {primaryClinic && (
              <PrimaryClinicCard
                clinic={primaryClinic}
                onEdit={() => setEditClinic(primaryClinic)}
                onDelete={() => setDeleteClinic(primaryClinic)}
              />
            )}

            {/* Other clinics (grid) */}
            {otherClinics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {otherClinics.map((clinic) => (
                  <ClinicCard
                    key={clinic._id}
                    clinic={clinic}
                    onEdit={() => setEditClinic(clinic)}
                    onDelete={() => setDeleteClinic(clinic)}
                    onSetPrimary={() => handleSetPrimary(clinic)}
                    isUpdating={updatingId === clinic._id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Stats sidebar */}
          <div className="w-full lg:w-[240px] shrink-0 flex flex-col gap-4">
            {/* Total capacity card */}
            <div
              className="rounded-[16px] p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #004AC6 0%, #2563EB 100%)' }}
            >
              <p className="text-[11px] font-medium text-white/70 uppercase tracking-widest mb-1">
                Total Clinics
              </p>
              <p className="text-[40px] font-extrabold leading-none mb-3">{clinics.length}</p>
              <div className="flex items-center gap-1.5 bg-white/20 self-start px-2.5 py-1 rounded-full w-fit">
                <TrendingUp size={11} className="text-white" />
                <span className="text-[11px] font-medium">Active locations</span>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-white rounded-[16px] border border-[#EAEAEB] p-5">
              <h4 className="text-[13px] font-bold text-[#191C1E] mb-3">Quick Insights</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0"></span>
                  <span>{clinics.length} active location{clinics.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                  <span>98% patient satisfaction</span>
                </div>
                {primaryClinic && (
                  <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                    <Star size={11} className="text-amber-400 shrink-0" />
                    <span className="truncate">Primary: {primaryClinic.clinicName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Expanding reach CTA */}
            <div className="bg-[#F7F9FC] rounded-[16px] border border-[#EAEAEB] p-5">
              <h4 className="text-[13px] font-bold text-[#191C1E] mb-1">Expanding your reach?</h4>
              <p className="text-[11px] text-[#64748B] leading-relaxed mb-4">
                Easily add temporary pop-up clinics or partner facilities to manage high-volume appointment seasons.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-bold py-2.5 rounded-xl transition-colors"
              >
                + Add Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <ClinicFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
          isLoading={addMutation.isPending}
        />
      )}

      {editClinic && (
        <ClinicFormModal
          initialData={editClinic}
          onClose={() => setEditClinic(null)}
          onSubmit={handleEdit}
          isLoading={updateMutation.isPending}
        />
      )}

      {deleteClinic && (
        <DeleteModal
          clinicName={deleteClinic.clinicName}
          onClose={() => setDeleteClinic(null)}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
