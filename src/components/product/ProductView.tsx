"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Heart, RotateCcw, Truck } from "lucide-react";
import { modelGenders, type ModelGender, type Product } from "@/lib/schema";
import { LOW_STOCK, sizeStock, toLine, variantCompareAt, variantPrice } from "@/lib/product-utils";
import { modelImage, thumbFocus } from "@/lib/model-image";
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
import { ModelThumb } from "./ModelThumb";
import { StickyBuyBar } from "./StickyBuyBar";

interface ProductViewProps {
  product: Product;
  pairings: Product[];
}

const noSubscribe = () => () => {};
// The query string as it was when this page opened. Frozen on the first read
// so our own replaceState() calls are never mistaken for an incoming link.
let openedWith: string | null = null;
const readSearch = () => (openedWith ??= window.location.search);
const serverSearch = () => "";

function fromSearch(product: Product, search: string) {
  const q = new URLSearchParams(search);
  const variant = product.variants.findIndex((v) => v.id === q.get("color"));
  const model = q.get("model") as ModelGender | null;
  const gender = model && modelGenders.includes(model) && product.genders.includes(model) ? model : null;
  return { variant: variant >= 0 ? variant : null, gender };
}

export function ProductView({ product, pairings }: ProductViewProps) {
  const [active, setActive] = useState(0);
  const [gender, setGender] = useState<ModelGender>(product.genders[0]!);

  // The page is a static file built with the default colour. After hydration
  // React re-renders with the real ?color= / ?model=, and we adopt them once,
  // in place, so the server-rendered photo stays on screen (no remount).
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
    const q = fromSearch(product, search);
    if (q.variant !== null) setActive(q.variant);
    if (q.gender) setGender(q.gender);
  }
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

  // Keep the URL in step so a shared link opens this exact colour. Skip the
  // first run: it would overwrite an incoming ?color= before it is adopted.
  const urlWrites = useRef(0);
  useEffect(() => {
    if (urlWrites.current++ === 0) return;
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
    <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-0 xl:grid-cols-[minmax(0,1fr)_24rem]">
      {/* Stage column */}
      <div className="min-w-0 lg:sticky lg:top-16 lg:self-start">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-4 pt-6 sm:px-6 md:pt-8 lg:px-10">
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
          <GenderToggle options={product.genders} value={gender} onChange={setGender} />
        </div>
        <div className="mt-4 px-4 sm:px-6 lg:px-10">
          <h1 className="display-type text-4xl sm:text-5xl lg:text-[4.25rem] lg:leading-[0.95]">
            Try the Look.<span className="sr-only"> {product.name}</span>
          </h1>
          <p className="mt-3 max-w-[46ch] text-sm text-ink-soft sm:text-base">
            {product.variants.length} colours, styled head to toe. Tap a pin to see the piece.{" "}
            <span className="text-ink">{product.name}.</span> {product.summary}
          </p>
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

      {/* Rail column */}
      <aside
        aria-label="Purchase options"
        className="min-w-0 border-line px-4 pt-8 sm:px-6 lg:border-l lg:px-6 lg:pt-10 lg:pb-10"
      >
        <div>
          <div className="flex items-center gap-3">
            <ModelThumb
              src={modelImage(product, variant, gender).src}
              focus={thumbFocus[product.garment]}
              className="size-12"
            />
            <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="truncate text-xs text-ink-soft">
                <span className="sr-only">Selected colour: </span>
                <span key={variant.id} className="inline-block animate-[pop-in_300ms_var(--ease-out-quint)]">
                  {variant.name}
                </span>
              </p>
            </div>
            {product.badge && (
              <span className="shrink-0 rounded-pill bg-ink px-2.5 py-1 text-2xs font-medium text-paper">{product.badge}</span>
            )}
            <PriceTag price={price} compareAt={compareAt} className="shrink-0 text-base" />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs text-ink-soft">Colour</p>
            <SwatchGroup
              variants={product.variants}
              value={variant.id}
              onChange={(id) => changeVariant(product.variants.findIndex((v) => v.id === id))}
              size="sm"
            />
          </div>

          <div className="mt-5">
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

          <div className="mt-2 flex gap-2">
            <button
              ref={addRef}
              type="button"
              onClick={addToBag}
              className="flex h-12 flex-1 items-center justify-center bg-ink text-sm font-medium text-paper transition-[background-color,transform] hover:bg-ink/85 active:scale-[0.99]"
              data-testid="add-to-bag"
            >
              Add to bag
            </button>
            <button
              type="button"
              onClick={() => toggleWish(product.slug)}
              aria-pressed={mounted ? wishlisted : false}
              aria-label="Save to wishlist"
              className="grid size-12 shrink-0 place-items-center border border-line-strong transition-colors hover:border-ink"
            >
              <Heart
                className={cn("size-5 transition-colors", mounted && wishlisted && "fill-ink")}
                strokeWidth={1.5}
              />
            </button>
          </div>

          <ul className="mt-4 space-y-2 text-xs text-ink-soft">
            <li className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              Free delivery on orders over $150
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              Free returns within 30 days
            </li>
          </ul>
        </div>

        {product.completeTheLook && pairings.length > 0 && (
          <div className="mt-8 border-t border-line pt-6">
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

        <div className="mt-8 border-t border-line pt-2">
          <ProductDetails product={product} />
        </div>
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
