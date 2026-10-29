import type { NewLine } from "@/store/cart";
import { applyDiscount } from "./price";
import { modelImage, thumbFocus } from "./model-image";
import type { Product, Variant } from "./schema";

export const variantPrice = (p: Product, v: Variant) => v.price ?? p.price;
export const variantCompareAt = (p: Product, v: Variant) => v.compareAtPrice ?? p.compareAtPrice;

export const inStock = (v: Variant) => v.sizes.some((s) => s.stock > 0);
export const sizeStock = (v: Variant, size: string) => v.sizes.find((s) => s.label === size)?.stock ?? 0;

export const LOW_STOCK = 3;

export function toLine(p: Product, v: Variant, size: string, discount = 0): NewLine {
  const listPrice = variantPrice(p, v);
  return {
    slug: p.slug,
    variantId: v.id,
    size,
    name: p.name,
    colorName: v.name,
    image: modelImage(p, v, p.genders[0]!).src,
    focus: thumbFocus[p.garment],
    listPrice,
    unitPrice: applyDiscount(listPrice, discount),
    bundle: discount > 0 || undefined,
  };
}
