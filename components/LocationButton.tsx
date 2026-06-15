"use client";

import { useState } from "react";

interface Props {
  onLocation: (coords: { lat: number; lng: number } | null, radiusKm: number) => void;
}

type Status = "idle" | "loading" | "active" | "denied";

export default function LocationButton({ onLocation }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [radius, setRadius] = useState(5);

  function handleClick() {
    if (status === "active") {
      setStatus("idle");
      onLocation(null, radius);
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("active");
        onLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }, radius);
      },
      () => {
        setStatus("denied");
        setTimeout(() => setStatus("idle"), 2500);
      },
      { timeout: 10000 }
    );
  }

  function handleRadiusChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setRadius(val);
    if (status === "active") {
      navigator.geolocation.getCurrentPosition((pos) => {
        onLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }, val);
      });
    }
  }

  const buttonClass =
    status === "active"
      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
      : status === "denied"
      ? "bg-red-500 text-white"
      : status === "loading"
      ? "bg-orange-400 text-white animate-pulse"
      : "bg-white text-gray-700 border border-gray-200 shadow-md hover:shadow-lg";

  const label =
    status === "active"
      ? "📍 Location on"
      : status === "denied"
      ? "⛔ Location blocked"
      : status === "loading"
      ? "Locating..."
      : "📍 Near me";

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      {status === "active" && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-52">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">Radius</span>
            <span className="text-xs font-bold text-emerald-700">{radius} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={radius}
            onChange={handleRadiusChange}
            className="w-full accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={status === "loading" || status === "denied"}
        className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${buttonClass}`}
      >
        {label}
      </button>
    </div>
  );
}
