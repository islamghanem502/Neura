import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Truck, AlertCircle, ShoppingCart, FileText, Gift
} from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';
import { useOnboardingForm } from '../OnboardingLayout';

// --- Modal for New Prescription ---
const AddPrescriptionModal = ({ isOpen, onClose, onAdd }) => {
  const [patientName, setPatientName] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-[450px] shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Simulate New Prescription</h3>
        <div className="space-y-4">
          <input 
            placeholder="Patient Name" 
            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={() => { onAdd(patientName); onClose(); }}
            className="flex-1 py-3 bg-[#153886] text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            Add Prescription
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data } = useOnboardingForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [orders] = useState([
    { name: 'Robert Hains', ref: 'RX-7728-ALPHA', status: 'PENDING', price: '$124.50' },
    { name: 'James Wilson', ref: 'RX-2210-BETA', status: 'PREPARING', price: '$42.00' },
    { name: 'Linda Sterling', ref: 'RX-8821-OMEGA', status: 'PENDING', price: '$218.10' },
    { name: 'Marcus Solis', ref: 'RX-1100-DELTA', status: 'OUT FOR DELIVERY', price: '$12.99' },
    { name: 'Karen Black', ref: 'RX-5561-SIGMA', status: 'DELIVERED', price: '$89.30' },
    { name: 'Emma Thompson', ref: 'RX-9910-ZETA', status: 'DELIVERED', price: '$210.00' },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { status: "PENDING REVIEW" },
    { status: "NEW UPLOAD" },
    { status: "AWAITING OFFER" },
  ]);

  const [inventory] = useState([
    { status: 'Low Stock' },
    { status: 'In Stock' },
    { status: 'Out of Stock' },
    { status: 'In Stock' },
    { status: 'Low Stock' },
    { status: 'In Stock' },
    { status: 'Low Stock' },
  ]);

  const totalOrders = orders.length;
  const pendingRxCount = prescriptions.filter(p => p.status === "PENDING REVIEW" || p.status === "NEW UPLOAD").length;
  const totalRevenue = orders.reduce((acc, curr) => acc + parseFloat(curr.price.replace('$', '')), 0).toLocaleString();
  const lowStockAlerts = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  const recentOrders = orders.slice(0, 5);

  const handleAddPrescription = (name) => {
    setPrescriptions([{ name: name || 'New Patient', status: "NEW UPLOAD" }, ...prescriptions]);
  };

  return (
    <DashboardLayout currentPage="dashboard">
          <AddPrescriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddPrescription} />
          {/* Page Title & Button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{data.pharmacyName || 'Clinical Precision'}</h1>
              <p className="text-gray-500 text-base">Daily Overview for Oct 24, 2023</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#153886] font-bold text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700 transition shadow-sm active:scale-95"
            >
              <Plus size={18} /> New Prescription
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<div className="bg-[#EFF6FF] p-2 rounded-full flex items-center justify-center">
                      <ShoppingCart className="text-blue-500" size={20} />
                  </div>} 
              label={<span className="font-bold text-slate-700">TOTAL ORDERS</span>} 
              value={totalOrders} 
              trend="+12.4%" 
              onClick={() => navigate('/dashboard/pharmacy/orders')}
            />
            <StatCard 
              icon={<div className="bg-[#EFF6FF] p-2 rounded-full flex items-center justify-center">
                      <FileText className="text-blue-400" size={20} />
                  </div>} 
              label={<span className="font-bold text-slate-700">PENDING RX </span>}
              value={pendingRxCount} 
              badge="Today" 
              onClick={() => navigate('/dashboard/pharmacy/prescription')}
            />
            <StatCard icon={<div className="bg-[#A3F69C66] p-1 rounded-full flex items-center justify-center">
                      <div className="text-green-500">$</div>
                  </div>} 
                   label={<span className="font-bold text-slate-700">REVENUE</span>} 
                   value={`$${totalRevenue}`} 
                   trend="+8.2%" />
            <StatCard 
              icon={<div className="bg-[#FFDAD6] p-2 rounded-full flex items-center justify-center">
                      <AlertCircle className="text-red-500" size={20} />
                  </div>} 
              label={<span className="font-bold text-slate-700">LOW STOCK ALERTS</span>} 
              value={lowStockAlerts < 10 ? `0${lowStockAlerts}` : lowStockAlerts} 
              badge="Critical" 
              badgeColor="bg-red-100 text-red-600" 
              onClick={() => navigate('/dashboard/pharmacy/inventory')}
            />
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Recent Orders Table*/}
            <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 flex justify-between items-center">
                <h3 className="font-bold">Recent Orders</h3>
                <button 
                  onClick={() => navigate('/dashboard/pharmacy/orders')}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View All Orders
                </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-[#f6f4f6] text-slate-600 text-sm text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Prescription Ref</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order, idx) => (
                    <OrderRow 
                      key={idx}
                      name={order.name}
                      refNo={order.ref}
                      status={order.status}
                      price={order.price}
                      onClick={() => navigate('/dashboard/pharmacy/orders')}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Side - Sidebar items */}
            <div className="space-y-6">
              {/* Active Offers */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 flex justify-between items-center text-[#2563EB]">
                  Active Offers <Gift size={16} className="text-blue-500" />
                </h3>
                <div className="space-y-3">
                  <div 
                    onClick={() => navigate('/dashboard/pharmacy/offers')}
                    className="bg-[#153886] p-4 rounded-xl text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <p className="text-xs opacity-80 uppercase font-bold">Seasonal Promo</p>
                    <h4 className="font-bold text-lg">20% off <br/>First Prescription</h4>
                    <p className="text-[10px] mt-2 bg-blue-500 w-fit px-2 py-1 rounded">Code: WELCOME20</p>
                  </div>
                  <div className="bg-[#E6E8EA] p-4 rounded-xl cursor-default">
                    <p className="text-xs text-green-600 font-bold">COMMUNITY CARE</p>
                    <h4 className="font-bold">Senior Citizen 15% Discount</h4>
                    <p className="text-[12px] text-slate-600 text-gray-500">Applies to all generics</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl cursor-default border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-tight">Logistics Promo</p>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold">Free Home Delivery</h4>
                      <Truck size={18} className="text-blue-600" />
                    </div>
                    <p className="text-[12px] text-gray-500 text-slate-600">Orders above $150.00</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/dashboard/pharmacy/offers')}
                  className="w-full mt-4 text-sm font-bold bg-[#F2F4F6] py-2 rounded-lg text-[#2563EB] hover:bg-gray-100 transition"
                >
                  Manage All Promotions
                </button>
              </div>

              {/* Stock Health */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ">
                <h3 className="font-bold mb-4 text-blue-600 ">Stock Health</h3>
                <StockItem label="ANTIBIOTICS" value={88} color="bg-green-600" onClick={() => navigate('/dashboard/pharmacy/inventory')} />
                <StockItem label="INSULIN VARIANTS" value={12} color="bg-red-500" onClick={() => navigate('/dashboard/pharmacy/inventory')} />
                <StockItem label="PAIN RELIEF" value={45} color="bg-blue-500" onClick={() => navigate('/dashboard/pharmacy/inventory')} />
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
};


const StatCard = ({ icon, label, value, trend, badge, badgeColor = "bg-blue-50 text-blue-600", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-blue-100 hover:shadow-xl hover:-translate-y-1 active:scale-95' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      {trend && <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
      {badge && <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>}
    </div>
    <p className="text-xs text-gray-400 font-bold mb-1 tracking-wider">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const OrderRow = ({ name, refNo, status, price, onClick }) => {
  const statusStyles = {
    'PENDING': 'bg-blue-50 text-blue-600',
    'PREPARING': 'bg-orange-50 text-orange-600',
    'OUT FOR DELIVERY': 'bg-green-50 text-green-600',
  };
  return (
    <tr onClick={onClick} className={`hover:bg-gray-50 transition ${onClick ? 'cursor-pointer' : ''}`}>
      <td className="px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">{name.charAt(0)}</div>
        <span className="text-sm font-medium">{name}</span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{refNo}</td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyles[status]}`}>{status}</span>
      </td>
      <td className="px-6 py-4 text-sm font-bold">{price}</td>
    </tr>
  );
};

const StockItem = ({ label, value, color, onClick }) => (
  <div 
    className={`mb-4 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
    onClick={onClick}
  >
    <div className="flex justify-between text-[12px] font-bold mb-1">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full">
      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default DashboardPage;