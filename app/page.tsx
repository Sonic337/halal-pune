"use client";

import { useState, useMemo } from "react";
import restaurantsData from "@/data/restaurants.json";
import RestaurantCard from "@/components/RestaurantCard";
import FilterDropdown from "@/components/FilterDropdown";
import LocationButton from "@/components/LocationButton";
import ThemeToggle from "@/components/ThemeToggle";
import { Restaurant } from "@/types";
import { haversineKm } from "@/lib/distance";

const restaurants = restaurantsData as Restaurant[];

const allCuisines = Array.from(
  new Set(restaurants.flatMap((r) => r.cuisines))
).filter((c) => c !== "Desserts" && c !== "Ice Cream").sort();

const allAreas = Array.from(
  new Set(restaurants.flatMap((r) => r.branches.map((b) => b.area)))
).sort();

interface UserLocation {
  lat: number;
  lng: number;
}

function nearestDistance(
  restaurant: Restaurant,
  loc: UserLocation
): number | undefined {
  const dists = restaurant.branches
    .filter((b) => b.lat != null && b.lng != null)
    .map((b) => haversineKm(loc.lat, loc.lng, b.lat!, b.lng!));
  return dists.length > 0 ? Math.min(...dists) : undefined;
}

function sortedBranches(restaurant: Restaurant, loc: UserLocation) {
  return [...restaurant.branches].sort((a, b) => {
    const da =
      a.lat != null && a.lng != null
        ? haversineKm(loc.lat, loc.lng, a.lat, a.lng)
        : Infinity;
    const db =
      b.lat != null && b.lng != null
        ? haversineKm(loc.lat, loc.lng, b.lat, b.lng)
        : Infinity;
    return da - db;
  });
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);

  function handleLocation(coords: UserLocation | null, radius: number) {
    setUserLocation(coords);
    setRadiusKm(radius);
  }

  const filtered = useMemo(() => {
    let results = restaurants.filter((r) => {
      const matchesSearch = r.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCuisine =
        selectedCuisines.length === 0 ||
        selectedCuisines.some((c) => r.cuisines.includes(c));
      const matchesArea =
        selectedAreas.length === 0 ||
        r.branches.some((b) => selectedAreas.includes(b.area));
      return matchesSearch && matchesCuisine && matchesArea;
    });

    if (userLocation) {
      results = results.filter((r) => {
        const d = nearestDistance(r, userLocation);
        return d !== undefined && d <= radiusKm;
      });
      results.sort((a, b) => {
        const da = nearestDistance(a, userLocation) ?? Infinity;
        const db = nearestDistance(b, userLocation) ?? Infinity;
        return da - db;
      });
    }

    return results;
  }, [search, selectedCuisines, selectedAreas, userLocation, radiusKm]);

  function toggleCuisine(c: string) {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function toggleArea(a: string) {
    setSelectedAreas((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  function clearAll() {
    setSearch("");
    setSelectedCuisines([]);
    setSelectedAreas([]);
  }

  const hasFilters =
    search || selectedCuisines.length > 0 || selectedAreas.length > 0;

  return (
    <main
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      className="min-h-screen"
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="relative bg-gradient-to-r from-orange-500 to-emerald-600 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-2" aria-hidden="true">
            🍽️
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Wurrynot
          </h1>
          <p className="text-orange-100 text-lg">
            Eat without the worry. Pune&apos;s best local spots, personally
            picked.
          </p>
          <p className="text-orange-200 text-sm mt-3">
            Spotted something wrong?{" "}
            <a
              href="mailto:contactwurrynot@gmail.com"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              contactwurrynot@gmail.com
            </a>
          </p>
        </div>

        {/* Theme toggle — top-right of hero */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search + Filter row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--color-text-3)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="themed-input w-full pl-12 pr-4 py-2.5 rounded-xl text-sm"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-card)",
              }}
            />
          </div>

          <FilterDropdown
            label="Cuisine"
            options={allCuisines}
            selected={selectedCuisines}
            onChange={toggleCuisine}
            accentColor="orange"
          />

          <FilterDropdown
            label="Area"
            options={allAreas}
            selected={selectedAreas}
            onChange={toggleArea}
            accentColor="emerald"
          />

          {hasFilters && (
            <button
              onClick={clearAll}
              className="px-4 py-2.5 text-sm rounded-xl font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-2)",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "var(--color-surface-2)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "var(--color-surface)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-text-2)";
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active filter pills */}
        {(selectedCuisines.length > 0 || selectedAreas.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedCuisines.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--brand-orange) 15%, var(--color-surface))",
                  color: "var(--brand-orange-dark)",
                  border: "1px solid color-mix(in srgb, var(--brand-orange) 30%, transparent)",
                }}
              >
                {c}
                <button
                  onClick={() => toggleCuisine(c)}
                  aria-label={`Remove ${c} filter`}
                  className="hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </span>
            ))}
            {selectedAreas.map((a) => (
              <span
                key={a}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--brand-emerald) 15%, var(--color-surface))",
                  color: "var(--brand-emerald-dark)",
                  border: "1px solid color-mix(in srgb, var(--brand-emerald) 30%, transparent)",
                }}
              >
                {a}
                <button
                  onClick={() => toggleArea(a)}
                  aria-label={`Remove ${a} filter`}
                  className="hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results count */}
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-text-2)" }}
        >
          {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} found
          {userLocation && ` within ${radiusKm} km`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <RestaurantCard
                key={r.name}
                restaurant={r}
                branches={
                  userLocation ? sortedBranches(r, userLocation) : undefined
                }
                distanceKm={
                  userLocation ? nearestDistance(r, userLocation) : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20"
            style={{ color: "var(--color-text-3)" }}
          >
            <div className="text-5xl mb-3" aria-hidden="true">
              🍽️
            </div>
            <p className="text-lg font-medium" style={{ color: "var(--color-text-2)" }}>
              {userLocation
                ? `No restaurants within ${radiusKm} km`
                : "No restaurants match your filters"}
            </p>
            <button
              onClick={clearAll}
              className="mt-3 text-sm underline transition-opacity hover:opacity-70"
              style={{ color: "var(--brand-orange)" }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <LocationButton onLocation={handleLocation} />
    </main>
  );
}
