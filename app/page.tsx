"use client";

import { useState, useMemo } from "react";
import restaurantsData from "@/data/restaurants.json";
import RestaurantCard from "@/components/RestaurantCard";
import { Restaurant } from "@/types";

const restaurants = restaurantsData as Restaurant[];

const allCuisines = Array.from(
  new Set(restaurants.flatMap((r) => r.cuisines))
).sort();

const allAreas = Array.from(
  new Set(restaurants.flatMap((r) => r.branches.map((b) => b.area)))
).sort();

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchesCuisine =
        selectedCuisines.length === 0 ||
        selectedCuisines.some((c) => r.cuisines.includes(c));
      const matchesArea =
        selectedAreas.length === 0 ||
        r.branches.some((b) => selectedAreas.includes(b.area));
      return matchesSearch && matchesCuisine && matchesArea;
    });
  }, [search, selectedCuisines, selectedAreas]);

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
        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base bg-white"
          />
        </div>

        {/* Cuisine filter */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cuisine</p>
          <div className="flex flex-wrap gap-2">
            {allCuisines.map((c) => (
              <button
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  selectedCuisines.includes(c)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Area filter */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Area</p>
          <div className="flex flex-wrap gap-2">
            {allAreas.map((a) => (
              <button
                key={a}
                onClick={() => toggleArea(a)}
                className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  selectedAreas.includes(a)
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} found
          </p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-orange-600 hover:text-orange-800 font-medium underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <RestaurantCard key={r.name} restaurant={r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-lg font-medium">No restaurants match your filters</p>
            <button onClick={clearAll} className="mt-3 text-orange-500 underline text-sm">Clear filters</button>
          </div>
        )}
      </div>
    </main>
  );
}
