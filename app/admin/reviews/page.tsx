import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
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
      <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#dc2626", fontSize: 14 }}>Failed to load reviews: {error.message}</p>
      </main>
    );
  }

  const isAdmin = role === "admin";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Top bar */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Left: logo + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <Image src="/wurrynot-logo.jpg" alt="Wurrynot" width={28} height={28} style={{ objectFit: "cover" }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Reviews</span>
          </div>

          {/* Right: role pill + links */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 20,
                backgroundColor: isAdmin ? "rgba(249,115,22,0.1)" : "rgba(66,133,244,0.12)",
                color: isAdmin ? "#ea580c" : "#4285F4",
                whiteSpace: "nowrap",
              }}
            >
              {isAdmin ? "Admin" : "Editor"}
            </span>
            <a
              href="/"
              style={{
                fontSize: 13,
                color: "#64748b",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              ← Back to site
            </a>
            <a
              href="/api/admin/logout"
              style={{
                fontSize: 13,
                color: "#64748b",
                textDecoration: "none",
                padding: "5px 12px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                whiteSpace: "nowrap",
              }}
            >
              Log out
            </a>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>
        {/* Stats row */}
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
          {reviews?.length ?? 0} reviews total
        </p>

        {/* Table */}
        <ReviewsTable reviews={reviews ?? []} role={role} />
      </div>
    </div>
  );
}
