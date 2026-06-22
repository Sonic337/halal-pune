"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/reviews");
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
      <form
        onSubmit={handleSubmit}
        style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: 8, border: "1px solid #e5e7eb", width: 320, display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Wurrynot Admin</h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          required
          style={{ padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
        />

        {error && (
          <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.5rem", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </main>
  );
}
