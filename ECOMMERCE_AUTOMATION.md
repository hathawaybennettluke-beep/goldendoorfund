# Commerce Autopilot – ecommerce automation platform

An AI operator for ecommerce businesses, built into this Next.js + Convex + Clerk app.
Landing page: `/ecommerce` · Dashboard: `/ecommerce/dashboard` · Generated storefront: `/ecommerce/storefront/<store-slug>`.

The existing donation platform is untouched and still lives at `/`; the ecommerce platform hides the donation navigation on its own routes and requires a signed-in Clerk user for the dashboard.

## The four pillars

| Pillar | What it automates | Where |
|---|---|---|
| **1. Find products** | Trend research with live web search & cited sources, competitor analysis, margin estimation (fees, shipping, returns, CPA, break-even ROAS), idea board with one-click launch | Dashboard → Research |
| **2. Build the store** | Product page generation (copy, bullets, FAQ, variants), product images (studio / lifestyle / flat-lay), margin-based pricing, auto-collections, SEO scoring & fixes, Shopify sync, built-in storefront with checkout | Dashboard → Products / Collections / SEO |
| **3. Manage marketing** | Meta, TikTok, Google, email, SMS and influencer campaigns; AI targeting & strategy; ad copy, UGC video scripts and image creatives; email/SMS flows; influencer discovery & outreach; automated optimisation (scale / reduce / pause / refresh creative) | Dashboard → Campaigns / Creatives / Email & SMS / Influencers |
| **4. Manage orders** | Monitor orders from storefront, Shopify or any webhook; fraud/risk holds; send to fulfilment (3PL webhook or Printful); carrier tracking (AfterShip); customer tracking & delivery messages; cancellations with refunds, restocking and notifications | Dashboard → Orders / Shipments |

## Background automation (Convex cron jobs, `convex/crons.ts`)

| Cadence | Job |
|---|---|
| every 15 min | Confirm and fulfil new paid orders (respecting risk holds and each store's `autoFulfill` flag) |
| every 30 min | Refresh shipment tracking, update order status, notify customers (`autoNotifyTracking`) |
| every 6 h | Sync ad metrics and optimise campaigns against ROAS / CPA guard-rails (`autoOptimizeCampaigns`) |
| daily 06:00 UTC | Refresh trend research for stores with `autoRefreshTrends` |

All automated decisions are written to the activity feed and to each order's timeline / campaign's optimisation log.

## Demo mode vs. live mode

Everything works without any credentials:

- **No `ANTHROPIC_API_KEY`** → built-in templates generate niche-aware content; results are labelled "Template (demo mode)".
- **No image provider** → branded SVG mockups are stored as product images.
- **No ad channel connected** → campaigns run in *simulation* with modelled metrics so the optimisation rules can be observed.
- **No email/SMS provider** → messages are logged as `simulated`.
- **No fulfilment partner** → a simulated partner ships ~20 minutes after hand-off with fake tracking that progresses to "delivered".
- **No Stripe** → storefront orders are recorded as *pending* (test mode) and can be marked paid in the dashboard.

Use **Orders → Simulate incoming order** to watch the full order loop.

Set `ANTHROPIC_API_KEY` (and optionally an image provider) on the Convex deployment to switch AI generation to live mode; connect channels per store under **Settings → Integrations**.

## Architecture

```
convex/
  schema.ts                     # ec* tables (stores, connectors, research, products, campaigns, orders, shipments, activity…)
  crons.ts                      # automation schedules
  http.ts                       # webhooks: Shopify orders, generic inbound orders, Stripe checkout
  ecommerce/
    stores.ts, connectors.ts, activity.ts
    research.ts / researchActions.ts       # pillar 1
    products.ts / productActions.ts        # pillar 2
    marketing.ts / marketingActions.ts     # pillar 3
    orders.ts / orderActions.ts            # pillar 4
    storefront.ts                          # public storefront API
    connectorActions.ts                    # credential tests
    lib/ai.ts                              # Claude API wrapper (structured outputs, web search, fallbacks)
    lib/fallbacks.ts                       # demo-mode generators
    lib/pricing.ts                         # margin & pricing math (shared with the UI)
    lib/images.ts                          # image providers + SVG placeholders
    lib/notify.ts                          # flow rendering + delivery + scheduling
    lib/integrations/                      # shopify, ads (meta/tiktok/google), messaging (resend/smtp/twilio),
                                           # fulfillment (webhook/printful), tracking (aftership + simulation)
src/app/ecommerce/
  page.tsx                      # landing page
  dashboard/                    # authenticated dashboard (sidebar shell, store switcher)
  storefront/[slug]/            # generated public storefront, product pages, checkout, order tracking
src/components/ecommerce/       # StoreProvider, DashboardShell, shared UI bits, cart
```

Data-layer files (`*.ts`) contain queries/mutations; `*Actions.ts` files run in the Node runtime and call external APIs. Access control: store owners (and app admins) only, enforced in `convex/ecommerce/lib/auth.ts`.

### AI

`convex/ecommerce/lib/ai.ts` uses the Anthropic SDK with `claude-opus-5` by default (`ANTHROPIC_MODEL` to override):

- `generateStructured` – structured outputs validated against zod schemas.
- `researchWithWebSearch` – server-side `web_search` tool for trend, competitor and creator research; sources are stored with each research run.
- `withAi` – runs the generator and falls back to templates on missing keys or errors; every stored result records `usedAi`.

Server-side refusal fallbacks are enabled (`fallbacks: "default"`).

### Webhooks

Shown with copy buttons under **Settings → Webhooks**:

- `POST /api/ecommerce/webhooks/orders?store=<storeId>&token=<token>` – generic inbound orders (JSON: customer, shippingAddress, items[], paid…)
- `POST /api/ecommerce/webhooks/shopify/orders?store=<storeId>` – Shopify `orders/create` (HMAC verified; auto-registered when Shopify is connected)
- `POST /api/ecommerce/webhooks/stripe` – Stripe `checkout.session.completed` for storefront payments

## Running locally

```bash
npm install
npx convex dev            # deploys schema/functions, prints NEXT_PUBLIC_CONVEX_URL
npm run dev               # http://localhost:3000/ecommerce
```

Set Clerk keys in `.env.local` (see `.env.example`) and, on the Convex dashboard, `CLERK_JWT_ISSUER_DOMAIN` plus any optional provider keys.
