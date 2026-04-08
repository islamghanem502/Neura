import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getDoctorBasicInfo,
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

export const useDoctorData = () => {
  return useQuery({
    queryKey: ['doctorBasicInfo'],
    queryFn: getDoctorBasicInfo,
  });
};

export const useUpdateDoctorBasicInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDoctorBasicInfo,
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
    onSuccess: () => {
      toast.success('Professional info updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorBasicInfo'] });
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
    onSuccess: () => {
      toast.success('Profile image uploaded successfully');
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
      // Redirect out of profile page since accountStatus is likely pending_verification now
      window.location.href = '/dashboard/doctor';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit profile for review');
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
