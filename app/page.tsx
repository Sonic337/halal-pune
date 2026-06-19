"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [fishFilter, setFishFilter] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");

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

    if (fishFilter.length > 0) {
      results = results.filter((r) => {
        if (!r.fishNote) return false;
        const confirmed = r.fishNote.includes("We've confirmed");
        if (fishFilter.includes("confirmed") && confirmed) return true;
        if (fishFilter.includes("unconfirmed") && !confirmed) return true;
        return false;
      });
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
  }, [search, selectedCuisines, selectedAreas, userLocation, radiusKm, dietFilter, fishFilter]);

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

  function toggleFish(val: string) {
    setFishFilter((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  }

  function clearAll() {
    setSearch("");
    setSelectedCuisines([]);
    setSelectedAreas([]);
    setDietFilter("all");
    setFishFilter([]);
  }

  const hasFilters =
    search || selectedCuisines.length > 0 || selectedAreas.length > 0 || dietFilter !== "all" || fishFilter.length > 0;

  return (
    <main
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      className="min-h-screen"
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="relative bg-gradient-to-r from-orange-500 to-emerald-600 text-white py-12 px-4 overflow-hidden">

        {/* Food image collage — desktop/tablet only */}
        <div className="hidden md:block" aria-hidden="true">
          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(14px) var(--img-rotate, rotate(0deg)); }
              to   { opacity: 1; transform: translateY(0px)  var(--img-rotate, rotate(0deg)); }
            }
            .hero-img {
              position: absolute;
              border-radius: 13px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.35);
              object-fit: cover;
              animation: fadeUp 0.7s ease both;
            }
          `}</style>

          {/* Row of images — hardcoded positions, varied rotations & sizes */}
          <Image unoptimized src="https://source.unsplash.com/180x220/?biryani" alt="" width={180} height={220}
            className="hero-img" style={{ top: "-20px", left: "2%", zIndex: 2, rotate: "-8deg", animationDelay: "0ms" }} />

          <Image unoptimized src="https://source.unsplash.com/140x170/?kebab" alt="" width={140} height={170}
            className="hero-img" style={{ top: "40px", left: "12%", zIndex: 4, rotate: "5deg", animationDelay: "80ms" }} />

          <Image unoptimized src="https://source.unsplash.com/220x270/?curry" alt="" width={220} height={270}
            className="hero-img" style={{ top: "-30px", left: "22%", zIndex: 1, rotate: "-13deg", animationDelay: "160ms" }} />

          <Image unoptimized src="https://source.unsplash.com/160x200/?naan" alt="" width={160} height={200}
            className="hero-img" style={{ bottom: "-30px", left: "8%", zIndex: 3, rotate: "7deg", animationDelay: "240ms" }} />

          <Image unoptimized src="https://source.unsplash.com/130x160/?samosa" alt="" width={130} height={160}
            className="hero-img" style={{ bottom: "-10px", left: "28%", zIndex: 5, rotate: "-4deg", animationDelay: "300ms" }} />

          <Image unoptimized src="https://source.unsplash.com/200x240/?shawarma" alt="" width={200} height={240}
            className="hero-img" style={{ top: "10px", right: "22%", zIndex: 2, rotate: "10deg", animationDelay: "100ms" }} />

          <Image unoptimized src="https://source.unsplash.com/150x150/?tikka" alt="" width={150} height={150}
            className="hero-img" style={{ bottom: "-20px", right: "30%", zIndex: 4, rotate: "-9deg", animationDelay: "200ms" }} />

          <Image unoptimized src="https://source.unsplash.com/180x220/?tandoori" alt="" width={180} height={220}
            className="hero-img" style={{ top: "-25px", right: "12%", zIndex: 1, rotate: "6deg", animationDelay: "350ms" }} />

          <Image unoptimized src="https://source.unsplash.com/140x180/?haleem" alt="" width={140} height={180}
            className="hero-img" style={{ top: "50px", right: "3%", zIndex: 3, rotate: "-12deg", animationDelay: "430ms" }} />

          <Image unoptimized src="https://source.unsplash.com/220x260/?mutton" alt="" width={220} height={260}
            className="hero-img" style={{ bottom: "-40px", right: "8%", zIndex: 5, rotate: "4deg", animationDelay: "510ms" }} />

          <Image unoptimized src="https://source.unsplash.com/160x190/?pulao" alt="" width={160} height={190}
            className="hero-img" style={{ bottom: "-15px", right: "20%", zIndex: 2, rotate: "-6deg", animationDelay: "590ms" }} />

          <Image unoptimized src="https://source.unsplash.com/130x160/?grilled+chicken" alt="" width={130} height={160}
            className="hero-img" style={{ top: "30px", left: "35%", zIndex: 0, rotate: "14deg", animationDelay: "670ms", willChange: "transform" }} />

          <Image unoptimized src="https://source.unsplash.com/150x190/?indian+street+food" alt="" width={150} height={190}
            className="hero-img" style={{ bottom: "-25px", left: "42%", zIndex: 3, rotate: "-11deg", animationDelay: "750ms", willChange: "transform" }} />

          <Image unoptimized src="https://source.unsplash.com/180x140/?food+platter" alt="" width={180} height={140}
            className="hero-img" style={{ top: "-10px", right: "35%", zIndex: 1, rotate: "3deg", animationDelay: "800ms" }} />
        </div>

        {/* Dark overlay so text stays legible */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.42), rgba(0,0,0,0.38))",
            zIndex: 6,
          }}
        />

        {/* Text content */}
        <div className="relative max-w-2xl mx-auto text-center" style={{ zIndex: 10 }}>
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
        <div className="absolute top-4 right-4" style={{ zIndex: 10 }}>
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
            label="🐟 Serves Fish"
            options={["confirmed", "unconfirmed"]}
            optionLabels={{
              confirmed: "Chicken kept separate — call ahead for extra care",
              unconfirmed: "Call before visiting to confirm separate prep",
            }}
            selected={fishFilter}
            onChange={toggleFish}
            onClear={() => setFishFilter([])}
            accentColor="sky"
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
