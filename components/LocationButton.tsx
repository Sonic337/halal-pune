"use client";

import { useState } from "react";

interface Props {
  onLocation: (
    coords: { lat: number; lng: number } | null,
    radiusKm: number
  ) => void;
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
        onLocation(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          radius
        );
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
        onLocation(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          val
        );
      });
    }
  }

  const buttonStyle: React.CSSProperties =
    status === "active"
      ? {
          backgroundColor: "var(--brand-emerald)",
          color: "#ffffff",
          boxShadow: "0 4px 14px 0 color-mix(in srgb, var(--brand-emerald) 40%, transparent)",
        }
      : status === "denied"
      ? { backgroundColor: "#ef4444", color: "#ffffff" }
      : status === "loading"
      ? { backgroundColor: "var(--brand-orange)", color: "#ffffff" }
      : {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        };

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
      {/* Radius picker popup */}
      {status === "active" && (
        <div
          className="rounded-2xl p-4 w-52"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-popup)",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--color-text-2)" }}
            >
              Radius
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: "var(--brand-emerald-dark)" }}
            >
              {radius} km
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={radius}
            onChange={handleRadiusChange}
            className="w-full accent-emerald-600"
            aria-label="Search radius in kilometres"
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: "var(--color-text-3)" }}
          >
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={status === "loading" || status === "denied"}
        className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
          status === "loading" ? "animate-pulse" : ""
        }`}
        style={buttonStyle}
        aria-label={
          status === "active"
            ? "Turn off location filter"
            : "Filter by my location"
        }
      >
        {label}
      </button>
    </div>
  );
}
