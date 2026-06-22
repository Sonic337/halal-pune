"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Restaurant, Branch } from "@/types";
import { slugify } from "@/lib/slug";
import PinnedReviewBubble from "@/components/PinnedReviewBubble";

export default function RestaurantCardImmersive({
  restaurant,
  branches: branchesProp,
  distanceKm,
  pinnedReview,
  isActive,
  onDismiss,
  onHoverStart,
  onHoverEnd,
}: {
  restaurant: Restaurant;
  branches?: Branch[];
  distanceKm?: number;
  pinnedReview?: { rating: number; review_text: string };
  isActive?: boolean;
  onDismiss?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  const branches = branchesProp ?? restaurant.branches;
  const slug = slugify(restaurant.name);

  const [hovered, setHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [areasExpanded, setAreasExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasActions = !!(restaurant.menuUrl || restaurant.phone);

  // Close mobile dropdown on outside tap
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutsideTap(e: TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("touchstart", handleOutsideTap);
    return () => document.removeEventListener("touchstart", handleOutsideTap);
  }, [dropdownOpen]);

  return (
    <Link href={`/restaurants/${slug}`} className="block">
    <article
      className="flex flex-col"
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={() => { setHovered(true); onHoverStart?.(); }}
      onMouseLeave={() => { setHovered(false); onHoverEnd?.(); }}
    >
      {/* ── Image ── */}
      <div
        className="relative w-full shrink-0 immersive-image"
        style={{ borderRadius: "12px 12px 0 0", overflow: "visible" }}
      >
        {pinnedReview && (
          <PinnedReviewBubble
            rating={pinnedReview.rating}
            reviewText={pinnedReview.review_text}
            visible={!!isActive}
            onDismiss={onDismiss ?? (() => {})}
          />
        )}
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: "var(--color-surface-2)" }}
          >
            🍽️
          </div>
        )}

        {/* tempClosed overlay */}
        {restaurant.tempClosed && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.52)" }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.03em",
              }}
            >
              Temporarily Closed
            </span>
          </div>
        )}

        {/* Desktop hover button overlay */}
        {hasActions && (
          <div
            className="absolute inset-x-0 bottom-0 hidden md:flex items-end gap-2 px-3 pb-3 pt-8"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 200ms ease",
              pointerEvents: hovered ? "auto" : "none",
            }}
          >
            {restaurant.menuUrl && (
              <a
                href={restaurant.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "4px 10px",
                  borderRadius: 20,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                📋 View Menu
              </a>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "4px 10px",
                  borderRadius: 20,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                📞 Call
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div
        className="flex flex-col"
        style={{ padding: 12, gap: 4 }}
      >
        {/* Row 1: name + rating */}
        <div className="flex items-center gap-2 min-w-0">
          <p
            className="truncate"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--color-text)",
              flex: 1,
              minWidth: 0,
            }}
          >
            {restaurant.name}
          </p>
          {restaurant.rating !== undefined && (
            <span
              style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                backgroundColor: "#1a7a4a",
                padding: "2px 7px",
                borderRadius: 20,
                whiteSpace: "nowrap",
              }}
            >
              {restaurant.rating.toFixed(1)}★
            </span>
          )}
        </div>

        {/* Row 2: cuisines */}
        <p
          className="truncate"
          style={{
            fontSize: 12,
            color: "var(--color-text-2)",
          }}
        >
          {restaurant.cuisines.join(", ")}
        </p>

        {/* Row 3: branch list */}
        <div className="flex flex-col" style={{ gap: 2 }}>
          {(areasExpanded ? branches : branches.slice(0, 2)).map((b) => (
            <div key={b.area} style={{ fontSize: 12, color: "var(--color-text-3)" }}>
              {b.mapsUrl ? (
                <a
                  href={b.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: "var(--color-text-3)",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  📍 {b.area}
                  {b.rating !== undefined && (
                    <span style={{ marginLeft: 4 }}>★ {b.rating.toFixed(1)}</span>
                  )}
                </a>
              ) : (
                <span>
                  📍 {b.area}
                  {b.rating !== undefined && (
                    <span style={{ marginLeft: 4 }}>★ {b.rating.toFixed(1)}</span>
                  )}
                </span>
              )}
            </div>
          ))}

          {!areasExpanded && branches.length > 2 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAreasExpanded(true); }}
              style={{
                fontSize: 12,
                color: "var(--color-text-3)",
                textDecoration: "underline",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                textAlign: "left",
              }}
            >
              +{branches.length - 2} more
            </button>
          )}

          {areasExpanded && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAreasExpanded(false); }}
              style={{
                fontSize: 12,
                color: "var(--color-text-3)",
                textDecoration: "underline",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                textAlign: "left",
              }}
            >
              show less
            </button>
          )}
        </div>

        {/* Price row */}
        {restaurant.priceRange !== undefined && (
          <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
            ₹{restaurant.priceRange.toLocaleString("en-IN")} for two
          </p>
        )}

        {/* Row 4: hotelBrand (conditional) */}
        {restaurant.hotelBrand && (
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-3)",
              fontStyle: "italic",
            }}
          >
            Part of {restaurant.hotelBrand}
          </p>
        )}

        {/* Mobile options pill + inline dropdown */}
        {hasActions && (
          <div ref={dropdownRef} className="md:hidden" style={{ marginTop: 4 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setDropdownOpen((v) => !v); }}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-text-2)",
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                padding: "3px 10px",
                borderRadius: 20,
                cursor: "pointer",
              }}
            >
              {dropdownOpen ? "✕ Close" : "••• Options"}
            </button>

            {dropdownOpen && (
              <div
                className="flex flex-col"
                style={{ marginTop: 6, gap: 2 }}
              >
                {restaurant.menuUrl && (
                  <a
                    href={restaurant.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 14,
                      color: "var(--color-text)",
                      padding: "8px 4px",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    📋 View Menu
                  </a>
                )}
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 14,
                      color: "var(--color-text)",
                      padding: "8px 4px",
                      textDecoration: "none",
                    }}
                  >
                    📞 Call
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
    </Link>
  );
}
