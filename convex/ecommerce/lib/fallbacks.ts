/**
 * Deterministic "demo mode" generators. They produce sensible, niche-aware
 * content when the Claude API is not configured so every workflow in the
 * platform can be exercised end-to-end.
 */
import { seededRandom, slugify, titleCase } from "./text";

export interface TrendIdeaTemplate {
  name: string;
  description: string;
  category: string;
  trendScore: number;
  competitionLevel: "low" | "medium" | "high";
  demandSignal: string;
  whyNow: string;
  risks: string[];
  estimatedCost: number;
  suggestedPrice: number;
  searchVolume: string;
  keywords: string[];
  supplierHints: string[];
}

const ANGLES = [
  ["Eco-friendly", "sustainable materials and refillable design"],
  ["Compact", "space-saving form factor for small apartments"],
  ["Smart", "app-connected with usage tracking"],
  ["Premium", "gift-ready packaging and lifetime warranty"],
  ["Travel", "TSA-friendly and under 300g"],
  ["Personalised", "monogram or custom colour options"],
];

const BASE_PRODUCTS: Record<string, string[]> = {
  default: ["Organizer", "Starter Kit", "Accessory Set", "Daily Essentials Bundle", "Pro Tool", "Care Kit"],
  fitness: ["Resistance Band Set", "Massage Gun", "Smart Jump Rope", "Grip Strength Trainer", "Recovery Slides", "Hydration Tracker"],
  home: ["Under-Sink Organizer", "Motion Sensor Light", "Spice Rack", "Cordless Vacuum", "Drawer Divider Set", "Bamboo Cutting Board"],
  pets: ["Slow Feeder Bowl", "Self-Cleaning Brush", "Interactive Puzzle Toy", "Cooling Mat", "Car Seat Cover", "Treat Pouch"],
  beauty: ["Ice Roller", "Scalp Massager", "LED Face Mask", "Heatless Curler", "Silk Pillowcase", "Lash Serum"],
  kitchen: ["Mini Waffle Maker", "Electric Salt Grinder", "Herb Stripper", "Cold Brew Pitcher", "Silicone Stretch Lids", "Portable Blender"],
  tech: ["Magnetic Charging Stand", "Cable Organizer", "Mini Projector", "Laptop Riser", "Key Finder", "Noise-Cancelling Earbuds"],
  baby: ["Silicone Bib Set", "White Noise Machine", "Bottle Drying Rack", "Teething Mitten", "Portable Changing Pad", "Sleep Sack"],
  outdoor: ["Collapsible Lantern", "Hammock Straps", "Solar Power Bank", "Camp Kettle", "Dry Bag", "Fire Starter Kit"],
};

function bucketFor(niche: string): string {
  const n = niche.toLowerCase();
  for (const key of Object.keys(BASE_PRODUCTS)) {
    if (key !== "default" && n.includes(key)) return key;
  }
  if (/gym|yoga|workout|sport/.test(n)) return "fitness";
  if (/dog|cat|puppy/.test(n)) return "pets";
  if (/skin|hair|cosmetic|makeup/.test(n)) return "beauty";
  if (/cook|food|coffee/.test(n)) return "kitchen";
  if (/gadget|phone|computer|gaming/.test(n)) return "tech";
  if (/camp|hik|garden|fish/.test(n)) return "outdoor";
  if (/decor|furniture|organi/.test(n)) return "home";
  return "default";
}

export function fallbackTrendIdeas(niche: string, count = 6): TrendIdeaTemplate[] {
  const rnd = seededRandom(niche);
  const bucket = bucketFor(niche);
  const bases = BASE_PRODUCTS[bucket];
  const ideas: TrendIdeaTemplate[] = [];
  for (let i = 0; i < count; i++) {
    const base = bases[i % bases.length];
    const [angle, angleDetail] = ANGLES[Math.floor(rnd() * ANGLES.length)];
    const cost = Math.round((4 + rnd() * 22) * 100) / 100;
    const multiple = 2.6 + rnd() * 1.4;
    const price = Math.ceil(cost * multiple) - 0.01;
    const trend = Math.round(55 + rnd() * 40);
    const compLevels: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
    ideas.push({
      name: `${angle} ${base}`,
      description: `${titleCase(niche)} shoppers are looking for a ${base.toLowerCase()} with ${angleDetail}. Positions well as a problem-solving purchase with strong video demo potential.`,
      category: bucket === "default" ? titleCase(niche) : titleCase(bucket),
      trendScore: trend,
      competitionLevel: compLevels[Math.floor(rnd() * 3)],
      demandSignal: `${Math.round(20 + rnd() * 120)}% rise in related searches over the last 90 days (estimate)`,
      whyNow: "Seasonal interest is building and short-form video content around this problem is gaining traction.",
      risks: ["Easily copied by competitors", "Shipping weight can erode margin"].slice(0, 1 + Math.floor(rnd() * 2)),
      estimatedCost: cost,
      suggestedPrice: price,
      searchVolume: `${Math.round(8 + rnd() * 60)}k/mo (estimate)`,
      keywords: [base.toLowerCase(), `${angle.toLowerCase()} ${base.toLowerCase()}`, `best ${base.toLowerCase()} ${new Date().getFullYear()}`],
      supplierHints: ["Compare 3+ suppliers on lead time and MOQ", "Request samples before listing"],
    });
  }
  return ideas;
}

