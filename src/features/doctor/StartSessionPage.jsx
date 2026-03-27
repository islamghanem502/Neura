import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, Building2, User, Loader2, AlertCircle,
  RefreshCw, FileText, ArrowRight, Mic, MicOff, Square,
  ChevronLeft, CheckCircle2, Stethoscope, Pill, AlertTriangle,
  Edit3, X, Plus, Zap, Brain, Activity, Save, RotateCcw,
  Volume2, Pause, Sparkles, Heart, Moon, Sun, Star, Wind, History
} from 'lucide-react';
import {
  getDoctorAppointments,
  startSessionAppointment,
  transcribeAudio,
  completeAppointment,
  updateVisitInfo
} from '../../api/appointmentService';
import { createMedicalRecord } from '../../api/medicalRecordService';
import PatientHistoryModal from './components/PatientHistoryModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
};
const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
};
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ─── Simple Smooth Wave Animation Component ───────────────────────────────────────────
const SmoothWave = ({ isActive, intensity = 1 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      timeRef.current += 0.015;
      const t = timeRef.current;

      // Simple, smooth, light waves
      const amp = isActive ? 12 * intensity : 4;
      const freq = 0.015;

      // Draw single smooth wave with light color
      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        const y = height / 2 + Math.sin(x * freq + t * 2.5) * amp;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = isActive ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = isActive ? 2 : 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [isActive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: isActive ? 0.6 : 0.3, transition: 'opacity 0.3s ease' }}
    />
  );
};

// ─── Simple Glowing Orb Animation ────────────────────────────────────────────────────
const SimpleGlow = ({ isActive, size = 120 }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`absolute rounded-full transition-all duration-500 ${isActive ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
          }`}
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
        }}
      />
    </div>
  );
};

