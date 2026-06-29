import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Bell,
  Target,
  Tag,
  Calendar,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "../DashboardLayout";

// --- Modal for Creating Offer ---
const CreateOfferModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ title: '', target: 'All Patients', value: '', validity: '' });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-bold mb-6 text-slate-800">Create New Promotion</h3>
        <div className="space-y-4">
          <InputField label="Promotion Title" placeholder="e.g. Winter Care" onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Target" options={["All Patients", "Chronic", "New"]} onChange={(e) => setFormData({...formData, target: e.target.value})} />
            <InputField label="Discount %" type="number" placeholder="20" onChange={(e) => setFormData({...formData, value: e.target.value})} />
          </div>
          <InputField label="Validity Date" type="date" onChange={(e) => setFormData({...formData, validity: e.target.value})} />
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={() => { onAdd(formData); onClose(); }}
            className="flex-1 py-3 bg-[#153886] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Launch Offer
          </button>
        </div>
      </div>
    </div>
  );
};

const OffersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Offers");
  const [sortBy, setSortBy] = useState("id"); // 'id' represents creation time
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [quickLaunch, setQuickLaunch] = useState({
    title: "",
    target: "All Patients",
    value: "",
    validity: "",
  });

  const [offers, setOffers] = useState([
    {
      id: 1,
      title: "Discount on Hypertension Medications",
      target: "Specific drug segment (ACE Inhibitors)",
      type: "15% Percentage Discount",
      validity: "Oct 01 - Dec 31, 2023",
      status: "Active",
      redeemed: 45,
      views: 650,
    },
    {
      id: 2,
      title: "Summer Allergy Bundle",
      target: "Prescription-based",
      type: "Buy 1 Get 1 (50% Off)",
      validity: "Jun 01 - Aug 31, 2023",
      status: "Expired",
      redeemed: 120,
      views: 1800,
    },
  ]);

  // Logic: Dynamic Stats Calculation
  const stats = useMemo(() => {
    const activeCount = offers.filter((o) => o.status === "Active").length;
    const totalRedeemed = offers.reduce((acc, curr) => acc + curr.redeemed, 0);
    const totalViews = offers.reduce((acc, curr) => acc + (curr.views || 0), 0);

    const getDiscountNum = (typeStr) => {
      const match = typeStr.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    const totalDiscount = offers.reduce((acc, curr) => acc + getDiscountNum(curr.type), 0);
    const avgDiscount = offers.length > 0 ? (totalDiscount / offers.length).toFixed(1) : "0";
    const convRate = totalViews > 0 ? ((totalRedeemed / totalViews) * 100).toFixed(1) : "0";

    return {
      activeCount,
      totalRedeemed: totalRedeemed.toLocaleString(),
      avgDiscount: `${avgDiscount}%`,
      conversionRate: `${convRate}%`,
    };
  }, [offers]);

  // Logic: Filtering based on Tabs
  const filteredOffers = useMemo(() => {
    let result = activeTab === "All Offers" ? [...offers] : offers.filter(
      (offer) => offer.status.toLowerCase() === activeTab.toLowerCase(),
    );
    return result.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [activeTab, offers, sortBy]);

  // Logic: Quick Launch Action
  const handleLaunchOffer = (manualData = null) => {
    const dataToUse = manualData && manualData.title ? manualData : quickLaunch;
    if (!dataToUse.title || !dataToUse.value)
      return alert("Please fill in the title and discount value.");

    const newOffer = {
      id: Date.now(),
      title: dataToUse.title,
      target: dataToUse.target,
      type: `${dataToUse.value}% Discount`,
      validity: dataToUse.validity || "Indefinite",
      status: "Active",
      redeemed: 0,
      views: 0,
    };

    setOffers(prev => [newOffer, ...prev]);
    if (!manualData) {
      setQuickLaunch({ title: "", target: "All Patients", value: "", validity: "" });
    }
    alert("Promotion Launched Successfully!");
  };

  return (
    <DashboardLayout currentPage="offers">
      <CreateOfferModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleLaunchOffer} />

      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Offers & Promotions
          </h1>
          <p className="text-slate-700 text-base mt-1">
            Create and manage offers for patients and prescriptions across all
            branches.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#153886] text-white font-semibold px-6 py-2.5 rounded-full flex items-center space-x-2 hover:bg-blue-900 transition active:scale-95 shadow-lg"
        >
          <Plus size={20} /> <span className="font-medium">Create Offer</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard
          title="ACTIVE OFFERS"
          value={stats.activeCount}
          change="+2 this week"
          trend="up"
        />
        <StatCard
          title="TOTAL REDEEMED"
          value={stats.totalRedeemed}
          change="14% growth"
          trend="up"
        />
        <StatCard
          title="AVG. DISCOUNT"
          value={stats.avgDiscount}
          change="Stable"
          trend="stable"
        />
        <StatCard
          title="CONVERSION RATE"
          value={stats.conversionRate}
          change="-0.4% vs last mo"
          trend="down"
        />
      </div>

      {/* Filter Tabs & Sort */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex bg-gray-100/50 p-1 rounded-xl space-x-1">
          {["All Offers", "Active", "Scheduled", "Expired"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
        <div 
          onClick={() => setSortBy(sortBy === "id" ? "redeemed" : "id")}
          className="flex items-center text-sm text-gray-700 font-medium cursor-pointer group"
        >
          Sort by:{" "}
          <span className="text-blue-700 ml-1 flex items-center group-hover:underline font-bold">
            {sortBy === "id" ? "Recently Created" : "Most Redeemed"} <ChevronDown size={14} className={`ml-1 transition-transform ${sortBy === "redeemed" ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </div>

      {/* Offers Cards Row */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {filteredOffers.map((offer) => (
          <div
            key={offer.id}
            className={`p-6 rounded-[24px] border shadow-sm relative hover:shadow-md transition-all ${offer.status === "Expired" ? "bg-[#F9FAFB] border-dashed border-gray-300 opacity-80" : "bg-white border-gray-100"}`}
          >
            <div
              className={`flex items-center space-x-1 mb-4 text-[13px] font-bold tracking-widest uppercase ${offer.status === "Active" ? "text-green-600" : "text-gray-400"}`}
            >
              {offer.status === "Active" && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              )}
              <span>{offer.status}</span>
            </div>
            <h3
              className={`font-bold text-xl mb-6 leading-tight ${offer.status === "Expired" ? "text-gray-500" : "text-slate-800"}`}
            >
              {offer.title}
            </h3>

            <div
              className={`space-y-4 mb-8 ${offer.status === "Expired" ? "grayscale opacity-60" : ""}`}
            >
              <div className="flex items-start space-x-3">
                <Target size={18} className="text-gray-600 mt-0.5" />
                <p className="text-sm text-gray-800">
                  Target:{" "}
                  <span className="font-semibold text-slate-900 block">
                    {offer.target}
                  </span>
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Tag size={18} className="text-gray-600 mt-0.5" />
                <p className="text-sm text-gray-800">
                  Type:{" "}
                  <span className="font-semibold text-slate-900">
                    {offer.type}
                  </span>
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar size={18} className="text-gray-600 mt-0.5" />
                <p className="text-sm text-gray-800">
                  Validity:{" "}
                  <span className="font-semibold text-slate-900">
                    {offer.validity}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                    src={`https://i.pravatar.cc/100?u=${offer.id + i}`}
                    alt="user"
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  +{offer.redeemed}
                </div>
              </div>
              <button
                onClick={() =>
                  alert(`Analytics for ${offer.title} coming soon!`)
                }
                className={`${offer.status === "Expired" ? "text-gray-400" : "text-blue-800"} text-sm font-bold hover:underline`}
              >
                {offer.status === "Expired"
                  ? "View Final Report"
                  : "View Analytics"}
              </button>
            </div>
          </div>
        ))}

        {/* Create New Placeholder */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-blue-100 rounded-[24px] flex flex-col items-center justify-center p-8 text-center hover:bg-blue-50/30 transition-colors cursor-pointer group"
        >
          <div
            className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"
          >
            <Plus className="text-blue-800" size={28} />
          </div>
          <h4 className="font-bold text-blue-800 text-lg">
            Create New Promotion
          </h4>
          <p className="text-sm text-gray-700 mt-2 px-6">
            Launch a new seasonal or condition-specific offer for your patients.
          </p>
        </div>
      </div>

      {/* Quick Launch Offer Form */}
      <div className="bg-[#F0F4F8]/50 border border-gray-100 rounded-[24px] p-8 mb-10">
        <h2 className="text-blue-800 font-bold text-xl mb-8">
          Quick Launch Offer
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <InputField
            label="PROMOTION TITLE"
            placeholder="e.g. Autumn Care Discount"
            value={quickLaunch.title}
            onChange={(e) =>
              setQuickLaunch({ ...quickLaunch, title: e.target.value })
            }
          />
          <SelectField
            label="TARGET SELECTION"
            options={["All Patients", "Chronic", "New"]}
            value={quickLaunch.target}
            onChange={(e) =>
              setQuickLaunch({ ...quickLaunch, target: e.target.value })
            }
          />
          <div className="flex flex-col space-y-2">
            <label className="text-[12px] font-black text-gray-600 tracking-widest">
              DISCOUNT VALUE
            </label>
            <div className="flex h-12">
              <input
                className="w-full border-y border-l rounded-l-xl px-4 focus:outline-none"
                placeholder="0"
                type="number"
                value={quickLaunch.value}
                onChange={(e) =>
                  setQuickLaunch({ ...quickLaunch, value: e.target.value })
                }
              />
              <div className="bg-gray-100 border rounded-r-xl px-4 flex items-center text-gray-800 font-bold text-sm">
                % <ChevronDown size={14} className="ml-2" />
              </div>
            </div>
          </div>
          <InputField
            label="VALIDITY PERIOD"
            type="date"
            placeholder="mm/dd/yy"
            value={quickLaunch.validity}
            onChange={(e) =>
              setQuickLaunch({ ...quickLaunch, validity: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() =>
              setQuickLaunch({
                title: "",
                target: "All Patients",
                value: "",
                validity: "",
              })
            }
            className="px-10 py-2.5 text-gray-500 font-bold hover:text-gray-700"
          >
            Discard
          </button>
          <button
            onClick={handleLaunchOffer}
            className="px-10 py-2.5 bg-[#153886] text-white font-bold rounded-3xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition"
          >
            Save and Launch
          </button>
        </div>
      </div>

      {/* Smart Targeting Engine - AI Card */}
      <div className=" bg-gradient-to-br from-indigo-900 via-blue-900 to-[#0A0E1A] rounded-[24px] p-10 text-white flex justify-between items-center relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold uppercase tracking-[0.2em] text-lg text-blue-100">
              Smart Targeting Engine
            </span>
          </div>
          <p className=" leading-relaxed  mb-6">
            Our system has identified{" "}
            <span className="text-blue-200 underline decoration-2">
              3 groups of patients
            </span>{" "}
            who haven't refilled <br/>their chronic condition prescriptions in 45
            days. A targeted 10% discount<br/> could recover approximately{" "}
            <span className="font-bold text-green-300 text-2xl ml-1">
              $4,200
            </span>{" "}
            in monthly revenue.
          </p>
          <div className="flex space-x-3">
            <Badge
              icon={<Target size={14} />}
              label="Chronic condition patients"
            />
            <Badge
              icon={<Calendar size={14} />}
              label="Recent prescriptions (expired)"
            />
            <Badge icon={<Tag size={14} />} label="Frequent buyers" />
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/pharmacy/dashboard")}
          className="relative z-10 bg-[#F0F4F8] text-[#1A335E] px-10 py-4 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl active:scale-95"
        >
          Launch AI Recommendation
        </button>
        {/* Decorative background circle */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </DashboardLayout>
  );
};

// --- Helper Components ---

const StatCard = ({ title, value, change, trend }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-50 shadow-sm">
    <p className="text-[12px] font-black text-gray-500 tracking-[0.15em] mb-3">
      {title}
    </p>
    <div className="flex items-baseline space-x-2">
      <h4 className="text-3xl font-black text-slate-800">{value}</h4>
    </div>
    <p
      className={`text-sm mt-2 font-bold flex items-center ${
        trend === "up"
          ? "text-green-500"
          : trend === "down"
            ? "text-red-500"
            : "text-gray-400"
      }`}
    >
      {trend === "up" && "↗"} {trend === "down" && "↘"} {change}
    </p>
  </div>
);

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${
      active
        ? "bg-[#153886] text-white shadow-md"
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    {label}
  </button>
);

const Badge = ({ icon, label }) => (
  <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm border border-white/5">
    {icon} <span>{label}</span>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="flex flex-col space-y-2 text-slate-800">
    <label className="text-[12px] font-black text-gray-600 tracking-widest">
      {label}
    </label>
    <input
      className="h-12 border rounded-xl px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm font-medium"
      {...props}
    />
  </div>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-[12px] font-black text-gray-600 tracking-widest">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-12 border rounded-xl px-4 appearance-none focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium bg-white"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-4 top-3.5 text-gray-400"
        size={18}
      />
    </div>
  </div>
);

export default OffersPage;
