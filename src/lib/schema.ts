import { z } from "zod";

export const garmentKinds = ["hoodie", "tee", "cargo"] as const;
export const modelGenders = ["men", "women"] as const;

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, "Use a 6-digit hex colour");

const image = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const size = z.object({
  label: z.string(),
  stock: z.number().int().nonnegative(),
});

export const variantSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  hex,
  /** Overrides the product price for this colour only. */
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  sizes: z.array(size).min(1),
  /**
   * Optional override for the model photo of this colour, per gender.
   * By default the page uses public/models/<product>/<variant>-<gender>.webp
   * (see scripts/process-models.py), so most products leave this empty.
   */
  images: z.object({ men: image.optional(), women: image.optional() }).default({}),
});

export const hotspotSchema = z.object({
  id: z.string(),
  /** Position on the model photo as a percentage of its box. Photos differ, so set these per product. */
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  title: z.string(),
  body: z.string(),
});

export const productSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    category: z.string(),
    garment: z.enum(garmentKinds),
    genders: z.array(z.enum(modelGenders)).min(1),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    currency: z.literal("USD"),
    summary: z.string(),
    description: z.string(),
    fit: z.string(),
    details: z.array(z.string()),
    materials: z.string(),
    care: z.array(z.string()),
    badge: z.string().optional(),
    variants: z.array(variantSchema).min(1),
    hotspots: z.array(hotspotSchema).default([]),
    completeTheLook: z
      .object({
        slugs: z.array(z.string()).min(1),
        discount: z.number().min(0).max(0.5),
      })
      .optional(),
  })
  .superRefine((p, ctx) => {
    const ids = new Set<string>();
    for (const v of p.variants) {
      if (ids.has(v.id)) ctx.addIssue({ code: "custom", message: `Duplicate variant id "${v.id}"` });
      ids.add(v.id);
    }
  });

export type Product = z.infer<typeof productSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type Hotspot = z.infer<typeof hotspotSchema>;
export type Garment = (typeof garmentKinds)[number];
export type ModelGender = (typeof modelGenders)[number];
