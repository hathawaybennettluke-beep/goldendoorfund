"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Image as ImageIcon, Sparkles, Trash2, Copy } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, StatusBadge, EmptyState, LoadingButton, AiTag, ProductImage } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CHANNEL_LABELS, relativeTime } from "@/lib/ecommerce/format";

export default function CreativesPage() {
  const store = useCurrentStore();
  const creatives = useQuery(api.ecommerce.marketing.listCreatives, { storeId: store._id });
  const products = useQuery(api.ecommerce.products.list, { storeId: store._id });
  const generate = useAction(api.ecommerce.marketingActions.generateCreatives);
  const remove = useMutation(api.ecommerce.marketing.deleteCreative);
  const [productId, setProductId] = useState<string>("");
  const [channel, setChannel] = useState("meta");
  const [busy, setBusy] = useState<string | null>(null);

  const gen = async (type: "ad_copy" | "video_script") => {
    const pid = (productId || products?.[0]?._id) as Id<"ecProducts"> | undefined;
    if (!pid) return toast.error("Add a product first");
    setBusy(type);
    try {
      const res = await generate({ storeId: store._id, productId: pid, channel, type });
      toast.success(`${res.created} creative(s) generated${res.usedAi ? "" : " (demo templates)"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  };
  const copyText = (text: string) => navigator.clipboard.writeText(text).then(() => toast.success("Copied"));

  const list = creatives ?? [];
  const copy = list.filter((c) => c.type === "ad_copy" || c.type === "email" || c.type === "sms");
  const videos = list.filter((c) => c.type === "video_script");
  const images = list.filter((c) => c.type === "image");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 3" title="Creatives" description="Ad copy, video scripts and image creatives across every campaign. Generate new angles for any product and channel." />
      <Section title="Generate" description="Pick a product and channel.">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <div className="space-y-1.5"><Label>Product</Label><Select value={productId || products?.[0]?._id || ""} onValueChange={setProductId}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{(products ?? []).map((p) => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Channel</Label><Select value={channel} onValueChange={setChannel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CHANNEL_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
          <LoadingButton loading={busy === "ad_copy"} onClick={() => gen("ad_copy")}><Sparkles className="h-4 w-4" /> 3 ad variants</LoadingButton>
          <LoadingButton variant="outline" loading={busy === "video_script"} onClick={() => gen("video_script")}><Sparkles className="h-4 w-4" /> Video script</LoadingButton>
        </div>
      </Section>
      {!creatives ? null : creatives.length === 0 ? <EmptyState icon={<ImageIcon className="h-5 w-5" />} title="No creatives yet" description="Create a campaign or generate creatives above." /> : (
        <Tabs defaultValue="copy">
          <TabsList><TabsTrigger value="copy">Copy ({copy.length})</TabsTrigger><TabsTrigger value="video">Video scripts ({videos.length})</TabsTrigger><TabsTrigger value="images">Images ({images.length})</TabsTrigger></TabsList>
          <TabsContent value="copy" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {copy.map((c) => (
              <article key={c._id} className="rounded-xl border bg-card p-4 text-sm">
                <div className="flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{CHANNEL_LABELS[c.channel] ?? c.channel} · {c.variant}</span><StatusBadge status={c.status} /></div>
                {c.hook && <p className="mt-2 text-xs italic text-muted-foreground">{c.hook}</p>}
                {c.headline && <p className="mt-1 font-semibold">{c.headline}</p>}
                {c.primaryText && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{c.primaryText}</p>}
                <div className="mt-3 flex items-center justify-between"><AiTag usedAi={c.usedAi} /><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyText([c.headline, c.primaryText, c.description, c.cta].filter(Boolean).join("\n\n"))}><Copy className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove({ creativeId: c._id })}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>
                <p className="mt-1 text-xs text-muted-foreground">{relativeTime(c.createdAt)}</p>
              </article>
            ))}
          </TabsContent>
          <TabsContent value="video" className="mt-4 space-y-4">
            {videos.map((v) => (
              <article key={v._id} className="rounded-xl border bg-card p-4 text-sm">
                <div className="flex items-center justify-between"><p className="font-semibold">{v.hook}</p><div className="flex items-center gap-2"><AiTag usedAi={v.usedAi} /><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyText((v.script ?? []).map((s) => `Scene ${s.scene} (${s.durationSec}s)\nVisual: ${s.visual}\nVO: ${s.voiceover}${s.onScreenText ? `\nText: ${s.onScreenText}` : ""}`).join("\n\n"))}><Copy className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove({ creativeId: v._id })}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>
                <ol className="mt-3 grid gap-2 md:grid-cols-2">{v.script?.map((s) => <li key={s.scene} className="rounded bg-muted/50 p-2"><span className="text-xs font-mono text-muted-foreground">Scene {s.scene} · {s.durationSec}s</span><p><span className="text-xs font-semibold">Visual: </span>{s.visual}</p><p><span className="text-xs font-semibold">VO: </span>{s.voiceover}</p>{s.onScreenText && <p className="text-xs text-primary">{s.onScreenText}</p>}</li>)}</ol>
              </article>
            ))}
          </TabsContent>
          <TabsContent value="images" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            {images.map((i) => <figure key={i._id} className="overflow-hidden rounded-xl border"><ProductImage src={i.imageUrl} alt={i.headline ?? "creative"} className="aspect-square w-full" /><figcaption className="truncate p-2 text-xs">{i.headline}</figcaption></figure>)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
