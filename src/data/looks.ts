import { z } from "zod";
import { modelGenders, type Product, type Variant } from "@/lib/schema";
import { MODEL_IMAGE } from "@/lib/model-image";
import raw from "./looks.json";
import { getProduct } from "./catalog";

// Shared with scripts/process-garments.py, which dresses the model for each look.
const lookSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  gender: z.enum(modelGenders),
  pieces: z.array(z.object({ slug: z.string(), variant: z.string() })).min(1),
});

export interface LookPiece {
  product: Product;
  variant: Variant;
}

export interface Look {
  id: string;
  name: string;
  image: { src: string; alt: string; width: number; height: number };
  pieces: LookPiece[];
}

export const LOOK_DISCOUNT = 0.1;

export const looks: Look[] = z
  .array(lookSchema)
  .parse(raw)
  .map((l) => ({
    id: l.id,
    name: l.name,
    image: { src: `/looks/${l.id}.webp`, alt: `${l.name}: a full outfit worn by a model`, ...MODEL_IMAGE },
    pieces: l.pieces.map((p) => {
      const product = getProduct(p.slug);
      const variant = product?.variants.find((v) => v.id === p.variant);
      if (!product || !variant) throw new Error(`Look "${l.id}" names an unknown piece ${p.slug}/${p.variant}`);
      return { product, variant };
    }),
  }));
