import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || (session.value !== "authenticated" && session.value !== "editor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { restaurant_slug, restaurant_name, rating, review_text } = await req.json();

  if (!restaurant_slug || !rating || !review_text) {
    return NextResponse.json({ error: "restaurant_slug, rating, and review_text are required" }, { status: 400 });
  }

  const db = getAdminClient();

  // Unpin all existing reviews for this restaurant
  const { error: unpinErr } = await db
    .from("reviews")
    .update({ is_pinned: false })
    .eq("restaurant_slug", restaurant_slug);

  if (unpinErr) {
    return NextResponse.json({ error: unpinErr.message }, { status: 400 });
  }

  // Insert the Google review as a pinned row
  const { data, error: insertErr } = await db
    .from("reviews")
    .insert({
      restaurant_slug,
      restaurant_name: restaurant_name ?? "",
      rating: Number(rating),
      review_text,
      reviewer_name: "Google Review",
      source: "google",
      is_pinned: true,
    })
    .select("id")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: data?.id });
}
