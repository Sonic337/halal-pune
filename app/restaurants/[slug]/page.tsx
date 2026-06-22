import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import restaurantsData from "@/data/restaurants.json";
import { Restaurant } from "@/types";
import { slugify, getRestaurantBySlug } from "@/lib/slug";
import BackButton from "@/components/BackButton";
import RestaurantTabs from "@/components/RestaurantTabs";

const restaurants = restaurantsData as Restaurant[];

export function generateStaticParams() {
  return restaurants.map((r) => ({ slug: slugify(r.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(restaurants, slug);
  if (!restaurant) return {};

  const description = [
    restaurant.cuisines.join(", "),
    "restaurant in Pune.",
    restaurant.tagline || "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: restaurant.name,
    description,
    alternates: { canonical: `https://wurrynot.com/restaurants/${slug}` },
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(restaurants, slug);
  if (!restaurant) notFound();

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {/* ── Back button ── */}
      <div className="max-w-3xl mx-auto px-4 pt-5 pb-2">
        <BackButton />
      </div>

      {/* ── Hero image ── */}
      {restaurant.imageUrl && (
        <div className="max-w-3xl mx-auto px-4 mb-5">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "16/9", borderRadius: 16 }}
          >
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>
      )}

      {/* ── Restaurant info ── */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Name + rating */}
        <div className="flex items-start gap-3 mb-2">
          <h1
            className="text-3xl font-extrabold tracking-tight flex-1"
            style={{ color: "var(--color-text)" }}
          >
            {restaurant.name}
          </h1>
          {restaurant.rating !== undefined && (
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <span
                className="text-sm font-bold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: "#1a7a4a" }}
              >
                {restaurant.rating.toFixed(1)}★
              </span>
              {restaurant.reviewCount !== undefined && (
                <span className="text-sm" style={{ color: "var(--color-text-3)" }}>
                  {restaurant.reviewCount.toLocaleString()} reviews
                </span>
              )}
            </div>
          )}
        </div>

        {/* Cuisines */}
        <p className="text-sm mb-1" style={{ color: "var(--color-text-2)" }}>
          {restaurant.cuisines.join(", ")}
        </p>

        {/* Price */}
        {restaurant.priceRange !== undefined && (
          <p className="text-sm mb-1" style={{ color: "var(--color-text-3)" }}>
            ₹{restaurant.priceRange.toLocaleString("en-IN")} for two
          </p>
        )}

        {/* hotelBrand */}
        {restaurant.hotelBrand && (
          <p
            className="text-sm mb-3"
            style={{ color: "var(--color-text-3)", fontStyle: "italic" }}
          >
            Part of {restaurant.hotelBrand}
          </p>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <RestaurantTabs
            restaurant={restaurant}
            slug={slug}
          />
        </div>
      </div>
    </main>
  );
}
