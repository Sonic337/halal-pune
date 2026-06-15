"use client";

import { useState, useMemo } from "react";
import restaurantsData from "@/data/restaurants.json";
import RestaurantCard from "@/components/RestaurantCard";
import FilterDropdown from "@/components/FilterDropdown";
import LocationButton from "@/components/LocationButton";
import { Restaurant } from "@/types";
import { haversineKm } from "@/lib/distance";

const restaurants = restaurantsData as Restaurant[];

const allCuisines = Array.from(
  new Set(restaurants.flatMap((r) => r.cuisines))
).sort();

const allAreas = Array.from(
  new Set(restaurants.flatMap((r) => r.branches.map((b) => b.area)))
).sort();

interface UserLocation { lat: number; lng: number }

function nearestDistance(restaurant: Restaurant, loc: UserLocation): number | undefined {
  const dists = restaurant.branches
    .filter((b) => b.lat != null && b.lng != null)
    .map((b) => haversineKm(loc.lat, loc.lng, b.lat!, b.lng!));
  return dists.length > 0 ? Math.min(...dists) : undefined;
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
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
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

  const hasFilters = search || selectedCuisines.length > 0 || selectedAreas.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-emerald-600 text-white py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-4xl mb-2">🕌</div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Halal Eats Pune</h1>
          <p className="text-orange-100 text-lg">Find halal restaurants across Pune — verified &amp; curated</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search + Filter row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
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
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active filter pills */}
        {(selectedCuisines.length > 0 || selectedAreas.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedCuisines.map((c) => (
              <span key={c} className="flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1.5 rounded-full">
                {c}
                <button onClick={() => toggleCuisine(c)} className="hover:text-orange-600">✕</button>
              </span>
            ))}
            {selectedAreas.map((a) => (
              <span key={a} className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1.5 rounded-full">
                {a}
                <button onClick={() => toggleArea(a)} className="hover:text-emerald-600">✕</button>
              </span>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
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
                distanceKm={userLocation ? nearestDistance(r, userLocation) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-lg font-medium">
              {userLocation ? `No restaurants within ${radiusKm} km` : "No restaurants match your filters"}
            </p>
            <button onClick={clearAll} className="mt-3 text-orange-500 underline text-sm">Clear filters</button>
          </div>
        )}
      </div>

      <LocationButton onLocation={handleLocation} />
    </main>
  );
}
