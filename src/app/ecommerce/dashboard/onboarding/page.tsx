"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Bot, ArrowLeft } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { useStore } from "@/components/ecommerce/StoreProvider";
import { LoadingButton } from "@/components/ecommerce/bits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

export default function OnboardingPage() {
  const router = useRouter();
  const { stores, setStoreId } = useStore();
  const create = useMutation(api.ecommerce.stores.create);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", niche: "", description: "", targetAudience: "", brandVoice: "Friendly, confident and practical", currency: "USD", country: "United States", primaryColor: "#d4a017" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.niche.trim()) {
      toast.error("Store name and niche are required");
      return;
    }
    setLoading(true);
    try {
      const id = await create({ ...form });
      setStoreId(id);
      toast.success("Store created – let's find your first products");
      router.push("/ecommerce/dashboard/research");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {stores && stores.length > 0 && (
          <Link href="/ecommerce/dashboard" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard
          </Link>
        )}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Set up your store</h1>
            <p className="text-muted-foreground">Tell the autopilot what you sell. Everything else – research, product pages, marketing and fulfilment – builds on this.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Store name</Label>
              <Input id="name" placeholder="e.g. Nordic Nest Home" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Niche / category</Label>
              <Input id="niche" placeholder="e.g. Home organisation, Pet wellness" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">What makes the brand different? (optional)</Label>
            <Textarea id="description" rows={3} placeholder="Minimal, durable products for small-space living…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="audience">Target audience</Label>
              <Input id="audience" placeholder="Urban renters aged 25–40" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice">Brand voice</Label>
              <Input id="voice" value={form.brandVoice} onChange={(e) => setForm({ ...form, brandVoice: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Primary market</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Brand colour</Label>
              <div className="flex items-center gap-2">
                <input id="color" type="color" className="h-9 w-12 rounded border bg-background" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
                <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="font-mono" />
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            We&apos;ll automatically create transactional email flows (order confirmation, shipping updates, delivery, cancellation), an inbound order webhook and sensible pricing & automation rules. You can change all of it in Settings.
          </div>
          <LoadingButton type="submit" loading={loading} size="lg" className="w-full">
            Create store and start researching
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
