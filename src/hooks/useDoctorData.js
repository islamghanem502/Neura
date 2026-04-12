import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getDoctorBasicInfo,
  createDoctorBasicInfo,
  updateDoctorBasicInfo,
  updateDoctorProfessionalInfo,
  uploadDoctorDocument,
  submitDoctorProfileForReview,
  getDoctorProfessionalInfo,
  addDoctorCertificate,
  deleteDoctorCertificate,
  addDoctorMembership,
  deleteDoctorMembership,
  addDoctorAward,
  deleteDoctorAward,
  getClinicInfo,
  addClinicInfo,
  updateClinicInfo,
  deleteClinicInfo,
  uploadProfileImage,
  deleteProfileImage,
} from '../api/doctorService';

/** Mongoose optimistic-locking conflict (VersionError) — safe to retry after a short delay. */
const isMongooseVersionConflict = (error) => {
  const msg = String(error?.response?.data?.message ?? error?.message ?? '');
  return (
    msg.includes('No matching document found for id') ||
    (msg.includes('version') && msg.includes('modifiedPaths'))
  );
};

export const useDoctorData = () => {
  return useQuery({
    queryKey: ['doctorBasicInfo'],
    queryFn: getDoctorBasicInfo,
  });
};

export const useCreateDoctorBasicInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDoctorBasicInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save basic info');
    }
  });
};

export const useUpdateDoctorBasicInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDoctorBasicInfo,
    retry: (failureCount, error) => failureCount < 3 && isMongooseVersionConflict(error),
    retryDelay: (attemptIndex) => Math.min(400 * 2 ** attemptIndex, 2500),
    onSuccess: () => {
      toast.success('Basic info updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update basic info');
    }
  });
};

export const useUpdateDoctorProfessionalInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDoctorProfessionalInfo,
    retry: (failureCount, error) => failureCount < 3 && isMongooseVersionConflict(error),
    retryDelay: (attemptIndex) => Math.min(400 * 2 ** attemptIndex, 2500),
    onSuccess: () => {
      toast.success('Professional info updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
      queryClient.invalidateQueries({ queryKey: ['doctorProfessionalInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update professional info');
    }
  });
};

export const useUploadDoctorDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDoctorDocument,
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    }
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (res) => {
      toast.success('Profile image uploaded successfully');
      // Optimistically patch cached doctor basic info so UI updates immediately.
      const uploadedUrl =
        res?.data?.profileImage?.imageUrl ??
        res?.data?.imageUrl ??
        res?.profileImage?.imageUrl ??
        res?.imageUrl ??
        null;

      if (uploadedUrl) {
        queryClient.setQueryData(['doctorBasicInfo'], (old) => {
          if (!old) return old;

          // Common API shape in this repo: { data: { basicInfo: { ... } } }
          if (old?.data?.basicInfo) {
            return {
              ...old,
              data: {
                ...old.data,
                basicInfo: {
                  ...old.data.basicInfo,
                  profileImage: { imageUrl: uploadedUrl },
                },
              },
            };
          }

          // Fallback: basic info may already be at root
          return {
            ...old,
            profileImage: { imageUrl: uploadedUrl },
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload profile image');
    }
  });
};

export const useDeleteProfileImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      toast.success('Profile image deleted successfully');
      // Patch cache immediately so UI removes the image without waiting.
      queryClient.setQueryData(['doctorBasicInfo'], (old) => {
        if (!old) return old;
        if (old?.data?.basicInfo) {
          return {
            ...old,
            data: {
              ...old.data,
              basicInfo: {
                ...old.data.basicInfo,
                profileImage: null,
              },
            },
          };
        }
        return { ...old, profileImage: null };
      });
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete profile image');
    }
  });
};

export const useSubmitDoctorProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitDoctorProfileForReview,
    onSuccess: () => {
      toast.success('Profile submitted for review successfully!');
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to submit profile for review';
      if (!msg.toLowerCase().includes('already submitted')) {
         toast.error(msg);
      }
    }
  });
};

// --- Professional Info Extended Hooks ---

export const useDoctorProfessionalInfo = () => {
  return useQuery({
    queryKey: ['doctorProfessionalInfo'],
    queryFn: getDoctorProfessionalInfo,
  });
};

export const useAddDoctorCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDoctorCertificate,
    onSuccess: () => {
      toast.success('Certificate added successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfessionalInfo'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add certificate');
    }
  });
};

export const useDeleteDoctorCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctorCertificate,
    onSuccess: () => {
      toast.success('Certificate deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfessionalInfo'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete certificate');
    }
  });
};

export const useAddDoctorMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDoctorMembership,
    onSuccess: () => {
      toast.success('Membership added successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfessionalInfo'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add membership');
    }
  });
};

export const useDeleteDoctorMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctorMembership,
    onSuccess: () => {
      toast.success('Membership deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfessionalInfo'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete membership');
    }
  });
};

export const useAddDoctorAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDoctorAward,
    onSuccess: () => {
      toast.success('Award added successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfessionalInfo'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add award');
    }
  });
};

export const useDeleteDoctorAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctorAward,
    onSuccess: () => {
      toast.success('Award deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorProfessionalInfo'] });
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete award');
    }
  });
};

// --- Clinic Hooks ---

export const useClinicInfo = () => {
  return useQuery({
    queryKey: ['clinicInfo'],
    queryFn: getClinicInfo,
  });
};

export const useAddClinicInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addClinicInfo,
    onSuccess: () => {
      toast.success('Clinic added successfully!');
      queryClient.invalidateQueries({ queryKey: ['clinicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add clinic');
    }
  });
};

export const useUpdateClinicInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClinicInfo,
    onSuccess: () => {
      toast.success('Clinic updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['clinicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update clinic');
    }
  });
};

export const useDeleteClinicInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClinicInfo,
    onSuccess: () => {
      toast.success('Clinic removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['clinicInfo'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete clinic');
    }
  });
};
