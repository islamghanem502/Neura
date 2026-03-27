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
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      light: "bg-blue-100",
      dark: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
      hover: "hover:bg-blue-600",
      ring: "focus:ring-blue-500",
      badge: "bg-blue-100 text-blue-700",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      light: "bg-emerald-100",
      dark: "bg-emerald-600",
      gradient: "from-emerald-500 to-teal-500",
      hover: "hover:bg-emerald-600",
      ring: "focus:ring-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
      light: "bg-purple-100",
      dark: "bg-purple-600",
      gradient: "from-purple-500 to-pink-500",
      hover: "hover:bg-purple-600",
      ring: "focus:ring-purple-500",
      badge: "bg-purple-100 text-purple-700",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-600",
      light: "bg-rose-100",
      dark: "bg-rose-600",
      gradient: "from-rose-500 to-pink-500",
      hover: "hover:bg-rose-600",
      ring: "focus:ring-rose-500",
      badge: "bg-rose-100 text-rose-700",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-600",
      light: "bg-amber-100",
      dark: "bg-amber-600",
      gradient: "from-amber-500 to-orange-500",
      hover: "hover:bg-amber-600",
      ring: "focus:ring-amber-500",
      badge: "bg-amber-100 text-amber-700",
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
      <div className={`${colors.bg} rounded-2xl shadow-lg border ${colors.border} p-6`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 ${colors.light} rounded-xl`}></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-20 bg-white/50 rounded-xl"></div>
            <div className="h-20 bg-white/50 rounded-xl"></div>
            <div className="h-20 bg-white/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} rounded-2xl shadow-lg border ${colors.border} overflow-hidden hover:shadow-xl transition-all duration-300`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Icon size={20} />
            <h3 className="font-bold">{title}</h3>
          </div>
          <span className={`bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm`}>
            {items.length} {items.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                {/* Main item header - always visible */}
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(item._id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">
                          {item[fields[0]?.name] || 'Unnamed'}
                        </span>
                        {fields.slice(1, 3).map(field => {
                          if (item[field.name]) {
                            return (
                              <span key={field.name} className={`text-xs ${colors.badge} px-2 py-0.5 rounded-full`}>
                                {item[field.name]}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {expandedItems[item._id] ? (
                          <span className="flex items-center gap-1 text-xs">
                            <ChevronUp size={14} /> Show less
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs">
                            <ChevronDown size={14} /> Show details
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedItems[item._id] && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {fields.map((field) => {
                        if (field.name === fields[0]?.name) return null;
                        return (
                          <div key={field.name} className="col-span-2 md:col-span-1">
                            <span className="text-xs text-gray-500 block">{field.label}</span>
                            <span className="font-medium text-gray-800">
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
          <div className="mb-6 p-8 bg-white/50 rounded-xl text-center border-2 border-dashed border-gray-200">
            <div className={`w-16 h-16 ${colors.light} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon size={32} className={colors.text} />
            </div>
            <h4 className="font-semibold text-gray-700 mb-1">No {title} Yet</h4>
            <p className="text-sm text-gray-500 mb-4">{emptyMessage}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className={`bg-white p-5 rounded-xl border-2 ${colors.border} shadow-inner`}>
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <div className={`w-1 h-5 ${colors.dark} rounded-full`}></div>
                {editingId ? 'Edit Record' : 'Add New Record'}
              </h4>
              
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
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
                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
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
                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        required={field.required}
                        min={field.type === "number" ? 0 : undefined}
                        step={field.type === "number" ? "1" : undefined}
                      />
                    )}
                    
                    {field.helpText && (
                      <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={localLoading}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {localLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingId ? 'Update' : 'Add'} {title.slice(0, -1)}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
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
            className={`w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed ${colors.border} text-${color}-600 rounded-xl hover:bg-${color}-50 transition-all font-semibold group`}
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            Add {title.slice(0, -1)}
          </button>
        )}
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MedicalProfileSection;