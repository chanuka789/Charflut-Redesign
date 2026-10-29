"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart, cartTotals, MAX_QTY, type CartLine } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { formatPrice } from "@/lib/price";
import { Sheet } from "@/components/ui/Sheet";
import { ModelFigure } from "@/components/figure/ModelFigure";

const FREE_DELIVERY = 150;

export function CartDrawer() {
  const mounted = useMounted();
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const lines = useCart((s) => s.lines);
  const { count, subtotal, savings } = cartTotals(mounted ? lines : []);
  const toFree = Math.max(0, FREE_DELIVERY - subtotal);

  return (
    <Sheet
      open={mounted && open}
      onOpenChange={setOpen}
      title={count ? `Your bag (${count})` : "Your bag"}
      description="Items in your shopping bag"
      footer={
        count > 0 ? (
          <div className="space-y-3">
            {savings > 0 && (
              <p className="tabular flex justify-between text-sm text-signal">
                <span>Bundle savings</span>
                <span>−{formatPrice(savings)}</span>
              </p>
            )}
            <p className="tabular flex justify-between text-base font-medium">
              <span>Subtotal</span>
              <span data-testid="cart-subtotal">{formatPrice(subtotal)}</span>
            </p>
            <p className="text-xs text-ink-soft">
              {toFree > 0 ? `Add ${formatPrice(toFree)} more for free delivery.` : "Your order ships free."} Taxes are
              calculated at checkout.
            </p>
            <button
              type="button"
              disabled
              title="This is a demo store"
              className="h-13 w-full rounded-pill bg-ink text-sm font-medium text-paper disabled:opacity-60"
            >
              Checkout (demo store)
            </button>
          </div>
        ) : undefined
      }
    >
      {count === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <ShoppingBag className="size-8 text-ink-faint" strokeWidth={1.25} aria-hidden="true" />
          <p className="text-sm text-ink-soft">Your bag is empty. Pick a colour and size to add something.</p>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-pill border border-ink px-5 py-3 text-sm transition-colors hover:bg-ink hover:text-paper"
          >
            Shop all
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line px-5 sm:px-6" data-testid="cart-lines">
          {lines.map((l) => (
            <CartLineRow key={l.key} line={l} />
          ))}
        </ul>
      )}
    </Sheet>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  return (
    <li className="flex gap-4 py-5">
      <div className="grid size-20 shrink-0 place-items-center rounded-sm bg-paper-sunk/70">
        <ModelFigure garment={line.garment} color={line.hex} gender="men" personaIndex={0} mode="garment" className="size-16" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <Link href={`/products/${line.slug}?color=${line.variantId}`} className="truncate text-sm hover:underline">
            {line.name}
          </Link>
          <p className="tabular shrink-0 text-sm">
            {line.unitPrice < line.listPrice && (
              <s className="mr-1.5 text-xs text-ink-faint">
                <span className="sr-only">Was </span>
                {formatPrice(line.listPrice * line.qty)}
              </s>
            )}
            {formatPrice(line.unitPrice * line.qty)}
          </p>
        </div>
        <p className="mt-0.5 text-xs text-ink-soft">
          {line.colorName}, size {line.size}
          {line.bundle ? ", bundle price" : ""}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-pill border border-line-strong" role="group" aria-label={`Quantity of ${line.name}`}>
            <button
              type="button"
              className="grid size-9 place-items-center disabled:opacity-35"
              onClick={() => setQty(line.key, line.qty - 1)}
              disabled={line.qty <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" strokeWidth={1.5} />
            </button>
            <span className="tabular w-6 text-center text-sm" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              className="grid size-9 place-items-center disabled:opacity-35"
              onClick={() => setQty(line.key, line.qty + 1)}
              disabled={line.qty >= MAX_QTY}
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(line.key)}
            className="text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
