"use client";

import { useState } from "react";
import { Restaurant, Branch } from "@/types";

/**
 * Cuisine badge colors — we keep the colorful hue-based mapping but
 * express it via CSS custom properties so dark mode can apply a
 * `filter: brightness(...)` override in globals.css via .cuisine-badge.
 */
const CUISINE_COLORS: Record<string, string> = {
  "North Indian":    "bg-red-100 text-red-800",
  Mexican:           "bg-orange-100 text-orange-800",
  Kebab:             "bg-amber-100 text-amber-800",
  Chinese:           "bg-yellow-100 text-yellow-800",
  Thai:              "bg-lime-100 text-lime-800",
  Asian:             "bg-green-100 text-green-800",
  Salad:             "bg-emerald-100 text-emerald-800",
  "Asian Fusion":    "bg-teal-100 text-teal-800",
  Seafood:           "bg-cyan-100 text-cyan-800",
  Beverages:         "bg-sky-100 text-sky-800",
  Continental:       "bg-blue-100 text-blue-800",
  European:          "bg-indigo-100 text-indigo-800",
  Iranian:           "bg-violet-100 text-violet-800",
  "Fast Food":       "bg-purple-100 text-purple-800",
  Italian:           "bg-fuchsia-100 text-fuchsia-800",
  Korean:            "bg-pink-100 text-pink-800",
  Desserts:          "bg-rose-100 text-rose-800",
  Cafe:              "bg-stone-100 text-stone-800",
  BBQ:               "bg-red-200 text-red-900",
  Burger:            "bg-orange-200 text-orange-900",
  Biryani:           "bg-amber-200 text-amber-900",
  Bakery:            "bg-yellow-200 text-yellow-900",
  Indonesian:        "bg-lime-200 text-lime-900",
  Jamaican:          "bg-green-200 text-green-900",
  "Healthy Food":    "bg-emerald-200 text-emerald-900",
  Lebanese:          "bg-teal-200 text-teal-900",
  Mediterranean:     "bg-cyan-200 text-cyan-900",
  Juices:            "bg-sky-200 text-sky-900",
  American:          "bg-blue-200 text-blue-900",
  "Middle Eastern":  "bg-indigo-200 text-indigo-900",
  Oriental:          "bg-violet-200 text-violet-900",
  Momos:             "bg-purple-200 text-purple-900",
  Pasta:             "bg-fuchsia-200 text-fuchsia-900",
  "Ice Cream":       "bg-pink-200 text-pink-900",
  Mughlai:           "bg-rose-200 text-rose-900",
  Coffee:            "bg-stone-200 text-stone-900",
  Pizza:             "bg-red-50 text-red-700",
  "South Indian":    "bg-orange-50 text-orange-700",
  Shawarma:          "bg-amber-50 text-amber-700",
  Sandwich:          "bg-yellow-50 text-yellow-700",
  Rolls:             "bg-lime-50 text-lime-700",
  "Street Food":     "bg-green-50 text-green-700",
  Wraps:             "bg-teal-50 text-teal-700",
  "Bar Food":        "bg-cyan-50 text-cyan-700",
  Sichuan:           "bg-sky-50 text-sky-700",
  Persian:           "bg-blue-50 text-blue-700",
  "Southeast Asian": "bg-indigo-50 text-indigo-700",
  Tea:               "bg-violet-50 text-violet-700",
};

function cuisineColor(cuisine: string) {
  return CUISINE_COLORS[cuisine] ?? "bg-gray-100 text-gray-700";
}

