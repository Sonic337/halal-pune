"use client";

import { useState, useEffect, useCallback } from "react";

interface WurrynотReview {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  created_at: string;
  is_pinned?: boolean;
}

interface GoogleReview {
  rating: number;
  text: string;
  relativePublishTimeDescription: string;
  source: "google";
}

interface Props {
  restaurantSlug: string;
  restaurantName: string;
  googlePlaceId?: string;
  isAdmin?: boolean;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#f59e0b" : "var(--color-border)", fontSize: 14 }}>
          ★
        </span>
      ))}
    </span>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${s} star${s !== 1 ? "s" : ""}`}
          style={{
            fontSize: 24,
            color: s <= (hovered || value) ? "#f59e0b" : "var(--color-border)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0 1px",
            lineHeight: 1,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SourceTag({ source }: { source: "wurrynot" | "google" }) {
  const isGoogle = source === "google";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "2px 7px",
        borderRadius: 20,
        backgroundColor: isGoogle
          ? "rgba(66,133,244,0.15)"
          : "color-mix(in srgb, var(--brand-orange) 15%, transparent)",
        color: isGoogle ? "#4285F4" : "var(--brand-orange)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {isGoogle ? "Google Review" : "Wurrynot Review"}
    </span>
  );
}

function PinButton({
  isPinned,
  loading,
  onClick,
}: {
  isPinned: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onClick}
        disabled={loading}
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          border: isPinned ? "none" : "1px solid var(--color-border)",
          backgroundColor: isPinned ? "#16a34a" : "transparent",
          color: isPinned ? "#fff" : "var(--color-text-3)",
          opacity: loading ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {loading ? "…" : isPinned ? "📌 Pinned" : "📌 Pin as bubble"}
      </button>
      {isPinned && (
        <span style={{ fontSize: 10, color: "var(--color-text-3)" }}>
          Showing as bubble on listing page
        </span>
      )}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      {[40, 80, 60].map((w) => (
        <div
          key={w}
          style={{
            height: 12,
            width: `${w}%`,
            borderRadius: 6,
            backgroundColor: "var(--color-border)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  restaurantSlug,
  restaurantName,
  googlePlaceId,
  isAdmin = false,
}: Props) {
  const [reviews, setReviews] = useState<WurrynотReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Track which google review index is pinned (at most one)
  const [pinnedGoogleIdx, setPinnedGoogleIdx] = useState<number | null>(null);
  const [pinningWurrynot, setPinningWurrynot] = useState<string | null>(null);
  const [pinningGoogleIdx, setPinningGoogleIdx] = useState<number | null>(null);

  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [copyDone, setCopyDone] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/get?slug=${encodeURIComponent(restaurantSlug)}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!googlePlaceId) return;
    setGoogleLoading(true);
    fetch(`/api/reviews/google?placeId=${encodeURIComponent(googlePlaceId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.reviews)) setGoogleReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => setGoogleLoading(false));
  }, [googlePlaceId]);

  async function handlePinWurrynot(reviewId: string, currentlyPinned: boolean) {
    setPinningWurrynot(reviewId);
    try {
      const res = await fetch("/api/admin/pin-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          currentlyPinned
            ? { id: reviewId, unpin: true }
            : { id: reviewId, restaurant_slug: restaurantSlug }
        ),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => {
            if (currentlyPinned) {
              return r.id === reviewId ? { ...r, is_pinned: false } : r;
            }
            return { ...r, is_pinned: r.id === reviewId };
          })
        );
        // Clear any pinned Google review when pinning a Wurrynot one
        if (!currentlyPinned) setPinnedGoogleIdx(null);
      }
    } catch {
      // silent
    } finally {
      setPinningWurrynot(null);
    }
  }

  async function handlePinGoogle(idx: number) {
    const review = googleReviews[idx];
    if (!review) return;
    setPinningGoogleIdx(idx);
    try {
      const res = await fetch("/api/admin/pin-google-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_slug: restaurantSlug,
          restaurant_name: restaurantName,
          rating: review.rating,
          review_text: review.text,
        }),
      });
      if (res.ok) {
        setPinnedGoogleIdx(idx);
        // Unpin all Wurrynot reviews locally
        setReviews((prev) => prev.map((r) => ({ ...r, is_pinned: false })));
      }
    } catch {
      // silent
    } finally {
      setPinningGoogleIdx(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (rating === 0) { setSubmitError("Please select a star rating."); return; }
    if (text.trim().length < 10) { setSubmitError("Review must be at least 10 characters."); return; }

    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurant_slug: restaurantSlug,
        restaurant_name: restaurantName,
        reviewer_name: name,
        reviewer_email: email,
        rating,
        review_text: text,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmittedText(text);
    setSubmitted(true);
    setRating(0);
    setName("");
    setEmail("");
    setText("");
    fetchReviews();
  }

  async function handleCopyAndOpen() {
    try {
      await navigator.clipboard.writeText(submittedText);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      // clipboard may be denied; still open the tab
    }
    window.open(
      `https://search.google.com/local/writereview?placeid=${googlePlaceId}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
    backgroundColor: "var(--color-surface-2)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
    outline: "none",
  };

  const hasAnyReviews = reviews.length > 0 || googleReviews.length > 0 || googleLoading;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Reviews list ── */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <p style={{ color: "var(--color-text-3)", fontSize: 14 }}>Loading reviews…</p>
        ) : (
          <>
            {/* Wurrynot reviews */}
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                      {r.reviewer_name || "Anonymous"}
                    </span>
                    <span style={{ color: "var(--color-text-3)", fontSize: 12 }}>
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <SourceTag source="wurrynot" />
                    {isAdmin && (
                      <PinButton
                        isPinned={!!r.is_pinned}
                        loading={pinningWurrynot === r.id}
                        onClick={() => handlePinWurrynot(r.id, !!r.is_pinned)}
                      />
                    )}
                  </div>
                </div>
                <StarDisplay rating={r.rating} />
                <p style={{ color: "var(--color-text-2)", fontSize: 14, lineHeight: 1.5 }}>
                  {r.review_text}
                </p>
              </div>
            ))}

            {/* Google reviews */}
            {googleLoading ? (
              <>
                <ReviewSkeleton />
                <ReviewSkeleton />
              </>
            ) : (
              googleReviews.map((r, i) => (
                <div
                  key={`google-${i}`}
                  className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span style={{ color: "var(--color-text-3)", fontSize: 12 }}>
                      {r.relativePublishTimeDescription}
                    </span>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <SourceTag source="google" />
                      {isAdmin && (
                        <PinButton
                          isPinned={pinnedGoogleIdx === i}
                          loading={pinningGoogleIdx === i}
                          onClick={() => handlePinGoogle(i)}
                        />
                      )}
                    </div>
                  </div>
                  <StarDisplay rating={r.rating} />
                  <p style={{ color: "var(--color-text-2)", fontSize: 14, lineHeight: 1.5 }}>
                    {r.text}
                  </p>
                </div>
              ))
            )}

            {/* Empty state */}
            {!hasAnyReviews && !googleLoading && (
              <p style={{ color: "var(--color-text-3)", fontSize: 14 }}>
                No reviews yet. Be the first!
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Write a review ── */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <h3 className="font-bold text-base" style={{ color: "var(--color-text)" }}>
          Write a Review
        </h3>

        {submitted ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium" style={{ color: "#16a34a" }}>
              Thanks for your review!
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
              Enjoyed writing that? Help {restaurantName} by sharing it on Google too.
            </p>
            {googlePlaceId && (
              <button
                onClick={handleCopyAndOpen}
                className="flex items-center gap-2 self-start px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#1a7a4a" }}
              >
                {copyDone ? "✓ Copied!" : "Copy & Open Google Reviews →"}
              </button>
            )}
            <button
              onClick={() => setSubmitted(false)}
              className="self-start text-sm underline"
              style={{ color: "var(--color-text-3)" }}
            >
              Write another review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--color-text-2)" }}>
                Your rating <span style={{ color: "var(--brand-orange)" }}>*</span>
              </p>
              <StarSelector value={rating} onChange={setRating} />
            </div>

            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="themed-input"
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="themed-input"
              style={inputStyle}
            />

            <textarea
              placeholder="Share your experience..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
              className="themed-input resize-none"
              style={inputStyle}
            />

            {submitError && (
              <p className="text-sm" style={{ color: "#dc2626" }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #f97316, #10b981)" }}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
