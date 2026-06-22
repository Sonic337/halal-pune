import { Restaurant } from "@/types";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRestaurantBySlug(
  restaurants: Restaurant[],
  slug: string
): Restaurant | undefined {
  return restaurants.find((r) => slugify(r.name) === slug);
}
