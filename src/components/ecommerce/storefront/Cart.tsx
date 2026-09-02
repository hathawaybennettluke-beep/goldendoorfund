"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";

export interface CartItem {
  productId: Id<"ecProducts">;
  handle: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface CartValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: Id<"ecProducts">) => void;
  setQuantity: (productId: Id<"ecProducts">, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const key = `ec:cart:${slug}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, key, loaded]);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: Math.min(i.quantity + quantity, 20) } : i));
      return [...prev, { ...item, quantity }];
    });
  }, []);
  const remove = useCallback((productId: Id<"ecProducts">) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const setQuantity = useCallback((productId: Id<"ecProducts">, quantity: number) => setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, 20)) } : i))), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(() => ({
    items, add, remove, setQuantity, clear,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
  }), [items, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
