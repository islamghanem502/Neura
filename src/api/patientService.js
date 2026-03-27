import axiosInstance from './axiosInstance';

export const patientService = {
  // --- Basic Info ---
  getBasicInfo: async () => {
    const { data } = await axiosInstance.get('/patients/me/basic-info');
    return data.data.basicInfo;
  },
  
  updateBasicInfo: async (formData) => {
    const { data } = await axiosInstance.patch('/patients/me/basic-info', formData);
    return data;
  },

  // --- Profile Image ---
  uploadProfileImage: async (imageFile) => {
    const formData = new FormData();
    // تأكد إن السيرفر مستني كلمة 'file' مش 'image'
    formData.append('file', imageFile); 

    const { data } = await axiosInstance.post('/patients/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data?.data?.profileImage?.imageUrl || data?.profileImage || data;
  },

  deleteProfileImage: async () => {
    const { data } = await axiosInstance.delete('/patients/me/profile-image');
    return data;
  },

  // --- Emergency Contacts ---
  getEmergencyContacts: async () => {
    const { data } = await axiosInstance.get('/patients/me/emergency-contacts');
    return data?.data?.emergencyContacts || [];
  },

  addEmergencyContact: async (contactData) => {
    const { data } = await axiosInstance.post('/patients/me/emergency-contacts', contactData);
    return data;
  },

  updateEmergencyContact: async ({ id, data: contactData }) => {
    const { data } = await axiosInstance.patch(`/patients/me/emergency-contacts/${id}`, contactData);
    return data;
  },

  deleteEmergencyContact: async (id) => {
    const { data } = await axiosInstance.delete(`/patients/me/emergency-contacts/${id}`);
    return data;
  },

  // --- Medical Profile (GET consolidated + CRUD for each section) ---
  
  // GET: Fetch all medical profile data from single endpoint
  getMedicalProfile: async () => {
    const { data } = await axiosInstance.get('/patients/me/medical-profile');
    return data.data.medicalProfile;
  },

  // Individual GET methods that pull from consolidated endpoint
  getMedications: async () => {
    const medicalProfile = await patientService.getMedicalProfile();
    return medicalProfile?.currentMedications || [];
  },

  getFamilyHistory: async () => {
    const medicalProfile = await patientService.getMedicalProfile();
    return medicalProfile?.familyMedicalHistory || [];
  },

  getSurgeries: async () => {
    const medicalProfile = await patientService.getMedicalProfile();
    return medicalProfile?.previousSurgeries || [];
  },

  getAllergies: async () => {
    const medicalProfile = await patientService.getMedicalProfile();
    const allergies = medicalProfile?.allergies || [];
    
    // Normalize allergies: flatten nested types array for form display
    return allergies.map((allergy) => {
      const firstType = Array.isArray(allergy.types) && allergy.types[0] ? allergy.types[0] : {};
      return {
        ...allergy,
        allergen: allergy.allergen || allergy.nameOfAllergy,
        reaction: firstType.reaction || "",
        severity: firstType.severity || "",
      };
    });
  },

  getChronicDiseases: async () => {
    const medicalProfile = await patientService.getMedicalProfile();
    return medicalProfile?.chronicDiseases || [];
  },

  // --- Medications CRUD ---
  addMedication: async (medicationData) => {
    const { data } = await axiosInstance.post('/patients/me/medical-profile/medications', medicationData);
    return data?.data?.medication || data?.data?.newMedication || data?.data;
  },

  updateMedication: async ({ id, medicationData }) => {
    const { data } = await axiosInstance.patch(`/patients/me/medical-profile/medications/${id}`, medicationData);
    return data?.data?.medication || data?.data;
  },

  deleteMedication: async (id) => {
    const { data } = await axiosInstance.delete(`/patients/me/medical-profile/medications/${id}`);
    return data;
  },

  // --- Family History CRUD ---
  addFamilyHistory: async (historyData) => {
    const { data } = await axiosInstance.post('/patients/me/medical-profile/family-history', historyData);
    return data?.data?.history || data?.data?.newHistory || data?.data;
  },

  updateFamilyHistory: async ({ id, historyData }) => {
    const { data } = await axiosInstance.patch(`/patients/me/medical-profile/family-history/${id}`, historyData);
    return data?.data?.history || data?.data;
  },

  deleteFamilyHistory: async (id) => {
    const { data } = await axiosInstance.delete(`/patients/me/medical-profile/family-history/${id}`);
    return data;
  },

  // --- Surgeries CRUD ---
  addSurgery: async (surgeryData) => {
    const { data } = await axiosInstance.post('/patients/me/medical-profile/surgeries', surgeryData);
    return data?.data?.surgery || data?.data?.newSurgery || data?.data;
  },

  updateSurgery: async ({ id, surgeryData }) => {
    const { data } = await axiosInstance.patch(`/patients/me/medical-profile/surgeries/${id}`, surgeryData);
    return data?.data?.surgery || data?.data;
  },

  deleteSurgery: async (id) => {
    const { data } = await axiosInstance.delete(`/patients/me/medical-profile/surgeries/${id}`);
    return data;
  },

  // --- Allergies CRUD ---
  addAllergy: async (allergyData) => {
    const VALID_SEVERITIES = ["mild", "moderate", "severe"];
    
    const payload = (() => {
      if (Array.isArray(allergyData?.types)) {
        return {
          nameOfAllergy: allergyData.allergen || allergyData.nameOfAllergy,
          types: allergyData.types.map((t) => {
            const cleanSeverity = typeof t.severity === "string" ? t.severity.toLowerCase() : t.severity;
            if (!VALID_SEVERITIES.includes(cleanSeverity)) {
              throw new Error(`Invalid severity: ${cleanSeverity}. Must be one of: ${VALID_SEVERITIES.join(", ")}`);
            }
            return {
              reaction: typeof t.reaction === "string" ? t.reaction.toLowerCase() : t.reaction,
              severity: cleanSeverity,
            };
          }),
        };
      }

      const { reaction, severity, allergen, nameOfAllergy, ...rest } = allergyData || {};
      const cleanReaction = typeof reaction === "string" ? reaction.toLowerCase() : reaction;
      const cleanSeverity = typeof severity === "string" ? severity.toLowerCase() : severity;
      
      if (!VALID_SEVERITIES.includes(cleanSeverity)) {
        throw new Error(`Invalid severity: ${cleanSeverity}. Must be one of: ${VALID_SEVERITIES.join(", ")}`);
      }
      
      const hasTypeFields = reaction !== undefined || severity !== undefined;
      const allergenName = allergen || nameOfAllergy;
      return {
        nameOfAllergy: allergenName,
        ...rest,
        types: hasTypeFields
          ? [{ reaction: cleanReaction || "", severity: cleanSeverity }]
          : [],
      };
    })();

    const { data } = await axiosInstance.post('/patients/me/medical-profile/allergies', payload);
    return data?.data?.allergy || data?.data?.newAllergy || data?.data;
  },

  updateAllergy: async ({ id, allergyData }) => {
    const VALID_SEVERITIES = ["mild", "moderate", "severe"];
    
    const payload = (() => {
      if (Array.isArray(allergyData?.types)) {
        return {
          nameOfAllergy: allergyData.allergen || allergyData.nameOfAllergy,
          types: allergyData.types.map((t) => {
            const cleanSeverity = typeof t.severity === "string" ? t.severity.toLowerCase() : t.severity;
            if (!VALID_SEVERITIES.includes(cleanSeverity)) {
              throw new Error(`Invalid severity: ${cleanSeverity}. Must be one of: ${VALID_SEVERITIES.join(", ")}`);
            }
            return {
              reaction: typeof t.reaction === "string" ? t.reaction.toLowerCase() : t.reaction,
              severity: cleanSeverity,
            };
          }),
        };
      }

      const { reaction, severity, allergen, nameOfAllergy, ...rest } = allergyData || {};
      const cleanReaction = typeof reaction === "string" ? reaction.toLowerCase() : reaction;
      const cleanSeverity = typeof severity === "string" ? severity.toLowerCase() : severity;
      
      if (!VALID_SEVERITIES.includes(cleanSeverity)) {
        throw new Error(`Invalid severity: ${cleanSeverity}. Must be one of: ${VALID_SEVERITIES.join(", ")}`);
      }
      
      const hasTypeFields = reaction !== undefined || severity !== undefined;
      const allergenName = allergen || nameOfAllergy;
      return {
        nameOfAllergy: allergenName,
        ...rest,
        types: hasTypeFields
          ? [{ reaction: cleanReaction || "", severity: cleanSeverity }]
          : [],
      };
    })();

    const { data } = await axiosInstance.patch(`/patients/me/medical-profile/allergies/${id}`, payload);
    return data?.data?.allergy || data?.data;
  },

  deleteAllergy: async (id) => {
    const { data } = await axiosInstance.delete(`/patients/me/medical-profile/allergies/${id}`);
    return data;
  },

  // --- Chronic Diseases CRUD ---
  addChronicDisease: async (diseaseData) => {
    const { data } = await axiosInstance.post('/patients/me/medical-profile/chronic-diseases', diseaseData);
    return data?.data?.disease || data?.data?.newDisease || data?.data;
  },

  updateChronicDisease: async ({ id, diseaseData }) => {
    const { data } = await axiosInstance.patch(`/patients/me/medical-profile/chronic-diseases/${id}`, diseaseData);
    return data?.data?.disease || data?.data;
  },

  deleteChronicDisease: async (id) => {
    const { data } = await axiosInstance.delete(`/patients/me/medical-profile/chronic-diseases/${id}`);
    return data;
  }
};