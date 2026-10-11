"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";

export default function PhotoUploadEditor({ value, onChange, label = "Incident Photographic Evidence" }) {
  const [imageSrc, setImageSrc] = useState(value || "");
  const [isEditing, setIsEditing] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [cropAspect, setCropAspect] = useState("original"); // original, square, 16:9

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (value !== imageSrc) {
      setImageSrc(value || "");
    }
  }, [value]);

  // Handle local file picking & compression
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (typeof base64 === "string") {
        setImageSrc(base64);
        onChange?.(base64);
        // Reset editor adjustments
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setRotation(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply edits to canvas and generate updated base64 image
  const applyAndSaveEdits = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isRotatedQuarter = rotation % 180 !== 0;
      canvas.width = isRotatedQuarter ? img.height : img.width;
      canvas.height = isRotatedQuarter ? img.width : img.height;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const editedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
      setImageSrc(editedDataUrl);
      onChange?.(editedDataUrl);
      setIsEditing(false);
    };
  };

  const handleRemove = () => {
    setImageSrc("");
    onChange?.("");
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 block">
          {label}
        </label>
        {imageSrc && !isEditing && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 transition-colors cursor-pointer"
            >
              🎨 Edit Photo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 transition-colors cursor-pointer"
            >
              ✕ Remove
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment" // allows mobile direct camera capture
        onChange={handleFileChange}
        className="hidden"
      />

      {!imageSrc ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 p-6 text-center transition-all shadow-xs"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:scale-105 transition-transform text-2xl">
            📷
          </div>
          <p className="mt-3 text-xs font-bold text-slate-700">
            Click or tap to upload real incident photo
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            JPG, PNG, WEBP up to 10MB • Camera or Gallery supported on mobile & laptop
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-xs">
          {/* Main Photo Display */}
          <div className="flex items-center justify-center max-h-72 min-h-48 overflow-hidden bg-slate-950/40 p-2">
            <img
              src={imageSrc}
              alt="Incident preview"
              style={{
                filter: isEditing
                  ? `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                  : "none",
                transform: isEditing ? `rotate(${rotation}deg)` : "none",
                transition: "filter 0.15s ease, transform 0.2s ease",
              }}
              className="max-h-64 max-w-full rounded-xl object-contain shadow-lg"
            />
          </div>

          {/* Interactive Photo Editor Tray */}
          {isEditing && (
            <div className="bg-slate-900 border-t border-slate-800 p-4 text-white space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>🛠️</span> Adjust Image Quality & Orientation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live In-Browser Canvas</span>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono text-blue-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Contrast</span>
                    <span className="font-mono text-blue-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Saturation</span>
                    <span className="font-mono text-blue-400">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Rotation & Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev - 90) % 360)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    ↺ Rotate Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    ↻ Rotate Right
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                      setRotation(0);
                    }}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={applyAndSaveEdits}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    ✓ Save Photo Edits
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
