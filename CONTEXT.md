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
- /forms page for restaurant suggestions (Google Sheets 
  backend via service account)
- Logo: W made of fork/knife/spoon in terracotta color

## What was just reverted
The card layout fix commit (f8db2e5) was reverted via 
git reset --hard ac1d53e because the UI output was broken. 
The checkpoint ac1d53e is the last known good state.

## Open tasks — next things to build
1. Card layout fix — needs a careful retry. The goal is:
   - Consistent card heights across grid rows
   - Cuisine tags capped at 2 visible + "+X more" expandable pill
   - Area badges capped at 2 visible + "+X more" expandable pill
   - Price row always reserves space even when absent
   - Bottom section (price + buttons) always pinned to card bottom
   - overflow: hidden only on image container, not card itself
   - tempClosed banner as absolute overlay on image
   - Mobile: min-height: auto on name/tagline/badge rows
   Last attempt failed — proceed carefully, audit first

2. Cost for Two slider — currently filters only, does not sort.
   Need to add Price Low to High / High to Low sort either 
   inside the filters panel or as an auto-sort when slider 
   is active. Decision not yet made.

3. Google Places API — image sourcing unresolved. Blocker is 
   billing/API setup on GCP. Places photos are the preferred 
   source for restaurant exterior/interior images. Each 
   restaurant needs images organized as:
   images/restaurants/{slug}/exterior.jpg
   images/restaurants/{slug}/interior.jpg
   Slug folder generator script not yet built.

4. Domain — wurrynot.com DNS was configured (A record @ → 
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
- Image sourcing: Google Places API (preferred) or manual
- hotelBrand badge shows actual brand name, not "Premium"
- "Serves Fish" filter removed from UI (fishNote still in data)
- priceRange stored as integer (e.g. 1500), displayed as 
  "₹1,500 for two"
- Dark mode badge contrast fix for cuisine tags is pending

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
- Rate limiting on /api/suggest-restaurant — NOT YET DONE

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
- Vercel Analytics: not yet added
- Google Analytics: not yet added

## Resend API

- RESEND_API_KEY added to Vercel environment variables
- Current status: broken/not working — needs debugging
- Unknown if Resend was added before or after the revert to 
  ac1d53e on June 20 — check if integration exists in codebase

## Open tasks — updated June 20 2026

1. Fix Resend API integration
2. Rate limiting on /api/suggest-restaurant
3. Card layout fix — previous attempt reverted (commit f8db2e5)
   Last good state: ac1d53e
4. Cost for Two filter — sort behavior not yet added
5. Google Places API for restaurant images — billing blocker
6. Vercel Analytics + Google Analytics setup
7. OG image — placeholder in public/og-image.png, needs 
   proper 1200x630 branded version
