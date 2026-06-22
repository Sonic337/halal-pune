import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "0 16px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo — goes to home and scrolls to top */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/wurrynot-logo.jpg"
            alt="Wurrynot"
            width={32}
            height={32}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
            }}
          >
            Wurrynot
          </span>
        </Link>

        {/* Nav links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 13,
            color: "var(--color-text-3)",
          }}
        >
          <Link
            href="/contact"
            style={{ color: "inherit", textDecoration: "none" }}
            className="hover:text-[var(--color-text-2)] transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/forms"
            style={{ color: "inherit", textDecoration: "none" }}
            className="hover:text-[var(--color-text-2)] transition-colors"
          >
            Suggest a Restaurant
          </Link>
        </nav>
      </div>
    </header>
  );
}
