"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { roundMoney } from "@/lib/price";

export interface CartLine {
  key: string;
  slug: string;
  variantId: string;
  size: string;
  name: string;
  colorName: string;
  image: string;
  /** CSS object-position that keeps the product in view in a square thumbnail. */
  focus: string;
  /** Price per item after any bundle discount. */
  unitPrice: number;
  /** Price per item before the bundle discount, shown struck through. */
  listPrice: number;
  qty: number;
  bundle?: boolean;
}

export type NewLine = Omit<CartLine, "key" | "qty">;

interface CartState {
  lines: CartLine[];
  open: boolean;
  add: (items: NewLine[]) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
}

export const MAX_QTY = 10;

export const lineKey = (l: Pick<CartLine, "slug" | "variantId" | "size" | "bundle">) =>
  [l.slug, l.variantId, l.size, l.bundle ? "bundle" : "single"].join("|");

export function addLines(lines: CartLine[], items: NewLine[]): CartLine[] {
  const next = lines.map((l) => ({ ...l }));
  for (const item of items) {
    const key = lineKey(item);
    const existing = next.find((l) => l.key === key);
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + 1);
    else next.push({ ...item, key, qty: 1 });
  }
  return next;
}

export function cartTotals(lines: CartLine[]) {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = roundMoney(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0));
  const savings = roundMoney(lines.reduce((s, l) => s + (l.listPrice - l.unitPrice) * l.qty, 0));
  return { count, subtotal, savings };
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (items) => set((s) => ({ lines: addLines(s.lines, items), open: true })),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      setOpen: (open) => set({ open }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "charflut-cart",
      // v2: lines carry a photo instead of a drawn figure; older lines are dropped.
      version: 2,
      migrate: () => ({ lines: [] }),
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);
