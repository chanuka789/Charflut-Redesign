"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Dialog, Popover } from "radix-ui";
import { ArrowRight, Plus, X } from "lucide-react";
import { looks, LOOK_DISCOUNT, type LookPiece } from "@/data/looks";
import { garmentImage } from "@/lib/garment-image";
import { toLine, variantPrice } from "@/lib/product-utils";
import { bundleTotals, formatPrice } from "@/lib/price";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCart } from "@/store/cart";
import { SizeSelector } from "@/components/product/SizeSelector";
import { cn } from "@/lib/cn";
import { ModelCarousel } from "./ModelCarousel";

/** Where each piece sits on the model photo, by garment, as % of the slide box. */
const pinAt = { hoodie: { x: 66, y: 27 }, tee: { x: 47, y: 15.5 }, cargo: { x: 60, y: 60 } } as const;

interface LookRunwayProps {
  title?: string;
  as?: "h1" | "h2";
}

export function LookRunway({ title = "Try the Look.", as: Heading = "h2" }: LookRunwayProps) {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const look = looks[active]!;
  const prices = look.pieces.map((p) => variantPrice(p.product, p.variant));
  const bundle = bundleTotals(prices, LOOK_DISCOUNT);

  return (
    <section
      aria-labelledby="look-runway-title"
      className="border-y border-line bg-paper lg:grid lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="min-w-0 pt-10 pb-8 lg:pt-11">
        <div className="px-4 sm:px-6 lg:px-14">
          <Heading id="look-runway-title" className="text-[34px] leading-none font-bold tracking-[0.02em] text-[#151413] sm:text-[46px]">
            {title}
          </Heading>
          <p className="mt-4 text-xs text-ink-soft">Six looks, styled head to toe. Tap a pin to see the piece.</p>
        </div>
        <div className="mt-2">
          <ModelCarousel
            slides={looks}
            label="Looks"
            noun="look"
            active={active}
            onActiveChange={setActive}
            reducedMotion={reducedMotion}
            overlay={(i) =>
              looks[i]!.pieces.map((piece, n) => <Pin key={piece.product.slug} piece={piece} number={n + 1} />)
            }
          />
        </div>
      </div>

      <aside aria-label="In this look" className="flex min-w-0 flex-col border-line lg:border-l">
        <div className="flex-1 px-4 pt-8 sm:px-6 lg:px-8 lg:pt-11">
          <div className="flex items-baseline justify-between border-b border-line pb-5">
            <h3 className="text-lg font-bold text-[#151413]">In this look</h3>
            <p className="text-[10px] tracking-[0.2em] text-ink-soft uppercase">{look.pieces.length} pieces</p>
          </div>
          <ol key={look.id} className="animate-[fade-in_400ms_ease-out]">
            {look.pieces.map((piece, n) => (
              <PieceRow key={piece.product.slug} piece={piece} number={n + 1} />
            ))}
          </ol>
        </div>

        <div className="border-t border-line px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium text-[#151413]">Complete the look</p>
              <p className="mt-0.5 text-[11px] text-ink-soft">
                Bundle all {look.pieces.length} and save {Math.round(LOOK_DISCOUNT * 100)}%
              </p>
            </div>
            <p className="tabular flex items-baseline gap-2.5">
              <s className="text-[11px] text-ink-soft">
                <span className="sr-only">Was </span>
                {formatPrice(bundle.full)}
              </s>
              <strong className="text-base font-bold">{formatPrice(bundle.total)}</strong>
            </p>
          </div>
          <BundleButton pieces={look.pieces} />
        </div>
      </aside>
    </section>
  );
}

