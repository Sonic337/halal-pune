"use client";

interface Props {
  rating: number;
  reviewText: string;
  visible: boolean;
  onDismiss: () => void;
}

export default function PinnedReviewBubble({ rating, reviewText, visible, onDismiss }: Props) {
  const truncated = reviewText.length > 80 ? reviewText.slice(0, 80) + "…" : reviewText;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onDismiss(); }}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 20,
        maxWidth: 200,
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.85)",
        transformOrigin: "top right",
        transition: visible
          ? "opacity 250ms ease-out, transform 250ms ease-out"
          : "opacity 200ms ease-in, transform 200ms ease-in",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Stars */}
      <div style={{ fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} style={{ color: s <= rating ? "#FFB800" : "#D1D5DB" }}>
            {s <= rating ? "★" : "☆"}
          </span>
        ))}
      </div>

      {/* Review text */}
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.4,
          color: "var(--color-text-2)",
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {truncated}
      </p>

      {/* Speech bubble tail — triangle pointing down-left */}
      <div
        style={{
          position: "absolute",
          bottom: -7,
          left: 16,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "7px solid var(--color-border)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: 17,
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "6px solid var(--color-surface)",
        }}
      />
    </div>
  );
}
