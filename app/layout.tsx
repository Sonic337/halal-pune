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

export const metadata: Metadata = {
  title: "Wurrynot",
  description:
    "Eat without the worry. Discover Pune's best local restaurants, personally picked and community-curated.",
  icons: {
    icon: "/wurrynot-logo.jpg",
    apple: "/wurrynot-logo.jpg",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
