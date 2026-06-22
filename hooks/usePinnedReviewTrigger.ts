"use client";

import { useEffect, useRef, useState } from "react";

const HOVER_TRIGGER_MS = 2500;
const AUTO_DISMISS_MS = 10000;

export function usePinnedReviewTrigger(
  slugsWithPinned: Set<string>
): {
  activeSlug: string | null;
  dismiss: () => void;
  onCardHover: (slug: string) => void;
  onCardLeave: () => void;
} {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredSlugRef = useRef<string | null>(null);
  const slugsRef = useRef<Set<string>>(slugsWithPinned);

  useEffect(() => {
    slugsRef.current = slugsWithPinned;
  }, [slugsWithPinned]);

  function clearHoverTimer() {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }

  function clearDismissTimer() {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }

  function startDismissTimer() {
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      setActiveSlug(null);
    }, AUTO_DISMISS_MS);
  }

  function onCardHover(slug: string) {
    // Hovering a new card clears any running dismiss timer
    clearDismissTimer();

    if (!slugsRef.current.has(slug)) {
      // This card has no pinned review — clear any pending hover timer
      clearHoverTimer();
      hoveredSlugRef.current = null;
      return;
    }

    // Already waiting on or showing this slug — do nothing
    if (hoveredSlugRef.current === slug) return;

    hoveredSlugRef.current = slug;
    clearHoverTimer();

    console.log(`[PinnedReview] hovering "${slug}" — has pinned review, starting ${HOVER_TRIGGER_MS}ms timer`);

    hoverTimerRef.current = setTimeout(() => {
      if (hoveredSlugRef.current === slug && slugsRef.current.has(slug)) {
        console.log(`[PinnedReview] showing bubble for "${slug}"`);
        setActiveSlug(slug);
      }
    }, HOVER_TRIGGER_MS);
  }

  function onCardLeave() {
    clearHoverTimer();
    hoveredSlugRef.current = null;
    // If a bubble is currently visible, start the auto-dismiss countdown
    startDismissTimer();
  }

  function dismiss() {
    clearHoverTimer();
    clearDismissTimer();
    setActiveSlug(null);
  }

  useEffect(() => {
    console.log("[PinnedReview] slugsWithPinned updated:", [...slugsWithPinned]);
  }, [slugsWithPinned]);

  useEffect(() => {
    console.log("[PinnedReview] activeSlug:", activeSlug);
  }, [activeSlug]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHoverTimer();
      clearDismissTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeSlug, dismiss, onCardHover, onCardLeave };
}
