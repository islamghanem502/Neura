import React, { useState } from 'react';
import { X } from 'lucide-react';

export const TagInput = ({ label, placeholder, value, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag].join(', '));
      setInputValue('');
    } else {
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove).join(', '));
  };

  return (
    <div className="flex flex-col">
      <label className="text-[11px] font-bold text-slate-700 mb-2 block uppercase tracking-wider">{label}</label>
      <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-2 min-h-[46px] flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        {tags.map((tag, index) => (
          <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 animate-in zoom-in-50 duration-200 shadow-sm border border-blue-200/50">
            {tag}
            <button type="button" onClick={() => removeTag(index)} className="hover:bg-blue-200 p-0.5 rounded-md transition-colors text-blue-600 hover:text-blue-800">
              <X size={12} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          className="flex-1 bg-transparent min-w-[120px] text-[13px] font-medium text-slate-700 px-2 py-1.5 focus:outline-none placeholder:text-slate-400"
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
        />
      </div>
    </div>
  );
};
