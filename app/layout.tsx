import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// TODO: Replace /og-image.png with a proper 1200x630 branded image before launch
export const metadata: Metadata = {
  metadataBase: new URL("https://wurrynot.com"),
  title: {
    default: "Wurrynot — Halal Restaurants in Pune",
    template: "%s | Wurrynot",
  },
  description:
    "Discover the best halal restaurants in Pune — from local dhabas to fine dining. Curated listings with ratings, cuisine filters, and area search.",
  alternates: {
    canonical: "https://wurrynot.com",
  },
  openGraph: {
    type: "website",
    url: "https://wurrynot.com",
    siteName: "Wurrynot",
    title: "Wurrynot — Halal Restaurants in Pune",
    description:
      "Discover the best halal restaurants in Pune — from local dhabas to fine dining. Curated listings with ratings, cuisine filters, and area search.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wurrynot — Halal Restaurants in Pune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wurrynot — Halal Restaurants in Pune",
    description:
      "Discover the best halal restaurants in Pune — from local dhabas to fine dining.",
    images: ["/og-image.png"],
  },
};

/**
 * Inline script injected before first paint:
 * - Reads localStorage for saved preference
 * - Falls back to prefers-color-scheme
 * - Sets data-theme on <html> before any CSS renders → zero layout shift
 */
const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('wurrynot-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved ? saved : (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme init — must run synchronously before body paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <nav aria-label="Main" className="sr-only">
          <a href="/">Home</a>
          <a href="/forms">Suggest a Restaurant</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
