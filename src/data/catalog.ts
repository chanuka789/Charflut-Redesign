import { productSchema, type Product } from "@/lib/schema";
import { loopHoodie } from "./products/loop-hoodie";
import { heavyTee } from "./products/heavy-tee";
import { utilityCargo } from "./products/utility-cargo";

// Parsed once at import time: a typo in product data fails the build
// instead of shipping a broken page.
export const products: Product[] = [loopHoodie, heavyTee, utilityCargo].map((p) => productSchema.parse(p));

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
