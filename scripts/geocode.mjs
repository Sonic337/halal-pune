import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../data/restaurants.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "halal-pune-directory/1.0" },
  });
  const data = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

const restaurants = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
let updated = 0;

for (const restaurant of restaurants) {
  for (const branch of restaurant.branches) {
    if (branch.lat && branch.lng) continue;

    const query = `${branch.area}, Pune, India`;
    process.stdout.write(`Geocoding: ${restaurant.name} — ${branch.area} ... `);

    const coords = await geocode(query);
    if (coords) {
      branch.lat = coords.lat;
      branch.lng = coords.lng;
      console.log(`✓ (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      updated++;
    } else {
      console.log("✗ not found");
    }

    await sleep(1100);
  }
}

writeFileSync(DATA_PATH, JSON.stringify(restaurants, null, 2));
console.log(`\nDone. Updated ${updated} branches.`);
