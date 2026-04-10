import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Loader2, Lock, ArrowRight, Shield, BadgeCheck, Headphones } from 'lucide-react';
import {
  useCreateDoctorBasicInfo,
  useUpdateDoctorBasicInfo,
  useUploadProfileImage,
  useDeleteProfileImage,
} from '../../../../hooks/useDoctorData';
import { useAutoSave, AutoSaveIndicator } from '../../../../hooks/useAutoSave';
import { ImageCropModal } from './ImageCropModal';

const getProfileImageUrl = (doctorData) => {
  if (!doctorData) return null;
  if (typeof doctorData.profileImage === 'string') return doctorData.profileImage;
  return doctorData.profileImage?.imageUrl || null;
};

export const ProfessionalIdentityStep = ({ doctorData, basicInfoExists, onNext }) => {
  const createBasicInfoMutation = useCreateDoctorBasicInfo();
  const updateBasicInfoMutation = useUpdateDoctorBasicInfo();
  const uploadProfileImageMutation = useUploadProfileImage();
  const deleteProfileImageMutation = useDeleteProfileImage();
  const [localProfilePreviewUrl, setLocalProfilePreviewUrl] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropFileBaseName, setCropFileBaseName] = useState('profile');

  const { register: registerBasic, handleSubmit: handleSubmitBasic, watch, formState: { isValid } } = useForm({
    mode: 'onChange',
    values: {
      firstName: doctorData.firstName || '',
      lastName: doctorData.lastName || '',
      phone: doctorData.phone || '',
      gender: doctorData.gender || 'male',
      dateOfBirth: doctorData.dateOfBirth ? doctorData.dateOfBirth.split('T')[0] : '',
      address: {
        governorate: doctorData.address?.governorate || '',
        city: doctorData.address?.city || '',
        street: doctorData.address?.street || ''
      },
    }
  });

  // ── Auto-save: debounce basic-info fields and persist after 3 s ───────────
  const watchedFields = watch();
  const autoSaveData = useMemo(() => ({
    firstName: watchedFields.firstName,
    lastName: watchedFields.lastName,
    phone: watchedFields.phone,
    gender: watchedFields.gender,
    dateOfBirth: watchedFields.dateOfBirth,
    address: watchedFields.address,
  }), [
    watchedFields.firstName,
    watchedFields.lastName,
    watchedFields.phone,
    watchedFields.gender,
    watchedFields.dateOfBirth,
    watchedFields.address?.governorate,
    watchedFields.address?.city,
    watchedFields.address?.street,
  ]);

  const { saveStatus } = useAutoSave({
    data: autoSaveData,
    saveFn: async (d) => {
      const payload = {
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        gender: d.gender,
        dateOfBirth: d.dateOfBirth,
        address: {
          governorate: d.address?.governorate,
          city: d.address?.city,
          street: d.address?.street,
        },
      };
      const mutation = basicInfoExists ? updateBasicInfoMutation : createBasicInfoMutation;
      await mutation.mutateAsync(payload);
    },
    delay: 3000,
    enabled: isValid,
  });

  const onBasicSubmit = async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      address: {
        governorate: data.address?.governorate,
        city: data.address?.city,
        street: data.address?.street
      }
    };

    const basicMutation = basicInfoExists ? updateBasicInfoMutation : createBasicInfoMutation;

    try {
      await basicMutation.mutateAsync(payload);
      onNext(2);
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      toast.error('Please choose an image file');
      e.target.value = null;
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropFileBaseName((file.name || 'profile').replace(/\.[^/.]+$/, '') || 'profile');
    setCropModalOpen(true);
    e.target.value = null;
  };

  const handleProfileImageDelete = () => {
    if (window.confirm('Are you sure you want to delete your profile picture?')) {
      deleteProfileImageMutation.mutate();
    }
  };

  const inputClass = "w-full bg-[#f3f4f6] text-slate-700 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400";
  const labelClass = "text-[11px] font-bold text-slate-700 mb-2 block";

  return (
    <div className="animate-in fade-in duration-500">
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        title="Crop your profile photo"
        aspect={1}
        outputSize={512}
        onCancel={() => {
          setCropModalOpen(false);
          setCropImageSrc((old) => {
            if (old) URL.revokeObjectURL(old);
            return null;
          });
        }}
        onConfirm={async (blob) => {
          const croppedPreviewUrl = URL.createObjectURL(blob);
          setLocalProfilePreviewUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return croppedPreviewUrl;
          });

          setCropModalOpen(false);
          setCropImageSrc((old) => {
            if (old) URL.revokeObjectURL(old);
            return null;
          });

          const croppedFile = new File([blob], `${cropFileBaseName}-square.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
          const formData = new FormData();
          formData.append('profileImage', croppedFile);
          uploadProfileImageMutation.mutate(formData, {
            onSuccess: () => {
              setLocalProfilePreviewUrl((old) => {
                if (old) URL.revokeObjectURL(old);
                return null;
              });
            },
            onError: () => {
              setLocalProfilePreviewUrl((old) => {
                if (old) URL.revokeObjectURL(old);
                return null;
              });
            },
          });
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 mb-6">
        <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center shadow-sm border border-slate-100/60">
          <h3 className="w-full text-left font-bold text-slate-800 mb-8">Profile Photo</h3>

          <div className="relative w-48 h-48 rounded-full bg-slate-200 mb-8 w-max h-max mx-auto group">
            <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-white shadow-xl shadow-slate-200">
              <img
                src={
                  localProfilePreviewUrl ||
                  getProfileImageUrl(doctorData) ||
                  `https://ui-avatars.com/api/?name=${doctorData?.firstName || 'Dr'}+${doctorData?.lastName || 'U'}&background=e2e8f0&color=475569&size=200`
                }
                alt="Doctor Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {getProfileImageUrl(doctorData) && (
              <button
                onClick={handleProfileImageDelete}
                disabled={deleteProfileImageMutation.isPending}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {uploadProfileImageMutation.isPending && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full z-10">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            )}
          </div>

          <p className="text-center text-[13px] text-slate-500 font-medium px-2 mb-8 leading-relaxed">
            Please provide a clear professional headshot. This will be visible to colleagues and verified during credentialing.
          </p>

          <label className="w-full py-3.5 bg-slate-100 text-blue-600 font-bold text-[13px] rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer text-center block">
            {uploadProfileImageMutation.isPending ? 'Uploading...' : 'Upload New Photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageUpload}
              disabled={uploadProfileImageMutation.isPending}
            />
          </label>
        </div>

        <form onSubmit={handleSubmitBasic(onBasicSubmit)} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800">Basic Information</h3>
            <AutoSaveIndicator status={saveStatus} />
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className={labelClass}>Full Professional Name</label>
              <div className="grid grid-cols-2 gap-3">
                <input {...registerBasic('firstName', { required: true })} className={inputClass} placeholder="First Name" />
                <input {...registerBasic('lastName', { required: true })} className={inputClass} placeholder="Last Name" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                Email Address <Lock size={12} className="text-emerald-500" />
              </label>
              <input
                disabled
                value={doctorData?.email || 'N/A'}
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium ml-1">Verified via invitation link</p>
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input {...registerBasic('phone', { required: true })} className={inputClass} placeholder="+1 (555) 000-0000" />
            </div>

            <div className="pt-6 border-t border-slate-100 mt-2">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Gender</label>
                  <select {...registerBasic('gender', { required: true })} className={inputClass + ' appearance-none'}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" {...registerBasic('dateOfBirth', { required: true })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input {...registerBasic('address.governorate', { required: true })} className={inputClass} placeholder="Gov." />
                <input {...registerBasic('address.city', { required: true })} className={inputClass} placeholder="City" />
                <input {...registerBasic('address.street', { required: true })} className={inputClass} placeholder="Street" />
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between mt-8 pt-4">
            <p className="text-[10px] max-w-[200px] leading-relaxed text-slate-400 font-medium pb-2">
              All information is stored securely in accordance with HIPAA standards.
            </p>

            <button
              type="submit"
              disabled={
                createBasicInfoMutation.isPending ||
                updateBasicInfoMutation.isPending ||
                !isValid
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[13px] flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:active:scale-100"
            >
              {(createBasicInfoMutation.isPending || updateBasicInfoMutation.isPending) ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Next Step <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
          <BadgeCheck size={20} className="text-emerald-600 mb-4" />
          <h4 className="font-bold text-slate-800 text-[13px] mb-2">Verified Identity</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-4">
            Your data is cross-referenced with NPI and medical board databases.
          </p>
        </div>

        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
          <Shield size={20} className="text-blue-600 mb-4" />
          <h4 className="font-bold text-slate-800 text-[13px] mb-2">Data Privacy</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-4">
            We use end-to-end encryption for all sensitive professional data.
          </p>
        </div>

        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
          <Headphones size={20} className="text-indigo-600 mb-4" />
          <h4 className="font-bold text-slate-800 text-[13px] mb-2">Concierge Onboarding</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-4">
            Need help? Our onboarding specialists are available 24/7.
          </p>
        </div>
      </div>
    </div>
  );
};
