"use client";

import { useState } from "react";

interface Review {
  id: string;
  restaurant_name: string;
  restaurant_slug: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  created_at: string;
  is_pinned: boolean;
  source?: string;
}

function SourcePill({ source }: { source?: string }) {
  const isGoogle = source === "google";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        backgroundColor: isGoogle ? "rgba(66,133,244,0.15)" : "rgba(249,115,22,0.12)",
        color: isGoogle ? "#4285F4" : "#c2410c",
        whiteSpace: "nowrap",
      }}
    >
      {isGoogle ? "Google" : "Wurrynot"}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stars(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function ReviewsTable({ reviews: initial, role }: { reviews: Review[]; role: "admin" | "editor" }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pinning, setPinning] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/delete-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete review");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeleting(null);
    }
  }

  async function handlePin(review: Review) {
    setPinning(review.id);
    const isCurrentlyPinned = review.is_pinned;
    try {
      const res = await fetch("/api/admin/pin-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isCurrentlyPinned
            ? { id: review.id, unpin: true }
            : { id: review.id, restaurant_slug: review.restaurant_slug }
        ),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => {
            if (isCurrentlyPinned) {
              return r.id === review.id ? { ...r, is_pinned: false } : r;
            } else {
              if (r.restaurant_slug === review.restaurant_slug) {
                return { ...r, is_pinned: r.id === review.id };
              }
              return r;
            }
          })
        );
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to update pin");
      }
    } catch {
      alert("Network error");
    } finally {
      setPinning(null);
    }
  }

  if (reviews.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>No reviews yet.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th style={th}>Restaurant</th>
              <th style={th}>Source</th>
              <th style={th}>Reviewer</th>
              <th style={th}>Rating</th>
              <th style={th}>Review</th>
              <th style={th}>Date</th>
              <th style={th}>Pin</th>
              {role === "admin" && <th style={th}></th>}
            </tr>
          </thead>
          <tbody>
            {reviews.map((r, i) => (
              <tr
                key={r.id}
                onMouseEnter={() => setHoveredRow(r.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderBottom: i < reviews.length - 1 ? "1px solid #e2e8f0" : "none",
                  borderLeft: r.is_pinned ? "3px solid #1a7a4a" : "3px solid transparent",
                  backgroundColor: r.is_pinned
                    ? "rgba(26,122,74,0.04)"
                    : hoveredRow === r.id
                    ? "rgba(0,0,0,0.02)"
                    : "#ffffff",
                  transition: "background-color 0.1s",
                }}
              >
                <td style={{ ...td, fontWeight: 600, color: "#0f172a" }}>
                  {r.restaurant_name || "—"}
                </td>
                <td style={td}>
                  <SourcePill source={r.source} />
                </td>
                <td style={{ ...td, color: r.reviewer_name ? "#334155" : "#94a3b8" }}>
                  {r.reviewer_name || "Anonymous"}
                </td>
                <td style={{ ...td, color: "#d97706", whiteSpace: "nowrap", fontSize: 12 }}>
                  {stars(r.rating)}
                </td>
                <td style={{ ...td, color: "#475569", maxWidth: 260 }}>
                  <span title={r.review_text}>
                    {r.review_text.length > 120 ? r.review_text.slice(0, 120) + "…" : r.review_text}
                  </span>
                </td>
                <td style={{ ...td, whiteSpace: "nowrap", color: "#94a3b8", fontSize: 12 }}>
                  {formatDate(r.created_at)}
                </td>
                <td style={td}>
                  <button
                    onClick={() => handlePin(r)}
                    disabled={pinning === r.id}
                    style={
                      r.is_pinned
                        ? {
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#ffffff",
                            backgroundColor: pinning === r.id ? "#86efac" : "#1a7a4a",
                            border: "none",
                            borderRadius: 6,
                            cursor: pinning === r.id ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                          }
                        : {
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#1a7a4a",
                            backgroundColor: "transparent",
                            border: "1px solid #1a7a4a",
                            borderRadius: 6,
                            cursor: pinning === r.id ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                          }
                    }
                  >
                    {pinning === r.id ? "…" : r.is_pinned ? "Pinned ★" : "Pin"}
                  </button>
                </td>
                {role === "admin" && (
                  <td style={td}>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      style={{
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#dc2626",
                        backgroundColor: "transparent",
                        border: "1px solid #dc2626",
                        borderRadius: 6,
                        cursor: deleting === r.id ? "not-allowed" : "pointer",
                        opacity: deleting === r.id ? 0.5 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {deleting === r.id ? "…" : "Delete"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 16px",
  fontWeight: 600,
  color: "#94a3b8",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "14px 16px",
  color: "#334155",
  verticalAlign: "top",
};
