import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "../data/restaurants.json");

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error("Error: GOOGLE_PLACES_API_KEY environment variable is not set.");
  process.exit(1);
}

const restaurants = JSON.parse(readFileSync(dataPath, "utf-8"));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPlaceId(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask": "places.id,places.displayName",
      "X-Goog-Api-Key": API_KEY,
    },
    body: JSON.stringify({ textQuery: query }),
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.places?.[0]?.id ?? null;
}

let matched = 0;
let noMatch = 0;
let skipped = 0;

for (const restaurant of restaurants) {
  if (restaurant.googlePlaceId && restaurant.googlePlaceId !== "") {
    skipped++;
    continue;
  }

  const area = restaurant.branches?.[0]?.area ?? "";
  const query = area
    ? `${restaurant.name} ${area} Pune India`
    : `${restaurant.name} Pune India`;

  try {
    const placeId = await fetchPlaceId(query);

    if (placeId) {
      restaurant.googlePlaceId = placeId;
      matched++;
      console.log(`✓ ${restaurant.name} → ${placeId}`);
    } else {
      restaurant.googlePlaceId = "";
      noMatch++;
      console.log(`✗ ${restaurant.name} → no match`);
    }
  } catch (err) {
    restaurant.googlePlaceId = "";
    noMatch++;
    console.log(`✗ ${restaurant.name} → error: ${err.message}`);
  }

  await sleep(200);
}

writeFileSync(dataPath, JSON.stringify(restaurants, null, 2));
console.log(`\nDone. ${matched} matched, ${noMatch} no match, ${skipped} skipped`);
