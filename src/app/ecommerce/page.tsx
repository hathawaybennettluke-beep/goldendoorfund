import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot, Search, Store, Megaphone, Truck, ArrowRight, TrendingUp, Users, Calculator, Lightbulb, FileText, Image as ImageIcon, Tag, Layers, Globe, Facebook, Music2, Mail, Handshake, Clapperboard, LineChart, Bell, PackageCheck, MapPin, Send, Ban, Zap, ShieldCheck, Workflow, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Commerce Autopilot – automate your ecommerce business",
  description: "Find winning products, build the store, run marketing and manage orders automatically. Research, product pages, ads, email/SMS, influencer outreach and fulfilment on autopilot.",
};

const PILLARS = [
  {
    step: "01",
    icon: Search,
    title: "Find products for your idea",
    tagline: "From niche to shortlist in minutes.",
    color: "from-amber-500/15 to-amber-500/0",
    features: [
      { icon: TrendingUp, text: "Research trending products with live web research and cited sources" },
      { icon: Users, text: "Analyse competitors: positioning, pricing, strengths, weaknesses and gaps" },
      { icon: Calculator, text: "Estimate margins with fees, shipping, returns and ad costs baked in" },
      { icon: Lightbulb, text: "Identify and shortlist potential products, then launch them in one click" },
    ],
  },
  {
    step: "02",
    icon: Store,
    title: "Build the store",
    tagline: "A complete, SEO-ready catalogue without the busywork.",
    color: "from-sky-500/15 to-sky-500/0",
    features: [
      { icon: FileText, text: "Generate product pages and write descriptions, bullets and FAQs" },
      { icon: ImageIcon, text: "Create product images in studio, lifestyle and flat-lay styles" },
      { icon: Tag, text: "Set pricing from your margin strategy and competitor data" },
      { icon: Layers, text: "Create collections automatically and sync everything to Shopify" },
      { icon: Globe, text: "Manage SEO with on-page scoring and one-click fixes" },
    ],
  },
  {
    step: "03",
    icon: Megaphone,
    title: "Manage marketing",
    tagline: "Every channel, one operator.",
    color: "from-violet-500/15 to-violet-500/0",
    features: [
      { icon: Facebook, text: "Facebook & Instagram campaigns with targeting and budgets" },
      { icon: Music2, text: "TikTok campaigns with UGC-style video scripts" },
      { icon: Globe, text: "Google campaigns with keyword plans" },
      { icon: Mail, text: "Email & SMS flows: welcome, abandoned cart, post-purchase, win-back" },
      { icon: Handshake, text: "Influencer discovery and personalised outreach" },
      { icon: Clapperboard, text: "Generate ads, videos and copy in multiple angles" },
      { icon: LineChart, text: "Optimise campaigns automatically against ROAS and CPA targets" },
    ],
  },
  {
    step: "04",
    icon: Truck,
    title: "Manage orders",
    tagline: "From checkout to doorstep without touching a thing.",
    color: "from-emerald-500/15 to-emerald-500/0",
    features: [
      { icon: Bell, text: "Monitor incoming orders from Shopify, your storefront or any webhook" },
      { icon: PackageCheck, text: "Send orders to fulfilment (3PL webhook, Printful) with fraud holds" },
      { icon: MapPin, text: "Track shipments across carriers" },
      { icon: Send, text: "Send customers tracking information and delivery updates" },
      { icon: Ban, text: "Handle cancellations, refunds and restocking" },
    ],
  },
];

const LOOP = [
  { cadence: "Every 15 min", text: "New paid orders are confirmed and sent to fulfilment; risky orders are held for review." },
  { cadence: "Every 30 min", text: "Shipments are tracked and customers receive tracking and delivery messages." },
  { cadence: "Every 6 hours", text: "Ad campaigns are synced and scaled, reduced, paused or refreshed with new creative." },
  { cadence: "Daily", text: "Trend research refreshes your idea pipeline with new opportunities." },
];

const INTEGRATIONS = ["Shopify", "Meta Ads", "TikTok Ads", "Google Ads", "Resend / SMTP", "Twilio", "Stripe", "Printful & 3PL webhooks", "AfterShip", "Claude by Anthropic"];

