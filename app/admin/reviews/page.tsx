import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ReviewsTable from "@/components/admin/ReviewsTable";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function AdminReviewsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || session.value !== "authenticated") {
    redirect("/admin");
  }

  const supabase = getAdminSupabase();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <p style={{ color: "#dc2626" }}>Failed to load reviews: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Reviews — {reviews?.length ?? 0} total</h1>
        <a
          href="/api/admin/logout"
          style={{ fontSize: 13, color: "#6b7280", textDecoration: "underline", cursor: "pointer" }}
        >
          Log out
        </a>
      </div>
      <ReviewsTable reviews={reviews ?? []} />
    </main>
  );
}
