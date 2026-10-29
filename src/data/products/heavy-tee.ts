import type { z } from "zod";
import type { productSchema } from "@/lib/schema";

const sizes = (stock: number[]) =>
  ["XS", "S", "M", "L", "XL", "XXL"].map((label, i) => ({ label, stock: stock[i] ?? 0 }));

export const heavyTee: z.input<typeof productSchema> = {
  slug: "heavy-tee",
  name: "Heavy Tee",
  category: "T-shirts",
  garment: "tee",
  genders: ["men", "women"],
  price: 58,
  currency: "USD",
  summary: "A 260 gsm jersey tee with a tight collar, a wide body and sleeves that hit mid-arm.",
  description:
    "The tee we wear under everything. Dense jersey that doesn't twist after washing, a narrow ribbed collar that stays flat, and a wide, slightly cropped body.",
  fit: "Relaxed. True to size.",
  details: ["1 cm ribbed collar", "Mid-arm sleeve length", "Side-seamed for a straight hang", "Pre-shrunk"],
  materials: "100% combed cotton jersey, 260 gsm. Made in Portugal.",
  care: ["Machine wash cold", "Tumble dry low", "Iron on reverse"],
  variants: [
    { id: "chalk", name: "Chalk", hex: "#ecebe6", sizes: sizes([10, 14, 18, 12, 9, 5]) },
    { id: "black", name: "Black", hex: "#242426", sizes: sizes([8, 12, 3, 10, 7, 4]) },
    { id: "heather", name: "Heather grey", hex: "#a8a8a4", sizes: sizes([4, 0, 6, 8, 2, 1]) },
    { id: "olive", name: "Olive", hex: "#5f6646", sizes: sizes([0, 3, 5, 6, 2, 0]) },
    { id: "sky", name: "Sky", hex: "#9fb5c8", sizes: sizes([5, 7, 9, 4, 0, 0]) },
    { id: "brick", name: "Brick", hex: "#94442f", sizes: sizes([3, 6, 7, 5, 4, 2]) },
  ],
  completeTheLook: { slugs: ["loop-hoodie", "utility-cargo"], discount: 0.1 },
};
