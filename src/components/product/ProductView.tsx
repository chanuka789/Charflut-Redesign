"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Accordion } from "radix-ui";
import { ChevronDown, Minus, Plus, Ruler } from "lucide-react";
import type { Product } from "@/lib/schema";
import { LOW_STOCK, sizeStock, toLine, variantCompareAt, variantPrice } from "@/lib/product-utils";
import { modelImage } from "@/lib/model-image";
import { garmentImage } from "@/lib/garment-image";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCart, MAX_QTY } from "@/store/cart";
import { SwatchGroup } from "./SwatchGroup";
import { SizeSelector } from "./SizeSelector";
import { SizeGuideDialog } from "./SizeGuideDialog";
import { PriceTag } from "./PriceTag";
import { HangingGarment } from "@/components/rail/HangingGarment";

const noSubscribe = () => () => {};
// The query string as it was when this page opened. Frozen on the first read
// so our own replaceState() calls are never mistaken for an incoming link.
let openedWith: string | null = null;
const readSearch = () => (openedWith ??= window.location.search);
const serverSearch = () => "";

export function ProductView({ product }: { product: Product }) {
  const [active, setActive] = useState(0);

  // The page is a static file built with the default colour. After hydration
  // React re-renders with the real ?color=, and we adopt it once, in place.
  const search = useSyncExternalStore(noSubscribe, readSearch, serverSearch);
  const [adopted, setAdopted] = useState(false);
  useEffect(
    () => () => {
      // The next product page opened in this tab reads its own URL.
      openedWith = null;
    },
    [],
  );
  if (!adopted && search) {
    setAdopted(true);
    const i = product.variants.findIndex((v) => v.id === new URLSearchParams(search).get("color"));
    if (i >= 0) setActive(i);
  }

  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const reducedMotion = useReducedMotion();
  const add = useCart((s) => s.add);
  const sizeRef = useRef<HTMLDivElement>(null);
  const errorId = useId();
  const stockId = useId();

  const variant = product.variants[active]!;
  const price = variantPrice(product, variant);
  const stock = size ? sizeStock(variant, size) : null;

  // Keep the URL in step so a shared link opens this exact colour. Skip the
  // first run: it would overwrite an incoming ?color= before it is adopted.
  const urlWrites = useRef(0);
  useEffect(() => {
    if (urlWrites.current++ === 0) return;
    const url = new URL(window.location.href);
    url.searchParams.set("color", variant.id);
    window.history.replaceState(window.history.state, "", url);
  }, [variant.id]);

  const changeVariant = (index: number) => {
    setActive(index);
    const next = product.variants[index]!;
    if (size && sizeStock(next, size) === 0) setSize(null);
  };

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      sizeRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      sizeRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus({ preventScroll: true });
      return false;
    }
    const line = toLine(product, variant, size);
    add(Array.from({ length: Math.min(qty, stock ?? qty) }, () => line));
    return true;
  };

  const gallery = [
    { key: "hanger", kind: "garment" as const },
    ...product.genders.map((g) => ({ key: g, kind: "model" as const, image: modelImage(product, variant, g) })),
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-[clamp(2rem,5vw,5.5rem)] lg:px-10 lg:pt-0">
      {/* Gallery: the piece on its hanger, then on each model. */}
      <ul
        // Scrolls sideways on phones, so keyboard users need to be able to focus it.
        tabIndex={0}
        aria-label={`${product.name} photos`}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-6 lg:overflow-visible lg:px-0"
      >
        {gallery.map((g, i) => (
          <li key={g.key} className="relative aspect-[4/5] w-[82%] shrink-0 snap-center bg-paper lg:w-auto">
            {g.kind === "garment" ? (
              <div className="absolute inset-x-[8%] top-0 bottom-[4%] flex justify-center">
                <div className={product.garment === "cargo" ? "w-[52%]" : "w-full"}>
                  <HangingGarment
                    key={variant.id}
                    image={garmentImage(product, variant)}
                    sizes="(min-width: 1024px) 30vw, 80vw"
                    priority
                    hook={product.garment === "cargo" ? 0.42 : 0.3}
                    className="animate-[fade-in_400ms_ease-out]"
                  />
                </div>
              </div>
            ) : (
              <div className="absolute inset-x-0 top-[3%] bottom-[2%]">
                <span className="contact-shadow !bottom-0 !w-[34%]" aria-hidden="true" />
                <Image
                  key={g.image.src}
                  src={g.image.src}
                  alt={g.image.alt}
                  fill
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  priority={i === 1}
                  className="animate-[fade-in_400ms_ease-out] object-contain object-bottom"
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <aside aria-label="Purchase options" className="mt-8 lg:sticky lg:top-[70px] lg:mt-0 lg:self-start lg:pt-10 lg:pb-12">
        <p className="text-xs text-ink-soft">{product.category}</p>
        <h1 className="mt-1 text-[32px] leading-tight font-bold tracking-[-0.01em]">{product.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <PriceTag price={price} compareAt={variantCompareAt(product, variant)} className="text-sm" />
          {product.badge && (
            <span className="bg-ink px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-paper uppercase">{product.badge}</span>
          )}
        </div>

        <hr className="mt-6 border-line" />

        <div className="mt-6">
          <p className="mb-2.5 text-sm" aria-live="polite">
            Colour: <span className="text-ink-soft">{variant.name}</span>
          </p>
          <SwatchGroup
            variants={product.variants}
            value={variant.id}
            onChange={(id) => changeVariant(product.variants.findIndex((v) => v.id === id))}
            size="sm"
          />
        </div>

        <div className="mt-6">
          <p className="mb-2.5 text-sm">Size</p>
          <SizeSelector
            ref={sizeRef}
            layout="grid"
            variant={variant}
            value={size}
            onChange={(s) => {
              setSize(s);
              setSizeError(false);
            }}
            invalid={sizeError}
            describedBy={sizeError ? errorId : stock !== null && stock <= LOW_STOCK ? stockId : undefined}
          />
          <div className="mt-2 min-h-5 text-xs">
            {sizeError ? (
              <p id={errorId} role="alert" className="text-danger">
                Choose a size to add this to your bag.
              </p>
            ) : stock !== null && stock <= LOW_STOCK ? (
              <p id={stockId} className="text-signal">
                Only {stock} left in {size}.
              </p>
            ) : null}
          </div>
          <SizeGuideDialog
            garment={product.garment}
            fit={product.fit}
            triggerClassName="mt-2 inline-flex items-center gap-2.5 border-b border-ink pb-1 text-[11px] tracking-[0.18em] uppercase"
          >
            <Ruler className="size-4" strokeWidth={1.3} aria-hidden="true" />
            Find your size
          </SizeGuideDialog>
        </div>

        <div className="mt-8 flex gap-3">
          <div className="flex h-[52px] w-[126px] shrink-0 items-center justify-between border border-[#ddd]" role="group" aria-label="Quantity">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="grid h-full w-11 place-items-center disabled:opacity-35"
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" strokeWidth={1.4} />
            </button>
            <span className="tabular text-sm" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              disabled={qty >= MAX_QTY}
              className="grid h-full w-11 place-items-center disabled:opacity-35"
              aria-label="Increase quantity"
            >
              <Plus className="size-4" strokeWidth={1.4} />
            </button>
          </div>
          <button
            type="button"
            onClick={addToBag}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 bg-ink text-sm font-medium text-paper transition-colors hover:bg-[#2b2b2b]"
            data-testid="add-to-bag"
          >
            <BagPlus className="size-5" />
            Add to cart
          </button>
        </div>
        <button
          type="button"
          onClick={addToBag}
          className="mt-3 h-[52px] w-full bg-ink text-sm font-medium text-paper transition-colors hover:bg-[#2b2b2b]"
        >
          Buy it now
        </button>

        <Accordion.Root type="multiple" defaultValue={["returns"]} className="mt-10">
          <Section value="returns" title="Return policy">
            Our goal is for every customer to be completely happy with their order. Return unworn items within 30 days for a
            full refund. Returns are free.
          </Section>
          <Section value="shipping" title="Shipping">
            Free standard delivery on orders over $150, otherwise $8. Orders ship in 1–2 working days.
          </Section>
          <Section value="fit" title="Description and fit">
            <p>{product.description}</p>
            <p className="mt-3">{product.fit}</p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              {product.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Section>
          <Section value="manufacturing" title="Manufacturing">
            <p>{product.materials}</p>
            <ul className="mt-3 space-y-1">
              {product.care.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>
        </Accordion.Root>
      </aside>
    </div>
  );
}

function Section({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <Accordion.Item value={value}>
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-3 text-left text-[13px] font-bold">
          {title}
          <ChevronDown
            className="size-4 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden text-[15px] leading-[1.35] data-[state=closed]:animate-[accordion-up_220ms_var(--ease-in-out-soft)] data-[state=open]:animate-[accordion-down_300ms_var(--ease-out-quint)]">
        <div className="pb-4">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

/** A shopping bag with a small plus: add to cart. */
function BagPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 8h13l-1 12H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      <path d="M17.5 13v6M14.5 16h6" stroke="currentColor" />
    </svg>
  );
}
