import type { z } from "zod";
import type { productSchema } from "@/lib/schema";

const sizes = (stock: number[]) =>
  ["XS", "S", "M", "L", "XL", "XXL"].map((label, i) => ({ label, stock: stock[i] ?? 0 }));

export const loopHoodie: z.input<typeof productSchema> = {
  slug: "loop-hoodie",
  name: "Loop Hoodie",
  category: "Hoodies",
  garment: "hoodie",
  genders: ["men", "women"],
  price: 128,
  currency: "USD",
  badge: "New",
  summary: "Heavyweight loopback cotton with a dropped shoulder and a boxy, cropped body.",
  description:
    "Our heaviest hoodie, knitted from 480 gsm loopback cotton that softens with every wash. The double-layer hood holds its shape, and the body is cut short and wide so it sits cleanly over wide-leg trousers.",
  fit: "Oversized. Take your usual size for a relaxed drape, or one size down for a closer fit.",
  details: [
    "Double-layer hood with flat cotton drawcords",
    "Kangaroo pocket with hidden side seams",
    "Ribbed cuffs and hem with 3% elastane for recovery",
    "Dropped shoulder, cropped boxy body",
  ],
  materials: "100% organic cotton loopback, 480 gsm. Made in Portugal.",
  care: ["Machine wash cold, inside out", "Do not tumble dry", "Dry flat in shade"],
  variants: [
    { id: "concrete", name: "Concrete", hex: "#9c9c98", sizes: sizes([4, 9, 2, 11, 6, 0]) },
    { id: "rust", name: "Rust", hex: "#8a4b2f", sizes: sizes([0, 5, 8, 3, 2, 1]) },
    { id: "washed-black", name: "Washed black", hex: "#2e2e31", sizes: sizes([7, 12, 14, 9, 8, 4]) },
    { id: "moss", name: "Moss", hex: "#6c7650", price: 118, compareAtPrice: 128, sizes: sizes([2, 0, 3, 5, 1, 0]) },
    { id: "bone", name: "Bone", hex: "#dcd5c6", sizes: sizes([6, 8, 10, 7, 3, 2]) },
    { id: "deep-navy", name: "Deep navy", hex: "#27324a", sizes: sizes([3, 6, 0, 4, 5, 2]) },
  ],
  completeTheLook: { slugs: ["heavy-tee", "utility-cargo"], discount: 0.1 },
};
