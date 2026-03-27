import { Activity } from 'lucide-react';

export default function LoadingOverlay({ message = 'Processing…' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-2xl border border-slate-100">
        {/* Pulsing logo icon */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <span className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-60" />
          <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-blue-600">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500 tracking-wide">{message}</p>
      </div>
    </div>
  );
}
