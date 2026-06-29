import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, RotateCcw, Search, Filter, History, ChevronDown, X } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

// --- Sub-Component: Audit Log Modal ---
const AuditLogModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const logs = [
    { id: 1, action: "Prescription RX-4492-B approved", user: "Pharmacist Sarah", time: "Oct 24, 12:30 PM" },
    { id: 2, action: "New upload RX-8821-C received", user: "Patient System", time: "Oct 24, 09:12 AM" },
    { id: 3, action: "Price offer sent for RX-1004-A", user: "Automated Engine", time: "Oct 23, 04:45 PM" },
    { id: 4, action: "Pharmacist note added to RX-1004-A", user: "Pharmacist Sarah", time: "Oct 23, 04:40 PM" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Verification History</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-bold text-slate-800">{log.action}</p>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-500 font-medium">By {log.user}</span>
                <span className="text-xs text-slate-400">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95">
          Close Log
        </button>
      </div>
    </div>
  );
};

const PrescriptionPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [prescriptions, setPrescriptions] = useState([
    { 
      id: 'RX-4492-B', 
      name: "Eleanor Shellstrop", 
      patientId: "#9902-X", 
      dob: "14 Oct 1982",
      status: "PENDING REVIEW", 
      doctor: "Dr. Chidi Anagonye", 
      date: "Oct 24, 2023 - 10:45 AM",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500",
      medicines: [
        { name: "Amoxicillin 500mg", desc: "Qty: 30 Capsules • 1 TID", action: "MAP TO STOCK", color: "blue" },
        { name: "Ibuprofen 800mg", desc: "Qty: 20 Tablets • 1 PRN", action: "MAPPED", color: "green" }
      ]
    },
    { 
      id: 'RX-8821-C', 
      name: "Michael Realman", 
      patientId: "#4412-M", 
      dob: "01 Jan 1970",
      status: "NEW UPLOAD", 
      doctor: "Dr. Janet Gentry", 
      date: "Oct 24, 2023 - 09:12 AM",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=500",
      medicines: [
        { name: "Metformin 850mg", desc: "Qty: 60 Tablets • 1 BID", action: "MAP TO STOCK", color: "blue" }
      ]
    },
    { 
      id: 'RX-1004-A', 
      name: "Tahani Al-Jamil", 
      patientId: "#1004-A", 
      dob: "21 Jul 1990",
      status: "AWAITING OFFER", 
      doctor: "Dr. Kamilah Al-Jamil", 
      date: "Oct 23, 2023 - 04:30 PM",
      image: "https://images.unsplash.com/photo-1576671081837-49000212a370?q=80&w=500",
      medicines: [
        { name: "Sertraline 50mg", desc: "Qty: 30 Tablets • 1 QD", action: "MAP TO STOCK", color: "blue" }
      ]
    },
  ]);

  const [selectedId, setSelectedId] = useState(null);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, prescriptions, statusFilter]);

  const selectedRx = prescriptions.find(p => p.id === selectedId) || prescriptions[0];

  const handleDownload = async () => {
    try {
      const response = await fetch(selectedRx.image);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Prescription_${selectedRx.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(selectedRx.image, '_blank');
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <DashboardLayout currentPage="prescription">
      <AuditLogModal isOpen={isAuditLogOpen} onClose={() => setIsAuditLogOpen(false)} />
      
      {/* Header Section - Spans full width above both columns */}
      <div className="flex justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Prescription Review</h1>
          <p className="text-slate-800 text-base mt-1">Verify and process patient uploaded medical documents.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-slate-400 z-10" />
            <input 
              type="text"
              placeholder="Search patient..."
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-5 py-2.5 border rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 uppercase tracking-tight ${statusFilter !== 'All' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50'}`}
            >
              <Filter size={16} className={statusFilter !== 'All' ? 'text-blue-500' : 'text-slate-400'} /> 
              {statusFilter === 'All' ? 'Filter' : statusFilter}
              <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  {['All', 'PENDING REVIEW', 'NEW UPLOAD', 'AWAITING OFFER', 'APPROVED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold transition-colors ${statusFilter === status ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {status === 'All' ? 'Show All' : status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button 
            onClick={() => setIsAuditLogOpen(true)}
            className="px-5 py-2.5 bg-[#153886] text-white rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <History size={16} />
            Audit Log
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Middle Column: Prescription List */}
        <div className="flex-[1.6] space-y-6">

              {/* Prescription Cards */}
              <div className="space-y-4">
                {filteredPrescriptions.map(rx => (
                  <PrescriptionCard 
                    key={rx.id}
                    name={rx.name}
                    id={rx.id}
                    status={rx.status} 
                    doctor={rx.doctor} 
                    date={rx.date}
                    image={rx.image}
                    active={rx.id === selectedId}
                    onClick={() => setSelectedId(rx.id)}
                    onApprove={() => handleStatusUpdate(rx.id, 'APPROVED')}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Details Panel (Sticky) */}
            <div className="flex-1 sticky top-0">
              <div className="bg-white border border-slate-200 rounded-[24px] shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                {/* Header Panel */}
                <div className="p-5 bg-[#153886] text-white">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-80">Document Verification</p>
                      <h3 className="text-xl font-bold">{selectedRx.name}</h3>
                      <p className="text-xs font-medium opacity-90">Patient ID: {selectedRx.patientId} • DOB: {selectedRx.dob}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => window.print()} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Printer size={18} /></button>
                      <button 
                        onClick={handleDownload}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="relative group">
                    <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-100">
                       <img 
                          src={selectedRx.image} 
                          alt="Prescription" 
                          className="w-full h-full object-cover"
                       />
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      <button className="p-2 bg-white rounded-full shadow-lg text-slate-600 hover:text-blue-600 transition-colors"><RotateCcw size={18}/></button>
                      <button className="p-2 bg-white rounded-full shadow-lg text-slate-600 hover:text-blue-600 transition-colors"><Search size={18}/></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Extracted Items</span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 uppercase">AI Assisted</span>
                    </div>
                    <div className="space-y-3 text-slate-400 ">
                      {selectedRx.medicines.map((med, i) => (
                        <MedicineItem 
                          key={i}
                          name={med.name} 
                          desc={med.desc} 
                          action={med.action} 
                          color={med.color} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Pharmacist's Note</label>
                    <textarea 
                      placeholder="Add internal verification notes or instructions for the patient..." 
                      className="w-full text-sm border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all p-4 outline-none min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-slate-100">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => navigate('/dashboard/pharmacy/offers')}
                      className="flex-[2] bg-[#153886] text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-100 uppercase tracking-wide"
                    >
                      Generate Offer
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedRx.id, 'REJECTED')}
                      className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors uppercase tracking-wide"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
};

const PrescriptionCard = ({ name, id, status, doctor, date, image, active = false, onClick, onApprove }) => (
  <div onClick={onClick} className={`p-5 bg-white border rounded-2xl flex gap-5 cursor-pointer transition-all ${active ? 'ring-2 ring-blue-500 border-transparent shadow-lg shadow-blue-50' : 'border-slate-200 hover:border-blue-200 hover:shadow-md'}`}>
    <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-50">
      <img src={image} alt="medication" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-xl text-slate-900 leading-tight">{name}</h4>
          <p className="text-[11px] text-slate-700 font-mono mt-0.5 tracking-tight uppercase">{id}</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-tight ${
          status === 'PENDING REVIEW' ? 'bg-[#FEF3C7] text-[#B45309] border border-orange-100' : 
          status === 'NEW UPLOAD' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
          status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' :
          status === 'AWAITING OFFER' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
          'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Uploaded On</p>
          <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{date}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">Doctor</p>
          <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{doctor}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        {status === 'AWAITING OFFER' ? (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); alert('Sending offer to patient...'); }}
              className="flex-1 py-2.5 bg-[#153886] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider hover:bg-blue-800 transition-colors active:scale-95 shadow-sm shadow-blue-100"
            >
              Send Offer
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); alert('Modify items panel opening...'); }}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 bg-[#F5FAFC] text-[11px] font-bold rounded-lg uppercase tracking-wider hover:bg-slate-50 transition-colors active:scale-95"
            >
              Modify
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); onApprove(); }}
              className="flex-1 py-2.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg uppercase tracking-wider hover:bg-blue-100 transition-colors active:scale-95"
            >
              Approve
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); alert('Alt suggestions panel opening...'); }}
              className="flex-1 py-2.5 border border-slate-100 text-slate-700 text-[11px] font-bold rounded-lg uppercase tracking-wider hover:bg-slate-50 transition-colors active:scale-95"
            >
              Suggest Alt
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

const MedicineItem = ({ name, desc, action, color }) => (
  <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${color === 'green' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center shadow-sm`}>
        <span className="text-xl">💊</span>
      </div>
      <div>
        <p className="text-[14px] font-bold text-slate-800">{name}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{desc}</p>
      </div>
    </div>
    <button className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
      color === 'green' ? 'text-green-600 bg-green-50' : 'text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100'
    }`}>
      {action}
    </button>
  </div>
);

export default PrescriptionPage;