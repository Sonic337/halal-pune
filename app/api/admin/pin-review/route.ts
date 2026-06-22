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
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, restaurant_slug, unpin } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const db = getAdminClient();

  if (unpin) {
    const { error } = await db
      .from("reviews")
      .update({ is_pinned: false })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    if (!restaurant_slug) {
      return NextResponse.json({ error: "restaurant_slug is required when pinning" }, { status: 400 });
    }
    // Unpin all reviews for this restaurant first
    const { error: unpinErr } = await db
      .from("reviews")
      .update({ is_pinned: false })
      .eq("restaurant_slug", restaurant_slug);
    if (unpinErr) return NextResponse.json({ error: unpinErr.message }, { status: 400 });

    // Then pin this one
    const { error: pinErr } = await db
      .from("reviews")
      .update({ is_pinned: true })
      .eq("id", id);
    if (pinErr) return NextResponse.json({ error: pinErr.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
