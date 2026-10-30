import type { Product, Variant } from "./schema";

/**
 * Size of the cut-out garment photos (scripts/process-garments.py). Tops are
 * close to square, trousers about twice as tall as they are wide.
 */
export const GARMENT_IMAGE = {
  top: { width: 640, height: 648 },
  bottom: { width: 640, height: 1277 },
} as const;

export interface GarmentImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** "bottom" hangs from a clip hanger, "top" from a shoulder hanger. */
  part: keyof typeof GARMENT_IMAGE;
}

export function garmentImage(product: Product, variant: Variant): GarmentImage {
  const part = product.garment === "cargo" ? "bottom" : "top";
  return {
    src: `/garments/${product.slug}/${variant.id}.webp`,
    alt: `${product.name} in ${variant.name}`,
    part,
    ...GARMENT_IMAGE[part],
  };
}
