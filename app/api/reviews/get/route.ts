import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  console.log("[reviews GET] key prefix:", process.env.SUPABASE_SECRET_KEY?.substring(0, 15));
  console.log("[reviews GET] supabase url:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30));

  const slug = req.nextUrl.searchParams.get("slug");
  console.log("[reviews GET] slug:", slug);

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  try {
    const { data, error } = await getAdminClient()
      .from("reviews")
      .select("id, reviewer_name, rating, review_text, created_at")
      .eq("restaurant_slug", slug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[reviews GET] supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[reviews GET] caught error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
