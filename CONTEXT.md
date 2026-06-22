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
  area badges, priceRange
- RestaurantCardImmersive (immersive view): full-bleed image, desktop
  hover buttons (View Menu, Call), mobile ••• Options dropdown,
  branch list (clickable to Google Maps), expanded branches toggle
- Both cards navigate to /restaurants/[slug] via onClick on article +
  router.push (NOT a stretched Link — that pattern was broken and removed)
- Interactive children (branch links, menu/call links, expand buttons)
  call e.stopPropagation() so they work independently

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
  - Fetches reviews from /api/reviews/get?slug= (NOT direct Supabase call —
    anon key was blocked by RLS; moved to server-side API route)
  - Star selector (1–5), name (optional), email (optional), review_text (required, min 10 chars)
  - Submits to POST /api/reviews (server-side, secret key)
  - On success: "Thanks for your review!" + "Copy & Open Google Reviews →" button if googlePlaceId exists
  - Copy button: copies review text to clipboard + opens Google review URL for the place
- GET /api/reviews/get — public read endpoint using SUPABASE_SECRET_KEY server-side
- POST /api/reviews — insert endpoint using SUPABASE_SECRET_KEY server-side
  - Validates: restaurant_slug required, rating 1–5, review_text min 10 chars
  - Has temporary key-prefix debug log (can be removed once confirmed working)
- IMPORTANT: lib/supabase.ts (anon key) is NOT used for reviews at all

### Other pages
- /forms — restaurant suggestion form with Turnstile, Resend email, IP rate limiting
- /contact — simple page with mailto link to contactwurrynot@gmail.com
- /sitemap.xml — includes all static pages + all restaurant sub-pages
- /robots.txt

### Admin panel (/admin) — not linked publicly
- /admin — password login form, POSTs to /api/admin/login
- /admin/reviews — cookie-gated server component; fetches all reviews via
  secret key; passes to ReviewsTable client component for delete-without-reload
- /api/admin/login — checks ADMIN_PASSWORD env var, sets httpOnly
  admin_session cookie (8hr)
- /api/admin/logout — clears cookie, redirects to /admin
- /api/admin/delete-review — cookie-gated DELETE via secret key

### Hero
- HeroCollage with cursor repel (desktop) and gyro parallax (mobile)
- Nav links (Contact Us, Suggest a Restaurant) sit above HeroCollage, outside it
- Logo image, tagline "Eat without the worry. Pune's best, personally picked."
- No email link inside hero (removed)

## Data file
data/restaurants.json — array of restaurant objects (80 restaurants as of June 2026).
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
- app/api/reviews/route.ts — POST endpoint for submitting reviews (secret key, lazy init)
- app/api/reviews/get/route.ts — GET endpoint for reading reviews (secret key, lazy init)
- app/api/suggest-restaurant/route.ts — POST endpoint for /forms, Turnstile + rate limit
- app/contact/page.tsx — contact page
- app/forms/page.tsx — server wrapper with Turnstile script + metadata
- lib/supabase.ts — lazy anon-key Supabase client; only used for future public reads
  (NOT used for reviews — all review routes use inline secret key clients)
- app/admin/page.tsx — admin login form
- app/admin/reviews/page.tsx — cookie-gated admin reviews table
- components/admin/ReviewsTable.tsx — delete UI client component
- app/api/admin/login/route.ts — sets admin_session cookie
- app/api/admin/logout/route.ts — clears cookie
- app/api/admin/delete-review/route.ts — cookie-gated review deletion
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
- ADMIN_PASSWORD (used by /api/admin/login to gate the admin panel)

## Open tasks
1. Domain — wurrynot.com DNS was configured (A record @ → 
   216.198.79.1, CNAME www → cname.vercel-dns.com).
   Verify Vercel dashboard shows green "Valid Configuration".
2. Supabase 'reviews' table — must exist with columns:
   id (uuid), restaurant_slug (text), restaurant_name (text), rating (int),
   reviewer_name (text nullable), reviewer_email (text nullable),
   review_text (text), created_at (timestamptz default now()).
   RLS: all routes use service role key (bypasses RLS), so RLS policies
   are not strictly required, but table must exist.
3. SUPABASE_SECRET_KEY in Vercel — must be the SERVICE ROLE key from
   Supabase → Project Settings → API (not the anon/publishable key).
   Temporary debug logs in /api/reviews/route.ts and /api/reviews/get/route.ts
   will show the key prefix in Vercel logs — remove once confirmed working.
4. ADMIN_PASSWORD — must be set in Vercel environment variables.
5. OG image: placeholder in public/og-image.png, proper branded version not made.
6. Custom sending domain in Resend not yet configured (sends from onboarding@resend.dev).

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
