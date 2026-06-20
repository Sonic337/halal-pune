"use client";

import { useState } from "react";
import Link from "next/link";

export default function FormsClient() {
  const [restaurants, setRestaurants] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurants.trim()) return;

    const turnstileToken =
      (document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value ?? "";

    setStatus("loading");
    try {
      const res = await fetch("/api/suggest-restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurants, turnstileToken }),
      });

      if (res.ok) {
        setStatus("success");
        setRestaurants("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-emerald-600 text-white py-10 px-4 text-center">
        <Link href="/" className="text-white/70 text-sm hover:text-white mb-4 inline-block">
          ← Back to Wurrynot
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Suggestions</h1>
        <p className="mt-1 text-white/80 text-sm">Restaurants in Pune</p>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div
          className="w-full max-w-lg rounded-2xl p-8 flex flex-col gap-6"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              SUGGESTIONS — RESTAURANTS IN PUNE
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
              We are creating a curated list of Halal restaurants in Pune.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="restaurants"
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Add restaurant name below{" "}
                <span style={{ color: "var(--color-text-3)" }}>
                  (separate with a comma if adding multiple)
                </span>
              </label>
              <textarea
                id="restaurants"
                value={restaurants}
                onChange={(e) => setRestaurants(e.target.value)}
                placeholder="e.g. Kebabbest, Persian Darbar, Blue Nile..."
                rows={4}
                className="themed-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                style={{
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>

            <div className="cf-turnstile" data-sitekey="0x4AAAAAADoNTRuX1QAq2Yjr"></div>

            <button
              type="submit"
              disabled={status === "loading" || !restaurants.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #f97316, #10b981)" }}
            >
              {status === "loading" ? "Sending..." : "Submit Suggestion"}
            </button>

            {status === "success" && (
              <p className="text-sm text-center font-medium text-emerald-600">
                ✓ Thanks! We&apos;ll review your suggestion soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-center font-medium text-red-600">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
