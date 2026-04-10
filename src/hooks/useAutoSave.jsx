import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * useAutoSave – debounced auto-save hook for doctor onboarding fields.
 *
 * @param {object}   options
 * @param {any}      options.data      – serialisable form data to watch
 * @param {function} options.saveFn    – async (data) => Promise  – called when the timer fires
 * @param {number}   [options.delay=3000] – debounce delay in ms
 * @param {boolean}  [options.enabled=true] – set false to temporarily pause
 *
 * @returns {{ saveStatus: 'idle'|'saving'|'saved'|'error', lastSavedAt: Date|null }}
 */
export const useAutoSave = ({ data, saveFn, delay = 3000, enabled = true }) => {
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const timerRef = useRef(null);
  const prevSnapshotRef = useRef(null);
  const savedIndicatorTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Keep saveFn ref stable so we always call the latest version
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
    };
  }, []);

  // Core effect: watch `data`, debounce, then save
  useEffect(() => {
    if (!enabled) return;

    const currentSnapshot = JSON.stringify(data);

    // On first render just store the snapshot — don't save
    if (prevSnapshotRef.current === null) {
      prevSnapshotRef.current = currentSnapshot;
      return;
    }

    // Nothing changed
    if (currentSnapshot === prevSnapshotRef.current) return;

    // Clear any pending save timer
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      setSaveStatus('saving');

      try {
        await saveFnRef.current(data);

        if (!isMountedRef.current) return;

        prevSnapshotRef.current = currentSnapshot;
        setSaveStatus('saved');
        setLastSavedAt(new Date());

        // Reset indicator after 2.5 s
        if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
        savedIndicatorTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) setSaveStatus('idle');
        }, 2500);
      } catch (err) {
        console.error('[useAutoSave] save failed:', err);
        if (!isMountedRef.current) return;
        setSaveStatus('error');

        // Reset error indicator after 4 s
        if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
        savedIndicatorTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) setSaveStatus('idle');
        }, 4000);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, delay, enabled]);

  return { saveStatus, lastSavedAt };
};

/**
 * Tiny presentational component to show auto-save status next to headings.
 *
 * Usage:  <AutoSaveIndicator status={saveStatus} />
 */
export const AutoSaveIndicator = ({ status }) => {
  if (status === 'idle') return null;

  const config = {
    saving: {
      text: 'Saving…',
      className: 'text-blue-500',
      icon: (
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
    },
    saved: {
      text: 'Auto-saved ✓',
      className: 'text-emerald-500',
      icon: null,
    },
    error: {
      text: 'Save failed',
      className: 'text-red-500',
      icon: null,
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${c.className} animate-in fade-in duration-300`}
    >
      {c.icon}
      {c.text}
    </span>
  );
};
