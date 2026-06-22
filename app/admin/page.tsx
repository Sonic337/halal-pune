"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "0 16px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          padding: 40,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          width: "90%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            overflow: "hidden",
            marginBottom: 20,
            flexShrink: 0,
          }}
        >
          <Image
            src="/wurrynot-logo.jpg"
            alt="Wurrynot"
            width={48}
            height={48}
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#0f172a",
            margin: 0,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Wurrynot Admin
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: 13,
            color: "#64748b",
            margin: 0,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Enter your password to continue
        </p>

        {/* Password input */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 14,
            color: "#0f172a",
            backgroundColor: "#f8fafc",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 12,
          }}
        />

        {/* Error */}
        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: 13,
              margin: 0,
              marginBottom: 12,
              alignSelf: "flex-start",
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px 0",
            background: loading
              ? "#fdba74"
              : "linear-gradient(to right, #f97316, #10b981)",
            color: "#ffffff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
