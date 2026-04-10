import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUploadDoctorDocument } from '../../../../hooks/useDoctorData';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Building2,
  Award,
  Loader2,
} from 'lucide-react';

/**
 * Combined "Documents & Credentials" step — merges the old CredentialsStep
 * (medical-license / medical-degree metadata) and IdentityDocumentsStep
 * (file-upload cards) into one unified section.
 */
export const CredentialsAndDocuments = ({ doctorData, docMeta, setDocMeta, onNext, onPrev }) => {
  const uploadDocMutation = useUploadDoctorDocument();

  // ─── Validation State ────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const currentYear = new Date().getFullYear();

  // ─── Meta helpers ────────────────────────────────────────────────────────────
  const handleDocMetaChange = (docType, field, value) => {
    setDocMeta((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [`${docType}.${field}`]: null,
    }));
  };

  const handleBlur = (docType, field) => {
    setTouched((prev) => ({
      ...prev,
      [`${docType}.${field}`]: true,
    }));
    validateField(docType, field);
  };

  // ─── Validation logic (from old CredentialsStep) ─────────────────────────────
  const validateField = (docType, field) => {
    const value = docMeta[docType]?.[field];
    let error = null;

    if (docType === 'medicalLicense') {
      if (field === 'licenseNumber') {
        if (!value || value.trim().length === 0) error = 'License number is required';
        else if (value.trim().length < 3) error = 'License number must be at least 3 characters';
        else if (value.trim().length > 100) error = 'License number must not exceed 100 characters';
      }
      if (field === 'issueDate') {
        if (!value) error = 'Issue date is required';
        else if (new Date(value) > new Date()) error = 'Issue date cannot be in the future';
      }
      if (field === 'expiryDate') {
        if (!value) error = 'Expiry date is required';
        else if (
          docMeta.medicalLicense?.issueDate &&
          new Date(value) <= new Date(docMeta.medicalLicense.issueDate)
        )
          error = 'Expiry date must be after issue date';
      }
    }

    if (docType === 'medicalDegree') {
      if (field === 'university') {
        if (!value || value.trim().length === 0) error = 'University name is required';
        else if (value.trim().length < 2) error = 'University name must be at least 2 characters';
        else if (value.trim().length > 100) error = 'University name must not exceed 100 characters';
      }
      if (field === 'graduationYear') {
        const year = parseInt(value);
        if (!value) error = 'Graduation year is required';
        else if (isNaN(year)) error = 'Please enter a valid year';
        else if (year < 1900) error = 'Graduation year must be after 1900';
        else if (year > currentYear) error = 'Graduation year cannot be in the future';
      }
      if (field === 'degree') {
        if (!value || value.trim().length === 0) error = 'Degree is required';
        else if (value.trim().length < 2) error = 'Degree must be at least 2 characters';
        else if (value.trim().length > 100) error = 'Degree must not exceed 100 characters';
      }
    }

    setErrors((prev) => ({ ...prev, [`${docType}.${field}`]: error }));
    return error === null;
  };

  const validateAllFields = () => {
    const fields = [
      { docType: 'medicalLicense', field: 'licenseNumber' },
      { docType: 'medicalLicense', field: 'issueDate' },
      { docType: 'medicalLicense', field: 'expiryDate' },
      { docType: 'medicalDegree', field: 'university' },
      { docType: 'medicalDegree', field: 'graduationYear' },
      { docType: 'medicalDegree', field: 'degree' },
    ];

    let isValid = true;
    const newTouched = {};

    fields.forEach(({ docType, field }) => {
      newTouched[`${docType}.${field}`] = true;
      if (!validateField(docType, field)) isValid = false;
    });

    setTouched(newTouched);
    return isValid;
  };

  const isCredentialsValid =
    docMeta.medicalLicense?.licenseNumber?.trim() &&
    docMeta.medicalLicense?.issueDate &&
    docMeta.medicalLicense?.expiryDate &&
    docMeta.medicalDegree?.university?.trim() &&
    docMeta.medicalDegree?.graduationYear &&
    docMeta.medicalDegree?.degree &&
    Object.values(errors).every((error) => !error);

  const getFieldError = (docType, field) =>
    touched[`${docType}.${field}`] ? errors[`${docType}.${field}`] : null;

  // ─── File upload logic (from old IdentityDocumentsStep) ──────────────────────

  const documentTypeMapping = {
    nationalIdFront: 'national-id-front',
    nationalIdBack: 'national-id-back',
    medicalLicense: 'medical-license',
    medicalDegree: 'medical-degree',
    syndicateCard: 'syndicate-card',
  };

  const handleFileUpload = (e, documentType) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    if (documentType === 'medicalLicense') {
      const meta = docMeta.medicalLicense;
      if (!meta?.licenseNumber || !meta?.issueDate || !meta?.expiryDate) {
        toast.error('Please fill all medical license details first');
        e.target.value = null;
        return;
      }
      formData.append('licenseNumber', meta.licenseNumber);
      formData.append('issueDate', meta.issueDate);
      formData.append('expiryDate', meta.expiryDate);
    }

    if (documentType === 'medicalDegree') {
      const meta = docMeta.medicalDegree;
      if (!meta?.university || !meta?.graduationYear || !meta?.degree) {
        toast.error('Please fill all medical degree details first');
        e.target.value = null;
        return;
      }
      formData.append('university', meta.university);
      formData.append('graduationYear', meta.graduationYear);
      formData.append('degree', meta.degree);
    }

    if (documentType === 'syndicateCard') {
      const meta = docMeta.syndicateCard;
      if (!meta?.syndicateNumber || !meta?.issueDate) {
        toast.error('Please fill all syndicate card details first');
        e.target.value = null;
        return;
      }
      formData.append('syndicateNumber', meta.syndicateNumber);
      formData.append('issueDate', meta.issueDate);
    }

    const apiDocumentType = documentTypeMapping[documentType];
    if (!apiDocumentType) {
      toast.error('Invalid document type');
      e.target.value = null;
      return;
    }

    uploadDocMutation.mutate(
      { documentType: apiDocumentType, formData },
      {
        onSuccess: () => toast.success(`${getDocumentLabel(documentType)} uploaded successfully`),
        onError: (error) =>
          toast.error(error?.response?.data?.message || `Failed to upload ${getDocumentLabel(documentType)}`),
      }
    );

    e.target.value = null;
  };

  const getDocumentLabel = (docType) => {
    const labels = {
      nationalIdFront: 'National ID (Front)',
      nationalIdBack: 'National ID (Back)',
      medicalLicense: 'Medical License',
      medicalDegree: 'Medical Degree',
      syndicateCard: 'Syndicate Card',
    };
    return labels[docType] || docType;
  };

  const isCurrentlyUploading = (docKey) => {
    if (!uploadDocMutation.isPending) return false;
    return uploadDocMutation.variables?.documentType === documentTypeMapping[docKey];
  };

  // ─── Credential metadata completion counter ──────────────────────────────────
  const completedSections = [
    docMeta.medicalLicense?.licenseNumber &&
    docMeta.medicalLicense?.issueDate &&
    docMeta.medicalLicense?.expiryDate,
    docMeta.medicalDegree?.university &&
    docMeta.medicalDegree?.graduationYear &&
    docMeta.medicalDegree?.degree,
  ].filter(Boolean).length;

  // ─── Document checklist (reqDocs) ────────────────────────────────────────────
  const reqDocs = doctorData?.requiredDocuments || {};

  const verificationChecklist = [
    {
      key: 'nationalIdFront',
      label: 'National ID (Front)',
      status: reqDocs.nationalId?.front?.status || reqDocs.nationalIdFront?.status,
      description: 'Upload a clear photo of the front side of your National ID card',
    },
    {
      key: 'nationalIdBack',
      label: 'National ID (Back)',
      status: reqDocs.nationalId?.back?.status || reqDocs.nationalIdBack?.status,
      description: 'Upload a clear photo of the back side of your National ID card',
    },
    {
      key: 'medicalLicense',
      label: 'Medical License',
      status: reqDocs.medicalLicense?.status,
      description: 'Upload your valid medical license document',
      requiresMeta: true,
    },
    {
      key: 'medicalDegree',
      label: 'Medical Degree',
      status: reqDocs.medicalDegree?.status,
      description: 'Upload your medical degree certificate',
      requiresMeta: true,
    },
    {
      key: 'syndicateCard',
      label: 'Syndicate Card',
      status: reqDocs.syndicateCard?.status,
      description: 'Upload your syndicate card with required details',
      requiresMeta: true,
    },
  ];

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (validateAllFields()) {
      onNext(4);
    }
  };

  // ─── Style helpers ───────────────────────────────────────────────────────────
  const credInputClass = (hasError) => `
    w-full bg-[#f8fafc] text-slate-700 px-4 py-3.5 rounded-xl 
    focus:outline-none transition-all text-[13px] font-medium 
    placeholder:text-slate-400 border-2
    ${hasError
      ? 'border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-transparent focus:border-blue-200 focus:ring-2 focus:ring-blue-100'
    }
  `;
  const labelClass =
    'text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider flex items-center gap-2';
  const plainInputClass =
    'w-full bg-[#f3f4f6] text-slate-700 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400';

  const degreeOptions = [
    { value: '', label: 'Select Degree' },
    { value: 'Doctor of Medicine (MD)', label: 'Doctor of Medicine (MD)' },
    { value: 'Doctor of Osteopathic Medicine (DO)', label: 'Doctor of Osteopathic Medicine (DO)' },
    {
      value: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
      label: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
    },
    { value: 'Doctor of Dental Surgery (DDS)', label: 'Doctor of Dental Surgery (DDS)' },
    { value: 'Doctor of Dental Medicine (DMD)', label: 'Doctor of Dental Medicine (DMD)' },
    { value: 'Doctor of Pharmacy (PharmD)', label: 'Doctor of Pharmacy (PharmD)' },
    { value: 'Other', label: 'Other Medical Degree' },
  ];

  // ─── Error aliases ───────────────────────────────────────────────────────────
  const licenseError = getFieldError('medicalLicense', 'licenseNumber');
  const issueDateError = getFieldError('medicalLicense', 'issueDate');
  const expiryDateError = getFieldError('medicalLicense', 'expiryDate');
  const universityError = getFieldError('medicalDegree', 'university');
  const graduationYearError = getFieldError('medicalDegree', 'graduationYear');
  const degreeError = getFieldError('medicalDegree', 'degree');

  // ─── Render helpers ──────────────────────────────────────────────────────────
  const renderDocMetaFields = (doc) => {
    if (doc.key === 'syndicateCard') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            placeholder="Syndicate Number"
            className={`${plainInputClass} col-span-2`}
            value={docMeta.syndicateCard?.syndicateNumber || ''}
            onChange={(e) => handleDocMetaChange(doc.key, 'syndicateNumber', e.target.value)}
          />
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">
              Issue Date
            </label>
            <input
              type="date"
              className={plainInputClass}
              value={docMeta.syndicateCard?.issueDate || ''}
              onChange={(e) => handleDocMetaChange(doc.key, 'issueDate', e.target.value)}
            />
          </div>
          <p className="col-span-3 text-[11px] text-slate-400 font-medium mt-2">{doc.description}</p>
        </div>
      );
    }

    return (
      <p className="text-[11px] text-slate-400 font-medium">{doc.description}</p>
    );
  };

  const renderDocumentCard = (doc) => {
    const isUploaded =
      doc.status === 'uploaded' || doc.status === 'pending' || doc.status === 'verified';
    const isUploading = isCurrentlyUploading(doc.key);

    // Skip meta fields for medicalLicense and medicalDegree in the upload card —
    // they are already in the dedicated credential sections above.
    const showMetaInCard = !doc.requiresMeta || doc.key === 'syndicateCard';

    return (
      <div
        key={doc.key}
        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-blue-100 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isUploaded
                  ? 'bg-emerald-50 text-emerald-500'
                  : isUploading
                    ? 'bg-blue-50 text-blue-500'
                    : 'bg-[#f3f4f6] text-slate-400'
                }`}
            >
              {isUploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isUploaded ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-800">{doc.label}</h4>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5 block">
                {isUploading
                  ? 'Uploading...'
                  : doc.status?.replace('_', ' ') || 'Action Required'}
              </span>
            </div>
          </div>

          {!isUploaded && (
            <label
              className={`cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-xl text-[11px] font-black transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : 'UPLOAD'}
              <input
                type="file"
                className="hidden"
                disabled={uploadDocMutation.isPending}
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e, doc.key)}
              />
            </label>
          )}
        </div>

        {!isUploaded && showMetaInCard && (
          <div className="mt-4 pt-4 border-t border-slate-50">
            {renderDocMetaFields(doc)}
          </div>
        )}
      </div>
    );
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      {/* ── Progress Indicator ─────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {completedSections}/2
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">Professional Credentials</h3>
            <p className="text-[11px] text-slate-600">
              {completedSections === 2
                ? 'All sections completed!'
                : `${2 - completedSections} section${2 - completedSections !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        </div>
        {completedSections === 2 && <CheckCircle2 size={20} className="text-emerald-500" />}
      </div>

      {/* ── Medical License Section ────────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Award size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800">Medical License Information</h3>
            <p className="text-[11px] text-slate-500">Provide your active medical license details</p>
          </div>
        </div>

        <div className="mb-6">
          <label className={labelClass}>
            <Award size={14} />
            Medical License Number
          </label>
          <input
            className={credInputClass(licenseError)}
            placeholder="e.g., MD-123456 or ML/2024/001234"
            value={docMeta.medicalLicense?.licenseNumber || ''}
            onChange={(e) => handleDocMetaChange('medicalLicense', 'licenseNumber', e.target.value)}
            onBlur={() => handleBlur('medicalLicense', 'licenseNumber')}
            maxLength={100}
          />
          {licenseError && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-[11px] font-medium">
              <AlertCircle size={12} />
              {licenseError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Calendar size={14} />
              License Issue Date
            </label>
            <input
              type="date"
              className={credInputClass(issueDateError)}
              max={new Date().toISOString().split('T')[0]}
              value={docMeta.medicalLicense?.issueDate || ''}
              onChange={(e) => handleDocMetaChange('medicalLicense', 'issueDate', e.target.value)}
              onBlur={() => handleBlur('medicalLicense', 'issueDate')}
            />
            {issueDateError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-[11px] font-medium">
                <AlertCircle size={12} />
                {issueDateError}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>
              <Calendar size={14} />
              License Expiry Date
            </label>
            <input
              type="date"
              className={credInputClass(expiryDateError)}
              min={docMeta.medicalLicense?.issueDate || ''}
              value={docMeta.medicalLicense?.expiryDate || ''}
              onChange={(e) => handleDocMetaChange('medicalLicense', 'expiryDate', e.target.value)}
              onBlur={() => handleBlur('medicalLicense', 'expiryDate')}
            />
            {expiryDateError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-[11px] font-medium">
                <AlertCircle size={12} />
                {expiryDateError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Medical Degree Section ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <GraduationCap size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800">Medical Education</h3>
            <p className="text-[11px] text-slate-500">Your primary medical degree information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className={labelClass}>
              <Building2 size={14} />
              University / Medical School
            </label>
            <input
              className={credInputClass(universityError)}
              placeholder="e.g., Johns Hopkins School of Medicine"
              value={docMeta.medicalDegree?.university || ''}
              onChange={(e) => handleDocMetaChange('medicalDegree', 'university', e.target.value)}
              onBlur={() => handleBlur('medicalDegree', 'university')}
              maxLength={100}
            />
            {universityError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-[11px] font-medium">
                <AlertCircle size={12} />
                {universityError}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              <Calendar size={14} />
              Graduation Year
            </label>
            <input
              type="number"
              min="1900"
              max={currentYear}
              className={credInputClass(graduationYearError)}
              placeholder={`e.g., ${currentYear - 5}`}
              value={docMeta.medicalDegree?.graduationYear || ''}
              onChange={(e) => handleDocMetaChange('medicalDegree', 'graduationYear', e.target.value)}
              onBlur={() => handleBlur('medicalDegree', 'graduationYear')}
            />
            {graduationYearError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-[11px] font-medium">
                <AlertCircle size={12} />
                {graduationYearError}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              <GraduationCap size={14} />
              Primary Degree
            </label>
            <div className="relative">
              <select
                className={`${credInputClass(degreeError)} appearance-none pr-10`}
                value={docMeta.medicalDegree?.degree || ''}
                onChange={(e) => handleDocMetaChange('medicalDegree', 'degree', e.target.value)}
                onBlur={() => handleBlur('medicalDegree', 'degree')}
              >
                {degreeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {degreeError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-[11px] font-medium">
                <AlertCircle size={12} />
                {degreeError}
              </div>
            )}
          </div>
        </div>

        {docMeta.medicalDegree?.degree === 'Other' && (
          <div className="animate-in fade-in duration-300">
            <label className={labelClass}>Specify Your Degree</label>
            <input
              className={credInputClass(false)}
              placeholder="Enter your medical degree"
              value={docMeta.medicalDegree?.customDegree || ''}
              onChange={(e) => handleDocMetaChange('medicalDegree', 'customDegree', e.target.value)}
              maxLength={100}
            />
          </div>
        )}
      </div>

      {/* ── Document Upload Cards ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-[15px] font-bold text-slate-800 mb-4">Upload Verification Documents</h3>
        <div className="space-y-4">{verificationChecklist.map(renderDocumentCard)}</div>
      </div>

      {/* ── Validation Summary ─────────────────────────────────────────────── */}
      {Object.values(errors).some((error) => error) && Object.keys(touched).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-[13px] font-bold text-red-900">Please fix the following errors:</h4>
            <ul className="text-[12px] text-red-700 mt-2 space-y-1 list-disc list-inside">
              {Object.entries(errors).map(
                ([key, error]) => error && touched[key] && <li key={key}>{error}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* ── Navigation Buttons ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onPrev(2)}
          className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition-all text-sm disabled:opacity-50"
          disabled={uploadDocMutation.isPending}
        >
          <ArrowLeft size={16} /> Previous Step
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isCredentialsValid || uploadDocMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-[13px] shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Save and Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
