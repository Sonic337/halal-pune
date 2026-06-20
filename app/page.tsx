import type { Metadata } from "next";
import restaurantsData from "@/data/restaurants.json";
import { Restaurant } from "@/types";
import HomeClient from "@/components/HomeClient";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Halal Restaurants in Pune",
  description:
    "Browse 78+ halal restaurants in Pune by cuisine, area, and rating. From dhabas to five-star hotel dining — all in one place.",
  alternates: {
    canonical: "https://wurrynot.com",
  },
};

const restaurants = restaurantsData as Restaurant[];

export default function Home() {
  return (
    <>
      <JsonLd restaurants={restaurants} />
      <HomeClient />
    </>
  );
}
