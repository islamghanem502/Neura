import React, { useCallback, useMemo, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Loader2, X, Check } from 'lucide-react';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (e) => reject(e));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedBlob = async (imageSrc, croppedAreaPixels, { size = 512, type = 'image/jpeg', quality = 0.9 } = {}) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const { x, y, width, height } = croppedAreaPixels;
  ctx.drawImage(image, x, y, width, height, 0, 0, size, size);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) throw new Error('Failed to encode cropped image');
  return blob;
};

export const ImageCropModal = ({
  isOpen,
  imageSrc,
  title = 'Crop photo',
  aspect = 1,
  outputSize = 512,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const canConfirm = !!imageSrc && !!croppedAreaPixels && !isSaving;

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, { size: outputSize, type: 'image/jpeg', quality: 0.9 });
      await onConfirm(blob);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="absolute inset-x-0 top-10 mx-auto w-[92vw] max-w-2xl rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-[14px] font-black text-slate-900">{title}</h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Drag to reposition. Use the slider to zoom.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative bg-slate-950">
          <div className="relative w-full h-[420px]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={false}
            />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Zoom</span>
            <span className="text-[11px] font-extrabold text-slate-500">{zoomLabel}</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-blue-600"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="px-5 py-2.5 rounded-xl text-[12px] font-black bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

