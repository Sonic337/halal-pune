"use client";

import { useState } from "react";
import { Restaurant } from "@/types";
import ReviewsSection from "@/components/ReviewsSection";

interface Props {
  restaurant: Restaurant;
  slug: string;
  isAdmin: boolean;
}

export default function RestaurantTabs({ restaurant, slug, isAdmin }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");

  const tabStyle = (tab: "overview" | "reviews"): React.CSSProperties =>
    activeTab === tab
      ? {
          color: "var(--color-text)",
          borderBottom: "2px solid var(--brand-orange)",
          fontWeight: 700,
          paddingBottom: 8,
          marginBottom: -1,
        }
      : {
          color: "var(--color-text-3)",
          borderBottom: "2px solid transparent",
          fontWeight: 400,
          paddingBottom: 8,
          marginBottom: -1,
          cursor: "pointer",
        };

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-6 mb-6"
        style={{ borderBottom: "1px solid var(--color-border)" }}
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          className="text-sm transition-colors"
          style={tabStyle("overview")}
        >
          Overview
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "reviews"}
          onClick={() => setActiveTab("reviews")}
          className="text-sm transition-colors"
          style={tabStyle("reviews")}
        >
          Reviews
        </button>
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6 pb-12">
          {/* Branches */}
          <div>
            <h2
              className="text-base font-semibold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              Locations
            </h2>
            <div className="flex flex-col gap-3">
              {restaurant.branches.map((b) => (
                <div
                  key={b.area}
                  className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                      {b.area}
                    </p>
                    {b.rating !== undefined && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                        ★ {b.rating.toFixed(1)}
                        {b.reviewCount !== undefined && ` · ${b.reviewCount.toLocaleString()} reviews`}
                      </p>
                    )}
                  </div>
                  {b.mapsUrl && (
                    <a
                      href={b.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--brand-emerald) 12%, var(--color-surface))",
                        color: "var(--brand-emerald-dark)",
                        border: "1px solid color-mix(in srgb, var(--brand-emerald) 30%, transparent)",
                      }}
                    >
                      Get Directions
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          {(restaurant.menuUrl || restaurant.phone) && (
            <div className="flex flex-wrap gap-3">
              {restaurant.menuUrl && (
                <a
                  href={restaurant.menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(to right, #f97316, #10b981)" }}
                >
                  📋 View Menu
                </a>
              )}
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  📞 {restaurant.phone}
                </a>
              )}
            </div>
          )}

          {!restaurant.menuUrl && !restaurant.phone && restaurant.branches.length === 0 && (
            <p style={{ color: "var(--color-text-3)", fontSize: 14 }}>
              More details coming soon.
            </p>
          )}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="pb-12">
          <ReviewsSection
            restaurantSlug={slug}
            restaurantName={restaurant.name}
            googlePlaceId={restaurant.googlePlaceId}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
}
