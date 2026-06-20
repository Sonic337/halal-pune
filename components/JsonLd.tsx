import { Restaurant } from "@/types";

interface JsonLdProps {
  restaurants: Restaurant[];
}

export default function JsonLd({ restaurants }: JsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Halal Restaurants in Pune",
    description: "Curated list of halal restaurants in Pune",
    url: "https://wurrynot.com",
    itemListElement: restaurants.map((restaurant, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Restaurant",
        name: restaurant.name,
        servesCuisine: restaurant.cuisines,
        ...(restaurant.priceRange !== undefined && {
          priceRange: `₹${restaurant.priceRange} for two`,
        }),
        ...(restaurant.rating !== undefined && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: restaurant.rating,
            reviewCount: restaurant.reviewCount ?? 0,
          },
        }),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Pune",
          addressCountry: "IN",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
