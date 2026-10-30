"use client";

import { useState } from "react";
import { Popover } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { products } from "@/data/catalog";
import { railItems } from "@/data/rail";
import { inStock, variantPrice } from "@/lib/product-utils";
import { cn } from "@/lib/cn";
import { ProductCard } from "@/components/product/ProductCard";

const sorts = {
  featured: "Featured",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  "name-asc": "Alphabetically, A–Z",
  "name-desc": "Alphabetically, Z–A",
} as const;
type Sort = keyof typeof sorts;

const prices = products.flatMap((p) => p.variants.map((v) => variantPrice(p, v)));
const PRICE_MIN = Math.floor(Math.min(...prices));
const PRICE_MAX = Math.ceil(Math.max(...prices));

export function CollectionGrid() {
  const [availability, setAvailability] = useState<{ in: boolean; out: boolean }>({ in: false, out: false });
  const [range, setRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sort, setSort] = useState<Sort>("featured");
  const [dense, setDense] = useState(false);

  let items = railItems.filter(({ product, variant }) => {
    const stocked = inStock(variant);
    if (availability.in !== availability.out && (availability.in ? !stocked : stocked)) return false;
    const price = variantPrice(product, variant);
    return price >= range[0] && price <= range[1];
  });
  if (sort !== "featured") {
    items = [...items].sort((a, b) => {
      if (sort === "price-asc") return variantPrice(a.product, a.variant) - variantPrice(b.product, b.variant);
      if (sort === "price-desc") return variantPrice(b.product, b.variant) - variantPrice(a.product, a.variant);
      const an = `${a.product.name} ${a.variant.name}`;
      const bn = `${b.product.name} ${b.variant.name}`;
      return sort === "name-asc" ? an.localeCompare(bn) : bn.localeCompare(an);
    });
  }
  const inCount = railItems.filter((i) => inStock(i.variant)).length;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-10 pb-24 sm:px-6 lg:px-10 lg:pt-12">
      <h1 className="text-[40px] leading-none font-bold tracking-[-0.01em] sm:text-[52px]">Products</h1>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px] sm:mt-[72px]">
        <span className="sr-only">Filter:</span>
        <Filter label="Availability" active={availability.in || availability.out}>
          <fieldset className="space-y-1">
            <legend className="sr-only">Availability</legend>
            {(
              [
                ["in", `In stock (${inCount})`],
                ["out", `Out of stock (${railItems.length - inCount})`],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={availability[key]}
                  onChange={(e) => setAvailability((a) => ({ ...a, [key]: e.target.checked }))}
                  className="size-4 accent-ink"
                />
                {label}
              </label>
            ))}
          </fieldset>
        </Filter>
        <Filter label="Price" active={range[0] > PRICE_MIN || range[1] < PRICE_MAX}>
          <p className="mb-3 text-xs text-ink-soft">The highest price is ${PRICE_MAX}.00</p>
          <div className="flex items-center gap-2">
            {(["From", "To"] as const).map((label, i) => (
              <label key={label} className="flex flex-1 items-center gap-1.5 border border-[#ddd] px-2.5 py-2 text-sm">
                <span className="text-ink-soft">$</span>
                <span className="sr-only">{label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  value={range[i]}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setRange((r) => (i === 0 ? [v, r[1]] : [r[0], v]));
                  }}
                  className="w-full min-w-0 bg-transparent outline-none"
                />
              </label>
            ))}
          </div>
          <button type="button" onClick={() => setRange([PRICE_MIN, PRICE_MAX])} className="mt-3 text-xs underline underline-offset-4">
            Reset
          </button>
        </Filter>

        <p className="ml-auto text-[15px] text-ink-soft" aria-live="polite">
          {items.length} items
        </p>
        <Popover.Root>
          <Popover.Trigger className="flex items-center gap-1.5 py-1.5">
            Sort <ChevronDown className="size-4" strokeWidth={1.5} />
            <span className="sr-only">: {sorts[sort]}</span>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content align="end" sideOffset={8} className="z-[60] w-56 border border-line bg-paper py-2 shadow-panel">
              <ul role="listbox" aria-label="Sort by">
                {(Object.keys(sorts) as Sort[]).map((key) => (
                  <li key={key}>
                    <Popover.Close asChild>
                      <button
                        type="button"
                        role="option"
                        aria-selected={sort === key}
                        onClick={() => setSort(key)}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-paper-sunk"
                      >
                        {sorts[key]}
                        {sort === key && <Check className="size-4" strokeWidth={1.5} />}
                      </button>
                    </Popover.Close>
                  </li>
                ))}
              </ul>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <div className="flex items-center gap-1" role="group" aria-label="Grid size">
          {[false, true].map((d) => (
            <button
              key={String(d)}
              type="button"
              onClick={() => setDense(d)}
              aria-pressed={dense === d}
              aria-label={d ? "Small tiles" : "Large tiles"}
              className="grid size-[30px] place-items-center rounded-[4px] text-ink-soft aria-pressed:bg-paper-sunk aria-pressed:text-ink"
            >
              <GridIcon dense={d} />
            </button>
          ))}
        </div>
      </div>

      {items.length ? (
        <ul
          className={cn(
            "mt-8 grid items-start gap-x-4 gap-y-10",
            dense ? "grid-cols-3 md:grid-cols-6" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
          )}
        >
          {items.map(({ key, product, variant }) => (
            <li key={key}>
              <ProductCard product={product} variant={variant} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-16 text-center text-ink-soft">No products match these filters.</p>
      )}
    </div>
  );
}

function Filter({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger className="flex items-center gap-1.5 py-1.5">
        {label}
        {active && <span className="size-1.5 rounded-full bg-ink" aria-label="(filtered)" />}
        <ChevronDown className="size-4" strokeWidth={1.5} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={8} className="z-[60] w-64 border border-line bg-paper p-4 shadow-panel">
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function GridIcon({ dense }: { dense: boolean }) {
  const cells = dense ? [2, 7, 12] : [3, 11];
  const r = dense ? 1.1 : 2.4;
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
      {cells.flatMap((x) => cells.map((y) => <rect key={`${x}-${y}`} x={x - r} y={y - r} width={r * 2} height={r * 2} rx={dense ? 0.4 : 0.8} />))}
    </svg>
  );
}
