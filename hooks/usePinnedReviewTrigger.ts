"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_STOP_MS = 2500;
const AUTO_DISMISS_MS = 10000;

export function usePinnedReviewTrigger(
  cardRefs: React.RefObject<Map<string, HTMLElement>>,
  slugsWithPinned: Set<string>
): { activeSlug: string | null; dismiss: () => void } {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingRef = useRef(false);

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

  function dismiss() {
    clearDismissTimer();
    setActiveSlug(null);
  }

  function getMostCenteredSlug(): string | null {
    const refs = cardRefs.current;
    if (!refs) return null;

    const viewportMid = window.innerHeight / 2;
    let bestSlug: string | null = null;
    let bestDist = Infinity;

    refs.forEach((el, slug) => {
      if (!slugsWithPinned.has(slug)) return;
      const rect = el.getBoundingClientRect();
      // Card must be at least partially visible
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const cardMid = rect.top + rect.height / 2;
      const dist = Math.abs(cardMid - viewportMid);
      if (dist < bestDist) {
        bestDist = dist;
        bestSlug = slug;
      }
    });

    return bestSlug;
  }

  useEffect(() => {
    console.log("[PinnedReview] slugsWithPinned:", [...slugsWithPinned]);
    console.log("[PinnedReview] cards being tracked:", cardRefs.current?.size ?? 0);
  }, [slugsWithPinned, cardRefs]);

  useEffect(() => {
    console.log("[PinnedReview] activeSlug changed:", activeSlug);
  }, [activeSlug]);

  useEffect(() => {
    if (slugsWithPinned.size === 0) return;

    function onScrollStart() {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        clearDismissTimer();
        setActiveSlug(null);
      }
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        const slug = getMostCenteredSlug();
        setActiveSlug(slug);
        if (slug) startDismissTimer();
      }, SCROLL_STOP_MS);
    }

    window.addEventListener("scroll", onScrollStart, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollStart);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      clearDismissTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsWithPinned]);

  return { activeSlug, dismiss };
}
