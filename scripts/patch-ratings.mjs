import { readFileSync, writeFileSync } from "fs";

const file = new URL("../data/restaurants.json", import.meta.url);
const restaurants = JSON.parse(readFileSync(file, "utf8"));

// Map of restaurant name → { rating, reviewCount }
// Sources: Zomato, Justdial, Google, EazyDiner, magicpin (best available)
const ratings = {
  "Badshah": { rating: 4.0, reviewCount: null },
  "George Restaurant": { rating: 4.2, reviewCount: null },
  "Yana Sizzler": { rating: 4.2, reviewCount: null },
  "Shawarma.co - Lassi Wassi": { rating: 4.2, reviewCount: null },
  "Blue Nile": { rating: 4.1, reviewCount: null },
  "Shahi Dawat": { rating: 4.3, reviewCount: null },
  "Butterwala and Co.": { rating: 4.2, reviewCount: null },
  "Salt": { rating: 4.2, reviewCount: null },
  "Irani Cafe": { rating: 4.2, reviewCount: null },
  "Cream Craver": { rating: 4.0, reviewCount: null },
  "Miya Kebabs": { rating: 4.5, reviewCount: null },
  "Signature": { rating: 4.2, reviewCount: null },
  "Olympia Kathi Kabab": { rating: 4.3, reviewCount: null },
  "Al Di La Restaurant": { rating: 4.4, reviewCount: null },
  "Jashn": { rating: 4.0, reviewCount: null },
  "Cafe Yezdan": { rating: 4.2, reviewCount: null },
  "Akhtar's Samosa": { rating: 4.1, reviewCount: null },
  "Burger King (Camp Burger)": { rating: 4.3, reviewCount: null },
  "The Place - Touche The Sizzler": { rating: 4.2, reviewCount: null },
  "Paasha - JW Marriott Pune": { rating: 4.5, reviewCount: null },
  "Spice Kitchen - JW Marriott Pune": { rating: 4.5, reviewCount: null },
  "Tao Fu - JW Marriott Pune": { rating: 4.6, reviewCount: null },
  "Alto Vino - JW Marriott Pune": { rating: 4.7, reviewCount: null },
  "Pune Baking Company - JW Marriott Pune": { rating: 4.5, reviewCount: null },
  "Alta Vida - Ritz-Carlton Pune": { rating: 4.5, reviewCount: null },
  "Three Kitchens - The Ritz-Carlton Pune": { rating: 4.4, reviewCount: null },
  "Aasmana - The Ritz-Carlton Pune": { rating: 4.5, reviewCount: null },
  "Café 88 - Hyatt Pune": { rating: 4.3, reviewCount: null },
  "Baan Tao - Hyatt Pune": { rating: 4.5, reviewCount: null },
  "TG's - The Oriental Grill": { rating: 4.4, reviewCount: null },
  "2BHK Diner & Key Club": { rating: 4.3, reviewCount: null },
  "Ba Da Bom": { rating: 4.3, reviewCount: null },
  "Acai": { rating: 4.3, reviewCount: null },
  "Millers - The Luxury Club": { rating: 4.1, reviewCount: null },
  "Epitome": { rating: 4.1, reviewCount: null },
  "Kukoo": { rating: 4.2, reviewCount: null },
  "Shisha Jazz Cafe": { rating: 4.3, reviewCount: null },
  "Di Mora": { rating: 4.2, reviewCount: null },
  "Latitude - Blue Diamond": { rating: 4.3, reviewCount: null },
  "Chingari - Sheraton Grand Pune": { rating: 4.1, reviewCount: null },
  "Feast - Sheraton Grand Pune": { rating: 4.3, reviewCount: null },
  "KMCY - Sheraton Grand Pune": { rating: 4.5, reviewCount: null },
  "The Market - The Westin Pune": { rating: 4.4, reviewCount: null },
  "Asilo - The Westin Pune": { rating: 4.2, reviewCount: null },
  "Masu - Conrad Pune": { rating: 4.4, reviewCount: null },
  "Kabana - Conrad Pune": { rating: 4.7, reviewCount: null },
  "Pune Sugar Box - Conrad Pune": { rating: 4.5, reviewCount: null },
  "Zeera - Conrad Pune": { rating: 4.5, reviewCount: null },
  "Coriander Kitchen - Conrad Pune": { rating: 4.5, reviewCount: null },
};

let patched = 0;
for (const r of restaurants) {
  if (r.rating !== undefined) continue; // already has rating, skip
  const match = ratings[r.name];
  if (match) {
    r.rating = match.rating;
    if (match.reviewCount !== null) r.reviewCount = match.reviewCount;
    patched++;
  }
}

writeFileSync(file, JSON.stringify(restaurants, null, 2));
console.log(`Patched ${patched} restaurants with ratings.`);
