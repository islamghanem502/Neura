import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Users, Mic, Hash, Clock, Flame, ArrowRight, HeartHandshake,
  Loader2, Search, KeyRound, CheckCircle2, X, Shield, Link2,
  Copy, RefreshCw, BarChart3, UserCheck, Sparkles
} from 'lucide-react';
import { useAuthContext } from '../../../providers/AuthProvider';
import { getActiveTherapyRooms, joinTherapyRoom } from '../../../api/therapyRoomService';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    waiting: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Waiting', dot: 'bg-amber-400' },
    active:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Live Now', dot: 'bg-emerald-500 animate-pulse' },
    ended:   { color: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Ended', dot: 'bg-slate-400' },
  };
  const s = map[status] || map.ended;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Join by Code Modal ────────────────────────────────────────────────────────
function JoinByCodeModal({ onClose, onJoined }) {
  const [code, setCode] = useState('');
  const { mutate, isPending } = useMutation({
    mutationFn: () => joinTherapyRoom(code.trim()),
    onSuccess: (res) => {
      toast.success('Joined room successfully!');
      onJoined(res.data);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to join room'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn"
        style={{ boxShadow: '0 30px 80px -10px rgba(234,88,12,0.15), 0 0 0 1px rgba(0,0,0,0.06)' }}
      >
        <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-b border-orange-100">
          <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-all">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-200">
              <KeyRound size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Join a Room</h2>
              <p className="text-xs text-slate-500 font-medium">Enter the code from your therapist</p>
            </div>
          </div>
        </div>

        <div className="px-7 py-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Room Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-center text-2xl font-black tracking-[0.3em] text-slate-800
                         focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 focus:bg-white transition-all placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal placeholder:font-normal"
            />
          </div>

          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
            <Shield size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">Your therapist will share a 6-digit code for their therapy session.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button
              onClick={() => mutate()}
              disabled={isPending || code.length < 4}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isPending ? 'Joining…' : 'Join Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Joined Success Card ───────────────────────────────────────────────────────
function JoinedSuccess({ room, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn text-center"
        style={{ boxShadow: '0 30px 80px -10px rgba(16,185,129,0.20)' }}
      >
        <div className="px-7 pt-10 pb-5 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-1">You're In!</h3>
          <p className="text-sm text-slate-500 font-medium">{room.title}</p>
        </div>

        <div className="px-7 py-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Participants', val: room.participants?.length || 0, icon: <Users size={13} /> },
              { label: 'Max Mics', val: room.maxActiveMics, icon: <Mic size={13} /> },
              { label: 'Code', val: room.roomCode, icon: <Hash size={13} /> },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 text-center">
                <div className="text-slate-400 flex justify-center mb-0.5">{s.icon}</div>
                <p className="text-sm font-black text-slate-700">{s.val}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 bg-blue-50 rounded-2xl border border-blue-100 text-left">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              🎧 You've joined the session. Your therapist will guide the conversation. Please keep your mic muted unless prompted.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Room Card ─────────────────────────────────────────────────────────────────
function RoomCard({ room, onJoin }) {

  const duration = room.startedAt
    ? Math.floor((Date.now() - new Date(room.startedAt).getTime()) / 60000)
    : null;

  const isFull = room.participantCount >= room.maxParticipants;
  const canJoin = room.status === 'active' || room.status === 'waiting';

  return (
    <div
      className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}
    >
      {/* Warm gradient top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400" />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-orange-50/60 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <StatusBadge status={room.status} />
              {duration !== null && room.status === 'active' && (
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={10} /> {duration}m
                </span>
              )}
              {isFull && (
                <span className="text-[11px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">Full</span>
              )}
            </div>
            <h3 className="text-base font-black text-slate-800 truncate">{room.title}</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center shrink-0">
            <HeartHandshake size={18} className="text-orange-500" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: <Users size={12} />, label: `${room.participantCount || room.participants?.length || 0}/${room.maxParticipants}`, sub: 'Joined' },
            { icon: <Mic size={12} />,   label: room.maxActiveMics, sub: 'Active Mics' },
            { icon: <Hash size={12} />,  label: room.roomCode, sub: 'Code' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
              <div className="text-slate-400 flex justify-center mb-0.5">{s.icon}</div>
              <p className="text-sm font-black text-slate-700">{s.label}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Participants */}
        {room.participants?.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {room.participants.slice(0, 4).map((p, i) => (
                <div
                  key={p.userId || i}
                  className="w-7 h-7 rounded-full border-2 border-white overflow-hidden ring-1 ring-slate-100"
                  title={`${p.name}${p.role === 'doctor' ? ' (Doctor)' : ''}`}
                >
                  {p.profileImage ? (
                    <img src={p.profileImage} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-300 to-rose-400 flex items-center justify-center text-white text-[9px] font-black">
                      {p.name?.[0] || '?'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 font-medium">
                {room.participants.find((p) => p.role === 'doctor') ? (
                  <span className="flex items-center gap-1">
                    <UserCheck size={11} className="text-emerald-500" />
                    <span>Therapist present</span>
                  </span>
                ) : 'In session'}
              </span>
            </div>
          </div>
        )}

        {/* Join button */}
        <button
          onClick={() => onJoin(room.roomCode)}
          disabled={!canJoin || isFull}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: canJoin && !isFull ? 'linear-gradient(135deg, #f97316, #e11d48)' : undefined }}
          {...(!canJoin || isFull ? { style: { background: '#e2e8f0', color: '#94a3b8' } } : {})}
        >
          {isFull ? (
            'Room Full'
          ) : !canJoin ? (
            'Room Ended'
          ) : (
            <><ArrowRight size={15} /> Join Session</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TherapyGroupsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['therapy-rooms'],
    queryFn: getActiveTherapyRooms,
    refetchInterval: 20000,
  });

  const rooms = (data?.data || []).filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Hero header ── */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-7"
          style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 40%, #fff1f2 100%)', border: '1px solid #fed7aa' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl bg-rose-200/40 -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-20 w-32 h-32 rounded-full blur-2xl bg-amber-200/40" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md shadow-orange-200">
                  <HeartHandshake size={18} className="text-white" />
                </div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                  Group Therapy
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                Therapy Rooms
              </h1>
              <p className="text-sm text-slate-500 font-medium max-w-md">
                Join a live group session hosted by your therapist, or enter a room code to connect directly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-orange-200 bg-white text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all"
              >
                <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                id="join-by-code-btn"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-orange-200"
                style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
              >
                <KeyRound size={16} />
                Join by Code
              </button>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search therapy rooms…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
          />
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-orange-400" />
            <p className="text-slate-400 font-medium text-sm">Loading rooms…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <X size={28} className="text-red-400" />
            </div>
            <p className="text-slate-500 font-medium mb-4">Failed to load therapy rooms.</p>
            <button onClick={() => refetch()} className="px-5 py-2 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all">
              Try Again
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                <HeartHandshake size={36} className="text-orange-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-700 mb-1">
                {search ? 'No rooms match your search' : 'No active rooms right now'}
              </h3>
              <p className="text-sm text-slate-400 font-medium max-w-xs">
                {search
                  ? 'Try a different search term or join by code.'
                  : 'Your therapist will create a room when a session starts. Check back soon or use a room code if you have one.'}
              </p>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-md shadow-orange-200"
              style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
            >
              <KeyRound size={15} /> Join by Code Instead
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4 px-1">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {rooms.map((room) => (
                <RoomCard
                  key={room._id || room.roomId}
                  room={room}
                  onJoin={(roomCode) => {
                    navigate(`/dashboard/patient/therapy-room/${roomCode}`);
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Info footer ── */}
        <div className="mt-10 flex items-start gap-3 px-5 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Shield size={16} className="text-orange-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            <strong className="text-slate-700">Safe & confidential.</strong> All therapy sessions are moderated by licensed professionals.
            Your participation is private and secure. Rooms automatically expire after 24 hours.
          </p>
        </div>
      </div>

      {showJoinModal && (
        <JoinByCodeModal
          onClose={() => setShowJoinModal(false)}
          onJoined={(room) => {
            setShowJoinModal(false);
            setJoinedRoom(room);
          }}
        />
      )}
      {joinedRoom && (
        <JoinedSuccess
          room={joinedRoom}
          onClose={() => {
            navigate(`/dashboard/patient/therapy-room/${joinedRoom.roomCode}`);
            setJoinedRoom(null);
          }}
        />
      )}
    </div>
  );
}