export function fallbackCompetitor(url: string, niche: string) {
  const domain = domainOf(url);
  const rnd = seededRandom(domain);
  const min = Math.round(15 + rnd() * 20);
  return {
    name: titleCase(domain.split(".")[0].replace(/[-_]/g, " ")),
    positioning: `Mid-market ${niche} brand leaning on lifestyle imagery and bundle offers.`,
    priceRange: { min, max: min + Math.round(30 + rnd() * 60) },
    strengths: ["Established review base", "Frequent bundle promotions", "Fast shipping promise"],
    weaknesses: ["Generic product photography", "Slow site speed on mobile", "Thin educational content"],
    opportunities: [
      "Own the comparison keywords with honest side-by-side content",
      "Lead with UGC video where the competitor uses static images",
      "Offer a stronger guarantee to reduce purchase anxiety",
    ],
    topProducts: [
      { name: "Best-seller bundle", price: min + 25, note: "Heavily discounted from compare-at price" },
      { name: "Starter kit", price: min, note: "Entry price point" },
      { name: "Premium edition", price: min + 60, note: "Highest margin item" },
    ],
    trafficEstimate: `${Math.round(20 + rnd() * 200)}k visits/mo (estimate)`,
    marketingChannels: ["Meta ads", "Influencer seeding", "Email"],
  };
}

