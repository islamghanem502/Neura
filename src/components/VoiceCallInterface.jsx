import React, { useEffect } from 'react';
import { useAgora } from '../hooks/useAgora';
import {
  Mic, MicOff, PhoneOff, Users, Shield, Radio,
  Loader2, AlertCircle, HeartHandshake, User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceCallInterface({ roomData, onClose }) {
  const {
    isConnected,
    isMuted,
    remoteUsers,
    error,
    joinChannel,
    leaveChannel,
    muteAudio,
  } = useAgora();

  const { agoraAppId, channelName, agoraToken, uid, title, role } = roomData;

  useEffect(() => {
    if (agoraAppId && channelName && agoraToken) {
      joinChannel(agoraAppId, channelName, agoraToken, uid)
        .then(() => {
          toast.success('Connected to voice channel!');
        })
        .catch(() => {
          toast.error('Failed to connect to audio streaming');
        });
    }
  }, [agoraAppId, channelName, agoraToken, uid, joinChannel]);

  const handleToggleMute = async () => {
    try {
      await muteAudio(!isMuted);
      if (isMuted) {
        toast.success('Microphone is now LIVE');
      } else {
        toast.success('Microphone muted');
      }
    } catch {
      toast.error('Could not access microphone');
    }
  };

  const handleLeave = async () => {
    await leaveChannel();
    toast.success('Left voice room');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 text-white animate-fadeIn"
        style={{ boxShadow: '0 30px 100px -10px rgba(244,63,94,0.15)' }}
      >
        {/* Call Header */}
        <div className="px-8 pt-8 pb-6 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-900/30 animate-pulse">
              <Radio size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 tracking-tight">{title || 'Therapy Room'}</h2>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                <Shield size={10} className="text-rose-400" />
                Moderated Session
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black rounded-full uppercase tracking-wider">
            Live
          </div>
        </div>

        {/* Call Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Connection status overlay */}
          {!isConnected && !error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 size={36} className="animate-spin text-rose-500" />
              <p className="text-slate-400 font-bold text-sm tracking-wide">Connecting to secure audio channel…</p>
            </div>
          ) : (
            <>
              {/* Speaker Visualizer Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Local user */}
                <div className={`relative bg-slate-900/80 rounded-3xl p-5 border text-center transition-all duration-300 ${!isMuted ? 'border-rose-500/50 shadow-lg shadow-rose-950/20' : 'border-slate-800'}`}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mx-auto mb-3 relative">
                    <User size={24} className="text-slate-300" />
                    {!isMuted && (
                      <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-200">You</h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">{role || 'Participant'}</p>
                  
                  <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${isMuted ? 'bg-slate-600' : 'bg-rose-500 animate-pulse'}`} />
                </div>

                {/* Remote users */}
                {remoteUsers.map((user) => (
                  <div key={user.uid} className="relative bg-slate-900/80 rounded-3xl p-5 border border-slate-800 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mx-auto mb-3 relative">
                      <User size={24} className="text-slate-300" />
                      {user.hasAudio && (
                        <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-200">User {user.uid}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Speaker</p>
                    
                    <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${user.hasAudio ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                  </div>
                ))}

                {remoteUsers.length === 0 && (
                  <div className="bg-slate-900/40 rounded-3xl p-5 border border-slate-800/40 border-dashed flex flex-col items-center justify-center text-center">
                    <Users size={20} className="text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Waiting for others to join…</p>
                  </div>
                )}
              </div>

              {/* Call Guidelines */}
              <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-800/80">
                <HeartHandshake size={16} className="text-rose-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Please be respectful. Mute your microphone when you aren't speaking to keep the channel clean for everyone.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Call Controls Footer */}
        <div className="px-8 py-6 bg-slate-950 border-t border-slate-900 flex items-center justify-center gap-4">
          <button
            onClick={handleToggleMute}
            disabled={!isConnected}
            className={`p-4 rounded-full transition-all active:scale-95 ${
              isMuted
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-900/30'
            }`}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          
          <button
            onClick={handleLeave}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 hover:rotate-135 transition-all duration-300 active:scale-95 shadow-lg shadow-red-900/30"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
