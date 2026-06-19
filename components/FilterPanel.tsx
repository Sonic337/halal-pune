"use client";

import { useEffect, useRef, useState } from "react";

export interface PanelFilters {
  minRating: number | null;   // null = Any
  maxPrice: number | null;    // null = Any (no upper limit)
}

interface Props {
  filters: PanelFilters;
  onApply: (f: PanelFilters) => void;
  onClose: () => void;
}

const RATING_STEPS = [null, 3.5, 4.0, 4.5, 5.0] as const;
const PRICE_STEPS = [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, null] as const;

function ratingLabel(v: number | null) {
  return v === null ? "Any" : `${v}★+`;
}
function priceLabel(v: number | null) {
  return v === null ? "Any" : `₹${v.toLocaleString("en-IN")}`;
}

export default function FilterPanel({ filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<PanelFilters>(filters);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset draft to committed filters each time panel opens
  useEffect(() => { setDraft(filters); }, [filters]);

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const ratingIdx = RATING_STEPS.indexOf(draft.minRating as never);
  const priceIdx = PRICE_STEPS.indexOf(draft.maxPrice as never);

  function setRatingByIdx(idx: number) {
    setDraft((d) => ({ ...d, minRating: RATING_STEPS[idx] }));
  }
  function setPriceByIdx(idx: number) {
    setDraft((d) => ({ ...d, maxPrice: PRICE_STEPS[idx] }));
  }

  const activeCount = [draft.minRating !== null, draft.maxPrice !== null].filter(Boolean).length;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-6"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-popup)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            Filters {activeCount > 0 && (
              <span
                className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--brand-orange)", color: "#fff" }}
              >
                {activeCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            style={{ color: "var(--color-text-3)" }}
            className="hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Rating slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Minimum Rating
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--brand-orange)" }}>
              {ratingLabel(draft.minRating)}
            </span>
          </div>
          <SteppedSlider
            steps={RATING_STEPS.length}
            value={ratingIdx === -1 ? 0 : ratingIdx}
            onChange={setRatingByIdx}
            accentColor="var(--brand-orange)"
            labels={RATING_STEPS.map(ratingLabel)}
          />
        </div>

        {/* Price slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Cost for Two (max)
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--brand-orange)" }}>
              {priceLabel(draft.maxPrice)}
            </span>
          </div>
          <SteppedSlider
            steps={PRICE_STEPS.length}
            value={priceIdx === -1 ? PRICE_STEPS.length - 1 : priceIdx}
            onChange={setPriceByIdx}
            accentColor="var(--brand-orange)"
            labels={PRICE_STEPS.map(priceLabel)}
            showEndLabels
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => setDraft({ minRating: null, maxPrice: null })}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-surface-2)",
              color: "var(--color-text-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            Clear all
          </button>
          <button
            onClick={() => { onApply(draft); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--brand-orange)", color: "#fff" }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function SteppedSlider({
  steps,
  value,
  onChange,
  accentColor,
  labels,
  showEndLabels,
}: {
  steps: number;
  value: number;
  onChange: (idx: number) => void;
  accentColor: string;
  labels: string[];
  showEndLabels?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const pct = value / (steps - 1);

  function idxFromX(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (steps - 1));
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(idxFromX(e.clientX));
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    onChange(idxFromX(e.clientX));
  }
  function onPointerUp() { setDragging(false); }

  function onTrackClick(e: React.MouseEvent) {
    onChange(idxFromX(e.clientX));
  }

  // Tick marks
  const ticks = Array.from({ length: steps }, (_, i) => i / (steps - 1));

  return (
    <div className="select-none">
      {/* Track area */}
      <div
        ref={trackRef}
        className="relative h-2 rounded-full cursor-pointer mx-2"
        style={{ backgroundColor: "var(--color-border)" }}
        onClick={onTrackClick}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: accentColor }}
        />
        {/* Ticks */}
        {ticks.map((t, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2"
            style={{
              left: `${t * 100}%`,
              backgroundColor: i <= value ? "#fff" : "var(--color-text-3)",
              opacity: i <= value ? 0.7 : 0.5,
            }}
          />
        ))}
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-md cursor-grab active:cursor-grabbing transition-transform"
          style={{
            left: `${pct * 100}%`,
            backgroundColor: accentColor,
            border: "2px solid #fff",
            transform: `translateY(-50%) translateX(-50%) scale(${dragging ? 1.2 : 1})`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>

      {/* Labels row */}
      {showEndLabels ? (
        <div className="flex justify-between mt-3 px-1 text-xs" style={{ color: "var(--color-text-3)" }}>
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      ) : (
        <div className="flex justify-between mt-3 px-1">
          {labels.map((l, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className="text-xs transition-colors"
              style={{
                color: i === value ? accentColor : "var(--color-text-3)",
                fontWeight: i === value ? 600 : 400,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
