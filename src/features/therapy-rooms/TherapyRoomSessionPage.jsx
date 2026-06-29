import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../providers/AuthProvider';
import {
  Mic, MicOff, PhoneOff, Users, Shield,
  Hand, Volume2, ArrowLeft, Leaf, Smile, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TherapyRoomSessionPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { role, user: currentUser } = useAuthContext();
  
  const [localMuted, setLocalMuted] = useState(true);
  const [localHandRaised, setLocalHandRaised] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const [duration, setDuration] = useState(1440);
  const [breathText, setBreathText] = useState('Inhale Comfort');
  const [breathScale, setBreathScale] = useState(false);

  const getRedirectPath = () => {
    return role === 'doctor' 
      ? '/dashboard/doctor/therapy-rooms' 
      : '/dashboard/patient/therapy-groups';
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const pool = localMuted ? [0, 1, 2, 3] : [0, 1, 2, 3, 4];
      const randomSpeaker = pool[Math.floor(Math.random() * pool.length)];
      setActiveSpeaker(randomSpeaker);
    }, 5000);

    const durTimer = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(durTimer);
    };
  }, [localMuted]);

  useEffect(() => {
    const sequence = [
      { text: 'Breathe In Gently', time: 4000, scale: true },
      { text: 'Hold the Peace', time: 4000, scale: true },
      { text: 'Breathe Out Softly', time: 4000, scale: false },
    ];
    let idx = 0;
    let timeoutId;

    const runSequence = () => {
      setBreathText(sequence[idx].text);
      setBreathScale(sequence[idx].scale);
      const nextDelay = sequence[idx].time;
      idx = (idx + 1) % sequence.length;
      timeoutId = setTimeout(runSequence, nextDelay);
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // قائمة الأعضاء بألوان الباستيل الناعمة والمتساوية والمستوحاة من image_d85819.png
  const participants = [
    {
      id: 0,
      name: 'Dr. Layla Hassan',
      role: 'doctor',
      isHost: true,
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      isMuted: false,
      handRaised: false,
      bgColor: 'bg-[#DCE4FA]', // أزرق باستيل هادئ جداً ومريح
      textColor: 'text-[#3B5284]'
    },
    {
      id: 1,
      name: 'Ahmed Mansour',
      role: 'patient',
      isHost: false,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isMuted: true,
      handRaised: false,
      bgColor: 'bg-[#FCF5E3]', // أصفر كريمي دافئ ولطيف
      textColor: 'text-[#7C6335]'
    },
    {
      id: 2,
      name: 'Nora Al-Fayed',
      role: 'patient',
      isHost: false,
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      isMuted: false,
      handRaised: false,
      bgColor: 'bg-[#FADED7]', // وردي باستيل ناعم ودافئ
      textColor: 'text-[#844F41]'
    },
    {
      id: 3,
      name: 'Youssef Karim',
      role: 'patient',
      isHost: false,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isMuted: true,
      handRaised: true,
      bgColor: 'bg-[#DCE4FA]', // أزرق باستيل
      textColor: 'text-[#3B5284]'
    },
    {
      id: 4,
      name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'You',
      role: role || 'patient',
      isHost: role === 'doctor',
      profileImage: currentUser?.profileImage || null,
      isMuted: localMuted,
      handRaised: localHandRaised,
      bgColor: 'bg-[#FCF5E3]', // أصفر كريمي لطيف للمستخدم الحالي
      textColor: 'text-[#7C6335]'
    }
  ];

  const handleToggleMute = () => {
    setLocalMuted(!localMuted);
    if (localMuted) {
      toast.success('Your microphone is now LIVE');
    } else {
      toast.success('Microphone muted');
    }
  };

  const handleToggleHand = () => {
    setLocalHandRaised(!localHandRaised);
    if (!localHandRaised) {
      toast.success('You raised your hand ✋');
    }
  };

  const handleLeave = () => {
    toast.success('Session exited successfully');
    navigate(getRedirectPath());
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#4A3E3D] flex flex-col font-sans selection:bg-[#FADED7]">
      
      {/* ── Header لطيف وبسيط ── */}
      <header className="px-6 py-4 border-b border-[#EAE6DF] flex items-center justify-between bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeave}
            className="p-2 rounded-2xl bg-[#F1EDE6] hover:bg-[#E6E0D5] text-[#6E5E5D] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-[#4A3E3D]">Cozy Safe Space</h1>
              <span className="text-[10px] text-[#8C7674] font-medium bg-[#EFECE6] px-2 py-0.5 rounded-full">
                {roomCode || '237999'}
              </span>
            </div>
            <p className="text-xs text-[#8C7674] flex items-center gap-1 mt-0.5">
              <Leaf size={12} className="text-[#A4BCA2]" /> A cute, quiet place to feel better
            </p>
          </div>
        </div>

        <div className="text-xs text-[#6E5E5D] bg-[#F1EDE6] px-3 py-1.5 rounded-xl font-medium">
          Time: {formatTime(duration)}
        </div>
      </header>

      {/* ── Main Content Grid ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* صندوق دليل التنفس اللطيف بنفس حجم كروت الحضور لإعطاء توازن بصرى محبب */}
        <div className="bg-[#EAECE6] rounded-3xl p-5 flex flex-col justify-between items-center text-center border border-white">
          <div className="text-[#6D786B] flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
            <Sparkles size={12} />
            <span>Little Breather</span>
          </div>
          
          <div className="flex flex-col items-center my-auto">
            <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform duration-[4000ms] ease-in-out shadow-sm ${
              breathScale ? 'scale-110' : 'scale-95'
            }`}>
              <Smile size={32} className="text-[#A4BCA2]" />
            </div>
            <h3 className="text-xs font-semibold text-[#4A3E3D] mt-4 tracking-wide">
              {breathText}
            </h3>
          </div>

          <p className="text-[11px] text-[#858C84] leading-normal">
            Take a soft breath with the circle.
          </p>
        </div>

        {/* شبكة الأعضاء (كروت متساوية الحجم تماماً بستايل مبهج ولطيف) */}
        {participants.map((person) => {
          const isSpeaking = activeSpeaker === person.id && !person.isMuted;

          return (
            <div
              key={person.id}
              className={`rounded-3xl p-5 flex flex-col justify-between relative transition-all duration-300 border ${person.bgColor} ${person.textColor} ${
                isSpeaking 
                  ? 'border-white ring-4 ring-[#EAE6DF] scale-[1.02] shadow-sm' 
                  : 'border-transparent'
              }`}
            >
              {/* الجزء العلوي للكارت */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/60 shadow-sm">
                    {person.profileImage ? (
                      <img src={person.profileImage} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/40 flex items-center justify-center text-lg font-bold">
                        {person.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wide">
                      {person.name}
                    </h3>
                    <p className="text-[10px] opacity-70 mt-0.5">
                      {person.isHost ? 'Friendly Therapist' : 'Listener'}
                    </p>
                  </div>
                </div>

                {/* الحالات والإشارات اللطيفة */}
                <div className="flex flex-col items-end gap-1">
                  {person.isHost && (
                    <span className="text-[9px] font-bold bg-white/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Host
                    </span>
                  )}
                  {person.handRaised && (
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold shadow-sm animate-bounce">
                      ✋ Raised
                    </span>
                  )}
                </div>
              </div>

              {/* الجزء السفلي للكارت */}
              <div className="flex items-center justify-between mt-6">
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60">
                  {person.role}
                </span>

                <div className="flex items-center gap-1.5">
                  {person.isMuted ? (
                    <div className="p-1.5 rounded-xl bg-white/40 opacity-60" title="Muted">
                      <MicOff size={12} />
                    </div>
                  ) : isSpeaking ? (
                    <div className="px-2 py-1 rounded-xl bg-white flex items-center gap-1 text-[9px] font-bold shadow-sm">
                      <Volume2 size={12} className="animate-pulse" />
                      <span>Speaking</span>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-xl bg-white/40" title="Mic Standby">
                      <Mic size={12} />
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}

      </main>

      {/* ── Footer التحكم ── */}
      <footer className="px-6 py-4 border-t border-[#EAE6DF] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className={`px-4 py-2.5 rounded-2xl transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5 shadow-sm ${
              localMuted
                ? 'bg-[#FADED7] text-[#844F41] hover:bg-[#F5CECE]'
                : 'bg-[#EAECE6] text-[#4D5A4A] hover:bg-[#DEE2D7]'
            }`}
          >
            {localMuted ? <MicOff size={14} /> : <Mic size={14} />}
            <span>{localMuted ? 'Unmute' : 'Muted'}</span>
          </button>

          <button
            onClick={handleToggleHand}
            className={`px-4 py-2.5 rounded-2xl transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5 shadow-sm ${
              localHandRaised
                ? 'bg-[#FCF5E3] text-[#7C6335]'
                : 'bg-[#F1EDE6] text-[#6E5E5D] hover:bg-[#E6E0D5]'
            }`}
          >
            <Hand size={14} />
            <span>{localHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
          </button>

          <div className="w-[1px] h-4 bg-[#EAE6DF]" />

          <button
            onClick={handleLeave}
            className="px-4 py-2.5 rounded-2xl bg-[#FADED7] text-[#844F41] hover:bg-[#EAA8A8] transition-colors active:scale-95 text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <PhoneOff size={14} />
            <span>Leave Space</span>
          </button>
        </div>
      </footer>
    </div>
  );
}