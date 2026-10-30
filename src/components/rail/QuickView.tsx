"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { ArrowRight, X } from "lucide-react";
import type { Product, Variant } from "@/lib/schema";
import { garmentImage } from "@/lib/garment-image";
import { toLine, variantCompareAt, variantPrice } from "@/lib/product-utils";
import { useCart } from "@/store/cart";
import { SwatchGroup } from "@/components/product/SwatchGroup";
import { SizeSelector } from "@/components/product/SizeSelector";
import { PriceTag } from "@/components/product/PriceTag";

export interface QuickViewItem {
  product: Product;
  variant: Variant;
}

/** A closer look at one piece from a rail: colour, size, add to bag. */
export function QuickView({ item, onClose }: { item: QuickViewItem | null; onClose: () => void }) {
  return (
    <Dialog.Root open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-[3px] data-[state=open]:animate-[fade-in_250ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-[100] max-h-[calc(100dvh-2rem)] w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-paper shadow-panel outline-none data-[state=open]:animate-[pop-in_320ms_var(--ease-out-quint)]"
        >
          {item && <QuickViewBody key={item.product.slug + item.variant.id} item={item} />}
          <Dialog.Close
            className="absolute top-3 right-3 grid size-11 place-items-center rounded-pill bg-paper/80 hover:bg-paper-sunk"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.5} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QuickViewBody({ item }: { item: QuickViewItem }) {
  const { product } = item;
  const [variant, setVariant] = useState(item.variant);
  const [size, setSize] = useState<string | null>(null);
  const [needSize, setNeedSize] = useState(false);
  const add = useCart((s) => s.add);
  const image = garmentImage(product, variant);

  return (
    <div className="grid md:grid-cols-2">
      <div className="relative grid min-h-72 place-items-center bg-paper-sunk p-10 md:min-h-[32rem]">
        <div className="relative h-full max-h-[26rem] w-full" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
          <Image key={image.src} src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 420px, 80vw" className="object-contain animate-[fade-in_300ms_ease-out]" />
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <p className="eyebrow text-ink-faint">{product.category}</p>
        <Dialog.Title className="mt-2 font-display text-[28px] leading-tight font-bold tracking-[-0.03em]">{product.name}</Dialog.Title>
        <PriceTag price={variantPrice(product, variant)} compareAt={variantCompareAt(product, variant)} className="mt-1 text-base" />
        <p className="mt-4 text-sm text-ink-soft">{product.summary}</p>

        <p className="mt-6 mb-2 text-sm">
          Colour: <span className="text-ink-soft">{variant.name}</span>
        </p>
        <SwatchGroup
          variants={product.variants}
          value={variant.id}
          onChange={(id) => {
            setVariant(product.variants.find((v) => v.id === id)!);
            setSize(null);
          }}
          size="sm"
        />

        <p className="mt-5 mb-2 text-sm">Size</p>
        <SizeSelector
          variant={variant}
          value={size}
          onChange={(s) => {
            setSize(s);
            setNeedSize(false);
          }}
          invalid={needSize}
        />
        {needSize && (
          <p role="alert" className="mt-2 text-xs text-danger">
            Choose a size first.
          </p>
        )}

        <button
          type="button"
          onClick={() => (size ? add([toLine(product, variant, size)]) : setNeedSize(true))}
          className="mt-6 h-13 w-full bg-ink text-[15px] font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Add to bag
        </button>
        <Link
          href={`/products/${product.slug}?color=${variant.id}`}
          className="mt-4 inline-flex items-center gap-2 self-start border-b border-ink pb-0.5 text-sm font-medium"
        >
          View full details <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
