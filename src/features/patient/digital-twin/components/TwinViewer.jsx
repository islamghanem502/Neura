import React, { useRef, useEffect, useCallback } from 'react';

export default function TwinViewer({ selectedOrgan, weight = 0, organsList = [], gender = 'male' }) {
  const iframeRef = useRef(null);

  const focusOrgan = useCallback((name) => {
    const win = iframeRef.current?.contentWindow;
    if (win && typeof win.focusOnOrganByName === 'function') win.focusOnOrganByName(name);
  }, []);

  const resetView = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (win && typeof win.returnToNormalView === 'function') win.returnToNormalView();
  }, []);

  // Apply injury highlight whenever organsList changes (e.g. after simulation)
  const applyHighlights = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (win && typeof win.highlightInjuredOrgans === 'function') {
      win.highlightInjuredOrgans(organsList);
    }
  }, [organsList]);

  useEffect(() => {
    if (selectedOrgan) {
      const t = setTimeout(() => focusOrgan(selectedOrgan), 300);
      return () => clearTimeout(t);
    } else {
      resetView();
    }
  }, [selectedOrgan, focusOrgan, resetView]);

  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const apply = () => { if (typeof win.setWeight === 'function') win.setWeight(weight); };
    apply();
    const t = setTimeout(apply, 500);
    return () => clearTimeout(t);
  }, [weight]);

  // Re-apply highlights when organsList changes (delayed to let model load)
  useEffect(() => {
    const t = setTimeout(applyHighlights, 800);
    return () => clearTimeout(t);
  }, [applyHighlights]);

  const handleLoad = () => {
    // Apply gender, weight and highlights after iframe loads
    setTimeout(() => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      // setGender is a no-op for male (already loaded via URL param)
      // but ensures the correct model is active
      if (typeof win.setGender === 'function') win.setGender(gender);
      if (typeof win.setWeight === 'function') win.setWeight(weight);
      if (typeof win.highlightInjuredOrgans === 'function') win.highlightInjuredOrgans(organsList);
    }, 1200);
  };

  // Pass gender as URL query param so main.js reads it on first load
  const iframeSrc = `/twin/index.html?gender=${encodeURIComponent(gender || 'male')}`;

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      className="w-full h-full border-0"
      style={{ background: 'transparent' }}
      title="Digital Twin 3D"
      onLoad={handleLoad}
    />
  );
}
