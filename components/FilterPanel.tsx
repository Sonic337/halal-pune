"use client";

import { useEffect, useRef, useState } from "react";

export interface PanelFilters {
  minRating: number | null; // null = Any
  minPrice: number | null;  // null = ₹0 / no lower bound
  maxPrice: number | null;  // null = Any / no upper bound
}

export const DEFAULT_PANEL_FILTERS: PanelFilters = {
  minRating: null,
  minPrice: null,
  maxPrice: null,
};

interface Props {
  filters: PanelFilters;
  onApply: (f: PanelFilters) => void;
  onClose: () => void;
}

const RATING_STEPS = [null, 3.5, 4.0, 4.5, 5.0] as const;
type RatingStep = (typeof RATING_STEPS)[number];

const PRICE_STEPS = [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, null] as const;
type PriceStep = (typeof PRICE_STEPS)[number];

function ratingLabel(v: RatingStep) {
  return v === null ? "Any" : `${v}★+`;
}
function priceLabel(v: PriceStep) {
  return v === null ? "Any" : `₹${v.toLocaleString("en-IN")}`;
}

function isDefaultFilters(f: PanelFilters) {
  return f.minRating === null && f.minPrice === null && f.maxPrice === null;
}

export function countActiveFilters(f: PanelFilters): number {
  let n = 0;
  if (f.minRating !== null) n++;
  if (f.minPrice !== null || f.maxPrice !== null) n++;
  return n;
}

