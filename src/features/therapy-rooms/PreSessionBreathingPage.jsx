import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../providers/AuthProvider';

const CYCLE = 8000; // 4s inhale + 4s exhale
const TOTAL = 10000;

export default function PreSessionBreathingPage() {
  const { roomCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role } = useAuthContext();

  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState('Breathe In');
  const [countdown, setCountdown] = useState(10);

  // Breathing cycle
  useEffect(() => {
    setExpanded(true);
    setLabel('Breathe In');

    const toggle = setInterval(() => {
      setExpanded(p => {
        const next = !p;
        setLabel(next ? 'Breathe In' : 'Breathe Out');
        return next;
      });
    }, 4000);

    return () => clearInterval(toggle);
  }, []);

  // Countdown → navigate
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(tick);
          const dest = role === 'doctor'
            ? `/dashboard/doctor/therapy-room-session/${roomCode}`
            : `/dashboard/patient/therapy-room-session/${roomCode}`;
          navigate(dest + (searchParams.toString() ? `?${searchParams}` : ''), { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [navigate, role, roomCode, searchParams]);

  const goNow = () => {
    const dest = role === 'doctor'
      ? `/dashboard/doctor/therapy-room-session/${roomCode}`
      : `/dashboard/patient/therapy-room-session/${roomCode}`;
    navigate(dest + (searchParams.toString() ? `?${searchParams}` : ''), { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">

      {/* Orb */}
      <div
        className="rounded-full"
        style={{
          width:  expanded ? 220 : 120,
          height: expanded ? 220 : 120,
          background: 'radial-gradient(circle at 35% 30%, #a5f3fc, #818cf8)',
          boxShadow: expanded
            ? '0 0 80px rgba(129,140,248,0.35)'
            : '0 0 20px rgba(129,140,248,0.12)',
          transition: 'all 4s ease-in-out',
        }}
      />

      {/* Label */}
      <p
        className="mt-14 text-lg font-semibold tracking-widest uppercase"
        style={{ color: '#64748b', letterSpacing: '0.2em' }}
      >
        {label}
      </p>

      {/* Countdown */}
      <p className="mt-4 text-sm text-slate-400">
        Entering in <span className="text-slate-600 font-bold">{countdown}s</span>
      </p>

      {/* Skip */}
      <button
        onClick={goNow}
        className="mt-10 text-xs text-slate-300 hover:text-slate-500 transition-colors tracking-widest uppercase"
      >
        Skip
      </button>
    </div>
  );
}
