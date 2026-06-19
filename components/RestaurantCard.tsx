"use client";

import { useState } from "react";
import Image from "next/image";
import { Restaurant, Branch } from "@/types";

const CUISINE_COLORS: Record<string, string> = {
  // light: bg-X-100 text-X-800  |  dark: bg-X-900/60 text-X-200
  "North Indian":    "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200",
  Mexican:           "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200",
  Kebab:             "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
  Chinese:           "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200",
  Thai:              "bg-lime-100 text-lime-800 dark:bg-lime-900/60 dark:text-lime-200",
  Asian:             "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200",
  Salad:             "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
  "Asian Fusion":    "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200",
  Seafood:           "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200",
  Beverages:         "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200",
  Continental:       "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200",
  European:          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200",
  Iranian:           "bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200",
  "Fast Food":       "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200",
  Italian:           "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/60 dark:text-fuchsia-200",
  Korean:            "bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200",
  Desserts:          "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
  Cafe:              "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200",
  // light: bg-X-200 text-X-900  |  dark: bg-X-900/70 text-X-300
  BBQ:               "bg-red-200 text-red-900 dark:bg-red-900/70 dark:text-red-300",
  Burger:            "bg-orange-200 text-orange-900 dark:bg-orange-900/70 dark:text-orange-300",
  Biryani:           "bg-amber-200 text-amber-900 dark:bg-amber-900/70 dark:text-amber-300",
  Bakery:            "bg-yellow-200 text-yellow-900 dark:bg-yellow-900/70 dark:text-yellow-300",
  Indonesian:        "bg-lime-200 text-lime-900 dark:bg-lime-900/70 dark:text-lime-300",
  Jamaican:          "bg-green-200 text-green-900 dark:bg-green-900/70 dark:text-green-300",
  "Healthy Food":    "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-300",
  Lebanese:          "bg-teal-200 text-teal-900 dark:bg-teal-900/70 dark:text-teal-300",
  Mediterranean:     "bg-cyan-200 text-cyan-900 dark:bg-cyan-900/70 dark:text-cyan-300",
  Juices:            "bg-sky-200 text-sky-900 dark:bg-sky-900/70 dark:text-sky-300",
  American:          "bg-blue-200 text-blue-900 dark:bg-blue-900/70 dark:text-blue-300",
  "Middle Eastern":  "bg-indigo-200 text-indigo-900 dark:bg-indigo-900/70 dark:text-indigo-300",
  Oriental:          "bg-violet-200 text-violet-900 dark:bg-violet-900/70 dark:text-violet-300",
  Momos:             "bg-purple-200 text-purple-900 dark:bg-purple-900/70 dark:text-purple-300",
  Pasta:             "bg-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-900/70 dark:text-fuchsia-300",
  "Ice Cream":       "bg-pink-200 text-pink-900 dark:bg-pink-900/70 dark:text-pink-300",
  Mughlai:           "bg-rose-200 text-rose-900 dark:bg-rose-900/70 dark:text-rose-300",
  Coffee:            "bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-300",
  // light: bg-X-50 text-X-700  |  dark: bg-X-900/50 text-X-300
  Pizza:             "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  "South Indian":    "bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  Shawarma:          "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Sandwich:          "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  Rolls:             "bg-lime-50 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300",
  "Street Food":     "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  Wraps:             "bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  "Bar Food":        "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  Sichuan:           "bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  Persian:           "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "Southeast Asian": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  Tea:               "bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  Mandi:             "bg-rose-50 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

function cuisineColor(cuisine: string) {
  return CUISINE_COLORS[cuisine] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
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
      className="rounded-2xl flex flex-col transition-shadow overflow-hidden"
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
      {/* ── Image ── */}
      {restaurant.imageUrl && (
        <div className="relative w-full h-44 shrink-0">
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          {restaurant.hotelBrand && (
            <span
              className="absolute top-2 left-2 z-10"
              style={{
                backgroundColor: "rgba(10, 15, 30, 0.78)",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              {restaurant.hotelBrand}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 p-5">

      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {restaurant.name}
            </h2>
            {restaurant.dietType === "pure-veg" && (
              <span
                title="Pure Vegetarian"
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border-2 border-green-600 text-green-700 dark:text-green-400 shrink-0"
                style={{ lineHeight: 1 }}
              >
                <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 inline-block" />
                Pure Veg
              </span>
            )}
            {restaurant.tempClosed && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: "color-mix(in srgb, #6b7280 12%, var(--color-surface))",
                  color: "#374151",
                  border: "1px solid color-mix(in srgb, #6b7280 30%, transparent)",
                }}
              >
                ⏸ Temporarily Closed
              </span>
            )}
          </div>
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
                style={{ color: "#b45309" }}
              >
                ★ {displayRating.toFixed(1)}
                {displayReviewCount !== undefined && (
                  <span style={{ color: "var(--color-text-3)", fontWeight: 400 }}>
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
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                +{restaurant.cuisines.length - VISIBLE_CUISINE_LIMIT} more
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Fish note ── */}
      {restaurant.fishNote && (() => {
        const confirmed = restaurant.fishNote.includes("We've confirmed");
        return (
          <div
            title={restaurant.fishNote}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit"
            style={confirmed ? {
              backgroundColor: "color-mix(in srgb, #0ea5e9 12%, var(--color-surface))",
              color: "#854d0e",
              border: "1px solid color-mix(in srgb, #0ea5e9 35%, transparent)",
            } : {
              backgroundColor: "color-mix(in srgb, #dc2626 12%, var(--color-surface))",
              color: "#dc2626",
              border: "1px solid color-mix(in srgb, #dc2626 40%, transparent)",
            }}
          >
            {confirmed
              ? "🐟 Fish served — chicken kept separate, call ahead for extra care"
              : "🐟 Fish served — call before visiting to confirm separate prep"}
          </div>
        );
      })()}

      <hr className="border-t-2" style={{ borderColor: "var(--color-border)" }} />

      {/* ── Branch chips ── */}
      <div className="flex flex-wrap gap-2">
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
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                +{hiddenCount} more
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Action row ── */}
      {(restaurant.menuUrl || restaurant.phone) && (
        <>
          <hr className="border-t-2" style={{ borderColor: "var(--color-border)" }} />
          <div className="flex gap-2 flex-wrap">
            {restaurant.menuUrl && (
              <a
                href={restaurant.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--brand-emerald) 12%, var(--color-surface))",
                  color: "var(--brand-emerald-dark)",
                  border: "1px solid color-mix(in srgb, var(--brand-emerald) 30%, transparent)",
                }}
              >
                📋 View Menu
              </a>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--brand-emerald) 12%, var(--color-surface))",
                  color: "var(--brand-emerald-dark)",
                  border: "1px solid color-mix(in srgb, var(--brand-emerald) 30%, transparent)",
                }}
              >
                📞 Call
              </a>
            )}
          </div>
        </>
      )}
      </div>
    </article>
  );
}
