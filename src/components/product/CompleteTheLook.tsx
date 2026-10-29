"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import type { Product, Variant } from "@/lib/schema";
import { bundleTotals, formatPrice } from "@/lib/price";
import { inStock, toLine, variantPrice } from "@/lib/product-utils";
import { useCart } from "@/store/cart";
import { modelImage, thumbFocus } from "@/lib/model-image";
import { ModelThumb } from "./ModelThumb";

interface CompleteTheLookProps {
  product: Product;
  variant: Variant;
  size: string | null;
  pairings: Product[];
  discount: number;
  /** Asks the main buy box to prompt for a size. */
  onNeedSize: () => void;
}

interface Piece {
  product: Product;
  variant: Variant;
}

export function CompleteTheLook({ product, variant, size, pairings, discount, onNeedSize }: CompleteTheLookProps) {
  const add = useCart((s) => s.add);
  const errorId = useId();
  const pieces: Piece[] = pairings.map((p) => ({ product: p, variant: p.variants.find(inStock) ?? p.variants[0]! }));
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const totals = bundleTotals(
    [variantPrice(product, variant), ...pieces.map((x) => variantPrice(x.product, x.variant))],
    discount,
  );

  const addOne = (piece: Piece) => {
    const s = sizes[piece.product.slug];
    if (!s) {
      setError(`Choose a size for the ${piece.product.name}.`);
      return;
    }
    setError(null);
    add([toLine(piece.product, piece.variant, s)]);
  };

  const addAll = () => {
    const missing = [
      ...(size ? [] : [product.name]),
      ...pieces.filter((x) => !sizes[x.product.slug]).map((x) => x.product.name),
    ];
    if (missing.length) {
      setError(`Choose a size for the ${missing.join(" and ")} to add the full look.`);
      if (!size) onNeedSize();
      return;
    }
    setError(null);
    add([
      toLine(product, variant, size!, discount),
      ...pieces.map((x) => toLine(x.product, x.variant, sizes[x.product.slug]!, discount)),
    ]);
  };

  return (
    <section aria-labelledby="ctl-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="ctl-heading" className="text-sm font-medium">
          In this look
        </h2>
        <p className="text-2xs tracking-wide text-ink-faint uppercase">{pieces.length + 1} pieces</p>
      </div>

      <ul className="mt-2 divide-y divide-line">
        <li className="flex items-center gap-3 py-3">
          <Thumb product={product} variant={variant} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{product.name}</p>
            <p className="truncate text-xs text-ink-soft">
              {variant.name}
              {size ? `, size ${size}` : ""}
            </p>
          </div>
          <p className="tabular shrink-0 text-sm">{formatPrice(variantPrice(product, variant))}</p>
        </li>
        {pieces.map((piece) => {
          const selectId = `${errorId}-${piece.product.slug}`;
          return (
            <li key={piece.product.slug} className="flex items-center gap-3 py-3">
              <Thumb product={piece.product} variant={piece.variant} />
              <div className="min-w-0 flex-1">
                <Link href={`/products/${piece.product.slug}`} className="block truncate text-sm hover:underline">
                  {piece.product.name}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="truncate text-xs text-ink-soft">{piece.variant.name}</span>
                  <label htmlFor={selectId} className="sr-only">
                    Size for {piece.product.name}
                  </label>
                  <select
                    id={selectId}
                    value={sizes[piece.product.slug] ?? ""}
                    onChange={(e) => {
                      setSizes((s) => ({ ...s, [piece.product.slug]: e.target.value }));
                      setError(null);
                    }}
                    className="h-8 shrink-0 rounded-sm border border-line-strong bg-transparent px-1.5 text-xs"
                  >
                    <option value="">Size</option>
                    {piece.variant.sizes.map((s) => (
                      <option key={s.label} value={s.label} disabled={s.stock === 0}>
                        {s.label}
                        {s.stock === 0 ? " (sold out)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <p className="tabular text-sm">{formatPrice(variantPrice(piece.product, piece.variant))}</p>
                <button
                  type="button"
                  onClick={() => addOne(piece)}
                  className="grid size-8 place-items-center rounded-pill text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
                  aria-label={`Add ${piece.product.name} to bag`}
                >
                  <Plus className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 border-t border-line pt-4">
        <p className="text-sm font-medium">Complete the look</p>
        <div className="mt-1 flex items-baseline justify-between gap-4">
          <p className="text-xs text-ink-soft">
            Bundle all {pieces.length + 1} and save {Math.round(discount * 100)}%
          </p>
          <p className="tabular flex items-baseline gap-2 text-sm">
            <s className="text-xs text-ink-faint">
              <span className="sr-only">Was </span>
              {formatPrice(totals.full)}
            </s>
            <span>{formatPrice(totals.total)}</span>
          </p>
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-3 text-xs text-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={addAll}
          aria-describedby={error ? errorId : undefined}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink/85 active:scale-[0.99]"
          data-testid="add-look"
        >
          Add full look to bag
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function Thumb({ product, variant }: Piece) {
  return (
    <ModelThumb
      src={modelImage(product, variant, product.genders[0]!).src}
      focus={thumbFocus[product.garment]}
      className="size-12"
    />
  );
}
