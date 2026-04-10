import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Award, GraduationCap, Loader2, ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';
import {
  useAddDoctorAward,
  useAddDoctorCertificate,
  useAddDoctorMembership,
  useUpdateDoctorProfessionalInfo,
  useDeleteDoctorAward,
  useDeleteDoctorCertificate,
} from '../../../../hooks/useDoctorData';
import { useAutoSave, AutoSaveIndicator } from '../../../../hooks/useAutoSave';
import { TagInput } from './TagInput';

export const ProfessionalInfoStep = ({ profData, onNext, onPrev }) => {
  const profInfoMutation = useUpdateDoctorProfessionalInfo();
  const addMembershipMutation = useAddDoctorMembership();
  const addAwardMutation = useAddDoctorAward();
  const addCertificateMutation = useAddDoctorCertificate();
  const deleteAwardMutation = useDeleteDoctorAward();
  const deleteCertificateMutation = useDeleteDoctorCertificate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    values: {
      yearsOfExperience: profData.yearsOfExperience ?? 0,
      primarySpecialization: profData.primarySpecialization || '',
      medicalMemberships: profData.medicalMemberships?.map((m) => m.nameOfAssociation).join(', ') || '',
      subSpecializations: profData.subSpecializations?.join(', ') || '',
    },
  });

  // Tag-only fields use setValue; register them so submit + getValues stay in sync.
  useEffect(() => {
    register('subSpecializations');
    register('medicalMemberships');
  }, [register]);

  const [awardForm, setAwardForm] = useState({ name: '', awardedBy: '', year: '' });
  const [awardFile, setAwardFile] = useState(null);

  const [certForm, setCertForm] = useState({ name: '', institution: '', Year: '' });
  const [certFile, setCertFile] = useState(null);

  // ── Auto-save: only PATCH-eligible fields (experience, specialization, sub-specs) ──
  const watchedExp = watch('yearsOfExperience');
  const watchedPrimary = watch('primarySpecialization');
  const watchedSubs = watch('subSpecializations');

  const autoSaveData = useMemo(() => ({
    yearsOfExperience: watchedExp,
    primarySpecialization: watchedPrimary,
    subSpecializations: watchedSubs,
  }), [watchedExp, watchedPrimary, watchedSubs]);

  const { saveStatus } = useAutoSave({
    data: autoSaveData,
    saveFn: async (d) => {
      const subRaw = d.subSpecializations ?? '';
      const subSpecializations = String(subRaw).split(',').map(s => s.trim()).filter(Boolean);
      await profInfoMutation.mutateAsync({
        yearsOfExperience: Number(d.yearsOfExperience),
        primarySpecialization: d.primarySpecialization,
        hospitalAffiliation: Array.isArray(profData?.hospitalAffiliation)
          ? profData.hospitalAffiliation.filter(Boolean)
          : [],
        subSpecializations,
        awards: profData?.awards || [],
        certificates: profData?.certificates || [],
        medicalMemberships: profData?.medicalMemberships || [],
      });
    },
    delay: 3000,
    enabled: isValid,
  });

  const onProfSubmit = handleSubmit(async () => {
    const data = getValues();
    const membershipRaw =
      data.medicalMemberships ??
      watch('medicalMemberships') ??
      '';
    const membershipNames = String(membershipRaw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const subRaw = data.subSpecializations ?? watch('subSpecializations') ?? '';
    const subSpecializations = String(subRaw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const currentYear = new Date().getFullYear();

    const existingMembershipNames = new Set(
      (Array.isArray(profData?.medicalMemberships) ? profData.medicalMemberships : [])
        .map((m) => String(m?.nameOfAssociation ?? '').trim())
        .filter(Boolean)
    );

    // To prevent the backend from wiping existing arrays on a PATCH, we send back the existing arrays.
    const profPayload = {
      yearsOfExperience: Number(data.yearsOfExperience),
      primarySpecialization: data.primarySpecialization,
      hospitalAffiliation: Array.isArray(profData?.hospitalAffiliation)
        ? profData.hospitalAffiliation.filter(Boolean)
        : [],
      subSpecializations,
      awards: profData?.awards || [],
      certificates: profData?.certificates || [],
      medicalMemberships: profData?.medicalMemberships || [],
    };

    try {
      await profInfoMutation.mutateAsync(profPayload);

      // Many APIs ignore medicalMemberships on PATCH; persist via POST /professional-info/memberships.
      for (const nameOfAssociation of membershipNames) {
        if (existingMembershipNames.has(nameOfAssociation)) continue;
        try {
          await addMembershipMutation.mutateAsync({
            nameOfAssociation,
            Since: currentYear,
          });
          existingMembershipNames.add(nameOfAssociation);
        } catch (e) {
          console.error('Membership add error:', e);
          toast.error(
            e?.response?.data?.message ||
              `Could not save membership: ${nameOfAssociation}`
          );
          return;
        }
      }

      // Persist any filled award/certificate row (same as + Add), so Save sends everything.
      if (awardForm.name.trim()) {
        if (!awardFile) {
          toast.error(
            'Attach a document for the award or clear the award fields before continuing.'
          );
          return;
        }
        try {
          const fd = new FormData();
          fd.append('name', awardForm.name.trim());
          fd.append('awardedBy', awardForm.awardedBy.trim());
          if (awardForm.year) fd.append('year', String(awardForm.year));
          fd.append('file', awardFile);
          await addAwardMutation.mutateAsync(fd);
          setAwardForm({ name: '', awardedBy: '', year: '' });
          setAwardFile(null);
        } catch (e) {
          console.error('Award add error:', e);
          toast.error(e?.response?.data?.message || 'Could not save award');
          return;
        }
      }

      if (certForm.name.trim()) {
        if (!certFile) {
          toast.error(
            'Attach a document for the certificate or clear the certificate fields before continuing.'
          );
          return;
        }
        try {
          const fd = new FormData();
          fd.append('name', certForm.name.trim());
          fd.append('institution', certForm.institution.trim());
          if (certForm.Year) fd.append('Year', String(certForm.Year));
          fd.append('file', certFile);
          await addCertificateMutation.mutateAsync(fd);
          setCertForm({ name: '', institution: '', Year: '' });
          setCertFile(null);
        } catch (e) {
          console.error('Certificate add error:', e);
          toast.error(e?.response?.data?.message || 'Could not save certificate');
          return;
        }
      }

      onNext(3);
    } catch (err) {
      console.error('Professional info submit error:', err);
    }
  });

  const handleAddAward = () => {
    if (!awardForm.name.trim()) {
      toast.error('Award name is required');
      return;
    }
    if (!awardFile) {
      toast.error('Please select a supporting document for the award');
      return;
    }
    const fd = new FormData();
    fd.append('name', awardForm.name.trim());
    fd.append('awardedBy', awardForm.awardedBy.trim());
    if (awardForm.year) fd.append('year', String(awardForm.year));
    fd.append('file', awardFile);
    addAwardMutation.mutate(fd, {
      onSuccess: () => {
        setAwardForm({ name: '', awardedBy: '', year: '' });
        setAwardFile(null);
      },
    });
  };

  const handleAddCertificate = () => {
    if (!certForm.name.trim()) {
      toast.error('Certificate name is required');
      return;
    }
    if (!certFile) {
      toast.error('Please select a supporting document for the certificate');
      return;
    }
    const fd = new FormData();
    fd.append('name', certForm.name.trim());
    fd.append('institution', certForm.institution.trim());
    if (certForm.Year) fd.append('Year', String(certForm.Year));
    fd.append('file', certFile);
    addCertificateMutation.mutate(fd, {
      onSuccess: () => {
        setCertForm({ name: '', institution: '', Year: '' });
        setCertFile(null);
      },
    });
  };

  const inputClass =
    'w-full bg-[#f3f4f6] text-slate-700 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400';
  const labelClass = 'text-[11px] font-bold text-slate-700 mb-2 block';

  return (
    <form onSubmit={onProfSubmit} className="animate-in fade-in duration-500 space-y-6 max-w-4xl">
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">Clinical profile</h3>
          <AutoSaveIndicator status={saveStatus} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Years of Experience</label>
            <input
              type="number"
              {...register('yearsOfExperience', { required: true, min: 0 })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Primary Specialization</label>
            <input
              {...register('primarySpecialization', { required: true })}
              className={inputClass}
              placeholder="e.g. Cardiology"
            />
          </div>
        </div>
        <div className="space-y-4">
          <TagInput
            label="Sub Specializations"
            placeholder="e.g. Interventional Cardiology, Echocardiography"
            value={watch('subSpecializations')}
            onChange={(val) => setValue('subSpecializations', val, { shouldValidate: true, shouldDirty: true })}
          />
          <TagInput
            label="Medical Memberships"
            placeholder="e.g. Egyptian Society of Cardiology"
            value={watch('medicalMemberships')}
            onChange={(val) => setValue('medicalMemberships', val, { shouldValidate: true, shouldDirty: true })}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60">
        <h3 className="font-bold text-slate-800 mb-2">Awards</h3>
        <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed">
          Each award needs a supporting PDF or image. Use <span className="font-bold text-slate-600">+ Add Award</span> or{' '}
          <span className="font-bold text-slate-600">Save and Continue</span> (with a file attached).
        </p>

        {profData?.awards?.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {profData.awards.map((a) => (
              <div
                key={a._id || a.id || `${a.name}-${a.year ?? ''}`}
                className="bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-semibold px-4 py-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Award size={16} className="shrink-0" />
                  <span>
                    {a.name}
                    {a.year ? ` (${a.year})` : ''}
                    {a.awardedBy ? ` - ${a.awardedBy}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-white px-2 py-1 rounded" title="View Document">
                      <ExternalLink size={12} /> <span className="text-[10px]">View</span>
                    </a>
                  )}
                  {a._id && (
                    <button
                      type="button"
                      onClick={() => deleteAwardMutation.mutate(a._id)}
                      disabled={deleteAwardMutation.isPending}
                      className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center p-1 bg-white rounded-full"
                      title="Delete Award"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className={inputClass}
              placeholder="Award name *"
              value={awardForm.name}
              onChange={(e) => setAwardForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="Awarded by"
              value={awardForm.awardedBy}
              onChange={(e) => setAwardForm((p) => ({ ...p, awardedBy: e.target.value }))}
            />
            <input
              type="number"
              className={inputClass}
              placeholder="Year"
              min="1950"
              max={new Date().getFullYear()}
              value={awardForm.year}
              onChange={(e) => setAwardForm((p) => ({ ...p, year: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer hover:border-amber-300 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500 shrink-0"
              >
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                <path d="M12 15v-6" />
                <path d="m9 12 3-3 3 3" />
              </svg>
              <span className="text-[12px] font-semibold text-slate-600 truncate">
                {awardFile ? awardFile.name : 'Attach document (PDF / image)'}
              </span>
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => setAwardFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="button"
              onClick={handleAddAward}
              disabled={addAwardMutation.isPending}
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-[12px] font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {addAwardMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : '+ Add Award'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60">
        <h3 className="font-bold text-slate-800 mb-2">Certificates</h3>
        <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed">
          Each certificate needs a supporting PDF or image. Use{' '}
          <span className="font-bold text-slate-600">+ Add Certificate</span> or{' '}
          <span className="font-bold text-slate-600">Save and Continue</span> (with a file attached).
        </p>

        {profData?.certificates?.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {profData.certificates.map((c) => (
              <div
                key={c._id || c.id || `${c.name}-${c.Year ?? ''}`}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-semibold px-4 py-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="shrink-0" />
                  <span>
                    {c.name}
                    {c.Year ? ` (${c.Year})` : ''}
                    {c.institution ? ` - ${c.institution}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-white px-2 py-1 rounded" title="View Document">
                      <ExternalLink size={12} /> <span className="text-[10px]">View</span>
                    </a>
                  )}
                  {c._id && (
                    <button
                      type="button"
                      onClick={() => deleteCertificateMutation.mutate(c._id)}
                      disabled={deleteCertificateMutation.isPending}
                      className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center p-1 bg-white rounded-full"
                      title="Delete Certificate"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className={inputClass}
              placeholder="Certificate name *"
              value={certForm.name}
              onChange={(e) => setCertForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="Institution"
              value={certForm.institution}
              onChange={(e) => setCertForm((p) => ({ ...p, institution: e.target.value }))}
            />
            <input
              type="number"
              className={inputClass}
              placeholder="Year"
              min="1950"
              max={new Date().getFullYear()}
              value={certForm.Year}
              onChange={(e) => setCertForm((p) => ({ ...p, Year: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer hover:border-emerald-300 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500 shrink-0"
              >
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                <path d="M12 15v-6" />
                <path d="m9 12 3-3 3 3" />
              </svg>
              <span className="text-[12px] font-semibold text-slate-600 truncate">
                {certFile ? certFile.name : 'Attach document (PDF / image)'}
              </span>
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="button"
              onClick={handleAddCertificate}
              disabled={addCertificateMutation.isPending}
              className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[12px] font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {addCertificateMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : '+ Add Certificate'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onPrev(1)}
          className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition-all text-sm"
        >
          <ArrowLeft size={16} /> Previous Step
        </button>
        <button
          type="submit"
          disabled={
            !isValid ||
            profInfoMutation.isPending ||
            addMembershipMutation.isPending ||
            addAwardMutation.isPending ||
            addCertificateMutation.isPending
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[13px] shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {profInfoMutation.isPending ||
          addMembershipMutation.isPending ||
          addAwardMutation.isPending ||
          addCertificateMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Save and Continue <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
