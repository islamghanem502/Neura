import React from 'react';
import { Heart, Brain, Wind, Droplets, Eye, Bone } from 'lucide-react';

const ORGANS = [
  { id: 'full', label: 'Full Body', icon: Bone },
  { id: 'brain', label: 'Brain', icon: Brain },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'kidneys', label: 'Kidney', icon: Droplets },
  { id: 'lung', label: 'Lungs', icon: Wind },
  { id: 'liver', label: 'Liver', icon: Eye },
];

export default function OrganNavBar({ selectedOrgan, onSelectOrgan }) {
  return (
    <div className="flex items-center gap-2 px-2 py-3 overflow-x-auto">
      {ORGANS.map((organ) => {
        const isActive = organ.id === 'full' ? !selectedOrgan : selectedOrgan === organ.id;
        const Icon = organ.icon;
        return (
          <button
            key={organ.id}
            onClick={() => onSelectOrgan(organ.id === 'full' ? null : organ.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white text-zinc-500 border border-zinc-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <Icon size={16} />
            {organ.label}
          </button>
        );
      })}
    </div>
  );
}
