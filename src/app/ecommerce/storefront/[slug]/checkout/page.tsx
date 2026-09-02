"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Trash2, Lock } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { useCart } from "@/components/ecommerce/storefront/Cart";
import { ProductImage, LoadingButton } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money } from "@/lib/ecommerce/format";

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const store = useQuery(api.ecommerce.storefront.getStore, { slug });
  const { items, remove, setQuantity, subtotal, clear } = useCart();
  const placeOrder = useMutation(api.ecommerce.storefront.placeOrder);
  const createCheckout = useAction(api.ecommerce.orderActions.createCheckoutSession);
  const [form, setForm] = useState({ name: "", email: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", note: "" });
  const [busy, setBusy] = useState(false);
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 4.99;
  const currency = store?.currency ?? "USD";
  const color = store?.primaryColor ?? "#d4a017";
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");
    setBusy(true);
    try {
      const order = await placeOrder({ slug, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })), customer: { name: form.name, email: form.email, phone: form.phone || undefined }, shippingAddress: { line1: form.line1, line2: form.line2 || undefined, city: form.city, state: form.state || undefined, postalCode: form.postalCode, country: form.country }, note: form.note || undefined });
      const origin = window.location.origin;
      const trackUrl = `${origin}/ecommerce/storefront/${slug}/track?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(form.email)}`;
      const checkout = await createCheckout({ slug, orderId: order.orderId, successUrl: `${trackUrl}&paid=1`, cancelUrl: `${origin}/ecommerce/storefront/${slug}/checkout` });
      clear();
      if (checkout.url) {
        window.location.href = checkout.url;
      } else {
        toast.success(`Order ${order.orderNumber} placed (test mode – no payment processor configured)`);
        router.push(`${trackUrl}&test=1`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <form onSubmit={submit} className="space-y-6 lg:col-span-3">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <section className="space-y-3 rounded-2xl border p-5">
          <h2 className="font-semibold">Contact</h2>
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Full name</Label><Input required value={form.name} onChange={set("name")} /></div><div className="space-y-1.5"><Label>Email</Label><Input required type="email" value={form.email} onChange={set("email")} /></div></div>
          <div className="space-y-1.5"><Label>Phone (for delivery updates)</Label><Input value={form.phone} onChange={set("phone")} /></div>
        </section>
        <section className="space-y-3 rounded-2xl border p-5">
          <h2 className="font-semibold">Shipping address</h2>
          <div className="space-y-1.5"><Label>Address</Label><Input required value={form.line1} onChange={set("line1")} /></div>
          <div className="space-y-1.5"><Label>Apartment, suite (optional)</Label><Input value={form.line2} onChange={set("line2")} /></div>
          <div className="grid gap-3 sm:grid-cols-4"><div className="space-y-1.5 sm:col-span-2"><Label>City</Label><Input required value={form.city} onChange={set("city")} /></div><div className="space-y-1.5"><Label>State</Label><Input value={form.state} onChange={set("state")} /></div><div className="space-y-1.5"><Label>Postal code</Label><Input required value={form.postalCode} onChange={set("postalCode")} /></div></div>
          <div className="space-y-1.5"><Label>Country code</Label><Input required value={form.country} onChange={set("country")} maxLength={2} className="uppercase" /></div>
          <div className="space-y-1.5"><Label>Order note (optional)</Label><Input value={form.note} onChange={set("note")} /></div>
        </section>
        <LoadingButton type="submit" size="lg" loading={busy} disabled={items.length === 0} className="w-full" style={{ backgroundColor: color }}><Lock className="h-4 w-4" /> Pay {money(subtotal + shipping, currency)}</LoadingButton>
        <p className="text-center text-xs text-muted-foreground">Payments are processed by Stripe when configured. Otherwise the order is recorded in test mode.</p>
      </form>
      <aside className="lg:col-span-2">
        <div className="rounded-2xl border p-5">
          <h2 className="font-semibold">Your cart</h2>
          {items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Cart is empty. <Link href={`/ecommerce/storefront/${slug}`} className="underline">Continue shopping</Link></p> : (
            <ul className="mt-3 divide-y">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3 py-3"><ProductImage src={i.image} alt={i.title} className="h-14 w-14 rounded-lg border" /><div className="flex-1 text-sm"><Link href={`/ecommerce/storefront/${slug}/products/${i.handle}`} className="font-medium hover:underline">{i.title}</Link>{i.variant && <p className="text-xs text-muted-foreground">{i.variant}</p>}<div className="mt-1 flex items-center gap-2"><Input type="number" min={1} max={20} value={i.quantity} onChange={(e) => setQuantity(i.productId, Number(e.target.value))} className="h-7 w-16" /><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(i.productId)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div><span className="text-sm font-medium">{money(i.price * i.quantity, currency)}</span></li>
              ))}
            </ul>
          )}
          <div className="mt-4 space-y-1 border-t pt-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(subtotal, currency)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : money(shipping, currency)}</span></div><div className="flex justify-between text-base font-semibold"><span>Total</span><span>{money(subtotal + shipping, currency)}</span></div></div>
        </div>
      </aside>
    </div>
  );
}
