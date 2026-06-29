import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, MoreVertical, ChevronLeft, ChevronRight, Search, X, Sliders
} from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';
import { useOnboardingForm } from '../OnboardingLayout';

// --- Modal for Adding New Product ---
const AddProductModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', type: '', category: 'Antibiotic', sku: '', stock: '' });
  if (!isOpen) return null;

  const handleSubmit = () => {
    const stockNum = parseInt(formData.stock) || 0;
    let status = 'In Stock';
    let color = 'green';
    
    if (stockNum === 0) { status = 'Out of Stock'; color = 'red'; }
    else if (stockNum < 50) { status = 'Low Stock'; color = 'orange'; }

    onAdd({ ...formData, stock: stockNum, status, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Add New Medication</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <input placeholder="Drug Name" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" onChange={e => setFormData({...formData, name: e.target.value})} />
          <input placeholder="Drug Type (e.g. Penicillin)" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" onChange={e => setFormData({...formData, type: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="SKU Code" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" onChange={e => setFormData({...formData, sku: e.target.value})} />
            <input placeholder="Initial Stock" type="number" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">Register Product</button>
        </div>
      </div>
    </div>
  );
};

// --- Modal for Adjusting Stock ---
const AdjustStockModal = ({ isOpen, onClose, product, onUpdate }) => {
  const [newStock, setNewStock] = useState(product?.stock || 0);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Adjust Stock</h3>
            <p className="text-xs text-slate-500">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Current Stock: {product.stock} units</label>
            <input 
              type="number" 
              className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-lg font-bold"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
          <button 
            onClick={() => onUpdate(product.sku, newStock)}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            Update Stock
          </button>
        </div>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const navigate = useNavigate();
  const { data, updateData } = useOnboardingForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const itemsPerPage = 5;
  
  const [inventory, setInventory] = useState([
    { name: 'Amoxicillin 500mg', type: 'Broad-spectrum penicillin', category: 'Antibiotic', sku: 'AMX-500-CAP', stock: 42, status: 'Low Stock', color: 'orange' },
    { name: 'Ibuprofen 400mg', type: 'Nonsteroidal anti-inflammatory', category: 'Pain Relief', sku: 'IBU-400-TAB', stock: 1240, status: 'In Stock', color: 'green' },
    { name: 'Lisinopril 10mg', type: 'ACE Inhibitor', category: 'Hypertension', sku: 'LIS-010-TAB', stock: 0, status: 'Out of Stock', color: 'red' },
    { name: 'Atorvastatin 20mg', type: 'Statin / Cholesterol', category: 'Lipid Lowering', sku: 'ATO-020-TAB', stock: 540, status: 'In Stock', color: 'green' },
    { name: 'Metformin 850mg', type: 'Antidiabetic medication', category: 'Diabetes', sku: 'MET-850-TAB', stock: 12, status: 'Low Stock', color: 'orange' },
    { name: 'Omeprazole 20mg', type: 'Proton-pump inhibitor', category: 'Gastric', sku: 'OME-020-CAP', stock: 890, status: 'In Stock', color: 'green' },
    { name: 'Amlodipine 5mg', type: 'Calcium channel blocker', category: 'Hypertension', sku: 'AML-005-TAB', stock: 15, status: 'Low Stock', color: 'orange' },
  ]);

  // Logic: Search & Filtering
  const filteredInventory = useMemo(() => {
    const result = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setCurrentPage(1);
    return result;
  }, [searchQuery, inventory, statusFilter]);

  // Logic: Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Logic: Dynamic Stats
  const stats = {
    total: inventory.length,
    low: inventory.filter(i => i.status === 'Low Stock').length,
    out: inventory.filter(i => i.status === 'Out of Stock').length
  };

  const handleAddProduct = (newProduct) => {
    setInventory([newProduct, ...inventory]);
    setCurrentPage(1);
  };

  const handleUpdateStock = (sku, newStock) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        let status = 'In Stock';
        let color = 'green';
        if (newStock === 0) { status = 'Out of Stock'; color = 'red'; }
        else if (newStock < 50) { status = 'Low Stock'; color = 'orange'; }
        return { ...item, stock: newStock, status, color };
      }
      return item;
    }));
    setIsAdjustModalOpen(false);
  };

  return (
    <DashboardLayout currentPage="inventory">
        <AddProductModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddProduct} 
        />
        <AdjustStockModal 
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          product={editingProduct}
          onUpdate={handleUpdateStock}
        />
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Inventory Management</h1>
              <p className="text-slate-800 text-base mt-1">Real-time clinical stock tracking and fulfillment status.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 px-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Enable Installments</span>
              <div 
                onClick={() => updateData({ installmentsEnabled: !data.installmentsEnabled })}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${data.installmentsEnabled ? 'bg-[#153886]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${data.installmentsEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
              <div 
                className="border-l border-slate-100 pl-4 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => {
                  const newTerms = prompt("Enter Default Installment Terms:", data.installmentTerms || "3 Months (0% APR)");
                  if (newTerms) updateData({ installmentTerms: newTerms });
                }}
              >
                <p className="text-[12px] text-slate-500 font-bold uppercase">Default Terms</p>
                <p className={`text-sm font-bold ${data.installmentsEnabled ? 'text-[#153886]' : 'text-slate-400'}`}>
                  {data.installmentTerms || '3 Months (0% APR)'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#153886] text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition active:scale-95 shadow-sm shadow-blue-200"
              >
                <Plus size={18} strokeWidth={2.5} /> Add New Product
              </button>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search inventory..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => {
                setEditingProduct(inventory[0]);
                setIsAdjustModalOpen(true);
              }}
              className="bg-[#F7F5F9] border border-slate-200 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-800 hover:bg-slate-50 transition flex items-center gap-2 active:scale-95"
            >
              <Sliders size={18} />
              Adjust Inventory
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr className="text-[13px] bg-[#f6f4f6] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-5 w-[25%]">Drug Name</th>
                  <th className="px-6 py-5 w-[15%]">Category</th>
                  <th className="px-6 py-5 w-[15%]">SKU</th>
                  <th className="px-6 py-5 w-[20%]">Stock Level</th>
                  <th className="px-6 py-5 w-[15%]">Status</th>
                  <th className="px-6 py-5 w-[10%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedInventory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                          💊
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[15px] truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{item.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium truncate">{item.category}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-[11px] font-semibold tracking-wider truncate">{item.sku}</td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                         <div className="flex justify-between text-[11px] font-black mb-1.5">
                            <span style={{ color: item.color === 'green' ? '#10b981' : item.color === 'orange' ? '#f59e0b' : '#ef4444' }}>
                                {item.stock.toLocaleString()} units
                            </span>
                         </div>
                         <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                    width: item.stock > 1000 ? '100%' : item.stock === 0 ? '0%' : `${Math.max((item.stock/1240)*100, 5)}%`,
                                    backgroundColor: item.color === 'green' ? '#10b981' : item.color === 'orange' ? '#f59e0b' : '#ef4444'
                                }}
                            ></div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide ${
                        item.status === 'In Stock' ? 'bg-green-50 text-green-600 border border-green-100' : 
                        item.status === 'Low Stock' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3 text-slate-400">
                        <button 
                          onClick={() => {
                            setEditingProduct(item);
                            setIsAdjustModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Component*/}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-600 font-medium">
                Showing <span className="text-slate-900 font-bold">{(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, filteredInventory.length)}</span> of <span className="text-slate-900 font-bold">{filteredInventory.length}</span> results
              </p>
              
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 text-slate-700 hover:bg-slate-50 rounded-lg transition disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#153886] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 text-slate-700 hover:bg-slate-50 rounded-lg transition disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mt-8">
             <StatsCard 
                label="Total SKU Count" 
                value={stats.total} 
                icon="📦" 
                onClick={() => setStatusFilter('All')}
                active={statusFilter === 'All'}
             />
             <StatsCard 
                label="Low Stock Items" 
                value={stats.low} 
                icon="⚠️" 
                onClick={() => setStatusFilter('Low Stock')}
                active={statusFilter === 'Low Stock'}
             />
             <StatsCard 
                label="Out of Stock" 
                value={stats.out} 
                icon="❌" 
                onClick={() => setStatusFilter('Out of Stock')}
                active={statusFilter === 'Out of Stock'}
             />
          </div>
    </DashboardLayout>
  );
};

const StatsCard = ({ label, value, icon, onClick, active }) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border flex items-center gap-5 transition-all group cursor-pointer ${
        active ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-md' : 'border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-colors ${
          active ? 'bg-blue-50' : 'bg-slate-50 group-hover:bg-blue-50'
        }`}>
            {icon}
        </div>
        <div>
            <p className="text-[12px] uppercase font-bold text-slate-600 tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
    </div>
)

export default InventoryPage;