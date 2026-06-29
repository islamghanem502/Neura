import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Sparkles, Pill, FileText, CheckCircle2, Clock, Phone, PenLine, Hand, ShieldX,
  Plus, Edit3, Trash2, Download, Pause, PhoneCall, Shield, Activity, ActivitySquare, HeartPulse,
  Calendar, Play, PlayCircle, Mic, X, Loader2
} from 'lucide-react';
import { useDoctorAppointments, resolveAppointments } from '../../../../hooks/useAppointments';
import { transcribeAudio, completeAppointment } from '../../../../api/appointmentService';
import { createMedicalRecord } from '../../../../api/medicalRecordService';

import LiveSessionStep from '../components/session/LiveSessionStep';
import AIProcessingStep from '../components/session/AIProcessingStep';
import ReviewStep from '../components/session/ReviewStep';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPatientId = (appt) => {
  const p = appt?.patient;
  if (!p) return null;
  if (typeof p === 'string') return p;
  return p._id || p.id;
};

const defaultSummary = {
  symptoms: [],
  diagnosis: '',
  prescription: { medications: [], lifestyle_advice: '' },
  summary: '',
  follow_up: '',
  urgency_level: 'routine',
  transcript: '',
  alerts: {
    drug_interactions: [],
    allergy_conflicts: [],
    requires_immediate_attention: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function SessionPage() {
  const { apptId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useDoctorAppointments({ limit: 100 });
  const appt = resolveAppointments(data).find((a) => (a.id === apptId || a._id === apptId));
  const patientId = getPatientId(appt);

  const [step, setStep] = useState('session');
  
  const [isRecording, setIsRecording] = useState(false); // Wait for explicit start
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); 
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const isRecordingRef = useRef(false);

  const [aiSummary, setAiSummary] = useState(defaultSummary);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Guard to prevent duplicate medical record creation
  const recordSavedRef = useRef(false);

  // Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Actually start recording mic
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500);
      mediaRecorderRef.current = mr;
      isRecordingRef.current = true;
      setIsRecording(true);
      setIsPaused(false);
    } catch {
       toast.error('Microphone access denied or unvailable');
       // Fallback for demo so user doesn't get blocked
       setIsRecording(true);
       isRecordingRef.current = true;
       setIsPaused(false);
    }
  }, []);

  const handlePauseResume = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else if (mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      // In case we are simulating recording
      setIsPaused((p) => !p);
    }
  }, []);

  const handleEndSession = useCallback(() => {
    const mr = mediaRecorderRef.current;
    setStep('processing');

    if (!mr || mr.state === 'inactive' || !isRecordingRef.current) {
      setTimeout(() => setStep('review'), 1500);
      return;
    }

    mr.onstop = async () => {
      isRecordingRef.current = false;
      setIsRecording(false);
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (!patientId || !apptId) {
           setTimeout(() => setStep('review'), 1000);
           return;
        }

        const response = await transcribeAudio({ audioBlob: blob, patientId, appointmentId: apptId });
        const body    = response ?? {};
        const payload = body?.data ?? body;
        const ai      = payload?.aiSummary ?? payload ?? {};

        if (!ai.summary && !ai.symptoms && !ai.diagnosis) {
          toast.error('AI returned empty summary — please fill in manually');
          setStep('review');
          return;
        }

        setAiSummary({
          symptoms: Array.isArray(ai.symptoms) ? ai.symptoms : [],
          diagnosis: ai.diagnosis || '',
          prescription: {
            medications: Array.isArray(ai.prescription?.medications) ? ai.prescription.medications : [],
            lifestyle_advice: ai.prescription?.lifestyle_advice || '',
          },
          summary: ai.summary || '',
          follow_up: ai.follow_up || '',
          urgency_level: ai.urgency_level || 'routine',
          transcript: ai.transcript || '',
          alerts: {
            drug_interactions: Array.isArray(ai.alerts?.drug_interactions) ? ai.alerts.drug_interactions : [],
            allergy_conflicts: Array.isArray(ai.alerts?.allergy_conflicts) ? ai.alerts.allergy_conflicts : [],
            requires_immediate_attention: ai.alerts?.requires_immediate_attention ?? false,
          },
        });

        const sugs = [];
        if (Array.isArray(ai.ai_suggestions)) {
          ai.ai_suggestions.forEach((sug) => sugs.push({ text: sug }));
        }
        if (ai.prescription?.lifestyle_advice) sugs.push({ text: ai.prescription.lifestyle_advice });
        if (ai.follow_up) sugs.push({ text: ai.follow_up });
        if (Array.isArray(ai.alerts?.drug_interactions)) ai.alerts.drug_interactions.forEach((d) => sugs.push({ text: `Interaction: ${d}` }));
        if (Array.isArray(ai.alerts?.allergy_conflicts)) ai.alerts.allergy_conflicts.forEach((d) => sugs.push({ text: `Allergy: ${d}` }));
        setSuggestions(sugs);

        const dn = payload?.doctorNotes ?? body?.doctorNotes ?? '';
        if (dn) setDoctorNotes(dn);

        toast.success('AI summary ready ✓');
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || 'Transcription API failed. Loading drafted UI.');
      } finally {
        mr.stream?.getTracks().forEach((t) => t.stop());
        setStep('review');
      }
    };
    mr.stop();
  }, [patientId, apptId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Step 1: Save the medical record (only if not already saved)
      if (!recordSavedRef.current) {
        const payloadAiSummary = { ...aiSummary };
        delete payloadAiSummary.transcript;

        const recordPayload = {
          appointmentId: apptId,
          patientId,
          visitDate: new Date().toISOString(),
          aiSummary: payloadAiSummary,
          doctorNotes,
        };

        console.log('[Session] Saving medical record with payload:', recordPayload);
        await createMedicalRecord(recordPayload);
        // Mark record as saved so retries don't create duplicates
        recordSavedRef.current = true;
      }

      // Step 2: Update appointment status to completed
      await completeAppointment(apptId);

      // Wait for cache to refresh BEFORE navigating
      await qc.invalidateQueries({ queryKey: ['doctorAppointments'] });
      
      toast.success('Session completed & record saved ✓');
      navigate('/dashboard/doctor/sessions');
    } catch (err) {
      console.error('[Session] Save error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save record or complete session');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  }

  return (
    <div className="h-full flex flex-col">
       {step === 'session' && (
         <LiveSessionStep appt={appt} isRecording={isRecording} isPaused={isPaused} recordingTime={recordingTime} onStartSession={startRecording} onPauseResume={handlePauseResume} onEndSession={handleEndSession} />
       )}
       {step === 'processing' && <AIProcessingStep appt={appt} />}
       {step === 'review' && (
         <ReviewStep
           appt={appt}
           aiSummary={aiSummary} setAiSummary={setAiSummary}
           doctorNotes={doctorNotes} setDoctorNotes={setDoctorNotes}
           suggestions={suggestions} setSuggestions={setSuggestions}
           onDiscard={() => navigate('/dashboard/doctor/sessions')}
           onSave={handleSave} isSaving={isSaving}
         />
       )}
    </div>
  );
}