export default function FilterPanel({ filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<PanelFilters>(filters);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDraft(filters); }, [filters]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  // Rating index
  const ratingIdx = RATING_STEPS.indexOf(draft.minRating as RatingStep);
  const safeRatingIdx = ratingIdx === -1 ? 0 : ratingIdx;

  function setRatingByIdx(idx: number) {
    setDraft((d) => ({ ...d, minRating: RATING_STEPS[idx] }));
  }

  // Price indices
  const minPriceIdx = PRICE_STEPS.indexOf((draft.minPrice ?? 0) as PriceStep);
  const maxPriceIdx = PRICE_STEPS.indexOf(draft.maxPrice as PriceStep);
  const safeMinPriceIdx = minPriceIdx === -1 ? 0 : minPriceIdx;
  const safeMaxPriceIdx = maxPriceIdx === -1 ? PRICE_STEPS.length - 1 : maxPriceIdx;

  function setPriceRange(minIdx: number, maxIdx: number) {
    setDraft((d) => ({
      ...d,
      minPrice: PRICE_STEPS[minIdx] === 0 ? null : (PRICE_STEPS[minIdx] as number),
      maxPrice: PRICE_STEPS[maxIdx] as PriceStep,
    }));
  }

  const activeCount = countActiveFilters(draft);

  // Display labels
  const priceDisplay =
    safeMinPriceIdx === 0 && safeMaxPriceIdx === PRICE_STEPS.length - 1
      ? "Any"
      : `${priceLabel(PRICE_STEPS[safeMinPriceIdx])} – ${priceLabel(PRICE_STEPS[safeMaxPriceIdx])}`;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full sm:w-[440px] rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-7"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-popup)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            Filters
            {activeCount > 0 && (
              <span
                className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--brand-orange)", color: "#fff" }}
              >
                {activeCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-text-3)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Rating slider ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Minimum Rating
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--brand-orange)" }}>
              {ratingLabel(draft.minRating as RatingStep)}
            </span>
          </div>
          <SteppedSlider
            stepCount={RATING_STEPS.length}
            value={safeRatingIdx}
            onChange={setRatingByIdx}
            labels={RATING_STEPS.map(ratingLabel)}
          />
        </div>

        {/* ── Cost for Two range slider ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Cost for Two
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--brand-orange)" }}>
              {priceDisplay}
            </span>
          </div>
          <RangeSlider
            stepCount={PRICE_STEPS.length}
            minIdx={safeMinPriceIdx}
            maxIdx={safeMaxPriceIdx}
            onChange={setPriceRange}
            startLabel={priceLabel(PRICE_STEPS[0])}
            endLabel={priceLabel(PRICE_STEPS[PRICE_STEPS.length - 1])}
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button
            onClick={() => setDraft(DEFAULT_PANEL_FILTERS)}
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
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--brand-orange)", color: "#fff" }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single-handle stepped slider (Rating) ──────────────────────────

function SteppedSlider({
  stepCount,
  value,
  onChange,
  labels,
}: {
  stepCount: number;
  value: number;
  onChange: (idx: number) => void;
  labels: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const pct = value / (stepCount - 1);

  function idxFromX(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (stepCount - 1));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(idxFromX(e.clientX));
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    onChange(idxFromX(e.clientX));
  }
  function onPointerUp() { setDragging(false); }

  return (
    <div className="select-none px-2">
      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-2 rounded-full cursor-pointer"
        style={{ backgroundColor: "var(--color-border)" }}
        onClick={(e) => onChange(idxFromX(e.clientX))}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
          style={{ width: `${pct * 100}%`, backgroundColor: "var(--brand-orange)" }}
        />

        {/* Tick marks */}
        {Array.from({ length: stepCount }, (_, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              left: `${(i / (stepCount - 1)) * 100}%`,
              width: i === value ? "10px" : "6px",
              height: i === value ? "10px" : "6px",
              backgroundColor: i <= value ? "var(--brand-orange)" : "var(--color-text-3)",
              border: i === value ? "2px solid #fff" : "none",
              opacity: i === value ? 1 : 0.5,
              transition: "width 0.1s, height 0.1s",
            }}
          />
        ))}

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md touch-none"
          style={{
            left: `${pct * 100}%`,
            width: dragging ? "22px" : "18px",
            height: dragging ? "22px" : "18px",
            backgroundColor: "var(--brand-orange)",
            border: "2.5px solid #fff",
            cursor: dragging ? "grabbing" : "grab",
            transition: "width 0.1s, height 0.1s",
            zIndex: 2,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-3">
        {labels.map((l, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className="text-xs transition-colors"
            style={{
              color: i === value ? "var(--brand-orange)" : "var(--color-text-3)",
              fontWeight: i === value ? 700 : 400,
              minWidth: 0,
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Two-handle range slider (Cost for Two) ─────────────────────────

function RangeSlider({
  stepCount,
  minIdx,
  maxIdx,
  onChange,
  startLabel,
  endLabel,
}: {
  stepCount: number;
  minIdx: number;
  maxIdx: number;
  onChange: (minIdx: number, maxIdx: number) => void;
  startLabel: string;
  endLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  function idxFromX(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (stepCount - 1));
  }

  function onPointerDownMin(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging("min");
  }
  function onPointerDownMax(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging("max");
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const idx = idxFromX(e.clientX);
    if (dragging === "min") onChange(Math.min(idx, maxIdx), maxIdx);
    else onChange(minIdx, Math.max(idx, minIdx));
  }
  function onPointerUp() { setDragging(null); }

  function onTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    const idx = idxFromX(e.clientX);
    // Move whichever handle is closer
    const distMin = Math.abs(idx - minIdx);
    const distMax = Math.abs(idx - maxIdx);
    if (distMin <= distMax) onChange(Math.min(idx, maxIdx), maxIdx);
    else onChange(minIdx, Math.max(idx, minIdx));
  }

  const minPct = (minIdx / (stepCount - 1)) * 100;
  const maxPct = (maxIdx / (stepCount - 1)) * 100;

  const thumbStyle = (active: boolean): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%) translateX(-50%)",
    width: active ? "22px" : "18px",
    height: active ? "22px" : "18px",
    borderRadius: "9999px",
    backgroundColor: "var(--brand-orange)",
    border: "2.5px solid #fff",
    cursor: active ? "grabbing" : "grab",
    transition: "width 0.1s, height 0.1s",
    zIndex: 3,
    touchAction: "none",
  });

  return (
    <div className="select-none px-2">
      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-2 rounded-full cursor-pointer"
        style={{ backgroundColor: "var(--color-border)" }}
        onClick={onTrackClick}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Filled range between handles */}
        <div
          className="absolute inset-y-0 rounded-full pointer-events-none"
          style={{
            left: `${minPct}%`,
            width: `${maxPct - minPct}%`,
            backgroundColor: "var(--brand-orange)",
          }}
        />

        {/* Min thumb */}
        <div
          style={{ ...thumbStyle(dragging === "min"), left: `${minPct}%` }}
          onPointerDown={onPointerDownMin}
        />

        {/* Max thumb */}
        <div
          style={{ ...thumbStyle(dragging === "max"), left: `${maxPct}%` }}
          onPointerDown={onPointerDownMax}
        />
      </div>

      {/* End labels */}
      <div className="flex justify-between mt-3 text-xs" style={{ color: "var(--color-text-3)" }}>
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}
