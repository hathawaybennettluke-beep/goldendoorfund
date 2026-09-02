"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { TrendingUp, Users, Calculator, Lightbulb, Rocket, Star, Trash2, ExternalLink, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, StatusBadge, AiTag, EmptyState, LoadingButton, DemoNotice } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { money, pct, relativeTime } from "@/lib/ecommerce/format";
import { computeMargin, DEFAULT_MARGIN_ASSUMPTIONS } from "../../../../../convex/ecommerce/lib/pricing";

type MarginEstimate = Awaited<ReturnType<ReturnType<typeof useAction<typeof api.ecommerce.researchActions.estimateMargins>>>>;

export default function ResearchPage() {
  const store = useCurrentStore();
  const runs = useQuery(api.ecommerce.research.listRuns, { storeId: store._id });
  const ideas = useQuery(api.ecommerce.research.listIdeas, { storeId: store._id });
  const competitors = useQuery(api.ecommerce.research.listCompetitors, { storeId: store._id });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 1" title="Find products" description="Research trends, analyse competitors, estimate margins and build a shortlist of products worth selling." />
      <Tabs defaultValue="trends">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="trends"><TrendingUp className="mr-1.5 h-4 w-4" /> Trends</TabsTrigger>
          <TabsTrigger value="ideas"><Lightbulb className="mr-1.5 h-4 w-4" /> Idea board {ideas?.length ? <Badge variant="secondary" className="ml-2">{ideas.length}</Badge> : null}</TabsTrigger>
          <TabsTrigger value="competitors"><Users className="mr-1.5 h-4 w-4" /> Competitors {competitors?.length ? <Badge variant="secondary" className="ml-2">{competitors.length}</Badge> : null}</TabsTrigger>
          <TabsTrigger value="margins"><Calculator className="mr-1.5 h-4 w-4" /> Margin calculator</TabsTrigger>
        </TabsList>
        <TabsContent value="trends" className="mt-4"><TrendsTab store={store} runs={runs} /></TabsContent>
        <TabsContent value="ideas" className="mt-4"><IdeasTab store={store} ideas={ideas} /></TabsContent>
        <TabsContent value="competitors" className="mt-4"><CompetitorsTab store={store} competitors={competitors} /></TabsContent>
        <TabsContent value="margins" className="mt-4"><MarginsTab store={store} /></TabsContent>
      </Tabs>
    </div>
  );
}