// ─── PHASE 1: Waiting Room Card with Glass Morphism ───────────────────────────
const WaitingCard = ({ appt, onStartSession, isStarting, onViewHistory }) => {
  const { patient, clinic, scheduledDate, scheduledTime, appointmentNumber, appointmentType } = appt;
  const apptId = appt._id || appt.id;
  const todayAppt = isToday(scheduledDate);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <div className="relative p-6 bg-white/90 rounded-2xl m-[1px]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Animated avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
              {(patient?.fullName || patient?.name || 'P')
                .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            {todayAppt && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 justify-between mb-1">
              <div>
                <p className="font-bold text-slate-900 text-lg leading-tight">
                  {patient?.fullName || patient?.name || 'Unknown Patient'}
                </p>
                {patient?.phone && (
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {patient.phone}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                Checked In
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(scheduledDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(scheduledTime?.startTime)}
              </span>
              {clinic?.clinicName && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {clinic.clinicName}
                </span>
              )}
            </div>

            {appt.patientProvidedInfo?.reasonForVisit && (
              <div className="mt-3 relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/50 p-3 border border-slate-100">
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-indigo-600 text-xs uppercase tracking-wide mr-1.5">Reason:</span>
                  {appt.patientProvidedInfo.reasonForVisit}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {appointmentNumber && (
              <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                #{appointmentNumber}
              </span>
            )}
            {appointmentType && (
              <span className="capitalize bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                {appointmentType === 'inPerson' ? 'In-Person' : appointmentType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewHistory({ id: patient?._id || patient?.id, name: patient?.fullName || patient?.name })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm transition-all active:scale-95"
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => onStartSession(appt)}
              disabled={isStarting}
              className="relative inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-60 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              {isStarting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start Session
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PHASE 2: Fluid Medical Scribe Recorder ────────────────────────────────────
const MedicalScribeRecorder = ({ appt, onBack, onTranscribed, onViewHistory }) => {
  const [recordingState, setRecordingState] = useState('idle');
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  const isRecording = recordingState === 'recording';
  const isProcessing = recordingState === 'processing';

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);
    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = Math.abs(dataArray[i] - 128) / 128;
      if (v > max) max = v;
    }
    setAudioLevel(Math.min(max * 1.5, 1));
    animationRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      updateAudioLevel();

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
      mr.start(250);
      setRecordingState('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } catch {
      toast.error('Microphone access denied. Please allow microphone in your browser settings.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    setRecordingState('idle');
    setAudioLevel(0);
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    setRecordingState('processing');
    try {
      const result = await transcribeAudio({
        audioBlob,
        patientId: appt.patient?._id || appt.patient?.id || '',
        appointmentId: appt._id || appt.id,
      });
      onTranscribed(result.data || result);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Transcription failed. Please try again.');
      setRecordingState('idle');
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setElapsed(0);
    setRecordingState('idle');
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const patientName = appt.patient?.fullName || appt.patient?.name || 'Patient';

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 mb-6 transition-colors group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to waiting list
      </button>

      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 shadow-2xl">
        <SmoothWave isActive={isRecording} intensity={audioLevel} />

        <div className="relative z-10 p-8">
          {/* Patient Info */}
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
              {patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-lg">{patientName}</p>
              <p className="text-xs text-indigo-300">
                {formatDate(appt.scheduledDate)} · {formatTime(appt.scheduledTime?.startTime)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewHistory({ id: appt.patient?._id || appt.patient?.id, name: patientName })}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 transition-all focus:outline-none"
              >
                <History className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-xs font-semibold text-white">History</span>
              </button>
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  In Session
                </span>
              </div>
            </div>
          </div>

          {/* Main Recording Section */}
          <div className="text-center py-8">
            <div className="relative inline-block">
              <SimpleGlow isActive={isRecording} size={140} />
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 z-10"
                style={{
                  background: isRecording
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : isProcessing
                      ? 'linear-gradient(135deg, #4b5563, #374151)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: isRecording ? '0 0 30px rgba(239,68,68,0.3)' : '0 0 20px rgba(99,102,241,0.3)'
                }}
              >
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : isRecording ? (
                  <Square className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            {/* Timer and Status */}
            <div className="mt-6 space-y-2">
              <p className={`text-3xl font-mono font-bold ${isRecording ? 'text-red-400' : 'text-white'}`}>
                {formatDuration(elapsed)}
              </p>
              <p className={`text-sm font-semibold ${isRecording ? 'text-red-300' : isProcessing ? 'text-indigo-300' : 'text-slate-400'}`}>
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is analyzing...
                  </span>
                ) : isRecording ? (
                  'Recording in progress'
                ) : audioBlob ? (
                  'Recording ready for analysis'
                ) : (
                  'Tap the microphone to begin'
                )}
              </p>
              {!isRecording && !isProcessing && audioBlob && (
                <p className="text-xs text-indigo-300">Click "Analyze" to generate clinical notes</p>
              )}
            </div>

            {/* Simple Audio Level Visualization */}
            {isRecording && (
              <div className="mt-6 flex justify-center gap-1">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-indigo-400/40 rounded-full transition-all duration-100"
                    style={{
                      height: `${15 + Math.sin(i * 0.2 + Date.now() * 0.008) * 10 + audioLevel * 25}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            {!isRecording && !isProcessing && audioBlob && (
              <button
                onClick={handleSend}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg transition-all active:scale-[0.99]"
              >
                <Brain className="w-5 h-5" />
                Generate AI Clinical Summary
              </button>
            )}

            {!isRecording && !isProcessing && audioBlob && (
              <button
                onClick={reset}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Record Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Simple Floating Particles Component ─────────────────────────────────────────────
const SimpleParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let particles = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.3
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-20" />;
};

// ─── PHASE 3: Clinical Summary with Glass Morphism ────────────────────────────
const ClinicalSummaryEditor = ({ scribeData, appt, onBack, onSaved, isSaving, onViewHistory }) => {
  const [transcript] = useState(scribeData.transcript || '');
  const [symptoms, setSymptoms] = useState(scribeData.symptoms || []);
  const [diagnosis, setDiagnosis] = useState(scribeData.diagnosis || '');
  const [medications, setMedications] = useState(scribeData.treatment_plan?.medications || []);
  const [lifestyle, setLifestyle] = useState(scribeData.treatment_plan?.lifestyle_advice || '');
  const [summary, setSummary] = useState(scribeData.summary || '');
  const [followUp, setFollowUp] = useState(scribeData.follow_up || '');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const alerts = scribeData.alerts || {};
  const urgency = scribeData.urgency_level || 'routine';

  const urgencyColor = {
    routine: 'from-emerald-500 to-teal-500',
    urgent: 'from-amber-500 to-orange-500',
    emergency: 'from-red-500 to-pink-500',
  }[urgency] || 'from-slate-500 to-gray-500';

  const patientName = appt.patient?.fullName || appt.patient?.name || 'Patient';

  const TagList = ({ tags, onChange, color = 'blue' }) => {
    const [input, setInput] = useState('');
    const colors = {
      blue: 'from-blue-500 to-indigo-500',
      amber: 'from-amber-500 to-orange-500',
      red: 'from-red-500 to-pink-500',
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="group relative inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-100 to-white border border-slate-200 text-slate-700 transition-all hover:scale-105"
            >
              {tag}
              <button
                onClick={() => onChange(tags.filter((_, j) => j !== i))}
                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add item..."
            className="flex-1 text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
          <button
            onClick={() => {
              const val = input.trim();
              if (val && !tags.includes(val)) {
                onChange([...tags, val]);
                setInput('');
              }
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen pb-20">
      <SimpleParticles />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white text-slate-600 hover:text-slate-900 transition-all shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-black text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Clinical Summary
            </h2>
            <p className="text-slate-500 text-sm mt-1">{patientName} · Review and edit AI-generated notes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewHistory({ id: appt.patient?._id || appt.patient?.id, name: patientName })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold shadow-sm transition-all"
            >
              <History className="w-4 h-4" />
              History
            </button>
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${urgencyColor} text-white text-xs font-bold shadow-lg capitalize`}>
              {urgency}
            </div>
          </div>
        </div>

        {/* AI Badge */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-indigo-900">AI-Generated Clinical Notes</p>
              <p className="text-xs text-indigo-600 mt-1">All fields are editable. Review carefully and correct any AI errors before saving.</p>
            </div>
            <button
              onClick={() => setShowTranscript(p => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-indigo-200 text-xs font-semibold text-indigo-600 hover:bg-white transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              {showTranscript ? 'Hide Transcript' : 'View Transcript'}
            </button>
          </div>
        </div>

        {/* Transcript */}
        {showTranscript && transcript && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 border border-slate-700 shadow-xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Mic className="w-3 h-3" />
              Audio Transcript
            </p>
            <p className="text-sm text-slate-300 leading-relaxed italic">"{transcript}"</p>
          </div>
        )}

        {/* Alerts */}
        {alerts.drug_interactions?.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 text-sm">Drug Interaction Warning</p>
                {alerts.drug_interactions.map((d, i) => (
                  <p key={i} className="text-xs text-red-600 mt-1">⚠️ {d}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Editable Sections with Glass Cards */}
        {[
          { icon: Activity, title: 'Symptoms', color: 'blue', component: TagList, props: { tags: symptoms, onChange: setSymptoms } },
          { icon: Stethoscope, title: 'Diagnosis', color: 'indigo', component: 'input', props: { value: diagnosis, onChange: e => setDiagnosis(e.target.value), placeholder: 'Enter diagnosis...' } },
          { icon: Pill, title: 'Medications', color: 'amber', component: TagList, props: { tags: medications, onChange: setMedications } },
          { icon: Edit3, title: 'Lifestyle Advice', color: 'emerald', component: 'textarea', props: { value: lifestyle, onChange: e => setLifestyle(e.target.value), rows: 2, placeholder: 'Lifestyle and behavioral advice...' } },
          { icon: FileText, title: 'Clinical Summary', color: 'purple', component: 'textarea', props: { value: summary, onChange: e => setSummary(e.target.value), rows: 4, placeholder: 'Clinical summary...' } },
          { icon: Calendar, title: 'Follow-Up', color: 'teal', component: 'input', props: { value: followUp, onChange: e => setFollowUp(e.target.value), placeholder: 'e.g., in 2 weeks' } },
          { icon: FileText, title: 'Doctor Notes', color: 'slate', component: 'textarea', props: { value: doctorNotes, onChange: e => setDoctorNotes(e.target.value), rows: 4, placeholder: 'Additional doctor notes or findings...' } },
        ].map((section, idx) => (
          <div
            key={idx}
            className={`rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${activeSection === idx ? 'scale-[1.01]' : ''
              }`}
            onMouseEnter={() => setActiveSection(idx)}
            onMouseLeave={() => setActiveSection(null)}
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-r from-${section.color}-100 to-${section.color}-50 flex items-center justify-center`}>
                <section.icon className={`w-4 h-4 text-${section.color}-600`} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{section.title}</h3>
            </div>
            <div className="p-6">
              {section.component === TagList ? (
                <TagList {...section.props} color={section.color} />
              ) : section.component === 'input' ? (
                <input
                  {...section.props}
                  className="w-full text-sm px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-slate-800 font-medium transition-all"
                />
              ) : (
                <textarea
                  {...section.props}
                  className="w-full text-sm px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 resize-none text-slate-700 leading-relaxed transition-all"
                />
              )}
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Record Again
          </button>
          <button
            onClick={() => {
              const compiled = {
                symptoms,
                diagnosis,
                prescription: {
                  medications: medications.map(m => typeof m === 'string' ? { name: m, dose: 'not specified', frequency: 'not specified', duration: 'not specified', notes: '' } : m),
                  lifestyle_advice: lifestyle
                },
                summary,
                follow_up: followUp,
                urgency_level: urgency,
                alerts
              };
              onSaved(compiled, doctorNotes);
            }}
            disabled={isSaving}
            className="flex-[2] py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? 'Saving & Completing...' : 'Save Clinical Notes & Complete Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page with Unique Design ─────────────────────────────────────────────
export default function StartSessionPage() {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState('list');
  const [activeAppt, setActiveAppt] = useState(null);
  const [scribeResult, setScribeResult] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);

  const queryParams = {
    status: 'checkedIn',
    sortBy: 'scheduledDate',
    sortOrder: 'asc',
  };

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['doctorAppointments', queryParams],
    queryFn: () => getDoctorAppointments(queryParams),
  });

  const startSessionMutation = useMutation({
    mutationFn: startSessionAppointment,
    onMutate: (id) => setStartingId(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      setStartingId(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to start session');
      setStartingId(null);
      setActiveAppt(null);
      setPhase('list');
    },
  });

  const handleStartSession = async (appt) => {
    const id = appt._id || appt.id;
    setActiveAppt(appt);
    try {
      await startSessionMutation.mutateAsync(id);
      setPhase('record');
    } catch {
      // handled in onError
    }
  };

  const handleTranscribed = (data) => {
    setScribeResult(data);
    setPhase('review');
  };

  const saveSessionMutation = useMutation({
    mutationFn: async ({ compiled, doctorNotes }) => {
      const id = activeAppt._id || activeAppt.id;

      // Create medical record matching the API structure (this is the primary data save)
      await createMedicalRecord({
        appointmentId: id,
        aiSummary: compiled,
        doctorNotes: doctorNotes
      });

      // Complete appointment status
      await completeAppointment(id);
    },
    onSuccess: () => {
      toast.success('Session completed successfully!', { icon: '🎉' });
      setPhase('done');
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save notes. Please try again.');
    }
  });

  const handleSave = (compiled, doctorNotes) => {
    saveSessionMutation.mutate({ compiled, doctorNotes });
  };

  const appointments = data?.data || [];

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Session Complete
          </h2>
          <p className="text-slate-500">
            Clinical notes for <strong>{activeAppt?.patient?.fullName || 'this patient'}</strong> have been saved.
          </p>
        </div>
        <button
          onClick={() => { setPhase('list'); setActiveAppt(null); setScribeResult(null); }}
          className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all"
        >
          Back to Waiting List
        </button>
      </div>
    );
  }

  if (phase === 'record' && activeAppt) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
        <MedicalScribeRecorder
          appt={activeAppt}
          onBack={() => { setPhase('list'); setActiveAppt(null); }}
          onTranscribed={handleTranscribed}
          onViewHistory={setHistoryPatient}
        />
      </div>
    );
  }

  if (phase === 'review' && scribeResult) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
        <ClinicalSummaryEditor
          scribeData={scribeResult}
          appt={activeAppt}
          onBack={() => setPhase('record')}
          onSaved={handleSave}
          isSaving={saveSessionMutation.isPending}
          onViewHistory={setHistoryPatient}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <SimpleParticles />

      <div className="relative z-10 flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Start Session
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Checked-in patients ready for consultation · AI medical scribe available
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 text-slate-600 text-sm font-semibold hover:bg-white transition-all shadow-lg"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-purple-500' : ''} />
            Refresh
          </button>
        </div>

        {/* AI Scribe Info Banner with Animation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-2xl">
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" style={{ animation: 'shimmer 2s infinite' }} />
          <div className="relative flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">AI Medical Scribe Enabled</p>
              <p className="text-indigo-100 text-sm mt-1">
                Record the consultation in Arabic and get instant clinical notes — transcript, diagnosis, medications, and follow-up.
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-white/60 animate-pulse" />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 rounded-full" />
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-500">Loading checked-in patients...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="font-bold text-slate-800">Failed to load patients</p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              {error?.response?.data?.message || 'Please try again.'}
            </p>
            <button onClick={() => refetch()} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-all">
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && appointments.length === 0 && (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 p-16 text-center shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No patients waiting</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              No patients are checked in yet. Go to <strong className="text-indigo-600">Appointments</strong> to confirm and check-in arriving patients.
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && !error && appointments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{appointments.length}</span> patient{appointments.length !== 1 ? 's' : ''} waiting
              </p>
              {isFetching && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
            </div>
            {appointments.map((appt, idx) => (
              <WaitingCard
                key={appt._id || appt.id || idx}
                appt={appt}
                onStartSession={handleStartSession}
                isStarting={startingId === (appt._id || appt.id) && startSessionMutation.isPending}
                onViewHistory={setHistoryPatient}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(100%) skewX(-12deg); }
        }
      `}</style>

      {/* History Modal */}
      <PatientHistoryModal
        patientId={historyPatient?.id}
        patientName={historyPatient?.name}
        isOpen={!!historyPatient}
        onClose={() => setHistoryPatient(null)}
      />
    </div>
  );
}