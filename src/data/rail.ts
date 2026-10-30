import type { Product, Variant } from "@/lib/schema";
import { products } from "./catalog";

export interface RailItem {
  key: string;
  product: Product;
  variant: Variant;
}

/** Every colour of every product, dealt out in turn so neighbours differ: hoodie, tee, cargo, hoodie… */
export const railItems: RailItem[] = (() => {
  const longest = Math.max(...products.map((p) => p.variants.length));
  const items: RailItem[] = [];
  for (let i = 0; i < longest; i++) {
    for (const product of products) {
      const variant = product.variants[i];
      if (variant) items.push({ key: `${product.slug}-${variant.id}`, product, variant });
    }
  }
  return items;
})();
