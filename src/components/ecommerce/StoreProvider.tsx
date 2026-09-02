"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type Store = Doc<"ecStores">;

interface StoreContextValue {
  stores: Store[] | undefined;
  store: Store | null;
  storeId: Id<"ecStores"> | null;
  setStoreId: (id: Id<"ecStores">) => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);
const STORAGE_KEY = "ec:selectedStore";

export function StoreProvider({ children }: { children: ReactNode }) {
  const stores = useQuery(api.ecommerce.stores.listMine, {});
  const [selected, setSelected] = useState<Id<"ecStores"> | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Id<"ecStores"> | null;
      if (saved) setSelected(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setStoreId = useCallback((id: Id<"ecStores">) => {
    setSelected(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const store = useMemo(() => {
    if (!stores || stores.length === 0) return null;
    return stores.find((s) => s._id === selected) ?? stores[0];
  }, [stores, selected]);

  const value = useMemo<StoreContextValue>(
    () => ({ stores, store, storeId: store?._id ?? null, setStoreId, isLoading: stores === undefined }),
    [stores, store, setStoreId]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Pages under the dashboard are only rendered once a store exists. */
export function useCurrentStore(): Store {
  const { store } = useStore();
  if (!store) throw new Error("No store selected");
  return store;
}
