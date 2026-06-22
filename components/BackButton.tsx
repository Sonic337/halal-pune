"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={handleBack}
      className="text-sm transition-opacity hover:opacity-70"
      style={{ color: "var(--color-text-2)" }}
    >
      ← Back to listings
    </button>
  );
}
