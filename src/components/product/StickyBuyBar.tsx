"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { PriceTag } from "./PriceTag";

interface StickyBuyBarProps {
  watchRef: React.RefObject<HTMLElement | null>;
  variantName: string;
  hex: string;
  price: number;
  compareAt?: number;
  size: string | null;
  onAdd: () => void;
}

/** Phone and tablet only: keeps "Add to bag" in reach once the main button scrolls away. */
export function StickyBuyBar({ watchRef, variantName, hex, price, compareAt, size, onAdd }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;
    // A scroll check rather than IntersectionObserver: the observer stays
    // silent when one fast scroll jumps from below the button to above it.
    let frame = 0;
    const check = () => {
      frame = 0;
      setVisible(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [watchRef]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper-raised/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 ease-[var(--ease-out-quint)] lg:hidden",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
      aria-hidden={!visible}
      inert={!visible}
      data-testid="sticky-buy-bar"
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <span className="size-7 shrink-0 rounded-pill ring-1 ring-line-strong ring-inset" style={{ backgroundColor: hex }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            {variantName}
            {size ? `, ${size}` : ""}
          </p>
          <PriceTag price={price} compareAt={compareAt} className="text-xs text-ink-soft" />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="h-12 shrink-0 rounded-pill bg-ink px-6 text-sm font-medium text-paper active:scale-[0.99]"
        >
          {size ? "Add to bag" : "Choose size"}
        </button>
      </div>
    </div>
  );
}
