import React, { useState, useRef } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../../../api/patientService";
import {
  User, Phone, Activity, Edit3, Save, X, MapPin, Camera, Loader2,
  Trash2, Pill, Users, Syringe, AlertTriangle, Heart, Mail, Calendar,
  ChevronRight, Plus, AlertCircle, Bell, HeartPulse, ClipboardList
} from "lucide-react";
import MedicalProfileSection from "./MedicalProfileSection";
import { bmiFromMetricKgCm } from "../digital-twin/digitalTwinUtils";
import { useAuthContext } from "../../../providers/AuthProvider";

const PatientProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // "basic", "medical", "meds", "emergency"
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuthContext();
  const navigate = useNavigate();
  const match = useMatch("/patient-dashboard/*");
  const BASE = match ? "/patient-dashboard" : "/dashboard/patient";

  // Fetch Basic Info
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["patientBasicInfo"],
    queryFn: patientService.getBasicInfo,
  });

  // Fetch all medical profile data
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ["medications"],
    queryFn: patientService.getMedications,
    retry: 1,
  });

  const { data: familyHistory = [], isLoading: familyHistoryLoading } = useQuery({
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

  const { data: chronicDiseases = [], isLoading: chronicDiseasesLoading } = useQuery({
    queryKey: ["chronicDiseases"],
    queryFn: patientService.getChronicDiseases,
    retry: 1,
  });

  const { data: emergencyContacts = [], isLoading: emergencyLoading } = useQuery({
    queryKey: ["emergencyContacts"],
    queryFn: patientService.getEmergencyContacts,
    retry: 1,
  });

  // Update Basic Info Mutation
  const updateMutation = useMutation({
    value: "updateBasicInfo",
    mutationFn: (newData) => patientService.updateBasicInfo(newData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["patientBasicInfo"] });
      if (res?.fullName || res?.data?.fullName) {
        const name = res.fullName || res.data.fullName;
        const [first = "", last = ""] = name.split(" ");
        updateUser({
          ...user,
          firstName: first,
          lastName: last,
        });
      }
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    },
  });

  // Profile Image Mutations
  const uploadImageMutation = useMutation({
    mutationFn: (file) => patientService.uploadProfileImage(file),
    onSuccess: (imageUrl) => {
      queryClient.invalidateQueries({ queryKey: ["patientBasicInfo"] });
      let extractedUrl = null;
      if (typeof imageUrl === 'string') {
        extractedUrl = imageUrl;
      } else if (imageUrl && typeof imageUrl === 'object') {
        extractedUrl = imageUrl?.imageUrl || imageUrl?.profileImage?.imageUrl || imageUrl?.data?.profileImage?.imageUrl;
      }
      if (extractedUrl) {
        updateUser({
          ...user,
          profileImage: extractedUrl
        });
      }
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: () => patientService.deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientBasicInfo"] });
      updateUser({
        ...user,
        profileImage: null
      });
    },
  });

  // Emergency Contacts Mutations
  const addEmergencyMutation = useMutation({
    mutationFn: (data) => patientService.addEmergencyContact(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] }),
  });

  const updateEmergencyMutation = useMutation({
    mutationFn: ({ id, data }) => patientService.updateEmergencyContact({ id, contactData: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] }),
  });

  const deleteEmergencyMutation = useMutation({
    mutationFn: (id) => patientService.deleteEmergencyContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] }),
  });

  // Medications Mutations
  const addMedicationMutation = useMutation({
    mutationFn: (data) => patientService.addMedication(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  const updateMedicationMutation = useMutation({
    mutationFn: ({ id, data }) => patientService.updateMedication({ id, medicationData: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: (id) => patientService.deleteMedication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  // Family History Mutations
  const addFamilyHistoryMutation = useMutation({
    mutationFn: (data) => patientService.addFamilyHistory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["familyHistory"] }),
  });

  const updateFamilyHistoryMutation = useMutation({
    mutationFn: ({ id, data }) => patientService.updateFamilyHistory({ id, historyData: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["familyHistory"] }),
  });

  const deleteFamilyHistoryMutation = useMutation({
    mutationFn: (id) => patientService.deleteFamilyHistory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["familyHistory"] }),
  });

  // Surgeries Mutations
  const addSurgeryMutation = useMutation({
    mutationFn: (data) => patientService.addSurgery(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surgeries"] }),
  });

  const updateSurgeryMutation = useMutation({
    mutationFn: ({ id, data }) => patientService.updateSurgery({ id, surgeryData: data }),
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
    mutationFn: ({ id, data }) => patientService.updateAllergy({ id, allergyData: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allergies"] }),
  });

  const deleteAllergyMutation = useMutation({
    mutationFn: (id) => patientService.deleteAllergy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allergies"] }),
  });

  // Chronic Diseases Mutations
  const addChronicDiseaseMutation = useMutation({
    mutationFn: (data) => patientService.addChronicDisease(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chronicDiseases"] }),
  });

  const updateChronicDiseaseMutation = useMutation({
    mutationFn: ({ id, data }) => patientService.updateChronicDisease({ id, diseaseData: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chronicDiseases"] }),
  });

  const deleteChronicDiseaseMutation = useMutation({
    mutationFn: (id) => patientService.deleteChronicDisease(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chronicDiseases"] }),
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    uploadImageMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteImage = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      deleteImageMutation.mutate();
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!profile) return 0;
    let filled = 0;
    const total = 10;
    if (profile.phone) filled++;
    if (profile.height) filled++;
    if (profile.weight) filled++;
    if (profile.bloodType) filled++;
    if (profile.address?.city) filled++;
    if (medications.length > 0) filled++;
    if (allergies.length > 0) filled++;
    if (surgeries.length > 0) filled++;
    if (chronicDiseases.length > 0) filled++;
    if (emergencyContacts.length > 0) filled++;
    return Math.round((filled / total) * 100);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-blue-600 font-semibold text-sm">Loading your health profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-sm">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Something went wrong</h2>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isImagePending = uploadImageMutation.isPending || deleteImageMutation.isPending;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ── Top Header Section (Minimal & Simple) ── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row items-center gap-6 justify-between shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Minimal Circular Progress Avatar */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="42" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="#2563eb"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute w-[76px] h-[76px] rounded-full overflow-hidden border-2 border-white bg-slate-100 shadow-inner">
                <img
                  src={
                    profile?.profileImage?.imageUrl ||
                    profile?.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&background=E0F2FE&color=0369A1&bold=true`
                  }
                  alt={profile?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0.5 right-0.5 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full border-2 border-white shadow-sm transition-transform active:scale-95"
                disabled={isImagePending}
              >
                {isImagePending ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
              </button>
              {profile?.profileImage && !isImagePending && (
                <button
                  onClick={handleDeleteImage}
                  className="absolute top-0.5 right-0.5 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full border border-white shadow-sm transition-transform active:scale-95"
                >
                  <Trash2 size={8} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            {/* Basic Info */}
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{profile?.fullName}</h2>
              <p className="text-xs font-semibold text-slate-400">
                {profile?.age || 'N/A'} Years old • {profile?.gender} • Blood Type: <strong className="text-slate-600">{profile?.bloodType || 'Not set'}</strong>
              </p>
              <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-blue-100/50 mt-1">
                {progress}% Completed
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing && activeTab === "basic" && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-blue-100 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Edit3 size={13} /> Edit Profile
              </button>
            )}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-px">
          {[
            { id: "basic", label: "Basic Info", icon: <User size={14} /> },
            { id: "medical", label: "Medical History", icon: <HeartPulse size={14} /> },
            { id: "meds", label: "Meds & Family", icon: <Pill size={14} /> },
            { id: "emergency", label: "Emergency", icon: <Bell size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50/20"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tabs Content ── */}
        <div className="min-h-[300px]">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Personal Information */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <User size={14} className="text-blue-500" /> Personal Info
                  </h3>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Height (cm)</label>
                          <input name="height" type="number" defaultValue={profile?.height} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Weight (kg)</label>
                          <input name="weight" type="number" step="0.1" defaultValue={profile?.weight} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Blood Type</label>
                          <select name="bloodType" defaultValue={profile?.bloodType} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none">
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Marital Status</label>
                          <select name="maritalStatus" defaultValue={profile?.maritalStatus} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none">
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Height</span>
                        <strong className="text-slate-700">{profile?.height ? `${profile.height} cm` : 'Not set'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Weight</span>
                        <strong className="text-slate-700">{profile?.weight ? `${profile.weight} kg` : 'Not set'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Marital Status</span>
                        <strong className="text-slate-700 capitalize">{profile?.maritalStatus || 'Not specified'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">BMI Index</span>
                        <strong className="text-slate-700">
                          {bmiFromMetricKgCm(profile?.weight, profile?.height)?.toFixed(1) || 'Not set'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact & Address */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Mail size={14} className="text-orange-500" /> Contact Details
                  </h3>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Phone Number</label>
                        <input name="phone" type="tel" defaultValue={profile?.phone} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Governorate</label>
                          <input name="governorate" defaultValue={profile?.address?.governorate} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">City</label>
                          <input name="city" defaultValue={profile?.address?.city} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Street</label>
                        <input name="street" defaultValue={profile?.address?.street} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Email</span>
                        <strong className="text-slate-700 truncate block">{profile?.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Phone</span>
                        <strong className="text-slate-700 block">{profile?.phone || 'Not set'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Address</span>
                        <strong className="text-slate-700 block">
                          {profile?.address?.city || profile?.address?.governorate
                            ? `${profile.address.city || ''}, ${profile.address.governorate || ''}`
                            : 'Not set'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {isEditing && (
                <div className="flex justify-center gap-3">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-blue-100 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: MEDICAL HISTORY */}
          {activeTab === "medical" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  { name: "allergen", label: "Allergy Name", required: true },
                  {
                    name: "reaction",
                    label: "Reaction Type",
                    type: "select",
                    options: ["Rash", "Itching", "Anaphylaxis", "Difficulty breathing", "Other"],
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
                  { name: "nameOfSurgery", label: "Surgery Name", required: true },
                  { name: "date", label: "Surgery Date", type: "date" },
                  { name: "hospital", label: "Hospital/Clinic" },
                  { name: "doctor", label: "Surgeon Name" },
                ]}
                emptyMessage="No surgeries recorded"
              />

              {/* Chronic Diseases */}
              <div className="md:col-span-2">
                <MedicalProfileSection
                  title="Chronic Diseases"
                  icon={Activity}
                  color="amber"
                  items={chronicDiseases}
                  isLoading={chronicDiseasesLoading}
                  onAdd={(data) => addChronicDiseaseMutation.mutateAsync(data)}
                  onUpdate={(data) => updateChronicDiseaseMutation.mutateAsync(data)}
                  onDelete={(id) => deleteChronicDiseaseMutation.mutate(id)}
                  fields={[
                    { name: "nameOfDisease", label: "Disease Name", required: true },
                    { name: "type", label: "Disease Type" },
                    { name: "since", label: "Year Diagnosed", type: "number" },
                  ]}
                  emptyMessage="No chronic diseases recorded"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDS & FAMILY */}
          {activeTab === "meds" && (
            <div className="grid grid-cols-1 gap-6">
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
                  { name: "reason", label: "Reason/Indication", type: "textarea" },
                  { name: "dosage", label: "Dosage & Frequency" },
                ]}
                emptyMessage="No medications recorded"
              />

              {/* Family Medical History */}
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
                  { name: "nameOfFamilyMember", label: "Family Member Name", required: true },
                  { name: "nameOfDisease", label: "Disease Name", required: true },
                  { name: "age", label: "Age (at diagnosis)", type: "number" },
                ]}
                emptyMessage="No family medical history recorded"
              />
            </div>
          )}

          {/* TAB 4: EMERGENCY */}
          {activeTab === "emergency" && (
            <EmergencyContactsSection
              contacts={emergencyContacts}
              isLoading={emergencyLoading}
              onAdd={(data) => addEmergencyMutation.mutateAsync(data)}
              onUpdate={(data) => updateEmergencyMutation.mutateAsync(data)}
              onDelete={(id) => deleteEmergencyMutation.mutate(id)}
            />
          )}

        </div>

      </div>
    </div>
  );
};

// Emergency Contacts Section Component
const EmergencyContactsSection = ({ contacts = [], isLoading, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", phoneNumber: "", relationship: "" });

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
    if (window.confirm("Are you sure you want to delete this emergency contact?")) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse space-y-4">
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        <div className="h-12 bg-slate-50 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Heart size={16} className="text-emerald-500" /> Emergency Contacts
        </h3>
        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {contacts.length} Contact(s)
        </span>
      </div>

      <div className="p-6">
        {contacts.length > 0 && (
          <div className="space-y-3 mb-6">
            {contacts.map((contact) => (
              <div key={contact._id} className="group bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-700 text-xs">{contact.name}</span>
                    <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">
                      {contact.relationship}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">{contact.phoneNumber}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(contact)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={13} /></button>
                  <button onClick={() => handleDelete(contact._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {contacts.length === 0 && !isAdding && (
          <div className="mb-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <p className="text-xs text-slate-400">No emergency contacts set yet.</p>
          </div>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contact name"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block">Relationship</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">Select relationship</option>
                {["Mother", "Father", "Spouse", "Sibling", "Child", "Friend", "Other"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors text-xs flex items-center justify-center gap-1.5">
                <Save size={14} /> {editingId ? "Update Contact" : "Add Contact"}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600">
                Cancel
              </button>
            </div>
          </form>
        )}

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-dashed border-slate-250 text-emerald-600 hover:text-emerald-700 hover:bg-slate-50 rounded-2xl transition-colors font-bold text-xs"
          >
            <Plus size={14} /> Add Emergency Contact
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientProfilePage;
