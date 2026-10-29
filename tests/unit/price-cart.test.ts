import { describe, expect, it } from "vitest";
import { applyDiscount, bundleTotals, formatPrice } from "@/lib/price";
import { addLines, cartTotals, MAX_QTY, type NewLine } from "@/store/cart";
import { products } from "@/data/catalog";
import { toLine } from "@/lib/product-utils";

describe("price", () => {
  it("formats whole and fractional prices", () => {
    expect(formatPrice(128)).toBe("$128");
    expect(formatPrice(492.3)).toBe("$492.30");
  });
  it("applies a bundle discount without float drift", () => {
    expect(applyDiscount(58, 0.1)).toBe(52.2);
    expect(bundleTotals([128, 58, 142], 0.1)).toEqual({ full: 328, total: 295.2, saved: 32.8 });
  });
});

describe("cart", () => {
  const line: NewLine = toLine(products[0]!, products[0]!.variants[0]!, "M");

  it("merges identical lines and caps quantity", () => {
    let lines = addLines([], [line, line]);
    expect(lines).toHaveLength(1);
    expect(lines[0]!.qty).toBe(2);
    for (let i = 0; i < 20; i++) lines = addLines(lines, [line]);
    expect(lines[0]!.qty).toBe(MAX_QTY);
  });

  it("keeps bundle-priced lines apart from full-price ones", () => {
    const bundled = toLine(products[0]!, products[0]!.variants[0]!, "M", 0.1);
    const lines = addLines([], [line, bundled]);
    expect(lines).toHaveLength(2);
    const t = cartTotals(lines);
    expect(t.count).toBe(2);
    expect(t.subtotal).toBe(128 + 115.2);
    expect(t.savings).toBe(12.8);
  });
});

describe("catalog", () => {
  it("parses every product and resolves complete-the-look links", () => {
    const slugs = new Set(products.map((p) => p.slug));
    for (const p of products) {
      for (const s of p.completeTheLook?.slugs ?? []) expect(slugs.has(s)).toBe(true);
    }
  });
});

describe("model photos", () => {
  it("exist for every product, colour and model", async () => {
    const { existsSync } = await import("node:fs");
    const { modelImage } = await import("@/lib/model-image");
    const missing: string[] = [];
    for (const p of products)
      for (const v of p.variants)
        for (const g of p.genders) {
          const src = modelImage(p, v, g).src;
          for (const file of [src, src.replace(/\.webp$/, "-sm.webp")])
            if (!existsSync(`public${file}`)) missing.push(file);
        }
    expect(missing).toEqual([]);
  });
});
