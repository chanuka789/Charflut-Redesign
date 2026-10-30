import Link from "next/link";
import type { Product, Variant } from "@/lib/schema";
import { garmentImage } from "@/lib/garment-image";
import { variantCompareAt, variantPrice } from "@/lib/product-utils";
import { HangingGarment } from "@/components/rail/HangingGarment";
import { PriceTag } from "./PriceTag";

/** One colour of a product, hanging from its hook, with the name and price below. */
export function ProductCard({ product, variant = product.variants[0]! }: { product: Product; variant?: Variant }) {
  const bottom = product.garment === "cargo";
  return (
    <Link href={`/products/${product.slug}?color=${variant.id}`} className="group block">
      <div className="flex justify-center">
        <div className={bottom ? "w-[50%]" : "w-full"}>
          <div className="origin-top transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] group-hover:animate-[nudge_1.4s_ease-out] motion-reduce:group-hover:animate-none">
            <HangingGarment image={garmentImage(product, variant)} sizes="(min-width: 1024px) 20vw, 45vw" hook={bottom ? 0.55 : 0.3} />
          </div>
        </div>
      </div>
      <h3 className="mt-3 text-[15px]">{product.name}</h3>
      <p className="text-[13px] text-ink-soft">{variant.name}</p>
      <PriceTag price={variantPrice(product, variant)} compareAt={variantCompareAt(product, variant)} className="mt-1 text-[13px] font-bold" />
    </Link>
  );
}
