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
        fontSize: 11,
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

export default function ReviewsTable({ reviews: initial }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pinning, setPinning] = useState<string | null>(null);

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
              // unpin all same restaurant, pin this one
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
    return <p style={{ color: "#6b7280", fontSize: 14 }}>No reviews yet.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
            <th style={th}>Restaurant</th>
            <th style={th}>Source</th>
            <th style={th}>Reviewer</th>
            <th style={th}>Rating</th>
            <th style={th}>Review</th>
            <th style={th}>Date</th>
            <th style={th}>Pin</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr
              key={r.id}
              style={{
                borderBottom: "1px solid #f3f4f6",
                backgroundColor: r.is_pinned ? "#f0fdf4" : undefined,
              }}
            >
              <td style={td}>{r.restaurant_name || "—"}</td>
              <td style={td}><SourcePill source={r.source} /></td>
              <td style={td}>{r.reviewer_name || <span style={{ color: "#9ca3af" }}>Anonymous</span>}</td>
              <td style={{ ...td, color: "#d97706", whiteSpace: "nowrap" }}>{stars(r.rating)}</td>
              <td style={td}>
                <span title={r.review_text}>
                  {r.review_text.length > 100 ? r.review_text.slice(0, 100) + "…" : r.review_text}
                </span>
              </td>
              <td style={{ ...td, whiteSpace: "nowrap", color: "#6b7280" }}>{formatDate(r.created_at)}</td>
              <td style={td}>
                <button
                  onClick={() => handlePin(r)}
                  disabled={pinning === r.id}
                  style={
                    r.is_pinned
                      ? {
                          padding: "3px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#fff",
                          backgroundColor: pinning === r.id ? "#86efac" : "#16a34a",
                          border: "none",
                          borderRadius: 4,
                          cursor: pinning === r.id ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }
                      : {
                          padding: "3px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#16a34a",
                          backgroundColor: "transparent",
                          border: "1px solid #16a34a",
                          borderRadius: 4,
                          cursor: pinning === r.id ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }
                  }
                >
                  {pinning === r.id ? "…" : r.is_pinned ? "Pinned ★" : "Pin"}
                </button>
              </td>
              <td style={td}>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  style={{
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: deleting === r.id ? "#fca5a5" : "#dc2626",
                    border: "none",
                    borderRadius: 4,
                    cursor: deleting === r.id ? "not-allowed" : "pointer",
                  }}
                >
                  {deleting === r.id ? "…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "8px 12px",
  fontWeight: 600,
  color: "#374151",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  color: "#111827",
  verticalAlign: "top",
};
