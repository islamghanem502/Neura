import React, { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const MedicalProfileSection = ({
  title,
  icon,
  color = "blue",
  items = [],
  isLoading = false,
  onAdd,
  onUpdate,
  onDelete,
  fields,
  emptyMessage = "No records found",
}) => {
  const Icon = icon;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Color configurations
  const colorConfig = {
    blue: {
      bg: "bg-blue-50/70",
      border: "border-blue-100",
      text: "text-blue-600",
      light: "bg-blue-50",
      dark: "bg-blue-600",
      hover: "hover:bg-blue-600",
      ring: "focus:ring-blue-500",
      badge: "bg-blue-50/50 border border-blue-100 text-blue-700",
    },
    emerald: {
      bg: "bg-emerald-50/70",
      border: "border-emerald-100",
      text: "text-emerald-600",
      light: "bg-emerald-50",
      dark: "bg-emerald-600",
      hover: "hover:bg-emerald-600",
      ring: "focus:ring-emerald-500",
      badge: "bg-emerald-50/50 border border-emerald-100 text-emerald-700",
    },
    purple: {
      bg: "bg-purple-50/70",
      border: "border-purple-100",
      text: "text-purple-600",
      light: "bg-purple-50",
      dark: "bg-purple-600",
      hover: "hover:bg-purple-600",
      ring: "focus:ring-purple-500",
      badge: "bg-purple-50/50 border border-purple-100 text-purple-700",
    },
    rose: {
      bg: "bg-rose-50/70",
      border: "border-rose-100",
      text: "text-rose-600",
      light: "bg-rose-50",
      dark: "bg-rose-600",
      hover: "hover:bg-rose-600",
      ring: "focus:ring-rose-500",
      badge: "bg-rose-50/50 border border-rose-100 text-rose-700",
    },
    amber: {
      bg: "bg-amber-50/70",
      border: "border-amber-100",
      text: "text-amber-600",
      light: "bg-amber-50",
      dark: "bg-amber-600",
      hover: "hover:bg-amber-600",
      ring: "focus:ring-amber-500",
      badge: "bg-amber-50/50 border border-amber-100 text-amber-700",
    },
  };

  const colors = colorConfig[color] || colorConfig.blue;

  const resetForm = () => {
    setFormData({});
    setIsAdding(false);
    setEditingId(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      const requiredFields = fields.filter(f => f.required);
      const missingFields = requiredFields.filter(f => !formData[f.name]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
      }

      // Remove system fields before sending
      const { _id, __v, ...payload } = formData;

      if (editingId) {
        await onUpdate({ id: editingId, data: payload });
      } else {
        await onAdd(payload);
      }
      resetForm();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      setError(errorMessage);
      console.error(`${title} Error:`, err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData(item);
    setIsAdding(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${title.slice(0, -1).toLowerCase()}?`)) {
      try {
        await onDelete(id);
      } catch (err) {
        setError(err?.message || "Failed to delete");
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatFieldValue = (value, field) => {
    if (!value) return 'Not specified';
    if (field.type === 'date') {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-slate-100 rounded-xl"></div>
            <div className="h-5 bg-slate-100 rounded w-1/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-14 bg-slate-50/50 rounded-xl"></div>
            <div className="h-14 bg-slate-50/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center`}>
            <Icon size={16} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        </div>
        <span className={`text-[11px] font-bold ${colors.badge} px-2.5 py-0.5 rounded-full`}>
          {items.length} {items.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50/80 border border-red-150 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-800">Error</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-650"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-slate-50/40 rounded-xl border border-gray-100 overflow-hidden group"
              >
                {/* Main item header - always visible */}
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(item._id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-700 text-sm">
                          {item[fields[0]?.name] || 'Unnamed'}
                        </span>
                        {fields.slice(1, 3).map(field => {
                          if (item[field.name]) {
                            return (
                              <span key={field.name} className={`text-[10px] ${colors.badge} px-2 py-0.5 rounded-md font-bold`}>
                                {item[field.name]}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                        {expandedItems[item._id] ? (
                          <span className="flex items-center gap-1 font-semibold">
                            <ChevronUp size={12} /> Show less
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-semibold">
                            <ChevronDown size={12} /> Show details
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                        className="p-1.5 text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedItems[item._id] && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-slate-50/80">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {fields.map((field) => {
                        if (field.name === fields[0]?.name) return null;
                        return (
                          <div key={field.name} className="col-span-2 md:col-span-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">{field.label}</span>
                            <span className="font-semibold text-gray-700">
                              {formatFieldValue(item[field.name], field)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && !isAdding && (
          <div className="mb-6 p-8 bg-white border border-dashed border-slate-100 rounded-xl text-center">
            <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <Icon size={24} className={colors.text} />
            </div>
            <h4 className="font-bold text-gray-700 mb-1 text-sm">No {title} Yet</h4>
            <p className="text-xs text-gray-400 mb-4">{emptyMessage}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="bg-slate-50/50 p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                {editingId ? 'Edit Record' : 'Add New Record'}
              </h4>
              
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-[10px] font-bold text-gray-405 uppercase tracking-wider mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-sm font-medium text-gray-700"
                        required={field.required}
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-sm font-medium text-gray-700 resize-none"
                        rows="3"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-sm font-medium text-gray-700"
                        required={field.required}
                        min={field.type === "number" ? 0 : undefined}
                        step={field.type === "number" ? "1" : undefined}
                      />
                    )}
                    
                    {field.helpText && (
                      <p className="mt-1 text-[10px] text-gray-400 font-semibold">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={localLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 text-xs"
                >
                  {localLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      {editingId ? 'Update' : 'Add'} {title.slice(0, -1)}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-xs text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Add Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-dashed border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-slate-50 rounded-xl transition-colors font-bold text-xs"
          >
            <Plus size={16} />
            Add {title.slice(0, -1)}
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicalProfileSection;