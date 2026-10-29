import type { Garment, ModelGender, Product, Variant } from "./schema";

/** Every model photo is processed to this size (2:5), see scripts/process-models.py. */
export const MODEL_IMAGE = { width: 600, height: 1500 } as const;

export interface ModelImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * The photo for one colour on one model. Uses the variant's own image when
 * it has one, otherwise the file the processing script writes:
 * public/models/<product>/<variant>-<gender>.webp
 */
export function modelImage(product: Product, variant: Variant, gender: ModelGender): ModelImage {
  const own = variant.images[gender];
  if (own) return own;
  return {
    src: `/models/${product.slug}/${variant.id}-${gender}.webp`,
    alt: `${product.name} in ${variant.name}, worn by a model`,
    ...MODEL_IMAGE,
  };
}

/** Where to crop a model photo for a small square thumbnail, so the product is in view. */
export const thumbFocus: Record<Garment, string> = {
  hoodie: "50% 22%",
  tee: "50% 22%",
  cargo: "50% 68%",
};
