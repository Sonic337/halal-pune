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

function BranchChip({ branch }: { branch: Branch }) {
  if (branch.mapsUrl) {
    return (
      <a
        href={branch.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors font-medium"
      >
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        {branch.area}
      </a>
    );
  }
  return (
    <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full font-medium">
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
  const branches = branchesProp ?? restaurant.branches;
  const hasMore = branches.length > VISIBLE_LIMIT;
  const visibleBranches =
    hasMore && !expanded ? branches.slice(0, VISIBLE_LIMIT) : branches;
  const hiddenCount = branches.length - VISIBLE_LIMIT;

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
          {restaurant.rating !== undefined && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 whitespace-nowrap">
              ★ {restaurant.rating.toFixed(1)}
              <span className="text-gray-400 font-normal">({restaurant.reviewCount?.toLocaleString()})</span>
            </span>
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
          <BranchChip key={b.area} branch={b} />
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