export function domainOf(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

export function fallbackProductCopy(opts: { title: string; category: string; niche: string; brandVoice?: string; audience?: string }) {
  const { title, category, niche } = opts;
  const audience = opts.audience || `${niche} enthusiasts`;
  return {
    shortDescription: `The ${title} makes everyday ${niche.toLowerCase()} simpler, faster and more enjoyable.`,
    description: `## Meet the ${title}\n\nDesigned for ${audience}, the ${title} solves the small frustrations that get in the way of the moments you love. Thoughtful details, durable materials and a design that looks as good as it works.\n\n### Why you'll love it\n\n- Built to last with premium ${category.toLowerCase()} materials\n- Set up in under a minute – no tools, no fuss\n- Compact enough to take anywhere\n- Backed by our 30-day happiness guarantee\n\n### How it works\n\nUnbox, set up and enjoy. The ${title} fits seamlessly into your routine from day one.\n\n### What's in the box\n\n1 × ${title}, quick-start guide and a thank-you note from our team.`,
    bullets: [
      `Premium ${category.toLowerCase()} build quality`,
      "Ready to use in under a minute",
      "Lightweight, travel-friendly design",
      "30-day happiness guarantee",
      "Fast, tracked shipping",
    ],
    faq: [
      { question: "How long does shipping take?", answer: "Orders ship within 1–2 business days and typically arrive in 3–7 business days with tracking." },
      { question: "What if it's not right for me?", answer: "You have 30 days to return it for a full refund – no questions asked." },
      { question: "Is there a warranty?", answer: "Yes, every order is covered by a 12-month warranty against manufacturing defects." },
    ],
    tags: [niche.toLowerCase(), category.toLowerCase(), "bestseller", "new"],
    variants: [{ name: "Color", options: ["Black", "White", "Sand"] }],
  };
}

export function fallbackSeo(opts: { title: string; category: string; niche: string; storeName: string }) {
  const kw = slugify(opts.title).replace(/-/g, " ");
  return {
    title: `${opts.title} | ${opts.storeName}`.slice(0, 60),
    description: `Shop the ${opts.title} at ${opts.storeName}. Premium ${opts.category.toLowerCase()} for ${opts.niche.toLowerCase()} lovers, fast shipping and a 30-day guarantee.`.slice(0, 155),
    keywords: [kw, `buy ${kw}`, `${kw} ${opts.niche.toLowerCase()}`, `best ${opts.category.toLowerCase()}`],
  };
}

export function fallbackAdCopy(opts: { title: string; channel: string; niche: string; price: number; currency: string }) {
  const p = `${opts.currency === "USD" ? "$" : ""}${opts.price.toFixed(2)}`;
  return [
    {
      variant: "A – Problem/Solution",
      hook: `Still struggling with ${opts.niche.toLowerCase()} the hard way?`,
      headline: `${opts.title}: the upgrade you'll wish you found sooner`,
      primaryText: `Tired of products that promise a lot and deliver little? The ${opts.title} was built for people who actually use it every day. Fast setup, built to last, ${p} with free tracked shipping.`,
      description: "30-day happiness guarantee.",
      cta: "Shop Now",
    },
    {
      variant: "B – Social proof",
      hook: `Why thousands of ${opts.niche.toLowerCase()} fans switched`,
      headline: `Rated 4.8★ by real customers`,
      primaryText: `"I didn't expect to love it this much." Join the customers who made the ${opts.title} part of their routine. Limited stock at ${p}.`,
      description: "Free shipping. Easy returns.",
      cta: "Get Yours",
    },
    {
      variant: "C – Urgency",
      hook: `Our best-selling ${opts.title.toLowerCase()} is back`,
      headline: `Back in stock – for now`,
      primaryText: `The last drop sold out in 6 days. Grab the ${opts.title} at ${p} before it's gone again.`,
      description: "Ships in 24h.",
      cta: "Order Now",
    },
  ];
}

export function fallbackVideoScript(opts: { title: string; niche: string; channel: string }) {
  return {
    hook: `POV: you finally fixed your ${opts.niche.toLowerCase()} problem`,
    script: [
      { scene: 1, durationSec: 3, visual: `Close-up of the frustrating "before" moment`, voiceover: `Okay, this used to drive me crazy.`, onScreenText: "The old way 😩" },
      { scene: 2, durationSec: 5, visual: `Unboxing the ${opts.title}, hands-only shot`, voiceover: `Then I found the ${opts.title}.`, onScreenText: `Meet the ${opts.title}` },
      { scene: 3, durationSec: 8, visual: `Demonstration of the key feature in use`, voiceover: `Watch this – set up in seconds, and it just works.`, onScreenText: "Setup in 10 seconds" },
      { scene: 4, durationSec: 6, visual: `Lifestyle shot, product in daily routine`, voiceover: `Now it's part of my routine every single day.`, onScreenText: "Every. Single. Day." },
      { scene: 5, durationSec: 4, visual: `Product hero shot with price and CTA`, voiceover: `Link's in the bio – you'll thank me later.`, onScreenText: "Shop now → 30-day guarantee" },
    ],
  };
}

export function fallbackFlow(trigger: string, storeName: string, channel: "email" | "sms") {
  const e = channel === "email";
  const flows: Record<string, { name: string; steps: Array<{ delayHours: number; subject?: string; body: string }> }> = {
    order_confirmation: {
      name: "Order confirmation",
      steps: [{ delayHours: 0, subject: e ? `Your ${storeName} order {{orderNumber}} is confirmed` : undefined, body: `Hi {{customerName}}, thanks for your order {{orderNumber}}! We're getting it ready now and will send tracking as soon as it ships. Total: {{total}}.` }],
    },
    shipping_update: {
      name: "Shipping updates",
      steps: [{ delayHours: 0, subject: e ? `Your order {{orderNumber}} is on its way` : undefined, body: `Good news {{customerName}} – your order {{orderNumber}} has shipped with {{carrier}}. Track it here: {{trackingUrl}}` }],
    },
    delivered: {
      name: "Delivered + review request",
      steps: [
        { delayHours: 0, subject: e ? `Delivered! Enjoy your order` : undefined, body: `{{customerName}}, your order {{orderNumber}} was delivered. We hope you love it!` },
        { delayHours: 72, subject: e ? `How are you liking it?` : undefined, body: `Quick favour, {{customerName}} – would you leave a short review? It helps a small brand like ${storeName} more than you know.` },
      ],
    },
    abandoned_cart: {
      name: "Abandoned cart recovery",
      steps: [
        { delayHours: 1, subject: e ? `You left something behind` : undefined, body: `Hi {{customerName}}, your cart is saved. Finish checkout whenever you're ready.` },
        { delayHours: 24, subject: e ? `Still thinking it over?` : undefined, body: `Here's 10% off to make it easy: use code COMEBACK10 at checkout.` },
      ],
    },
    welcome: {
      name: "Welcome series",
      steps: [
        { delayHours: 0, subject: e ? `Welcome to ${storeName}` : undefined, body: `Welcome! Here's what makes ${storeName} different – and a little something for your first order: WELCOME10.` },
        { delayHours: 48, subject: e ? `Our customers' favourites` : undefined, body: `Not sure where to start? These are the products our customers can't stop talking about.` },
      ],
    },
    post_purchase: {
      name: "Post-purchase upsell",
      steps: [{ delayHours: 168, subject: e ? `Perfect pairings for your order` : undefined, body: `Customers who bought what you did also love these. Enjoy 15% off your next order with THANKYOU15.` }],
    },
    winback: {
      name: "Win-back",
      steps: [{ delayHours: 1440, subject: e ? `We miss you` : undefined, body: `It's been a while, {{customerName}}. Come back and save 20% with WEMISSYOU20.` }],
    },
    cancellation: {
      name: "Cancellation confirmation",
      steps: [{ delayHours: 0, subject: e ? `Your order {{orderNumber}} has been cancelled` : undefined, body: `Hi {{customerName}}, order {{orderNumber}} has been cancelled as requested. Any payment will be refunded within 5–10 business days.` }],
    },
  };
  return flows[trigger] ?? flows.order_confirmation;
}

export function fallbackInfluencers(niche: string, count = 8) {
  const rnd = seededRandom(`inf-${niche}`);
  const platforms = ["instagram", "tiktok", "youtube"];
  const adjectives = ["daily", "with", "life", "lab", "diaries", "hq", "club", "journal"];
  const slug = slugify(niche).replace(/-/g, "");
  const list = [];
  for (let i = 0; i < count; i++) {
    const followers = Math.round((8 + rnd() * 240) * 1000);
    const platform = platforms[Math.floor(rnd() * platforms.length)];
    const handle = `${slug}${adjectives[i % adjectives.length]}${Math.floor(rnd() * 90 + 10)}`;
    list.push({
      name: `${titleCase(niche)} creator ${i + 1}`,
      handle: `@${handle}`,
      platform,
      followers,
      engagementRate: Math.round((1.5 + rnd() * 6) * 10) / 10,
      niche,
      contact: `partnerships@${handle}.example`,
      profileUrl: `https://${platform}.com/${handle}`,
      fitScore: Math.round(60 + rnd() * 38),
      estimatedRate: Math.round(followers / 100) * 1,
    });
  }
  return list;
}

export function fallbackOutreach(opts: { influencerName: string; handle: string; storeName: string; productTitle: string; niche: string }) {
  return {
    outreachMessage: `Hi ${opts.influencerName.split(" ")[0]},\n\nI've been following ${opts.handle} for a while – your ${opts.niche.toLowerCase()} content is exactly the kind of honest, useful stuff our customers love.\n\nI'm from ${opts.storeName}. We just launched the ${opts.productTitle} and I'd love to send you one, no strings attached. If you like it and want to share it, we can set up a commission code for your audience (typically 15–20% + a free product for a giveaway).\n\nWould you be open to that? Happy to ship this week.\n\nBest,\n${opts.storeName} team`,
    followUpMessage: `Hi again – just floating this back to the top of your inbox. Still keen to send you the ${opts.productTitle} to try. Let me know the best address and I'll ship it out today!`,
  };
}

export function fallbackTargeting(channel: string, niche: string, audience?: string) {
  return {
    audience: audience || `${titleCase(niche)} enthusiasts, 25–45`,
    interests: [niche, `${niche} accessories`, "online shopping", "lifestyle"],
    ageRange: "25-45",
    genders: "all",
    locations: ["United States", "Canada", "United Kingdom", "Australia"],
    placements: channel === "tiktok" ? ["In-feed", "TopView"] : channel === "google" ? ["Search", "Shopping", "Performance Max"] : ["Feed", "Stories", "Reels"],
    strategy: `Start with a broad ${channel} prospecting set at the daily budget, 3 creative variants, optimise for purchases. Kill creatives with CTR < 1% after 2k impressions, scale winners +20% every 48h while ROAS stays above target.`,
    keywords: channel === "google" ? [`buy ${niche}`, `best ${niche} products`, `${niche} online store`] : [],
  };
}

export function fallbackOptimizationNotes(name: string, roas: number, target: number, ctr: number) {
  if (roas >= target * 1.3) return `${name} is beating the ROAS target by 30%+ – increase budget 20% and duplicate the winning creative into a new ad set.`;
  if (roas >= target) return `${name} is on target – hold budget, refresh the weakest creative to prevent fatigue.`;
  if (ctr < 1) return `${name} has a weak CTR (${ctr.toFixed(2)}%) – the creative, not the audience, is the problem. Swap hooks before spending more.`;
  return `${name} is below the ROAS target – tighten targeting to top converting locations and reduce budget until performance recovers.`;
}
