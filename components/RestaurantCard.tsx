"use client";

import { useState } from "react";
import { Restaurant, Branch } from "@/types";

const CUISINE_COLORS: Record<string, string> = {
  Mexican: "bg-orange-100 text-orange-800",
  "North Indian": "bg-red-100 text-red-800",
  Chinese: "bg-yellow-100 text-yellow-800",
  Asian: "bg-green-100 text-green-800",
  Italian: "bg-green-100 text-green-800",
  Pizza: "bg-red-100 text-red-800",
  "Fast Food": "bg-purple-100 text-purple-800",
  Korean: "bg-pink-100 text-pink-800",
  Continental: "bg-blue-100 text-blue-800",
  Kebab: "bg-amber-100 text-amber-800",
  Seafood: "bg-cyan-100 text-cyan-800",
  Thai: "bg-lime-100 text-lime-800",
  Cafe: "bg-stone-100 text-stone-800",
  Beverages: "bg-sky-100 text-sky-800",
  Desserts: "bg-rose-100 text-rose-800",
  Salad: "bg-emerald-100 text-emerald-800",
  default: "bg-gray-100 text-gray-700",
};

function cuisineColor(cuisine: string) {
  return CUISINE_COLORS[cuisine] ?? CUISINE_COLORS.default;
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
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
      {branch.area}
      {branch.rating !== undefined && (
        <span className="ml-0.5 text-amber-500 font-semibold">★ {branch.rating.toFixed(1)}</span>
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
        className={`${shared} bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100`}
      >
        {inner}
      </a>
    );
  }
  return (
    <span
      onMouseEnter={() => onHover(branch)}
      onMouseLeave={onLeave}
      className={`${shared} bg-gray-50 text-gray-600 border border-gray-200`}
    >
      {branch.area}
    </span>
  );
}

const VISIBLE_LIMIT = 3;

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
  const [hoveredBranch, setHoveredBranch] = useState<Branch | null>(null);
  const branches = branchesProp ?? restaurant.branches;
  const hasMore = branches.length > VISIBLE_LIMIT;
  const visibleBranches =
    hasMore && !expanded ? branches.slice(0, VISIBLE_LIMIT) : branches;
  const hiddenCount = branches.length - VISIBLE_LIMIT;

  // Priority: hovered branch → nearest branch (location active) → restaurant average
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
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-5 flex flex-col gap-3 border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
          {restaurant.tagline && (
            <p className="text-sm text-gray-500 mt-0.5">{restaurant.tagline}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {distanceKm !== undefined && (
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full whitespace-nowrap">
              {distanceKm} km
            </span>
          )}
          {displayRating !== undefined && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 whitespace-nowrap">
                ★ {displayRating.toFixed(1)}
                {displayReviewCount !== undefined && (
                  <span className="text-gray-400 font-normal">
                    ({displayReviewCount.toLocaleString()})
                  </span>
                )}
              </span>
              {ratingLabel && (
                <span className="text-[10px] text-gray-400 font-normal">
                  {ratingLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {restaurant.cuisines.map((c) => (
          <span key={c} className={`text-xs font-medium px-2.5 py-1 rounded-full ${cuisineColor(c)}`}>
            {c}
          </span>
        ))}
      </div>

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
            className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors font-medium"
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
    </div>
  );
}
