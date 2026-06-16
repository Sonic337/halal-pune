import { readFileSync, writeFileSync } from "fs";

const file = new URL("../data/restaurants.json", import.meta.url);
const restaurants = JSON.parse(readFileSync(file, "utf8"));

// Per-branch Google Maps ratings from Co-work lookup
const branchRatings = {
  "Uncle Chinese": {
    "Lullnagar": { rating: 4.2, reviewCount: 699 },
    "Camp": { rating: 4.6, reviewCount: 977 },
    "Bavdhan": { rating: 4.4, reviewCount: 1057 },
    "Koregaon Park": { rating: 4.0, reviewCount: 2661 },
    "Viman Nagar": { rating: 4.3, reviewCount: 732 },
    "Hinjewadi": { rating: 4.7, reviewCount: 851 },
  },
  "Pimplico": {
    "Royale Heritage Mall, Mohammadwadi": { rating: 4.2, reviewCount: 539 },
    "Koregaon Park": { rating: 4.2, reviewCount: 4406 },
    "Kothrud, Erandwane": { rating: 4.1, reviewCount: 2571 },
  },
  "Taco Bell": {
    "Deccan Gymkhana": { rating: 3.5, reviewCount: 774 },
    "Seasons Mall": { rating: 3.8, reviewCount: 1869 },
    "Kalyani Nagar": { rating: 3.7, reviewCount: 203 },
    "Phoenix Marketcity, Viman Nagar": { rating: 3.4, reviewCount: 217 },
    "Westend Mall, Aundh": { rating: 3.5, reviewCount: 304 },
    "Balewadi High St, Laxman Nagar": { rating: 3.8, reviewCount: 521 },
    "Pimpri-Chinchwad": { rating: 3.9, reviewCount: 310 },
    "Hinjewadi": { rating: 3.4, reviewCount: 198 },
  },
  "Nothing but Chicken": {
    "Viman Nagar": { rating: 3.8, reviewCount: 118 },
    "Wanwadi": { rating: 3.9, reviewCount: 89 },
    "Kothrud": { rating: 2.5, reviewCount: 11 },
    "Wakad": { rating: 2.7, reviewCount: 22 },
    "Baner": { rating: 3.6, reviewCount: 19 },
  },
  "Balsam": {
    "Kondhwa": { rating: 4.3, reviewCount: 323 },
    "Salunke Vihar Road": { rating: 4.3, reviewCount: 323 },
  },
  "Chafa Cafe": {
    "Koregaon Park": { rating: 4.2, reviewCount: 2193 },
    "Salunkhe Vihar Road": { rating: 4.4, reviewCount: 417 },
  },
  "Yana Sizzler": {
    "Camp": { rating: 4.2, reviewCount: 2271 },
    "Koregaon Park": { rating: 4.2, reviewCount: 2074 },
    "FC Road": { rating: 4.2, reviewCount: 9953 },
    "Baner": { rating: 4.3, reviewCount: 431 },
  },
  "Irani Cafe": {
    "Camp": { rating: 4.2, reviewCount: 4641 },
    "Deccan Gymkhana": { rating: 4.2, reviewCount: 7520 },
    "Senapati Bapat Road": { rating: 3.8, reviewCount: 362 },
    "Koregaon Park": { rating: 3.9, reviewCount: 972 },
    "Karve Nagar": { rating: 3.9, reviewCount: 2412 },
    "Singhad Road": { rating: 4.0, reviewCount: 358 },
    "Kalyani Nagar": { rating: 4.2, reviewCount: 7498 },
    "Katraj": { rating: 3.2, reviewCount: 241 },
    "NIBM Road": { rating: 4.1, reviewCount: 2057 },
  },
  "Cafe Yezdan": {
    "Camp": { rating: 4.2, reviewCount: 1685 },
    "NIBM Road": { rating: 4.0, reviewCount: 112 },
  },
};

let branchesPatched = 0;
let restaurantsAveraged = 0;

for (const r of restaurants) {
  const map = branchRatings[r.name];
  if (!map) continue;

  // Apply per-branch ratings
  for (const branch of r.branches) {
    const data = map[branch.area];
    if (data) {
      branch.rating = data.rating;
      branch.reviewCount = data.reviewCount;
      branchesPatched++;
    }
  }

  // Recompute restaurant-level rating as weighted average across branches
  const rated = r.branches.filter(b => b.rating != null && b.reviewCount != null && b.reviewCount > 0);
  if (rated.length > 0) {
    const totalReviews = rated.reduce((s, b) => s + b.reviewCount, 0);
    const weightedSum = rated.reduce((s, b) => s + b.rating * b.reviewCount, 0);
    r.rating = Math.round((weightedSum / totalReviews) * 10) / 10;
    r.reviewCount = totalReviews;
    restaurantsAveraged++;
  }
}

writeFileSync(file, JSON.stringify(restaurants, null, 2));
console.log(`Patched ${branchesPatched} branches, recomputed averages for ${restaurantsAveraged} restaurants.`);
