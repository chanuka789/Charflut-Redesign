"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Heart, RotateCcw, Truck } from "lucide-react";
import type { ModelGender, Product } from "@/lib/schema";
import { LOW_STOCK, sizeStock, toLine, variantCompareAt, variantPrice } from "@/lib/product-utils";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useMounted } from "@/lib/use-mounted";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/cn";
import { VariantCarousel } from "./VariantCarousel";
import { SwatchGroup } from "./SwatchGroup";
import { SizeSelector } from "./SizeSelector";
import { SizeGuideDialog } from "./SizeGuideDialog";
import { GenderToggle } from "./GenderToggle";
import { PriceTag } from "./PriceTag";
import { ProductDetails } from "./ProductDetails";
import { CompleteTheLook } from "./CompleteTheLook";
import { StickyBuyBar } from "./StickyBuyBar";

interface ProductViewProps {
  product: Product;
  pairings: Product[];
  initialVariant: number;
  initialGender: ModelGender;
}

export function ProductView({ product, pairings, initialVariant, initialGender }: ProductViewProps) {
  const [active, setActive] = useState(initialVariant);
  const [gender, setGender] = useState<ModelGender>(initialGender);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const reducedMotion = useReducedMotion();
  const mounted = useMounted();

  const add = useCart((s) => s.add);
  const wishlisted = useWishlist((s) => s.ids.includes(product.slug));
  const toggleWish = useWishlist((s) => s.toggle);

  const sizeRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const errorId = useId();
  const stockId = useId();

  const variant = product.variants[active]!;
  const price = variantPrice(product, variant);
  const compareAt = variantCompareAt(product, variant);
  const stock = size ? sizeStock(variant, size) : null;

  // Keep the URL in step so a shared link opens this exact colour.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("color", variant.id);
    url.searchParams.set("model", gender);
    window.history.replaceState(window.history.state, "", url);
  }, [variant.id, gender]);

  const changeVariant = (index: number) => {
    setActive(index);
    const next = product.variants[index]!;
    // Keep the chosen size only if this colour has it in stock.
    if (size && sizeStock(next, size) === 0) setSize(null);
  };

  const promptForSize = () => {
    setSizeError(true);
    sizeRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    const first = sizeRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])");
    first?.focus({ preventScroll: true });
  };

  const addToBag = () => {
    if (!size) return promptForSize();
    add([toLine(product, variant, size)]);
  };

  return (
    <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] lg:gap-0 xl:grid-cols-[minmax(0,1fr)_28rem]">
      {/* Stage column */}
      <div className="min-w-0 lg:sticky lg:top-16 lg:self-start">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-4 pt-6 sm:px-6 md:pt-8 lg:px-10">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-xs text-ink-soft">
                <li>
                  <Link href="/" className="hover:text-ink">
                    Shop
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>{product.category}</li>
              </ol>
            </nav>
            <h1 className="display-type mt-3 text-4xl sm:text-5xl lg:text-[4.25rem] lg:leading-[0.95]">{product.name}</h1>
            <p className="mt-3 max-w-[46ch] text-sm text-ink-soft sm:text-base">{product.summary}</p>
          </div>
          <GenderToggle options={product.genders} value={gender} onChange={setGender} />
        </div>

        <div className="mt-2 md:mt-4">
          <VariantCarousel
            product={product}
            gender={gender}
            active={active}
            onActiveChange={changeVariant}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      {/* Buy column */}
      <aside
        aria-label="Purchase options"
        className="px-4 pt-8 sm:px-6 md:grid md:grid-cols-2 md:gap-8 lg:block lg:min-h-[calc(100dvh-4rem)] lg:border-l lg:border-line lg:px-8 lg:pt-10 lg:pb-10"
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <div aria-live="polite" aria-atomic="true">
              <PriceTag price={price} compareAt={compareAt} className="text-2xl" />
              <p className="mt-1 text-sm text-ink-soft">
                <span className="sr-only">Selected colour: </span>
                <span key={variant.id} className="inline-block animate-[pop-in_300ms_var(--ease-out-quint)] text-ink">
                  {variant.name}
                </span>
              </p>
            </div>
            {product.badge && (
              <span className="rounded-pill bg-ink px-2.5 py-1 text-2xs font-medium text-paper">{product.badge}</span>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs text-ink-soft">
              Colour
            </p>
            <SwatchGroup
              variants={product.variants}
              value={variant.id}
              onChange={(id) => changeVariant(product.variants.findIndex((v) => v.id === id))}
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-ink-soft">Size</p>
              <SizeGuideDialog garment={product.garment} fit={product.fit} />
            </div>
            <SizeSelector
              ref={sizeRef}
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
          </div>

          <div className="mt-3 flex gap-2">
            <button
              ref={addRef}
              type="button"
              onClick={addToBag}
              className="h-13 flex-1 rounded-pill bg-ink text-sm font-medium text-paper transition-[background-color,transform] hover:bg-ink/85 active:scale-[0.99]"
              data-testid="add-to-bag"
            >
              Add to bag
            </button>
            <button
              type="button"
              onClick={() => toggleWish(product.slug)}
              aria-pressed={mounted ? wishlisted : false}
              aria-label="Save to wishlist"
              className="grid size-13 place-items-center rounded-pill border border-line-strong transition-colors hover:border-ink"
            >
              <Heart
                className={cn("size-5 transition-colors", mounted && wishlisted && "fill-ink")}
                strokeWidth={1.5}
              />
            </button>
          </div>

          <ul className="mt-5 space-y-2 text-xs text-ink-soft">
            <li className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              Free delivery on orders over $150
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              Free returns within 30 days
            </li>
          </ul>

          <div className="mt-8">
            <ProductDetails product={product} />
          </div>
        </div>

        {product.completeTheLook && pairings.length > 0 && (
          <div className="mt-10 md:mt-0 lg:mt-10">
            <CompleteTheLook
              product={product}
              variant={variant}
              size={size}
              pairings={pairings}
              discount={product.completeTheLook.discount}
              onNeedSize={promptForSize}
            />
          </div>
        )}
      </aside>

      <StickyBuyBar
        watchRef={addRef}
        variantName={variant.name}
        hex={variant.hex}
        price={price}
        compareAt={compareAt}
        size={size}
        onAdd={addToBag}
      />
    </div>
  );
}
