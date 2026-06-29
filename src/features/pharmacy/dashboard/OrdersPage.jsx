import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../DashboardLayout';
import { 
  Download, Clock, Package, Truck, CheckCircle, Calendar, Search, XCircle 
} from 'lucide-react';

// --- Sub-Components ---

const StatCard = ({ title, value, change, colorClass, icon, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all duration-100 ${onClick ? 'cursor-pointer hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 active:scale-95' : ''}`}
  >
    <div className="flex justify-between items-start">
      <h3 className="text-gray-500 text-[12px] font-extrabold uppercase tracking-wider">{title}</h3>
      <span className={`p-2 rounded-lg ${colorClass.replace('text', 'bg').replace('-500', '-50')} ${colorClass}`}>
        {icon}
      </span>
    </div>
    <div className="mt-4">
      <p className="text-3xl font-black text-gray-800 tracking-tight">{value}</p>
      <p className={`text-sm mt-2 font-bold ${colorClass}`}>{change}</p>
    </div>
  </div>
);

const InventoryCard = ({ name, units, progress, color, onClick }) => (
  <div onClick={onClick} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/20 transition-all group">
    <p className="text-[10px] uppercase text-blue-200 font-bold mb-1 tracking-tight">{name}</p>
    <p className="text-xl font-bold text-white">{units} units</p>
    <div className="w-full bg-white/20 h-1.5 mt-4 rounded-full overflow-hidden">
      <div className={`${color} h-full transition-all duration-700 group-hover:opacity-80`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

// --- Modal for Creating Order ---
const CreateOrderModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ patient: '', ref: '', price: '', status: 'Pending' });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-[450px] shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Create New Pharmacy Order</h3>
        <div className="space-y-4">
          <input 
            placeholder="Patient Name" 
            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            onChange={(e) => setFormData({...formData, patient: e.target.value})}
          />
          <input 
            placeholder="Prescription Ref (e.g. RX-1234)" 
            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            onChange={(e) => setFormData({...formData, ref: e.target.value})}
          />
          <input 
            placeholder="Total Price (e.g. $50.00)" 
            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={() => { onAdd(formData); onClose(); }}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            Add Order
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function OrderPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ordersPerPage = 5;
  
  const [orders, setOrders] = useState([
    { id: '#ORD-99189', patient: 'Robert Hains', patientId: '5521-9020', ref: 'RX-7728-ALPHA', status: 'Pending', price: '$124.50', color: 'bg-blue-100 text-blue-600', time: '10m ago' },
    { id: '#ORD-99200', patient: 'Robert Hains', patientId: '4410-2216', ref: 'RX-2210-BETA', status: 'Preparing', price: '$42.00', color: 'bg-orange-100 text-[#B45309]' },
    { id: '#ORD-99555', patient: 'Linda Sterling', patientId: '1102-3392', ref: 'RX-8821-OMEGA', status: 'Approved', price: '$218.10', color: 'bg-blue-50 text-blue-500' },
    { id: '#ORD-99100', patient: 'Marcus Solis', patientId: '9918-1212', ref: 'RX-1100-DELTA', status: 'Out for delivery', price: '$12.99', color: 'bg-purple-100 text-purple-600' },
    { id: '#ORD-99198', patient: 'Karen Black', patientId: '7721-0019', ref: 'RX-5561-SIGMA', status: 'Delivered', price: '$89.30', color: 'bg-green-100 text-green-600' },
    { id: '#ORD-99300', patient: 'James Wilson', patientId: '2231-9980', ref: 'RX-3341-GAMMA', status: 'Pending', price: '$55.00', color: 'bg-blue-100 text-blue-600', time: '5h ago' },
    { id: '#ORD-99412', patient: 'Emma Thompson', patientId: '8821-4432', ref: 'RX-9910-ZETA', status: 'Delivered', price: '$210.00', color: 'bg-green-100 text-green-600', time: '1d ago' },
    { id: '#ORD-99501', patient: 'Noah Garcia', patientId: '5501-1122', ref: 'RX-4455-KAPPA', status: 'Preparing', price: '$34.20', color: 'bg-orange-100 text-[#B45309]' },
  ]);

  // Logic: Filtering orders based on search and status
  const filteredOrders = useMemo(() => {
    const result = orders.filter(order => {
      const matchesSearch = order.patient.toLowerCase().includes(searchQuery.toLowerCase()) || order.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'All Statuses' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setCurrentPage(1); // Reset to page 1 on filter change
    return result;
  }, [searchQuery, statusFilter, orders]);

  // Logic: Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  const handleAddOrder = (newOrder) => {
    const orderObj = {
      id: `#ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      patient: newOrder.patient,
      patientId: 'New-Patient',
      ref: newOrder.ref,
      status: 'Pending',
      price: newOrder.price,
      color: 'bg-blue-100 text-blue-600',
      time: 'Just now'
    };
    setOrders([orderObj, ...orders]);
  };

  const exportCSV = () => {
    const headers = ["Order ID,Patient,Ref,Status,Price"];
    const rows = orders.map(o => `${o.id},${o.patient},${o.ref},${o.status},${o.price}`);
    const csvData = headers.concat(rows).join("\n");
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pharmacy_orders.csv';
    a.click();
  };

  // Logic: Stats Calculation
  const stats = {
    pending: orders.filter(o => o.status === 'Pending').length,
    preparing: orders.filter(o => o.status === 'Preparing').length,
    outForDelivery: orders.filter(o => o.status === 'Out for delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  return (
    <DashboardLayout currentPage="orders">
      <CreateOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddOrder} 
      />
      <div className="space-y-8">
        {/* Section 1: Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Order Management</h2>
            <p className="text-gray-800 text-base">Real-time prescription processing and fulfillment queue.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={exportCSV}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download size={18} className="text-gray-500" />
              Export CSV
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#153886] text-white rounded-full text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              + Create New Order
            </button>
          </div>
        </div>

        {/* Section 2: Statistics Grid */}
        <div className="grid grid-cols-4 gap-6 ">
          <StatCard title="Pending Approval" value={stats.pending} change="+12% from yesterday" colorClass="text-blue-500" icon={<Clock size={20} />} onClick={() => setStatusFilter('Pending')} />
          <StatCard title="In Preparation" value={stats.preparing} change="Critical Priority (3)" colorClass="text-orange-500" icon={<Package size={20} />} onClick={() => setStatusFilter('Preparing')} />
          <StatCard title="Out for Delivery" value={stats.outForDelivery} change="Last sync 2m ago" colorClass="text-purple-500" icon={<Truck size={20} />} onClick={() => setStatusFilter('Out for delivery')} />
          <StatCard title="Delivered Today" value={stats.delivered} change="98% KPI Target" colorClass="text-green-500" icon={<CheckCircle size={20} />} onClick={() => setStatusFilter('Delivered')} />
        </div>

        {/* Section 3: Filters & Search */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="flex-1">
            <label className="text-[12px] font-bold text-gray-400 uppercase block mb-1">Search Patient</label>
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or ID..." 
                  className="w-full bg-[#F4F5F9] border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none" 
                />
            </div>
          </div>
          <div className="w-48">
  <label className="text-[12px] font-bold text-gray-400 uppercase block mb-1">Status Filter</label>
  
  <div className="relative">
    <select 
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full bg-[#F4F5F9] border-none rounded-lg p-2 pr-10 text-sm outline-none cursor-pointer appearance-none font-semibold text-gray-700"
    >
      <option>All Statuses</option>
      <option>Pending</option>
      <option>Preparing</option>
      <option>Approved</option>
      <option>Out for delivery</option>
      <option>Delivered</option>
    </select>

    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
      <svg 
        className="w-4 h-4 text-gray-400" 
        
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
 </div>
          <div className="w-64">
            <label className="text-[12px] font-bold text-gray-400 uppercase block mb-1">Date Range</label>
            <div className="w-full bg-[#F4F5F9] p-2 rounded-lg text-sm text-gray-500 flex  gap-2 items-center cursor-pointer font-medium">
            <Calendar size={15} className="text-gray-400" />
             Oct 20, 2023 - Oct 27, 2023 
            </div>
          </div>
          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('All Statuses'); }}
            className="mt-5 px-4 py-2 text-[14px] text-gray-500 text-sm font-bold bg-[#F1F5F9] hover:text-blue-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Section 4: Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="text-[13px] bg-[#F4F5F9] uppercase text-gray-600 font-bold border-b border-gray-50">
                <th className="p-5 tracking-widest w-[15%]">Order ID</th>
                <th className="p-5 tracking-widest w-[25%]">Patient Name</th>
                <th className="p-5 tracking-widest w-[20%]">Prescription Ref</th>
                <th className="p-5 tracking-widest w-[15%]">Status</th>
                <th className="p-5 tracking-widest w-[12%]">Total Price</th>
                <th className="p-5 tracking-widest w-[13%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <td className="p-5">
                    <p className="font-bold text-gray-800 text-sm truncate">{order.id}</p>
                    <p className="text-[13px] text-gray-400 font-medium">Placed {order.time}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 ring-2 ring-white">
                        {order.patient.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-700 truncate">{order.patient}</p>
                        <p className="text-[14px] text-gray-400 tracking-tighter">ID: {order.patientId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-gray-500 font-medium tracking-tight uppercase">{order.ref}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${order.color}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-5 text-sm font-bold text-gray-800">{order.price}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end">
                      {order.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                      {order.status === 'Preparing' && (
                        <button className="text-[11px] font-bold text-slate-600  px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
                          Update Status
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <button className="text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap">
                          Archive
                        </button>
                      )}
                      {order.status === 'Out for delivery' && (
                        <button className="text-[11px] font-bold text-slate-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
                          Track Order
                        </button>
                      )}
                      {order.status === 'Approved' && (
                        <button className="text-[11px] font-bold text-slate-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
                          Start Prep
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Footer */}
          <div className="p-5 border-t border-gray-50 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-semibold tracking-tight">
              Showing {paginatedOrders.length} of {filteredOrders.length} results
            </p>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg font-bold "
              >‹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#153886] text-white shadow-md shadow-blue-100' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg font-bold"
              >›</button>
            </div>
          </div>
        </div>

        {/* Section 5: Bottom Grid */}
        <div className="grid grid-cols-3 gap-8">
          
          {/* Inventory Sync Panel */}
          <div className="col-span-2 bg-gradient-to-br from-indigo-900 via-blue-900 to-[#0A0E1A] p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-white text-xl font-bold mb-2 tracking-tight">Automated Inventory Sync</h3>
              <p className="text-blue-200/70 text-semibold  mb-8 max-w-sm leading-relaxed">Your inventory is automatically adjusted based on current order throughput. Three items are currently reaching their minimum threshold.</p>
              <div className="grid grid-cols-3 gap-5">
                <InventoryCard name="Amoxicillin" units="12" progress={30} color="bg-orange-400" onClick={() => navigate('/dashboard/pharmacy/inventory')} />
                <InventoryCard name="Lisinopril" units="8" progress={15} color="bg-red-500" onClick={() => navigate('/dashboard/pharmacy/inventory')} />
                <InventoryCard name="Metformin" units="45" progress={80} color="bg-green-400" onClick={() => navigate('/dashboard/pharmacy/inventory')} />
              </div>
            </div>
            {/* Background decorative glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
          </div>

          {/* Quick Tasks List */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-gray-800 font-extrabold mb-8 flex items-center gap-2 tracking-tight">
              <span className="text-blue-500">⚡</span> Quick Tasks
            </h3>
            <ul className="space-y-7">
              {[
                { label: 'Print Daily Manifest', icon: '📄', color: 'bg-blue-50', iconColor: 'text-blue-500', path: '#' },
                { label: 'Flag Urgent Rx', icon: '🚨', color: 'bg-green-50', iconColor: 'text-green-500', path: '/dashboard/pharmacy/prescription' },
                { label: 'Weekly Audit Log', icon: '📅', color: 'bg-purple-50', iconColor: 'text-purple-500', path: '#' }
              ].map((task, i) => (
                <li 
                  key={i} 
                  onClick={() => task.path !== '#' && navigate(task.path)}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 ${task.color} ${task.iconColor} rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform`}>
                      {task.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors tracking-tight">{task.label}</p>
                      <p className="text-[12px] text-gray-500 font-bold tracking-tight uppercase opacity-70">Logs & Manifests</p>
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:translate-x-1 transition-transform font-bold">→</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}