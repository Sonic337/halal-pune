import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Wurrynot team.",
};

export default function ContactPage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <header className="bg-gradient-to-r from-orange-500 to-emerald-600 text-white py-10 px-4 text-center">
        <Link href="/" className="text-white/70 text-sm hover:text-white mb-4 inline-block">
          ← Back to Wurrynot
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div
          className="w-full max-w-lg rounded-2xl p-8 flex flex-col gap-5"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
            Spotted something wrong or have a question? Reach out to us.
          </p>

          <a
            href="mailto:contactwurrynot@gmail.com"
            className="font-medium text-sm"
            style={{ color: "var(--brand-orange)" }}
          >
            contactwurrynot@gmail.com
          </a>

          <p className="text-sm" style={{ color: "var(--color-text-3)" }}>
            Want to suggest a restaurant?{" "}
            <Link
              href="/forms"
              className="underline underline-offset-2"
              style={{ color: "var(--color-text-2)" }}
            >
              Fill out our form →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
