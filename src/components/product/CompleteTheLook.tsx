"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import type { Product, Variant } from "@/lib/schema";
import { bundleTotals, formatPrice } from "@/lib/price";
import { inStock, toLine, variantPrice } from "@/lib/product-utils";
import { useCart } from "@/store/cart";
import { ModelFigure } from "@/components/figure/ModelFigure";

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
    <section aria-labelledby="ctl-heading" className="rounded-md border border-line bg-paper-raised/60">
      <div className="flex items-baseline justify-between gap-4 px-5 pt-5">
        <h2 id="ctl-heading" className="text-sm font-medium">
          Complete the look
        </h2>
        <p className="text-xs text-ink-soft">{pieces.length + 1} pieces</p>
      </div>

      <ul className="mt-3 divide-y divide-line px-5">
        <li className="flex items-center gap-4 py-3">
          <Thumb product={product} variant={variant} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{product.name}</p>
            <p className="text-xs text-ink-soft">
              {variant.name}
              {size ? `, size ${size}` : ""}
            </p>
          </div>
          <p className="tabular text-sm">{formatPrice(variantPrice(product, variant))}</p>
        </li>
        {pieces.map((piece) => {
          const selectId = `${errorId}-${piece.product.slug}`;
          return (
            <li key={piece.product.slug} className="flex items-center gap-4 py-3">
              <Thumb product={piece.product} variant={piece.variant} />
              <div className="min-w-0 flex-1">
                <Link href={`/products/${piece.product.slug}`} className="block truncate text-sm hover:underline">
                  {piece.product.name}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-ink-soft">{piece.variant.name}</span>
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
                    className="h-8 rounded-sm border border-line-strong bg-paper-raised px-2 text-xs"
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
              <div className="flex flex-col items-end gap-1">
                <p className="tabular text-sm">{formatPrice(variantPrice(piece.product, piece.variant))}</p>
                <button
                  type="button"
                  onClick={() => addOne(piece)}
                  className="-mr-2 grid size-9 place-items-center rounded-pill text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
                  aria-label={`Add ${piece.product.name} to bag`}
                >
                  <Plus className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line px-5 pt-4 pb-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm">
            Bundle all {pieces.length + 1}
            <span className="ml-2 text-xs text-signal">Save {Math.round(discount * 100)}%</span>
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
          className="mt-4 h-12 w-full rounded-pill border border-ink text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
          data-testid="add-look"
        >
          Add the full look to bag
        </button>
      </div>
    </section>
  );
}

function Thumb({ product, variant }: Piece) {
  return (
    <div className="grid size-14 shrink-0 place-items-center rounded-sm bg-paper-sunk/70">
      <ModelFigure
        garment={product.garment}
        color={variant.hex}
        gender="men"
        personaIndex={0}
        mode="garment"
        className="size-11"
      />
    </div>
  );
}
