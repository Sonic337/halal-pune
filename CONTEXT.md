# WurryNot — Project Handoff Context

## What this project is
A Next.js website listing halal restaurants in Pune, deployed 
on Vercel at wurrynot.com. GitHub repo: Sonic337/halal-pune.

## Tech stack
Next.js (App Router), TypeScript, Tailwind CSS, deployed on 
Vercel, custom domain wurrynot.com via GoDaddy DNS.
Supabase (reviews storage), Resend (email), Cloudflare Turnstile (bot protection).

## Current state of the codebase — what is built and working

### Listing page (/)
- Two view modes: Immersive (default) and Old UI (compact)
  - Toggle button top-right of listing: "Old UI" / "Immersive View"
  - viewMode persisted in localStorage under 'wurrynot-view-mode'
  - viewMode also synced to URL via ?view=compact
- All filter state synced to URL params (shareable/bookmarkable):
  - ?q= search, ?cuisines= (comma-separated), ?areas= (comma-separated)
  - ?diet= (veg | non-veg), ?highEnd=Hotel Restaurants
  - ?minRating=, ?maxPrice= (from the Filters panel)
  - ?view= (compact only; immersive is default/omitted)
- Filters: Cuisine dropdown (multi-select), Area dropdown (multi-select),
  High-End dropdown, Veg/Non-Veg pills, Filters panel (rating + price range)
- Location-based filtering (haversine distance)
- Nav links above hero: "Contact Us" → /contact, "Suggest a Restaurant" → /forms

### Restaurant cards
- RestaurantCard (compact view): image, name, rating badge, cuisines,
  area badges, priceRange, stretched link to sub-page
- RestaurantCardImmersive (immersive view): full-bleed image, desktop
  hover buttons (View Menu, Call), mobile ••• Options dropdown,
  branch list (clickable to Google Maps), expanded branches toggle,
  stretched link to sub-page
- Both cards navigate to /restaurants/[slug] on click

### Restaurant sub-pages (/restaurants/[slug])
- Statically generated via generateStaticParams
- Server component with generateMetadata (title, description, canonical)
- Hero image (16:9), name, rating, reviewCount, cuisines, priceRange, hotelBrand
- BackButton: router.back() with fallback to /
- RestaurantTabs client component (Overview + Reviews tabs):
  - Overview: branch cards with Get Directions links, View Menu + Call buttons
  - Reviews: ReviewsSection component

### Reviews system
- ReviewsSection (client component):
  - Fetches reviews from Supabase 'reviews' table filtered by restaurant_slug
  - Star selector (1–5), name (optional), email (optional), review_text (required, min 10 chars)
  - On success: "Thanks for your review!" + "Copy & Open Google Reviews →" button if googlePlaceId exists
  - Copy button: copies review text to clipboard + opens Google review URL for the place
- POST /api/reviews: server-side insert using SUPABASE_SECRET_KEY (not anon key)
  - Validates: restaurant_slug required, rating 1–5, review_text min 10 chars

### Other pages
- /forms — restaurant suggestion form with Turnstile, Resend email, IP rate limiting
- /contact — simple page with mailto link to contactwurrynot@gmail.com
- /sitemap.xml — includes all static pages + all restaurant sub-pages
- /robots.txt

### Hero
- HeroCollage with cursor repel (desktop) and gyro parallax (mobile)
- Nav links (Contact Us, Suggest a Restaurant) sit above HeroCollage, outside it
- Logo image, tagline "Eat without the worry. Pune's best, personally picked."
- No email link inside hero (removed)

## Data file
data/restaurants.json — array of restaurant objects (~79 restaurants).
Fields: name, tagline, rating, reviewCount, cuisines,
branches (area/mapsUrl/lat/lng/rating/reviewCount),
dietType?, fishNote?, menuUrl?, phone?, imageUrl?,
tempClosed?, hotelBrand?, priceRange?, googlePlaceId?

## Key files
- app/page.tsx — server component, exports metadata, renders JsonLd + HomeClient in Suspense
- app/layout.tsx — root layout, global metadata, GoogleAnalytics
- components/HomeClient.tsx — all listing/filter UI, useSearchParams + useRouter for URL state
- components/HeroCollage.tsx — hero with repel/gyro effects
- components/RestaurantCard.tsx — compact card with stretched link
- components/RestaurantCardImmersive.tsx — immersive card
- components/FilterDropdown.tsx — multi-select stays open, chevron close button
- components/FilterPanel.tsx — rating + price range panel
- app/restaurants/[slug]/page.tsx — restaurant sub-page (SSG)
- components/RestaurantTabs.tsx — tabs: Overview + Reviews
- components/ReviewsSection.tsx — review fetch/submit UI
- components/BackButton.tsx — back navigation
- app/api/reviews/route.ts — POST endpoint for submitting reviews
- app/api/suggest-restaurant/route.ts — POST endpoint for /forms, Turnstile + rate limit
- app/contact/page.tsx — contact page
- app/forms/page.tsx — server wrapper with Turnstile script + metadata
- lib/supabase.ts — lazy Supabase client (avoids build-time crash without env vars)
- lib/slug.ts — slugify() and getRestaurantBySlug()
- lib/distance.ts — haversineKm()
- types/index.ts — Restaurant + Branch interfaces (includes googlePlaceId?)
- next.config.ts — security headers
- scripts/populate-place-ids.mjs — batch Google Places API lookup for googlePlaceId

## Environment variables (Vercel)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SECRET_KEY (server-only, used in /api/reviews)
- RESEND_API_KEY
- TURNSTILE_SECRET_KEY
- GOOGLE_PLACES_API_KEY (used only by scripts/populate-place-ids.mjs locally)

## Open tasks
1. Domain — wurrynot.com DNS was configured (A record @ → 
   216.198.79.1, CNAME www → cname.vercel-dns.com).
   Verify Vercel dashboard shows green "Valid Configuration".
2. Supabase 'reviews' table — must exist with columns:
   id (uuid), restaurant_slug (text), rating (int), name (text),
   review_text (text), email (text), created_at (timestamptz).
   Row-level security: anon can SELECT, service role can INSERT.
3. OG image: placeholder in public/og-image.png, proper branded version not made.
4. Custom sending domain in Resend not yet configured (sends from onboarding@resend.dev).

## Commands to resume local dev
npm run dev → localhost:3000
git push origin main → triggers Vercel auto-deploy

---

## Security — completed June 2026
- Security headers in next.config.ts (X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy)
- Cloudflare on wurrynot.com: SSL Full (strict), Bot Fight Mode on, Block AI Bots on
- Cloudflare Turnstile on /forms (site key: 0x4AAAAAADoNTRuX1QAq2Yjr)
- IP rate limiting on /api/suggest-restaurant (5 req/hr, in-memory Map)

## SEO — completed June 2026
- Full metadata in layout.tsx and page-level files
- sitemap.ts (includes restaurant sub-pages), robots.ts
- JsonLd with Restaurant schema on home page
- generateMetadata on each restaurant sub-page
- Google Analytics: G-6ZHV6TD3Q1 via @next/third-parties
- Google Search Console: verified, sitemap submitted

## Resend API
- Sends to contactwurrynot@gmail.com from onboarding@resend.dev
- Working. Custom sending domain not yet configured.

## Key decisions — do not re-litigate
- No scraping of Zomato/Swiggy images or data
- No ONDC integration
- Google Places API for images: dropped
- hotelBrand badge shows actual brand name, not "Premium"
- "Serves Fish" filter removed from UI (fishNote still in data)
- priceRange stored as integer (e.g. 1500), displayed as "₹1,500 for two"
- Vercel Analytics: not added, not needed
