import Link from "next/link";
import type { Product } from "@/lib/schema";
import Image from "next/image";
import { modelImage } from "@/lib/model-image";
import { PriceTag } from "./PriceTag";

export function ProductCard({ product }: { product: Product }) {
  const first = product.variants[0]!;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="studio-floor relative aspect-[4/5] overflow-hidden rounded-md">
        <div className="absolute inset-x-0 bottom-[3%] mx-auto aspect-[2/5] h-[92%] origin-bottom transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.03]">
          <span className="contact-shadow" aria-hidden="true" />
          <Image
            src={modelImage(product, first, product.genders[0]!).src}
            alt=""
            fill
            sizes="(min-width: 768px) 15vw, 30vw"
            className="object-contain object-bottom"
          />
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{product.name}</h3>
          <p className="mt-0.5 text-xs text-ink-soft">{product.variants.length} colours</p>
        </div>
        <PriceTag price={product.price} compareAt={product.compareAtPrice} className="text-sm" />
      </div>
      <ul className="mt-2 flex gap-1" aria-label="Available colours">
        {product.variants.map((v) => (
          <li key={v.id} className="size-3 rounded-pill ring-1 ring-black/10 ring-inset" style={{ backgroundColor: v.hex }}>
            <span className="sr-only">{v.name}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
