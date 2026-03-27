import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../../../api/patientService";
import {
  User,
  Phone,
  Activity,
  Edit3,
  Save,
  X,
  MapPin,
  Camera,
  Loader2,
  Trash2,
  Pill,
  Users,
  Syringe,
  AlertTriangle,
  Heart,
  Mail,
  Calendar,
  Weight,
  Ruler,
  Droplet,
  HeartPulse,
  ChevronRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import MedicalProfileSection from "./MedicalProfileSection";

const PatientProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Fetch Basic Info
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["patientBasicInfo"],
    queryFn: patientService.getBasicInfo,
  });

  // Fetch all medical profile data
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ["medications"],
    queryFn: patientService.getMedications,
    retry: 1,
  });

  const { data: familyHistory = [], isLoading: familyHistoryLoading } =
    useQuery({
      queryKey: ["familyHistory"],
      queryFn: patientService.getFamilyHistory,
      retry: 1,
    });

  const { data: surgeries = [], isLoading: surgeriesLoading } = useQuery({
    queryKey: ["surgeries"],
    queryFn: patientService.getSurgeries,
    retry: 1,
  });

  const { data: allergies = [], isLoading: allergiesLoading } = useQuery({
    queryKey: ["allergies"],
    queryFn: patientService.getAllergies,
    retry: 1,
  });

  const { data: chronicDiseases = [], isLoading: chronicDiseasesLoading } =
    useQuery({
      queryKey: ["chronicDiseases"],
      queryFn: patientService.getChronicDiseases,
      retry: 1,
    });

  const { data: emergencyContacts = [], isLoading: emergencyLoading } =
    useQuery({
      queryKey: ["emergencyContacts"],
      queryFn: patientService.getEmergencyContacts,
      retry: 1,
    });

  // Update Basic Info Mutation
  const updateMutation = useMutation({
    mutationFn: (newData) => patientService.updateBasicInfo(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientBasicInfo"] });
      setIsEditing(false);
    },
  });

  // Profile Image Mutations
  const uploadImageMutation = useMutation({
    mutationFn: (file) => patientService.uploadProfileImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientBasicInfo"] });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: () => patientService.deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientBasicInfo"] });
    },
  });

  // Emergency Contacts Mutations
  const addEmergencyMutation = useMutation({
    mutationFn: (data) => patientService.addEmergencyContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });

  const updateEmergencyMutation = useMutation({
    mutationFn: ({ id, data }) =>
      patientService.updateEmergencyContact({ id, contactData: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });

  const deleteEmergencyMutation = useMutation({
    mutationFn: (id) => patientService.deleteEmergencyContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });

  // Medications Mutations
  const addMedicationMutation = useMutation({
    mutationFn: (data) => patientService.addMedication(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  const updateMedicationMutation = useMutation({
    mutationFn: ({ id, data }) =>
      patientService.updateMedication({ id, medicationData: data }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: (id) => patientService.deleteMedication(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  // Family History Mutations
  const addFamilyHistoryMutation = useMutation({
    mutationFn: (data) => patientService.addFamilyHistory(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["familyHistory"] }),
  });

  const updateFamilyHistoryMutation = useMutation({
    mutationFn: ({ id, data }) =>
      patientService.updateFamilyHistory({ id, historyData: data }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["familyHistory"] }),
  });

  const deleteFamilyHistoryMutation = useMutation({
    mutationFn: (id) => patientService.deleteFamilyHistory(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["familyHistory"] }),
  });

  // Surgeries Mutations
  const addSurgeryMutation = useMutation({
    mutationFn: (data) => patientService.addSurgery(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surgeries"] }),
  });

  const updateSurgeryMutation = useMutation({
    mutationFn: ({ id, data }) =>
      patientService.updateSurgery({ id, surgeryData: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surgeries"] }),
  });

  const deleteSurgeryMutation = useMutation({
    mutationFn: (id) => patientService.deleteSurgery(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surgeries"] }),
  });

  // Allergies Mutations
  const addAllergyMutation = useMutation({
    mutationFn: (data) => patientService.addAllergy(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allergies"] }),
  });

  const updateAllergyMutation = useMutation({
    mutationFn: ({ id, data }) =>
      patientService.updateAllergy({ id, allergyData: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allergies"] }),
  });

  const deleteAllergyMutation = useMutation({
    mutationFn: (id) => patientService.deleteAllergy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allergies"] }),
  });

  // Chronic Diseases Mutations
  const addChronicDiseaseMutation = useMutation({
    mutationFn: (data) => patientService.addChronicDisease(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["chronicDiseases"] }),
  });

  const updateChronicDiseaseMutation = useMutation({
    mutationFn: ({ id, data }) =>
      patientService.updateChronicDisease({ id, diseaseData: data }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["chronicDiseases"] }),
  });

  const deleteChronicDiseaseMutation = useMutation({
    mutationFn: (id) => patientService.deleteChronicDisease(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["chronicDiseases"] }),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const handleDeleteImage = (e) => {
    e.stopPropagation();
    if (
      window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      deleteImageMutation.mutate();
    }
  };

  // Calculate Progress
  const calculateProgress = () => {
    if (!profile) return 0;

    let filledFields = 0;
    let totalFields = 15;

    // Basic fields
    if (profile.phone) filledFields++;
    if (profile.height) filledFields++;
    if (profile.weight) filledFields++;
    if (profile.bloodType) filledFields++;
    if (profile.maritalStatus) filledFields++;
    if (profile.address?.city) filledFields++;
    if (profile.address?.governorate) filledFields++;

    // Medical sections
    if (medications.length > 0) filledFields++;
    if (familyHistory.length > 0) filledFields++;
    if (surgeries.length > 0) filledFields++;
    if (allergies.length > 0) filledFields++;
    if (chronicDiseases.length > 0) filledFields++;
    if (emergencyContacts.length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    const patchPayload = {
      phone: formValues.phone,
      maritalStatus: formValues.maritalStatus,
      bloodType: formValues.bloodType,
      height: Number(formValues.height),
      weight: Number(formValues.weight),
      address: {
        governorate: formValues.governorate,
        city: formValues.city,
        street: formValues.street,
      },
    };

    updateMutation.mutate(patchPayload);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">
            Loading your health profile...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600">
            Failed to load profile data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isActionPending =
    uploadImageMutation.isPending || deleteImageMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="relative">
                <div
                  className={`w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 ${isActionPending ? "animate-pulse" : ""}`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                    <img
                      src={
                        profile?.profileImage?.imageUrl ||
                        profile?.profileImage ||
                        `https://ui-avatars.com/api/?name=${profile?.fullName}&background=0D8ABC&color=fff&bold=true`
                      }
                      alt={profile?.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 border-4 border-white"
                  disabled={isActionPending}
                >
                  {isActionPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                {profile?.profileImage && !isActionPending && (
                  <button
                    onClick={handleDeleteImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                    title="Remove profile picture"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    {profile?.fullName}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Health Profile
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {profile?.age} Years • {profile?.gender}
                    </span>
                    {profile?.bloodType && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {profile.bloodType} Blood Type
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-xl active:scale-95 whitespace-nowrap"
                  >
                    <Edit3 size={18} /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2.5 text-gray-400 hover:text-red-500 bg-gray-100 rounded-xl transition-colors hover:bg-red-50"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-gray-600">
                    Profile Completion
                  </p>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {progress === 100
                    ? "✨ Perfect! Your profile is complete"
                    : `${Math.ceil(15 - progress / 6.67)} items remaining to complete your profile`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <User size={20} />
                  <h3 className="font-bold">Personal Information</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-100">
                    <label className="text-xs text-gray-500">Full Name</label>
                    <p className="text-lg font-semibold text-gray-800">
                      {profile?.fullName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Age</label>
                      <p className="font-semibold text-gray-800">
                        {profile?.age} years
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Gender</label>
                      <p className="font-semibold text-gray-800">
                        {profile?.gender}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="text-xs text-gray-500">
                            Weight (kg)
                          </label>
                          <input
                            name="weight"
                            type="number"
                            step="0.1"
                            defaultValue={profile?.weight}
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">
                            Height (cm)
                          </label>
                          <input
                            name="height"
                            type="number"
                            step="0.1"
                            defaultValue={profile?.height}
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs text-gray-500">
                            Weight
                          </label>
                          <p className="font-semibold text-gray-800">
                            {profile?.weight
                              ? `${profile.weight} kg`
                              : "Not set"}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">
                            Height
                          </label>
                          <p className="font-semibold text-gray-800">
                            {profile?.height
                              ? `${profile.height} cm`
                              : "Not set"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {isEditing ? (
                    <div>
                      <label className="text-xs text-gray-500">
                        Blood Type
                      </label>
                      <select
                        name="bloodType"
                        defaultValue={profile?.bloodType}
                        className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      >
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-gray-500">
                        Blood Type
                      </label>
                      <p className="font-semibold text-gray-800">
                        {profile?.bloodType || "Not set"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Address Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Phone size={20} />
                  <h3 className="font-bold">Contact & Address</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-100">
                    <label className="text-xs text-gray-500">
                      Email Address
                    </label>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {profile?.email}
                    </p>
                  </div>

                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-xs text-gray-500">
                          Phone Number
                        </label>
                        <input
                          name="phone"
                          defaultValue={profile?.phone}
                          className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">
                            Governorate
                          </label>
                          <input
                            name="governorate"
                            defaultValue={profile?.address?.governorate}
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">City</label>
                          <input
                            name="city"
                            defaultValue={profile?.address?.city}
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Street Details
                        </label>
                        <input
                          name="street"
                          defaultValue={profile?.address?.street}
                          className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-gray-500">Phone</label>
                        <p
                          className={`font-medium flex items-center gap-2 ${!profile?.phone ? "text-orange-500" : "text-gray-800"}`}
                        >
                          <Phone size={16} className="text-gray-400" />
                          {profile?.phone || "Not added yet"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Address</label>
                        <p className="text-gray-800 font-medium flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="text-gray-400 mt-1 flex-shrink-0"
                          />
                          <span>
                            {profile?.address?.city ||
                            profile?.address?.governorate
                              ? `${profile.address.city || ""}${profile.address.city && profile.address.governorate ? ", " : ""}${profile.address.governorate || ""}`
                              : "Not specified"}
                            {profile?.address?.street && (
                              <span className="block text-sm text-gray-500 mt-1">
                                {profile.address.street}
                              </span>
                            )}
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Activity size={20} />
                  <h3 className="font-bold">Medical Overview</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <Pill size={20} className="text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {medications.length}
                    </p>
                    <p className="text-xs text-gray-600">Medications</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <AlertTriangle size={20} className="text-red-600 mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {allergies.length}
                    </p>
                    <p className="text-xs text-gray-600">Allergies</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <Activity size={20} className="text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-amber-600">
                      {chronicDiseases.length}
                    </p>
                    <p className="text-xs text-gray-600">Chronic Diseases</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <Heart size={20} className="text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {emergencyContacts.length}
                    </p>
                    <p className="text-xs text-gray-600">Emergency Contacts</p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4">
                    <label className="text-xs text-gray-500">
                      Marital Status
                    </label>
                    <select
                      name="maritalStatus"
                      defaultValue={profile?.maritalStatus}
                      className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="text-xs text-gray-500">
                      Marital Status
                    </label>
                    <p className="font-semibold text-gray-800">
                      {profile?.maritalStatus
                        ? profile.maritalStatus.charAt(0).toUpperCase() +
                          profile.maritalStatus.slice(1)
                        : "Not specified"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mb-8 flex justify-center">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Medical Profile Sections */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HeartPulse size={24} className="text-blue-600" />
            Medical Profile
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medications */}
            <MedicalProfileSection
              title="Current Medications"
              icon={Pill}
              color="blue"
              items={medications}
              isLoading={medicationsLoading}
              onAdd={(data) => addMedicationMutation.mutateAsync(data)}
              onUpdate={(data) => updateMedicationMutation.mutateAsync(data)}
              onDelete={(id) => deleteMedicationMutation.mutate(id)}
              fields={[
                { name: "name", label: "Medication Name", required: true },
                {
                  name: "reason",
                  label: "Reason/Indication",
                  type: "textarea",
                },
                { name: "dosage", label: "Dosage & Frequency" },
              ]}
              emptyMessage="No medications recorded"
            />

            {/* Allergies */}
            <MedicalProfileSection
              title="Known Allergies"
              icon={AlertTriangle}
              color="rose"
              items={allergies}
              isLoading={allergiesLoading}
              onAdd={(data) => addAllergyMutation.mutateAsync(data)}
              onUpdate={(data) => updateAllergyMutation.mutateAsync(data)}
              onDelete={(id) => deleteAllergyMutation.mutate(id)}
              fields={[
                {
                  name: "allergen",
                  label: "Allergy Name",
                  required: true,
                },
                {
                  name: "reaction",
                  label: "Reaction Type",
                  type: "select",
                  options: [
                    "Rash",
                    "Itching",
                    "Anaphylaxis",
                    "Difficulty breathing",
                    "Other",
                  ],
                },
                {
                  name: "severity",
                  label: "Severity",
                  type: "select",
                  options: ["mild", "moderate", "severe"],
                },
              ]}
              emptyMessage="No allergies recorded"
            />

            {/* Surgeries */}
            <MedicalProfileSection
              title="Surgical History"
              icon={Syringe}
              color="purple"
              items={surgeries}
              isLoading={surgeriesLoading}
              onAdd={(data) => addSurgeryMutation.mutateAsync(data)}
              onUpdate={(data) => updateSurgeryMutation.mutateAsync(data)}
              onDelete={(id) => deleteSurgeryMutation.mutate(id)}
              fields={[
                {
                  name: "nameOfSurgery",
                  label: "Surgery Name",
                  required: true,
                },
                { name: "date", label: "Surgery Date", type: "date" },
                { name: "hospital", label: "Hospital/Clinic" },
                { name: "doctor", label: "Surgeon Name" },
              ]}
              emptyMessage="No surgeries recorded"
            />

            {/* Chronic Diseases */}
            <MedicalProfileSection
              title="Chronic Diseases"
              icon={Activity}
              color="amber"
              items={chronicDiseases}
              isLoading={chronicDiseasesLoading}
              onAdd={(data) => addChronicDiseaseMutation.mutateAsync(data)}
              onUpdate={(data) =>
                updateChronicDiseaseMutation.mutateAsync(data)
              }
              onDelete={(id) => deleteChronicDiseaseMutation.mutate(id)}
              fields={[
                {
                  name: "nameOfDisease",
                  label: "Disease Name",
                  required: true,
                },
                { name: "type", label: "Disease Type" },
                { name: "since", label: "Year Diagnosed", type: "number" },
              ]}
              emptyMessage="No chronic diseases recorded"
            />
          </div>

          {/* Family History - Full Width */}
          <div>
            <MedicalProfileSection
              title="Family Medical History"
              icon={Users}
              color="emerald"
              items={familyHistory}
              isLoading={familyHistoryLoading}
              onAdd={(data) => addFamilyHistoryMutation.mutateAsync(data)}
              onUpdate={(data) => updateFamilyHistoryMutation.mutateAsync(data)}
              onDelete={(id) => deleteFamilyHistoryMutation.mutate(id)}
              fields={[
                {
                  name: "nameOfFamilyMember",
                  label: "Family Member Name",
                  required: true,
                },
                {
                  name: "nameOfDisease",
                  label: "Disease Name",
                  required: true,
                },
                {
                  name: "age",
                  label: "Age (at diagnosis/current)",
                  type: "number",
                },
              ]}
              emptyMessage="No family medical history recorded"
            />
          </div>

          {/* Emergency Contacts Section */}
          <EmergencyContactsSection
            contacts={emergencyContacts}
            isLoading={emergencyLoading}
            onAdd={(data) => addEmergencyMutation.mutateAsync(data)}
            onUpdate={(data) => updateEmergencyMutation.mutateAsync(data)}
            onDelete={(id) => deleteEmergencyMutation.mutate(id)}
          />
        </div>
      </div>
    </div>
  );
};

// Emergency Contacts Section Component
const EmergencyContactsSection = ({
  contacts,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    relationship: "",
  });

  const resetForm = () => {
    setFormData({ name: "", phoneNumber: "", relationship: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await onUpdate({ id: editingId, data: formData });
      } else {
        await onAdd(formData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact._id);
    setFormData({
      name: contact.name || "",
      phoneNumber: contact.phoneNumber || "",
      relationship: contact.relationship || "",
    });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this emergency contact?")
    ) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded-lg"></div>
            <div className="h-20 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Heart size={20} />
            <h3 className="font-bold">Emergency Contacts</h3>
          </div>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {contacts.length} {contacts.length === 1 ? "Contact" : "Contacts"}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Contacts List */}
        {contacts.length > 0 && (
          <div className="space-y-3 mb-6">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="group bg-gradient-to-r from-emerald-50 to-transparent p-4 rounded-xl border border-emerald-100 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {contact.name}
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {contact.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Phone size={14} />
                      <span className="text-sm font-medium">
                        {contact.phoneNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {contacts.length === 0 && !isAdding && (
          <div className="mb-6 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl text-center">
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <h4 className="font-semibold text-amber-800 mb-1">
              No Emergency Contacts
            </h4>
            <p className="text-sm text-amber-600 mb-4">
              Add emergency contacts for your safety
            </p>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200"
          >
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Emergency contact name"
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Emergency contact phone"
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Relationship
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              >
                <option value="">Select relationship</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingId ? "Update Contact" : "Add Contact"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Add Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 border-2 border-dashed border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all font-semibold group"
          >
            <Plus
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            Add Emergency Contact
          </button>
        )}
      </div>
    </div>
  );
};

// Helper Components
const InfoField = ({ label, value, readOnly, isMissing }) => (
  <div className="mb-1">
    <label className="text-xs text-gray-500">{label}</label>
    <p
      className={`font-medium ${readOnly ? "text-gray-400" : isMissing ? "text-orange-500" : "text-gray-800"}`}
    >
      {value || "N/A"}
    </p>
  </div>
);

const EditField = ({ label, name, defaultValue, type = "text" }) => (
  <div className="mb-1">
    <label className="text-xs text-gray-500">{label}</label>
    <input
      name={name}
      type={type}
      defaultValue={defaultValue}
      className="w-full mt-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
    />
  </div>
);

export default PatientProfilePage;