function Pin({ piece, number }: { piece: LookPiece; number: number }) {
  const at = pinAt[piece.product.garment];
  return (
    <Popover.Root>
      <Popover.Trigger
        className="group absolute grid size-11 -translate-x-1/2 -translate-y-1/2 animate-[pop-in_400ms_var(--ease-out-quint)] place-items-center"
        style={{ left: `${at.x}%`, top: `${at.y}%` }}
        aria-label={`Piece ${number}: ${piece.product.name}`}
      >
        <span className="absolute size-6 animate-ping rounded-pill bg-white/60 [animation-duration:2.4s] motion-reduce:hidden" />
        <span className="relative grid size-[22px] place-items-center rounded-pill bg-white text-[10px] font-bold shadow-[0_2px_8px_rgb(0_0_0/0.25)] transition-transform group-hover:scale-110">
          {number}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          sideOffset={6}
          collisionPadding={16}
          className="z-[60] w-56 animate-[pop-in_220ms_var(--ease-out-quint)] bg-ink p-4 text-paper shadow-panel"
        >
          <p className="text-[10px] tracking-[0.2em] text-paper/60 uppercase">{piece.product.category}</p>
          <p className="mt-1 text-sm font-medium">
            {piece.product.name}, {piece.variant.name}
          </p>
          <p className="mt-0.5 text-sm">{formatPrice(variantPrice(piece.product, piece.variant))}</p>
          <Link
            href={`/products/${piece.product.slug}?color=${piece.variant.id}`}
            className="mt-3 inline-flex items-center gap-1.5 border-b border-paper/60 pb-0.5 text-xs"
          >
            View details <ArrowRight className="size-3.5" strokeWidth={1.5} />
          </Link>
          <Popover.Arrow className="fill-ink" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PieceRow({ piece, number }: { piece: LookPiece; number: number }) {
  const { product, variant } = piece;
  const image = garmentImage(product, variant);
  const [size, setSize] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const add = useCart((s) => s.add);

  return (
    <li className="flex gap-5 border-b border-line py-[18px]">
      <Link href={`/products/${product.slug}?color=${variant.id}`} className="relative block h-[115px] w-[92px] shrink-0 bg-paper-sunk">
        <Image src={image.src} alt={image.alt} fill sizes="92px" className="object-contain p-1.5" />
        <span className="absolute top-2 right-2 grid size-[18px] place-items-center rounded-pill bg-white text-[9px] font-bold shadow-sm">
          {number}
        </span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col pt-5">
        <p className="text-[10px] tracking-[0.2em] text-ink-soft uppercase">Charflut</p>
        <Link href={`/products/${product.slug}?color=${variant.id}`} className="mt-1.5 truncate text-[13px] font-medium hover:underline">
          {product.name}
        </Link>
        <p className="mt-1 text-[11px] text-ink-soft">{variant.name}</p>
        <div className="mt-auto flex items-end justify-between">
          <p className="tabular text-xs">{formatPrice(variantPrice(product, variant))}</p>
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger
              className="-mr-2 grid size-9 place-items-center rounded-pill transition-colors hover:bg-paper-sunk"
              aria-label={`Add ${product.name} to bag`}
            >
              <Plus className="size-5" strokeWidth={1.2} />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="left"
                align="end"
                sideOffset={8}
                collisionPadding={16}
                className="z-[60] w-72 animate-[pop-in_220ms_var(--ease-out-quint)] border border-line bg-paper p-4 shadow-panel"
              >
                <p className="mb-2 text-xs font-medium">Choose a size</p>
                <SizeSelector variant={variant} value={size} onChange={setSize} />
                <button
                  type="button"
                  disabled={!size}
                  onClick={() => {
                    add([toLine(product, variant, size!)]);
                    setOpen(false);
                  }}
                  className="mt-3 h-10 w-full bg-ink text-xs font-medium text-paper disabled:opacity-40"
                >
                  Add to bag
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </li>
  );
}

function BundleButton({ pieces }: { pieces: LookPiece[] }) {
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const add = useCart((s) => s.add);
  const ready = pieces.every((p) => sizes[p.product.slug]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="group mt-5 flex h-14 w-full items-center justify-center gap-3 bg-ink text-[13px] font-medium tracking-[0.02em] text-paper transition-colors hover:bg-[#2a2a2a]">
        Add full look to bag
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={1.2} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/40 data-[state=open]:animate-[fade-in_250ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-[100] max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-paper p-6 shadow-panel data-[state=open]:animate-[pop-in_300ms_var(--ease-out-quint)]"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold">Pick your sizes</Dialog.Title>
            <Dialog.Close className="-mr-2 grid size-10 place-items-center rounded-pill hover:bg-paper-sunk" aria-label="Close">
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <ul className="mt-4 space-y-5">
            {pieces.map((p) => (
              <li key={p.product.slug}>
                <p className="mb-2 text-sm">
                  {p.product.name} <span className="text-ink-soft">· {p.variant.name}</span>
                </p>
                <SizeSelector
                  variant={p.variant}
                  value={sizes[p.product.slug] ?? null}
                  onChange={(s) => setSizes((all) => ({ ...all, [p.product.slug]: s }))}
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              add(pieces.map((p) => toLine(p.product, p.variant, sizes[p.product.slug]!, LOOK_DISCOUNT)));
              setOpen(false);
            }}
            className={cn("mt-6 h-13 w-full bg-ink text-sm font-medium text-paper", !ready && "opacity-40")}
          >
            {ready ? "Add all to bag" : "Choose a size for each piece"}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
