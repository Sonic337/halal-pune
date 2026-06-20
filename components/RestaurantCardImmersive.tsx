"use client";

import Image from "next/image";
import { Restaurant, Branch } from "@/types";

export default function RestaurantCardImmersive({
  restaurant,
  branches: branchesProp,
  distanceKm,
}: {
  restaurant: Restaurant;
  branches?: Branch[];
  distanceKm?: number;
}) {
  const branches = branchesProp ?? restaurant.branches;
  const primaryBranch = branches[0];
  const areas = branches.map((b) => b.area).join(", ");

  const namePrefix = restaurant.hotelBrand ? (
    <span style={{ color: "var(--color-text-2)", fontWeight: 400 }}>
      {restaurant.hotelBrand} · {" "}
    </span>
  ) : null;

  return (
    <article
      className="rounded-xl flex flex-col transition-shadow overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* ── Image ── */}
      <div className="relative w-full shrink-0 immersive-image">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ borderRadius: "12px 12px 0 0" }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{
              borderRadius: "12px 12px 0 0",
              backgroundColor: "var(--color-surface-2)",
            }}
          >
            🍽️
          </div>
        )}

        {/* tempClosed overlay */}
        {restaurant.tempClosed && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              borderRadius: "12px 12px 0 0",
              backgroundColor: "rgba(0,0,0,0.55)",
            }}
          >
            <span
              className="font-semibold text-white text-sm px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              Temporarily Closed
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col gap-2 p-4">

        {/* Line 1: name + rating */}
        <div className="flex items-start justify-between gap-2">
          <p
            className="font-bold leading-tight text-[18px] md:text-[16px]"
            style={{ color: "var(--color-text)" }}
          >
            {namePrefix}
            {restaurant.name}
          </p>
          {restaurant.rating !== undefined && (
            <span
              className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "#1a7a4a", whiteSpace: "nowrap" }}
            >
              {restaurant.rating.toFixed(1)}★
            </span>
          )}
        </div>

        {/* Line 2: cuisines */}
        <p
          className="truncate text-[14px] md:text-[13px]"
          style={{ color: "var(--color-text-2)" }}
        >
          {restaurant.cuisines.join(", ")}
        </p>

        {/* Line 3: areas */}
        <p
          className="truncate text-[14px] md:text-[13px]"
          style={{ color: "var(--color-text-3)" }}
        >
          📍 {areas}
          {distanceKm !== undefined && ` · ${distanceKm} km`}
        </p>

        {/* Line 4: price */}
        {restaurant.priceRange !== undefined ? (
          <p
            className="text-[14px] md:text-[13px]"
            style={{ color: "var(--color-text-3)" }}
          >
            ₹{restaurant.priceRange.toLocaleString("en-IN")} for two
          </p>
        ) : (
          <p className="text-[13px]" style={{ visibility: "hidden" }}>—</p>
        )}

        {/* Action buttons */}
        {(restaurant.menuUrl || restaurant.phone) && (
          <div className="flex flex-col md:flex-row gap-2 mt-1">
            {restaurant.menuUrl && (
              <a
                href={restaurant.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors md:w-auto w-full"
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
                className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors md:w-auto w-full"
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
        )}
      </div>
    </article>
  );
}