function BranchChip({
  branch,
  onHover,
  onLeave,
}: {
  branch: Branch;
  onHover: (b: Branch) => void;
  onLeave: () => void;
}) {
  const shared =
    "flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors";

  const inner = (
    <>
      <svg
        className="w-3 h-3 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
      {branch.area}
      {branch.rating !== undefined && (
        <span className="ml-0.5 font-semibold" style={{ color: "#d97706" }}>
          ★ {branch.rating.toFixed(1)}
        </span>
      )}
    </>
  );

  if (branch.mapsUrl) {
    return (
      <a
        href={branch.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => onHover(branch)}
        onMouseLeave={onLeave}
        className={`${shared} branch-chip-link`}
        style={{
          backgroundColor: "color-mix(in srgb, var(--brand-emerald) 12%, var(--color-surface))",
          color: "var(--brand-emerald-dark)",
          border: "1px solid color-mix(in srgb, var(--brand-emerald) 30%, transparent)",
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <span
      onMouseEnter={() => onHover(branch)}
      onMouseLeave={onLeave}
      className={shared}
      style={{
        backgroundColor: "var(--color-surface-2)",
        color: "var(--color-text-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      {branch.area}
    </span>
  );
}

const VISIBLE_LIMIT = 3;
const VISIBLE_CUISINE_LIMIT = 2;

export default function RestaurantCard({
  restaurant,
  branches: branchesProp,
  distanceKm,
}: {
  restaurant: Restaurant;
  branches?: Branch[];
  distanceKm?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cuisineExpanded, setCuisineExpanded] = useState(false);
  const [hoveredBranch, setHoveredBranch] = useState<Branch | null>(null);
  const branches = branchesProp ?? restaurant.branches;
  const hasMore = branches.length > VISIBLE_LIMIT;
  const visibleBranches =
    hasMore && !expanded ? branches.slice(0, VISIBLE_LIMIT) : branches;
  const hiddenCount = branches.length - VISIBLE_LIMIT;

  const nearestBranch = distanceKm !== undefined ? branches[0] : undefined;
  const activeBranch = hoveredBranch ?? nearestBranch;
  const displayRating = activeBranch?.rating ?? restaurant.rating;
  const displayReviewCount =
    activeBranch?.rating !== undefined
      ? activeBranch.reviewCount
      : restaurant.reviewCount;
  const ratingLabel = hoveredBranch
    ? hoveredBranch.area
    : nearestBranch && nearestBranch.rating !== undefined
    ? nearestBranch.area
    : null;

  return (
    <article
      className="rounded-2xl p-5 flex flex-col gap-3 transition-shadow"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            {restaurant.name}
          </h2>
          {restaurant.tagline && (
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--color-text-2)" }}
            >
              {restaurant.tagline}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {distanceKm !== undefined && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{
                backgroundColor: "color-mix(in srgb, var(--brand-emerald) 15%, var(--color-surface))",
                color: "var(--brand-emerald-dark)",
              }}
            >
              {distanceKm} km
            </span>
          )}
          {displayRating !== undefined && (
            <div className="flex flex-col items-end gap-0.5">
              <span
                className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap"
                style={{ color: "#d97706" }}
              >
                ★ {displayRating.toFixed(1)}
                {displayReviewCount !== undefined && (
                  <span
                    className="font-normal"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    ({displayReviewCount.toLocaleString()})
                  </span>
                )}
              </span>
              {ratingLabel && (
                <span
                  className="text-[10px] font-normal"
                  style={{ color: "var(--color-text-3)" }}
                >
                  {ratingLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Cuisine badges ── */}
      <div className="flex flex-wrap gap-1.5">
        {(cuisineExpanded
          ? restaurant.cuisines
          : restaurant.cuisines.slice(0, VISIBLE_CUISINE_LIMIT)
        ).map((c) => (
          <span
            key={c}
            className={`cuisine-badge text-xs font-medium px-2.5 py-1 rounded-full ${cuisineColor(c)}`}
          >
            {c}
          </span>
        ))}
        {restaurant.cuisines.length > VISIBLE_CUISINE_LIMIT && (
          <button
            onClick={() => setCuisineExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-surface-2)",
              color: "var(--color-text-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            {cuisineExpanded ? (
              <>
                Show less
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </>
            ) : (
              <>
                +{restaurant.cuisines.length - VISIBLE_CUISINE_LIMIT} more
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Branch chips ── */}
      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {visibleBranches.map((b) => (
          <BranchChip
            key={b.area}
            branch={b}
            onHover={setHoveredBranch}
            onLeave={() => setHoveredBranch(null)}
          />
        ))}

        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-surface-2)",
              color: "var(--color-text-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            {expanded ? (
              <>
                Show less
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </>
            ) : (
              <>
                +{hiddenCount} more
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
