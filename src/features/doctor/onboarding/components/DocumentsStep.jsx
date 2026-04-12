import React from 'react';
import { toast } from 'react-hot-toast';
import { useUploadDoctorDocument } from '../../../../hooks/useDoctorData';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2, FileText, ShieldCheck, CloudUpload } from 'lucide-react';

export const DocumentsStep = ({ doctorData, docMeta, setDocMeta, onNext, onPrev }) => {
  const uploadDocMutation = useUploadDoctorDocument();

  const handleDocMetaChange = (docType, field, value) => {
    setDocMeta((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value,
      },
    }));
  };

  const documentTypeMapping = {
    nationalIdFront: 'national-id-front',
    nationalIdBack: 'national-id-back',
    medicalLicense: 'medical-license',
    syndicateCard: 'syndicate-card',
  };

  const handleFileUpload = (e, documentType) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    if (documentType === 'syndicateCard') {
      const meta = docMeta.syndicateCard;
      if (meta?.syndicateNumber) formData.append('syndicateNumber', meta.syndicateNumber);
      if (meta?.issueDate) formData.append('issueDate', meta.issueDate);
    } else if (documentType === 'medicalLicense') {
      const meta = docMeta.medicalLicense;
      if (meta?.licenseNumber) formData.append('licenseNumber', meta.licenseNumber);
      if (meta?.issueDate) formData.append('issueDate', meta.issueDate);
      if (meta?.expiryDate) formData.append('expiryDate', meta.expiryDate);
    }

    const docConfig = verificationChecklist.find(d => d.key === documentType);
    const docLabel = docConfig?.label || 'Document';

    const apiDocumentType = documentTypeMapping[documentType];
    if (!apiDocumentType) {
      toast.error('Invalid document type');
      e.target.value = null;
      return;
    }

    uploadDocMutation.mutate(
      { documentType: apiDocumentType, formData },
      {
        onSuccess: () => toast.success(`${docLabel} uploaded successfully`),
        onError: (error) => toast.error(error?.response?.data?.message || `Failed to upload ${docLabel}`),
      }
    );

    e.target.value = null;
  };

  const isCurrentlyUploading = (docKey) => {
    if (!uploadDocMutation.isPending) return false;
    return uploadDocMutation.variables?.documentType === documentTypeMapping[docKey];
  };

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
      key: 'syndicateCard',
      label: 'Syndicate Card',
      status: reqDocs.syndicateCard?.status,
      description: 'Upload your syndicate card with registration details',
      requiresMeta: true,
    },
  ];

  const plainInputClass = 'w-full bg-[#f4f4f5] text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-[13px] font-medium placeholder:text-slate-400 border-none';

  const renderDocMetaFields = (doc) => {
    if (doc.key === 'syndicateCard') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
             <label className="text-[10px] font-bold text-slate-800 mb-2 block uppercase tracking-wider opacity-60">Syndicate Number</label>
             <input
               placeholder="e.g. 12345/67"
               className={plainInputClass}
               value={docMeta.syndicateCard?.syndicateNumber || ''}
               onChange={(e) => handleDocMetaChange(doc.key, 'syndicateNumber', e.target.value)}
             />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-800 mb-2 block uppercase tracking-wider opacity-60">
              Issue Date
            </label>
            <input
              type="date"
              className={plainInputClass}
              value={docMeta.syndicateCard?.issueDate || ''}
              onChange={(e) => handleDocMetaChange(doc.key, 'issueDate', e.target.value)}
            />
          </div>
        </div>
      );
    } else if (doc.key === 'medicalLicense') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
             <label className="text-[10px] font-bold text-slate-800 mb-2 block uppercase tracking-wider opacity-60">License Number</label>
             <input
               placeholder="e.g. 5894869"
               className={plainInputClass}
               value={docMeta.medicalLicense?.licenseNumber || ''}
               onChange={(e) => handleDocMetaChange(doc.key, 'licenseNumber', e.target.value)}
             />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-800 mb-2 block uppercase tracking-wider opacity-60">
              Issue Date
            </label>
            <input
              type="date"
              className={plainInputClass}
              value={docMeta.medicalLicense?.issueDate || ''}
              onChange={(e) => handleDocMetaChange(doc.key, 'issueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-800 mb-2 block uppercase tracking-wider opacity-60">
              Expiry Date
            </label>
            <input
              type="date"
              className={plainInputClass}
              value={docMeta.medicalLicense?.expiryDate || ''}
              onChange={(e) => handleDocMetaChange(doc.key, 'expiryDate', e.target.value)}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const renderDocumentCard = (doc) => {
    const isUploaded = doc.status === 'uploaded' || doc.status === 'pending' || doc.status === 'verified';
    const isUploading = isCurrentlyUploading(doc.key);
    const showMetaInCard = doc.requiresMeta && !isUploaded;

    let canUpload = true;
    if (doc.requiresMeta) {
       if (doc.key === 'syndicateCard') {
          canUpload = !!(docMeta.syndicateCard?.syndicateNumber && docMeta.syndicateCard?.issueDate);
       } else if (doc.key === 'medicalLicense') {
          canUpload = !!(docMeta.medicalLicense?.licenseNumber && docMeta.medicalLicense?.issueDate && docMeta.medicalLicense?.expiryDate);
       }
    }

    const cardBgClass = isUploaded ? 'bg-emerald-50/30 border-emerald-500' : 'bg-white border-slate-100 hover:border-blue-100';

    return (
      <div key={doc.key} className={`${cardBgClass} border rounded-[24px] p-6 shadow-sm transition-all group`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-colors ${isUploaded ? 'bg-emerald-50 text-emerald-500' : isUploading ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'bg-[#f4f4f5] text-slate-400'}`}>
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : isUploaded ? <CheckCircle2 size={22} /> : <FileText size={20} />}
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-slate-900">{doc.label}</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{doc.description}</p>
            </div>
          </div>

          {!isUploaded ? (
            <label 
               className={`cursor-pointer px-6 py-2.5 rounded-full text-[12px] font-bold shadow-sm transition-all flex items-center gap-2 
               ${!canUpload ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}
               ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
               onClick={(e) => {
                  if (!canUpload) {
                     e.preventDefault();
                     toast.error('Please fill the required details below before uploading');
                  }
               }}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
              <span>{isUploading ? 'UPLOADING...' : 'UPLOAD'}</span>
              <input
                type="file"
                className="hidden"
                disabled={uploadDocMutation.isPending || !canUpload}
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e, doc.key)}
              />
            </label>
          ) : (
            <div className="flex flex-col items-center gap-1.5 bg-emerald-50/80 border border-emerald-100 px-5 py-2.5 rounded-2xl">
               <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={16} className="fill-emerald-100" />
                  <span className="text-[12px] font-bold uppercase tracking-wider">{doc.status?.replace('_', ' ')}</span>
               </div>
               <span className="text-[10px] text-emerald-500 font-medium">({doc.label})</span>
            </div>
          )}
        </div>

        {showMetaInCard && (
          <div className="mt-4 pt-6 border-t border-slate-50">
             <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50">
                <p className="text-[11px] text-blue-600 font-bold flex items-center gap-2 mb-1">
                   <AlertCircle size={12} />
                   Action Required
                </p>
                <p className="text-[10px] text-blue-400 font-semibold mb-4">Please fill the details below before uploading.</p>
                {renderDocMetaFields(doc)}
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-16 animate-in fade-in duration-500">
      <div className="flex-1">
        <div className="space-y-6">
          {verificationChecklist.map(renderDocumentCard)}
        </div>

        <div className="flex justify-between items-center mt-12 px-4">
          <button
            type="button"
            onClick={() => onPrev(2)}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2 transition-all text-[16px] disabled:opacity-50"
            disabled={uploadDocMutation.isPending}
          >
            <ArrowLeft size={20} /> Previous Step
          </button>
          <button
             type="button"
             onClick={() => onNext(4)}
             disabled={uploadDocMutation.isPending}
             className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-4.5 rounded-full font-bold text-[16px] shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             Save and Continue <ArrowRight size={24} />
          </button>
        </div>
      </div>

      <div className="w-full lg:w-[420px] flex flex-col gap-8 shrink-0">
        <div className="bg-[#f8fafc] border border-slate-100 rounded-[32px] p-10 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[15px] mb-6 tracking-wider">
             <ShieldCheck size={20} />
            <span>Document Security</span>
          </div>
          <p className="text-[14px] text-slate-500 font-medium mb-10 leading-relaxed">
            All documents are stored on encrypted servers with restricted access and military-grade protection.
          </p>

          <div className="space-y-8">
            <div className="flex gap-5">
              <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[14px] font-bold text-slate-900">End-to-End Encryption</h5>
                <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">Your PII is protected using enterprise-grade protocols during and after upload.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[14px] font-bold text-slate-900">Admin-Only View</h5>
                <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">Only verified compliance officers can access these files for verification purposes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8fafc] border border-slate-100 rounded-[32px] p-8 shadow-sm overflow-hidden relative group">
          <div className="mb-8 rounded-2xl overflow-hidden bg-slate-200 h-56 relative">
             <img 
               src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=600" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               alt="Customer Support" 
             />
             <div className="absolute inset-0 bg-blue-900/10" />
          </div>
          <h4 className="font-bold text-[18px] text-slate-900 mb-3">Need Support?</h4>
          <p className="text-[13px] text-slate-400 font-medium mb-8 leading-relaxed">
            If you're having trouble uploading large files, our support team can help you with manual verification 24/7.
          </p>
          <button className="w-full bg-white border border-slate-100 text-slate-600 py-4 rounded-2xl text-[13px] font-bold hover:bg-slate-50 transition-all tracking-wide shadow-sm active:scale-95">
            CHAT WITH SUPPORT
          </button>
        </div>
      </div>
    </div>
  );
};
