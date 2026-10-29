import type { z } from "zod";
import type { productSchema } from "@/lib/schema";

const sizes = (stock: number[]) =>
  ["28", "30", "32", "34", "36", "38"].map((label, i) => ({ label, stock: stock[i] ?? 0 }));

export const utilityCargo: z.input<typeof productSchema> = {
  slug: "utility-cargo",
  name: "Utility Cargo",
  category: "Trousers",
  garment: "cargo",
  genders: ["men", "women"],
  price: 142,
  currency: "USD",
  summary: "Wide-leg cotton ripstop cargos with bellows pockets and an adjustable hem.",
  description:
    "Wide through the leg and long enough to stack over trainers. Cotton ripstop that breaks in instead of wearing out, with bellows pockets flat enough to keep the line clean.",
  fit: "Wide leg, mid rise. Waist sizes in inches.",
  details: ["Bellows cargo pockets with snap flaps", "Drawcord hem to adjust stacking", "Gusseted crotch", "YKK zip fly"],
  materials: "100% cotton ripstop, 290 gsm. Made in Turkey.",
  care: ["Machine wash cold", "Line dry", "Warm iron"],
  variants: [
    { id: "stone", name: "Stone", hex: "#b7ad97", sizes: sizes([5, 8, 9, 6, 3, 2]) },
    { id: "khaki", name: "Khaki", hex: "#857d5b", sizes: sizes([2, 6, 0, 4, 3, 1]) },
    { id: "black", name: "Black", hex: "#29292b", sizes: sizes([9, 10, 12, 8, 6, 3]) },
    { id: "slate", name: "Slate", hex: "#596168", sizes: sizes([0, 4, 6, 5, 0, 0]) },
    { id: "sand", name: "Sand", hex: "#ccbe9e", sizes: sizes([3, 5, 7, 4, 2, 1]) },
  ],
  hotspots: [
    { id: "pocket", x: 30, y: 68, title: "Bellows pocket", body: "Expands when you need it and lies flat when you don't." },
    { id: "hem", x: 66, y: 93, title: "Drawcord hem", body: "Pull it in to stack over high-tops, or leave it loose." },
  ],
  completeTheLook: { slugs: ["loop-hoodie", "heavy-tee"], discount: 0.1 },
};
