import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus, Users, Mic, Hash, Clock, Flame, CheckCircle2,
  XCircle, Copy, Video, Loader2, X, ArrowRight, BarChart3,
  HeartHandshake, Shield, Link2, Crown
} from 'lucide-react';
import {
  createTherapyRoom,
  getActiveTherapyRooms,
  endTherapyRoom,
} from '../../../../api/therapyRoomService';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    waiting:  { color: 'bg-amber-100 text-amber-700 border-amber-200',  label: 'Waiting',  dot: 'bg-amber-400' },
    active:   { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Live', dot: 'bg-emerald-500 animate-pulse' },
    ended:    { color: 'bg-slate-100 text-slate-500 border-slate-200',  label: 'Ended',   dot: 'bg-slate-400' },
  };
  const s = map[status] || map.ended;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Create Room Modal ─────────────────────────────────────────────────────────
function CreateRoomModal({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', maxParticipants: 20, maxActiveMics: 3 });

  const { mutate, isPending } = useMutation({
    mutationFn: createTherapyRoom,
    onSuccess: (res) => {
      toast.success('Therapy room created!');
      qc.invalidateQueries({ queryKey: ['therapy-rooms'] });
      onClose(res.data);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create room'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Room title is required');
    mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn"
        style={{ boxShadow: '0 30px 80px -10px rgba(234,88,12,0.15), 0 0 0 1px rgba(0,0,0,0.06)' }}
      >
        {/* Warm gradient header */}
        <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 border-b border-orange-100">
          <button
            onClick={() => onClose(null)}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-all"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <HeartHandshake size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">New Therapy Room</h2>
              <p className="text-xs text-slate-500 font-medium">Create a safe space for your patients</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          {/* Room Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Room Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Anxiety Management Group"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Max Participants */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Max Participants
              </label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={2} max={100}
                  value={form.maxParticipants}
                  onChange={(e) => setForm((f) => ({ ...f, maxParticipants: +e.target.value }))}
                  className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                             focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Max Active Mics */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Active Mics
              </label>
              <div className="relative">
                <Mic size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={1} max={20}
                  value={form.maxActiveMics}
                  onChange={(e) => setForm((f) => ({ ...f, maxActiveMics: +e.target.value }))}
                  className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                             focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
            <Shield size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              You'll be assigned as the <strong>host</strong>. A unique room code will be generated for participants to join.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isPending ? 'Creating…' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Room Created Success Card ─────────────────────────────────────────────────
function RoomCreatedSuccess({ room, onClose }) {
  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    toast.success('Room code copied!');
  };
  const copyLink = () => {
    navigator.clipboard.writeText(room.roomLink);
    toast.success('Room link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn text-center"
        style={{ boxShadow: '0 30px 80px -10px rgba(16,185,129,0.20)' }}
      >
        <div className="px-7 pt-10 pb-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-1">Room Created!</h3>
          <p className="text-sm text-slate-500 font-medium">{room.title}</p>
        </div>

        <div className="px-7 py-6 space-y-4">
          {/* Room Code */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Room Code</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-3xl font-black text-orange-600 tracking-widest">{room.roomCode}</span>
              <button
                onClick={copyCode}
                className="p-2 rounded-xl bg-white border border-orange-200 text-orange-500 hover:bg-orange-50 transition-all"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Share link */}
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Link2 size={14} className="text-slate-400 shrink-0" />
              <span className="truncate text-xs font-medium">{room.roomLink}</span>
            </div>
            <Copy size={13} className="text-slate-400 shrink-0" />
          </button>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Max Participants', val: room.maxParticipants, icon: <Users size={14} /> },
              { label: 'Active Mics', val: room.maxActiveMics, icon: <Mic size={14} /> },
              { label: 'Status', val: 'Waiting', icon: <Clock size={14} /> },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <div className="text-slate-400 mb-1 flex justify-center">{s.icon}</div>
                <p className="text-sm font-black text-slate-800">{s.val}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wide font-bold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Room Card ─────────────────────────────────────────────────────────────────
function RoomCard({ room, onEnter, onEnd }) {
  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    toast.success('Room code copied!');
  };

  const duration = room.startedAt
    ? Math.floor((Date.now() - new Date(room.startedAt).getTime()) / 60000)
    : null;

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
         style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>

      {/* Warm top gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={room.status} />
              {duration !== null && room.status === 'active' && (
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={10} /> {duration}m
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-slate-800 truncate">{room.title}</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center shrink-0">
            <HeartHandshake size={18} className="text-orange-500" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: <Users size={12} />, label: `${room.participants?.length || 0}/${room.maxParticipants}`, sub: 'Joined' },
            { icon: <Mic size={12} />,   label: room.maxActiveMics, sub: 'Max Mics' },
            { icon: <Hash size={12} />,  label: room.roomCode, sub: 'Code' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
              <div className="text-slate-400 flex justify-center mb-0.5">{s.icon}</div>
              <p className="text-sm font-black text-slate-700">{s.label}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Analytics */}
        {room.analytics && (
          <div className="flex items-center gap-3 px-3 py-2 bg-amber-50 rounded-2xl mb-4 border border-amber-100">
            <BarChart3 size={13} className="text-amber-500 shrink-0" />
            <div className="flex gap-3 text-xs text-amber-700 font-medium">
              <span><strong>{room.analytics.totalJoined}</strong> total joined</span>
              <span className="text-amber-300">•</span>
              <span><strong>{room.analytics.peakConcurrent}</strong> peak</span>
            </div>
          </div>
        )}

        {/* Participants avatars */}
        {room.participants?.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {room.participants.slice(0, 4).map((p, i) => (
                <div key={p.userId || i}
                  className="w-7 h-7 rounded-full border-2 border-white overflow-hidden ring-1 ring-slate-100"
                  title={p.name}
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
              {room.participants.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500">
                  +{room.participants.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium">in the room</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          {(room.status === 'waiting' || room.status === 'active') && (
            <button
              onClick={() => onEnter(room.roomCode)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-md shadow-orange-100"
              style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
            >
              <Video size={14} /> Enter Session
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Copy size={13} /> Copy Code
            </button>
            {(room.status === 'waiting' || room.status === 'active') && (
              <button
                onClick={() => onEnd(room.roomId)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-red-200 text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
              >
                <XCircle size={13} /> End Room
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorTherapyRoomsPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['therapy-rooms'],
    queryFn: getActiveTherapyRooms,
    refetchInterval: 15000,
  });

  const { mutate: endRoom } = useMutation({
    mutationFn: endTherapyRoom,
    onSuccess: () => {
      toast.success('Room ended successfully');
      qc.invalidateQueries({ queryKey: ['therapy-rooms'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to end room'),
  });

  const rooms = data?.data || [];
  const activeCount = rooms.filter((r) => r.status === 'active').length;
  const waitingCount = rooms.filter((r) => r.status === 'waiting').length;

  const handleCreated = (room) => {
    setShowCreate(false);
    if (room) {
      setCreatedRoom(room);
      qc.invalidateQueries({ queryKey: ['therapy-rooms'] });
    }
  };

  const handleEnterRoom = (roomCode) => {
    navigate(`/dashboard/doctor/therapy-room/${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] px-6 py-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md shadow-orange-200">
                <HeartHandshake size={16} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Therapy Rooms</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-10">
              Create and manage your group therapy sessions
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            id="create-therapy-room-btn"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-orange-200"
            style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
          >
            <Plus size={18} />
            Create New Room
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Rooms', value: rooms.length, icon: <Video size={18} />, color: 'from-blue-400 to-indigo-500', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-100' },
            { label: 'Active Now', value: activeCount, icon: <Flame size={18} />, color: 'from-emerald-400 to-teal-500', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
            { label: 'Waiting', value: waitingCount, icon: <Clock size={18} />, color: 'from-amber-400 to-orange-500', bg: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-3xl p-5 flex items-center gap-4`}>
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-orange-400" />
            <p className="text-slate-400 font-medium text-sm">Loading rooms…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <XCircle size={40} className="mx-auto mb-3 text-rose-300" />
            <p className="text-slate-500 font-medium">Failed to load rooms. Please refresh.</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
              <HeartHandshake size={36} className="text-orange-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-700 mb-1">No rooms yet</h3>
              <p className="text-sm text-slate-400 font-medium max-w-xs">
                Create your first therapy room and share the code with your patients to get started.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
            >
              <Plus size={16} /> Create First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <RoomCard
                key={room._id || room.roomId}
                room={room}
                onEnter={(roomCode) => handleEnterRoom(roomCode, room.title)}
                onEnd={(roomId) => {
                  if (window.confirm('Are you sure you want to end this room?')) {
                    endRoom(roomId);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <CreateRoomModal onClose={handleCreated} />}
      {createdRoom && <RoomCreatedSuccess room={createdRoom} onClose={() => setCreatedRoom(null)} />}
    </div>
  );
}
