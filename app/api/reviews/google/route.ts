import { NextRequest, NextResponse } from "next/server";

interface GoogleReviewText {
  text: string;
  languageCode: string;
}

interface GoogleReview {
  rating: number;
  text?: GoogleReviewText;
  relativePublishTimeDescription?: string;
}

interface PlacesApiResponse {
  reviews?: GoogleReview[];
  rating?: number;
}

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY ?? "",
          "X-Goog-FieldMask": "reviews,rating",
        },
        // Do not cache — always fresh
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("[google reviews] Places API error:", res.status, await res.text());
      return NextResponse.json({ reviews: [] });
    }

    const data: PlacesApiResponse = await res.json();

    if (!data.reviews || data.reviews.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    const filtered = data.reviews
      .filter((r) => r.rating >= 3 && r.text?.text)
      .map((r) => ({
        rating: r.rating,
        text: r.text!.text,
        relativePublishTimeDescription: r.relativePublishTimeDescription ?? "",
        source: "google" as const,
      }));

    return NextResponse.json({ reviews: filtered });
  } catch (err) {
    console.error("[google reviews] fetch error:", err);
    return NextResponse.json({ reviews: [], error: "failed to fetch" });
  }
}
