"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import HeroCollage from "@/components/HeroCollage";
import restaurantsData from "@/data/restaurants.json";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantCardImmersive from "@/components/RestaurantCardImmersive";
import FilterDropdown from "@/components/FilterDropdown";
import FilterPanel, { PanelFilters, DEFAULT_PANEL_FILTERS, countActiveFilters } from "@/components/FilterPanel";
import LocationButton from "@/components/LocationButton";
import { Restaurant } from "@/types";
import { haversineKm } from "@/lib/distance";

const restaurants = restaurantsData as Restaurant[];

const allCuisines = Array.from(
  new Set(restaurants.flatMap((r) => r.cuisines))
).filter((c) => !["Desserts", "Ice Cream", "Beverages", "Juices", "Drinks", "Bar Food"].includes(c)).sort();

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

type ViewMode = "compact" | "immersive";

export default function HomeClient() {
  const [search, setSearch] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [highEndFilter, setHighEndFilter] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelFilters, setPanelFilters] = useState<PanelFilters>(DEFAULT_PANEL_FILTERS);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("compact");

  useEffect(() => {
    const saved = localStorage.getItem("wurrynot-view-mode");
    if (saved === "compact" || saved === "immersive") setViewMode(saved);
  }, []);

  function toggleViewMode() {
    setViewMode((prev) => {
      const next: ViewMode = prev === "compact" ? "immersive" : "compact";
      localStorage.setItem("wurrynot-view-mode", next);
      return next;
    });
  }

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

    if (dietFilter === "veg") results = results.filter((r) => r.dietType === "pure-veg");
    if (dietFilter === "non-veg") results = results.filter((r) => r.dietType !== "pure-veg");

    if (panelFilters.minRating !== null)
      results = results.filter((r) => (r.rating ?? 0) >= panelFilters.minRating!);

    const priceActive = panelFilters.minPrice !== null || panelFilters.maxPrice !== null;
    if (priceActive) {
      const lo = panelFilters.minPrice ?? 0;
      results = results.filter((r) => {
        if (r.priceRange === undefined) return false;
        if (r.priceRange < lo) return false;
        if (panelFilters.maxPrice !== null && r.priceRange > panelFilters.maxPrice) return false;
        return true;
      });
    }

    if (highEndFilter === "Hotel Restaurants") {
      results = results.filter((r) => !!r.hotelBrand);
    }

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
  }, [search, selectedCuisines, selectedAreas, userLocation, radiusKm, dietFilter, panelFilters, highEndFilter]);

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
    setDietFilter("all");
    setHighEndFilter("");
    setPanelFilters(DEFAULT_PANEL_FILTERS);
  }

  const panelActiveCount = countActiveFilters(panelFilters);

  const hasFilters =
    search || selectedCuisines.length > 0 || selectedAreas.length > 0 || dietFilter !== "all" || highEndFilter !== "" || panelActiveCount > 0;

  return (
    <main
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      className="min-h-screen"
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroCollage>
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <Image
              src="/wurrynot-logo.jpg"
              alt="Wurrynot"
              width={240}
              height={240}
              className="rounded-full object-cover shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Wurrynot
          </h1>
          <p className="text-orange-100 text-lg">
            Eat without the worry. Pune&apos;s best, personally picked.
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
      </HeroCollage>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* View toggle */}
        <div className="flex justify-end mb-3 sm:mb-4">
          <button
            onClick={toggleViewMode}
            className="w-full sm:w-auto px-4 py-1.5 rounded-full font-medium transition-colors"
            style={{
              fontSize: 13,
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-2)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {viewMode === "compact" ? "✦ Immersive View" : "✦ Compact View"}
          </button>
        </div>

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
              className="themed-input w-full pl-12 py-2.5 rounded-xl text-sm"
              style={{
                paddingRight: search ? "2.75rem" : "1rem",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-card)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
                style={{ color: "var(--color-text-3)" }}
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <FilterDropdown
            label="Cuisine"
            options={allCuisines}
            selected={selectedCuisines}
            onChange={toggleCuisine}
            onClear={() => setSelectedCuisines([])}
            accentColor="orange"
          />

          <FilterDropdown
            label="Area"
            options={allAreas}
            selected={selectedAreas}
            onChange={toggleArea}
            onClear={() => setSelectedAreas([])}
            accentColor="emerald"
          />

<FilterDropdown
            label="✦ High-End"
            options={["Hotel Restaurants"]}
            selected={highEndFilter ? [highEndFilter] : []}
            onChange={(val) => setHighEndFilter((prev) => (prev === val ? "" : val))}
            onClear={() => setHighEndFilter("")}
            accentColor="emerald"
          />

          {/* Filters button */}
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
            style={
              panelActiveCount > 0
                ? { backgroundColor: "var(--brand-orange)", color: "#fff", border: "1px solid var(--brand-orange)" }
                : { backgroundColor: "var(--color-surface)", color: "var(--color-text)", border: "1px solid var(--color-border)" }
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2M9 16h6" />
            </svg>
            Filters
            {panelActiveCount > 0 && (
              <span className="bg-white/30 text-xs rounded-full px-1.5 py-0.5 font-bold">
                {panelActiveCount}
              </span>
            )}
          </button>

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

        {/* Diet filter pills */}
        <div className="flex gap-2 mb-4">
          {(["all", "veg", "non-veg"] as const).map((d) => {
            const labels = { all: "All", veg: "🌿 Veg", "non-veg": "🍖 Non-Veg + Veg" };
            const isActive = dietFilter === d;
            return (
              <button
                key={d}
                onClick={() => setDietFilter(d)}
                className="px-3 py-1 text-sm rounded-full font-medium transition-colors border"
                style={
                  isActive
                    ? d === "veg"
                      ? { backgroundColor: "#16a34a", color: "#fff", borderColor: "#16a34a" }
                      : d === "non-veg"
                      ? { backgroundColor: "var(--brand-orange)", color: "#fff", borderColor: "var(--brand-orange)" }
                      : { backgroundColor: "var(--color-text)", color: "var(--color-bg)", borderColor: "var(--color-text)" }
                    : { backgroundColor: "var(--color-surface)", color: "var(--color-text-2)", borderColor: "var(--color-border)" }
                }
              >
                {labels[d]}
              </button>
            );
          })}
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
          viewMode === "compact" ? (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <RestaurantCardImmersive
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
          )
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

      {panelOpen && (
        <FilterPanel
          filters={panelFilters}
          onApply={setPanelFilters}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </main>
  );
}