function TrendsTab({ store, runs }: { store: Doc<"ecStores">; runs: Doc<"ecResearchRuns">[] | undefined }) {
  const run = useAction(api.ecommerce.researchActions.runTrendResearch);
  const brief = useAction(api.ecommerce.researchActions.generateIdeasFromBrief);
  const [focus, setFocus] = useState("");
  const [briefText, setBriefText] = useState("");
  const [loading, setLoading] = useState<"trends" | "brief" | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const start = async () => {
    setLoading("trends");
    try {
      const res = await run({ storeId: store._id, focus: focus || undefined });
      toast.success(`${res.ideaCount} product opportunities added to the idea board${res.usedAi ? "" : " (demo mode)"}`);
      if (res.warning) toast.message(res.warning);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Research failed");
    } finally {
      setLoading(null);
    }
  };
  const fromBrief = async () => {
    if (!briefText.trim()) return toast.error("Describe the kind of product you have in mind");
    setLoading("brief");
    try {
      const res = await brief({ storeId: store._id, brief: briefText });
      toast.success(`${res.ideaCount} ideas generated`);
      setBriefText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Section title="Research trending products" description="Live web research on rising demand, best-seller movement and social trends.">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Focus (optional)</Label>
              <Input placeholder={`Default: ${store.niche}`} value={focus} onChange={(e) => setFocus(e.target.value)} />
            </div>
            <LoadingButton onClick={start} loading={loading === "trends"} className="w-full"><Sparkles className="h-4 w-4" /> Run trend research</LoadingButton>
            <p className="text-xs text-muted-foreground">Takes 30–90 seconds with live research. Results land on the idea board with scores, margins and sources.</p>
          </div>
        </Section>
        <Section title="Ideas from a brief" description="Have a direction already? Turn it into concrete products.">
          <div className="space-y-3">
            <Textarea rows={4} placeholder="e.g. Gift-ready kitchen gadgets under $40 that demo well on TikTok" value={briefText} onChange={(e) => setBriefText(e.target.value)} />
            <LoadingButton onClick={fromBrief} loading={loading === "brief"} variant="outline" className="w-full"><Lightbulb className="h-4 w-4" /> Generate ideas</LoadingButton>
          </div>
        </Section>
      </div>
      <div className="lg:col-span-2">
        <Section title="Research history" description="Every run with its summary and sources.">
          {!runs ? <p className="text-sm text-muted-foreground">Loading…</p> : runs.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-5 w-5" />} title="No research yet" description="Run trend research to populate the idea board with scored product opportunities." />
          ) : (
            <ul className="divide-y">
              {runs.map((r) => (
                <li key={r._id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="font-medium capitalize">{r.kind}</span>
                      <span className="text-sm text-muted-foreground">· {r.query}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {r.status === "completed" && <AiTag usedAi={r.usedAi} />}
                      {relativeTime(r.createdAt)}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>{expanded === r._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
                    </div>
                  </div>
                  {expanded === r._id && (
                    <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm">
                      {r.error && <p className="text-red-600">{r.error}</p>}
                      {r.summary && <p className="whitespace-pre-wrap">{r.summary}</p>}
                      {r.sources && r.sources.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {r.sources.slice(0, 8).map((s) => (
                            <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> {s.title || s.url}</a></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function IdeasTab({ store, ideas }: { store: Doc<"ecStores">; ideas: Doc<"ecProductIdeas">[] | undefined }) {
  const router = useRouter();
  const updateStatus = useMutation(api.ecommerce.research.updateIdeaStatus);
  const remove = useMutation(api.ecommerce.research.deleteIdea);
  const launch = useMutation(api.ecommerce.products.createFromIdea);
  const [filter, setFilter] = useState<"all" | "candidate" | "shortlisted" | "launched" | "rejected">("all");
  const [launching, setLaunching] = useState<Id<"ecProductIdeas"> | null>(null);

  const list = (ideas ?? []).filter((i) => filter === "all" ? i.status !== "rejected" : i.status === filter);

  const doLaunch = async (idea: Doc<"ecProductIdeas">) => {
    setLaunching(idea._id);
    try {
      const productId = await launch({ ideaId: idea._id });
      toast.success(`${idea.name} added as a draft product`);
      router.push(`/ecommerce/dashboard/store/products/${productId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not launch idea");
    } finally {
      setLaunching(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "candidate", "shortlisted", "launched", "rejected"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
        ))}
      </div>
      {!ideas ? <p className="text-sm text-muted-foreground">Loading…</p> : list.length === 0 ? (
        <EmptyState icon={<Lightbulb className="h-5 w-5" />} title="No ideas here yet" description="Run trend research or generate ideas from a brief in the Trends tab." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((idea) => (
            <article key={idea._id} className="flex flex-col rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold leading-tight">{idea.name}</h3>
                  <p className="text-xs text-muted-foreground">{idea.category}</p>
                </div>
                <StatusBadge status={idea.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Trend score</span><span className="font-medium">{idea.trendScore}/100</span></div>
                  <Progress value={idea.trendScore} className="mt-1 h-1.5" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Cost</p><p className="font-medium">{money(idea.estimatedCost, store.currency)}</p></div>
                  <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Price</p><p className="font-medium">{money(idea.suggestedPrice, store.currency)}</p></div>
                  <div className="rounded bg-muted/60 p-2"><p className="text-muted-foreground">Margin</p><p className="font-medium">{pct(idea.marginPct, 0)}</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">Competition</span><StatusBadge status={idea.competitionLevel} />
                  {idea.searchVolume && <span className="text-muted-foreground">· {idea.searchVolume}</span>}
                </div>
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Demand:</span> {idea.demandSignal}</p>
                {idea.whyNow && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Why now:</span> {idea.whyNow}</p>}
                {idea.risks && idea.risks.length > 0 && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Risks:</span> {idea.risks.join("; ")}</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                {idea.status !== "launched" && (
                  <>
                    <LoadingButton size="sm" loading={launching === idea._id} onClick={() => doLaunch(idea)}><Rocket className="h-3.5 w-3.5" /> Launch as product</LoadingButton>
                    <Button size="sm" variant="outline" onClick={() => updateStatus({ ideaId: idea._id, status: idea.status === "shortlisted" ? "candidate" : "shortlisted" })}>
                      <Star className={`h-3.5 w-3.5 ${idea.status === "shortlisted" ? "fill-current" : ""}`} /> {idea.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
                    </Button>
                    {idea.status !== "rejected" && <Button size="sm" variant="ghost" onClick={() => updateStatus({ ideaId: idea._id, status: "rejected" })}>Reject</Button>}
                  </>
                )}
                {idea.status === "launched" && idea.productId && <Button size="sm" variant="outline" onClick={() => router.push(`/ecommerce/dashboard/store/products/${idea.productId}`)}>Open product</Button>}
                <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={() => remove({ ideaId: idea._id })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function CompetitorsTab({ store, competitors }: { store: Doc<"ecStores">; competitors: Doc<"ecCompetitors">[] | undefined }) {
  const analyze = useAction(api.ecommerce.researchActions.analyzeCompetitor);
  const remove = useMutation(api.ecommerce.research.deleteCompetitor);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!url.trim()) return toast.error("Enter a competitor URL");
    setLoading(true);
    try {
      const res = await analyze({ storeId: store._id, url: url.trim() });
      toast.success(`Competitor analysed${res.usedAi ? "" : " (demo mode)"}`);
      setUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Analyse a competitor" description="We read their site and research their positioning, pricing, best-sellers and weaknesses.">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="https://competitor-store.com" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} />
          <LoadingButton onClick={run} loading={loading}><Users className="h-4 w-4" /> Analyse</LoadingButton>
        </div>
      </Section>
      {!competitors ? null : competitors.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No competitors analysed" description="Add 2–3 competitors – their prices also feed the pricing engine for your products." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {competitors.map((c) => (
            <article key={c._id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <a href={c.url.startsWith("http") ? c.url : `https://${c.url}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{c.domain}</a>
                </div>
                <div className="flex items-center gap-2"><AiTag usedAi={c.usedAi} /><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove({ competitorId: c._id })}><Trash2 className="h-3.5 w-3.5" /></Button></div>
              </div>
              {c.positioning && <p className="mt-3 text-sm">{c.positioning}</p>}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {c.priceRange && <span>Prices {money(c.priceRange.min, store.currency)} – {money(c.priceRange.max, store.currency)}</span>}
                {c.trafficEstimate && <span>· Traffic {c.trafficEstimate}</span>}
                {c.marketingChannels && c.marketingChannels.length > 0 && <span>· Channels: {c.marketingChannels.join(", ")}</span>}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
                <div><p className="font-semibold text-emerald-700">Strengths</p><ul className="mt-1 list-disc pl-4 space-y-0.5">{c.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>
                <div><p className="font-semibold text-red-700">Weaknesses</p><ul className="mt-1 list-disc pl-4 space-y-0.5">{c.weaknesses.map((s) => <li key={s}>{s}</li>)}</ul></div>
                <div><p className="font-semibold text-primary">How we win</p><ul className="mt-1 list-disc pl-4 space-y-0.5">{c.opportunities.map((s) => <li key={s}>{s}</li>)}</ul></div>
              </div>
              {c.topProducts.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold">Top products</p>
                  <ul className="mt-1 divide-y text-sm">
                    {c.topProducts.map((p) => (
                      <li key={p.name} className="flex justify-between py-1.5"><span>{p.name}{p.note && <span className="text-muted-foreground"> – {p.note}</span>}</span>{p.price ? <span className="font-medium">{money(p.price, store.currency)}</span> : null}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">Analysed {relativeTime(c.lastAnalyzedAt)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function MarginsTab({ store }: { store: Doc<"ecStores"> }) {
  const estimate = useAction(api.ecommerce.researchActions.estimateMargins);
  const [form, setForm] = useState({ productName: "", category: "", unitCost: "", price: "", shippingCost: "", adCostPerOrder: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarginEstimate | null>(null);

  // Instant calculator (client side) for the current inputs
  const live = form.unitCost && form.price ? computeMargin({
    price: Number(form.price), cost: Number(form.unitCost), shippingCost: Number(form.shippingCost || 0), adCostPerOrder: Number(form.adCostPerOrder || 0),
    paymentFeePct: DEFAULT_MARGIN_ASSUMPTIONS.paymentFeePct, paymentFeeFixed: DEFAULT_MARGIN_ASSUMPTIONS.paymentFeeFixed, platformFeePct: 0, returnRatePct: DEFAULT_MARGIN_ASSUMPTIONS.returnRatePct, otherCostPerOrder: DEFAULT_MARGIN_ASSUMPTIONS.otherCostPerOrder,
  }) : null;

  const run = async () => {
    if (!form.productName.trim()) return toast.error("Enter a product name");
    setLoading(true);
    try {
      const res = await estimate({
        storeId: store._id,
        productName: form.productName,
        category: form.category || undefined,
        unitCost: form.unitCost ? Number(form.unitCost) : undefined,
        price: form.price ? Number(form.price) : undefined,
        shippingCost: form.shippingCost ? Number(form.shippingCost) : undefined,
        adCostPerOrder: form.adCostPerOrder ? Number(form.adCostPerOrder) : undefined,
      });
      setResult(res);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Estimate failed");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, placeholder: string, type = "text") => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Section title="Unit economics" description="Leave fields blank to let the AI estimate them." className="lg:col-span-2">
        <div className="space-y-3">
          {field("productName", "Product", "e.g. Collapsible silicone lunch box")}
          {field("category", "Category (optional)", "Kitchen")}
          <div className="grid grid-cols-2 gap-3">
            {field("unitCost", `Unit cost (${store.currency})`, "8.50", "number")}
            {field("price", `Retail price (${store.currency})`, "29.99", "number")}
            {field("shippingCost", "Shipping cost", "3.20", "number")}
            {field("adCostPerOrder", "Ad cost / order", "12", "number")}
          </div>
          <LoadingButton onClick={run} loading={loading} className="w-full"><Calculator className="h-4 w-4" /> Estimate margins</LoadingButton>
          {live && (
            <div className="rounded-lg bg-muted/60 p-3 text-sm">
              <p className="text-xs font-semibold text-muted-foreground">Live calculation</p>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <span>Gross margin</span><span className="text-right font-medium">{pct(live.grossMarginPct)}</span>
                <span>Net margin (after ads)</span><span className={`text-right font-medium ${live.netMarginPct >= store.pricing.minMarginPct ? "text-emerald-700" : "text-red-700"}`}>{pct(live.netMarginPct)}</span>
                <span>Net profit / order</span><span className="text-right font-medium">{money(live.netProfit, store.currency)}</span>
                <span>Break-even ROAS</span><span className="text-right font-medium">{Number.isFinite(live.breakevenRoas) ? `${live.breakevenRoas.toFixed(2)}x` : "—"}</span>
              </div>
            </div>
          )}
        </div>
      </Section>
      <div className="lg:col-span-3">
        {!result ? (
          <EmptyState icon={<Calculator className="h-5 w-5" />} title="Margin estimate" description={`Enter a product to see recommended pricing for a ${store.pricing.targetMarginPct}% target margin, break-even ROAS/CPA and price scenarios.`} />
        ) : (
          <Section title={result.productName} description={result.assumptions.notes} actions={<div className="flex gap-2"><StatusBadge status={result.verdict} /><AiTag usedAi={result.usedAi} /></div>}>
            {result.warning && <DemoNotice>{result.warning}</DemoNotice>}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-primary/5 p-4"><p className="text-xs text-muted-foreground">Recommended price</p><p className="text-2xl font-semibold">{money(result.recommended.price, store.currency)}</p>{result.recommended.compareAtPrice && <p className="text-xs text-muted-foreground">Compare at {money(result.recommended.compareAtPrice, store.currency)}</p>}</div>
              <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Net margin</p><p className="text-2xl font-semibold">{pct(result.recommended.netMarginPct)}</p><p className="text-xs text-muted-foreground">Target {store.pricing.targetMarginPct}% · floor {store.pricing.minMarginPct}%</p></div>
              <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Assumed CPA</p><p className="text-2xl font-semibold">{money(result.assumptions.adCostPerOrder, store.currency)}</p><p className="text-xs text-muted-foreground">Cost {money(result.assumptions.unitCost, store.currency)} · ship {money(result.assumptions.shippingCost, store.currency)} · returns {result.assumptions.returnRatePct}%</p></div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{result.recommended.rationale}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Price</th><th>Gross profit</th><th>Gross %</th><th>Net profit</th><th>Net %</th><th>Break-even ROAS</th><th>Max CPA</th></tr></thead>
                <tbody className="divide-y">
                  {result.scenarios.map((s) => (
                    <tr key={s.price} className={s.price === result.recommended.price ? "bg-primary/5 font-medium" : ""}>
                      <td className="py-2">{money(s.price, store.currency)}</td><td>{money(s.grossProfit, store.currency)}</td><td>{pct(s.grossMarginPct, 0)}</td><td className={s.netProfit < 0 ? "text-red-600" : ""}>{money(s.netProfit, store.currency)}</td><td>{pct(s.netMarginPct, 0)}</td><td>{s.breakevenRoas ? `${s.breakevenRoas.toFixed(2)}x` : "—"}</td><td>{money(s.breakevenCpa, store.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