export default function EcommerceLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/ecommerce" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></span>
            Commerce Autopilot
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#pillars" className="hover:text-foreground">Platform</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#automation" className="hover:text-foreground">Automation</a>
            <a href="#integrations" className="hover:text-foreground">Integrations</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link href="/sign-in?redirect_url=/ecommerce/dashboard">Sign in</Link></Button>
            <Button asChild size="sm"><Link href="/ecommerce/dashboard">Open dashboard <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,160,23,0.18),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" /> AI operator for ecommerce businesses
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Run an entire ecommerce business <span className="text-primary">on autopilot</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Give it a niche. It researches trending products, builds the store, launches the marketing and manages every order through delivery – with you in control of the rules.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg"><Link href="/ecommerce/dashboard">Start automating <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><a href="#how">See how it works</a></Button>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 text-left md:grid-cols-4">
            {PILLARS.map((p) => (
              <a key={p.step} href={`#pillar-${p.step}`} className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">{p.step}</span>
                </div>
                <p className="mt-3 font-semibold leading-tight">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.features.length} automations</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="pillars" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">The four pillars</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Everything an ecommerce operator does, automated</h2>
            <p className="mt-3 text-muted-foreground">Each pillar is a set of AI actions plus background automation. Use them one at a time or let the loop run end to end.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {PILLARS.map((p) => (
              <article key={p.step} id={`pillar-${p.step}`} className={`relative overflow-hidden rounded-2xl border bg-card p-7 bg-gradient-to-br ${p.color}`}>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background shadow-sm"><p.icon className="h-5 w-5 text-primary" /></div>
                  <span className="font-mono text-sm text-muted-foreground">{p.step}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3 text-sm">
                      <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">From idea to shipped orders</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-4">
            {[
              { t: "Describe your store", d: "Name, niche, audience, brand voice and margin targets. That context powers every generation." },
              { t: "Research & shortlist", d: "Trend research, competitor analysis and margin estimates produce a ranked idea board. Launch the winners as products." },
              { t: "Generate & publish", d: "Copy, images, pricing, collections and SEO are generated per product. Publish to the built-in storefront or Shopify." },
              { t: "Market & fulfil", d: "Campaigns, creatives, flows and outreach go live. Orders flow to fulfilment, tracking goes to customers, campaigns self-optimise." },
            ].map((s, i) => (
              <li key={s.t} className="relative rounded-2xl border bg-card p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="automation" className="border-t bg-muted/30 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Always on</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">The automation loop</h2>
            <p className="mt-3 text-muted-foreground">Background jobs keep the business moving while you sleep. Every action is logged to an activity feed, and every rule – fraud holds, ROAS targets, notification preferences – is yours to change.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Fraud & risk holds before fulfilment", "ROAS / CPA guard-rails on every campaign", "Full audit trail of automated decisions", "Works in demo mode before you connect anything"].map((t) => (
                <li key={t} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-medium"><Workflow className="h-4 w-4 text-primary" /> Scheduled jobs</div>
            <ul className="mt-4 divide-y">
              {LOOP.map((l) => (
                <li key={l.cadence} className="flex gap-4 py-3 text-sm">
                  <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">{l.cadence}</span>
                  <span>{l.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="integrations" className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Integrations</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Plugs into the tools you already use</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {INTEGRATIONS.map((n) => (
              <span key={n} className="rounded-full border bg-card px-4 py-2 text-sm">{n}</span>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground">Nothing connected yet? The platform runs in demo mode with simulated channels so you can see every workflow before adding credentials.</p>
        </div>
      </section>

      <section className="border-t bg-primary/5 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Put your store on autopilot today</h2>
          <p className="mt-3 text-muted-foreground">Create a store in two minutes. The first trend research run is one click away.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg"><Link href="/ecommerce/dashboard">Open the dashboard <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {["Research", "Store builder", "Marketing", "Order automation"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row">
          <span>Commerce Autopilot · ecommerce automation platform</span>
          <div className="flex gap-4">
            <Link href="/ecommerce/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/" className="hover:text-foreground">GoldenDoor Fund</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
