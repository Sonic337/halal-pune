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

  const sessionValue = session?.value;
  if (sessionValue !== "authenticated" && sessionValue !== "editor") {
    redirect("/admin");
  }

  const role: "admin" | "editor" = sessionValue === "authenticated" ? "admin" : "editor";

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: role === "admin" ? "rgba(22,163,74,0.12)" : "rgba(249,115,22,0.12)", color: role === "admin" ? "#16a34a" : "#c2410c" }}>
            {role === "admin" ? "Admin" : "Editor"}
          </span>
          <a
            href="/api/admin/logout"
            style={{ fontSize: 13, color: "#6b7280", textDecoration: "underline", cursor: "pointer" }}
          >
            Log out
          </a>
        </div>
      </div>
      <ReviewsTable reviews={reviews ?? []} role={role} />
    </main>
  );
}
