# WurryNot — Project Handoff Context

## What this project is
A Next.js website listing halal restaurants in Pune, deployed 
on Vercel at wurrynot.com. GitHub repo: Sonic337/halal-pune.

## Tech stack
Next.js (App Router), TypeScript, Tailwind CSS, deployed on 
Vercel, custom domain wurrynot.com via GoDaddy DNS.

## Current state of the codebase — what is built and working
- Restaurant listing page with cards showing name, rating, 
  review count, cuisine tags, area/location badges, 
  priceRange ("₹X for two"), hotelBrand badge on image
- Light and dark theme with shared design tokens
- Filters: Cuisine dropdown, Area dropdown, Rating dropdown, 
  High-End dropdown, Veg/Non-Veg toggle
- Filters panel (opened via "Filters" button): Minimum Rating 
  slider (Any/3.5/4.0/4.5/5.0) and Cost for Two range slider 
  (₹0 to ₹2500 in ₹250 steps)
- hotelBrand field on 13 hotel-chain restaurants with badge 
  on card image
- priceRange field (number, cost for two in rupees) on 
  restaurants that have been filled in
- Hero section with food image collage, cursor repel effect 
  on desktop, gyroscope parallax on mobile
- /forms page for restaurant suggestions — Resend API sends 
  email to contactwurrynot@gmail.com on submission; 
  IP rate limited (5 req/hr); Turnstile bot protection
- Logo: W made of fork/knife/spoon in terracotta color

## Open tasks

1. Domain — wurrynot.com DNS was configured (A record @ → 
   216.198.79.1, CNAME www → cname.vercel-dns.com). 
   Verify Vercel dashboard shows green "Valid Configuration".

## Data file location
data/restaurants.json — array of restaurant objects.
Fields: name, tagline, rating, reviewCount, cuisines, 
branches (area/mapsUrl/lat/lng/rating/reviewCount), 
dietType?, fishNote?, menuUrl?, phone?, imageUrl?, 
tempClosed?, hotelBrand?, priceRange?

## Key decisions already made — do not re-litigate
- No scraping of Zomato/Swiggy images or data under any method
- No ONDC integration
- Google Places API for images: dropped, no longer planned
- hotelBrand badge shows actual brand name, not "Premium"
- "Serves Fish" filter removed from UI (fishNote still in data)
- priceRange stored as integer (e.g. 1500), displayed as 
  "₹1,500 for two"
- Dark mode badge contrast fix for cuisine tags is pending
- OG image: placeholder (logo copy) in public/og-image.png, 
  proper branded version not needed
- Vercel Analytics: not added, not needed
- Card layout fix: previous approach abandoned, will be 
  approached differently if revisited

## Commands to resume local dev
npm run dev → localhost:3000
git push origin main → triggers Vercel auto-deploy

---

## Security — completed June 20 2026

- Security headers added to next.config.ts (X-Frame-Options, 
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Cloudflare active on wurrynot.com (free plan)
  - SSL/TLS: Full (strict)
  - Bot Fight Mode: on
  - Block AI Bots: on
  - Caching: Standard, 4hr browser TTL
- Cloudflare Turnstile added to /forms page
  - Site key: 0x4AAAAAADoNTRuX1QAq2Yjr
  - Secret key stored in Vercel env as TURNSTILE_SECRET_KEY
  - Verifies token in /api/suggest-restaurant before writing to sheet
- TURNSTILE_SECRET_KEY added to Vercel environment variables 
  (Production + Preview + Development)
- Rate limiting on /api/suggest-restaurant — DONE (5 req/hr per IP, in-memory)

## SEO — completed June 20 2026

- metadata export added to app/layout.tsx (title, description, 
  openGraph, twitter, canonical)
- Page-level metadata added to app/page.tsx and app/forms/page.tsx
- app/sitemap.ts created — live at wurrynot.com/sitemap.xml
- app/robots.ts created
- JsonLd component created with Restaurant schema, rendered in 
  app/page.tsx
- Google Search Console: domain verified, sitemap submitted, 
  status Success, 2 pages discovered
- Vercel Analytics: not added, not needed
- Google Analytics: live, ID G-6ZHV6TD3Q1, via @next/third-parties

## Resend API — fixed June 20 2026

- RESEND_API_KEY in Vercel environment variables
- Sends to contactwurrynot@gmail.com from onboarding@resend.dev
- Working. Custom sending domain not yet configured in Resend.
