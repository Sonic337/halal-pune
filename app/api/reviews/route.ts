import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { restaurant_slug, restaurant_name, reviewer_name, reviewer_email, rating, review_text } = body;

  if (!restaurant_slug) {
    return NextResponse.json({ error: "restaurant_slug is required" }, { status: 400 });
  }
  if (!review_text || review_text.trim().length < 10) {
    return NextResponse.json({ error: "review_text must be at least 10 characters" }, { status: 400 });
  }
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }

  const { error } = await getAdminClient().from("reviews").insert({
    restaurant_slug,
    restaurant_name: restaurant_name ?? "",
    reviewer_name: reviewer_name?.trim() || null,
    reviewer_email: reviewer_email?.trim() || null,
    rating: Number(rating),
    review_text: review_text.trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
