"use client";

import Link from "next/link";
import { useState } from "react";
import { railItems } from "@/data/rail";
import { garmentImage } from "@/lib/garment-image";
import { variantPrice } from "@/lib/product-utils";
import { cn } from "@/lib/cn";
import { HangingGarment } from "./HangingGarment";
import { QuickView, type QuickViewItem } from "./QuickView";

/** A wall rail with end brackets and ten pieces hung shoulder to shoulder. */
export function RailStraight() {
  const [peek, setPeek] = useState<QuickViewItem | null>(null);
  const items = railItems.slice(0, 10);

  return (
    <section aria-labelledby="rail-straight-title" className="overflow-hidden border-b border-line bg-paper pt-20 pb-28">
      <h2 id="rail-straight-title" className="eyebrow flex items-center justify-center gap-4 text-[#0b0b0b]">
        <span>New collection</span>
        <span className="h-4 w-px bg-current opacity-30" aria-hidden="true" />
        <span className="opacity-60">Premium streetwear</span>
      </h2>

      <div className="relative mt-9">
        {/* Rail with a wall bracket at each end. */}
        <div className="absolute inset-x-0 top-[14px] h-[5px] bg-[linear-gradient(180deg,#9ea2a6,#f1f2f3_45%,#6e7377)] shadow-[0_2px_3px_rgb(0_0_0/0.15)]" aria-hidden="true" />
        {(["left-0.5", "right-0.5"] as const).map((side) => (
          <span
            key={side}
            className={cn(
              "absolute top-0 h-[26px] w-10 rounded-[3px] border border-[#8c9095] bg-[linear-gradient(180deg,#d7d9db,#a9adb1)] shadow-sm",
              side,
            )}
            aria-hidden="true"
          />
        ))}

        <ul className="no-scrollbar relative mx-auto flex max-w-[1240px] items-start justify-start overflow-x-auto px-6 pt-[11px] sm:justify-center">
          {items.map((it, i) => {
            const image = garmentImage(it.product, it.variant);
            const bottom = image.part === "bottom";
            return (
              <li key={it.key} className={cn("shrink-0", bottom ? "w-[66px] sm:w-[72px]" : "w-[104px] sm:w-[116px]")}>
                <button
                  type="button"
                  onClick={() => setPeek({ product: it.product, variant: it.variant })}
                  aria-label={`${it.product.name} in ${it.variant.name}, $${Math.round(variantPrice(it.product, it.variant))}. Look closer`}
                  className="group block w-full origin-top"
                >
                  <span
                    className="block origin-top transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] group-hover:translate-y-1 group-hover:animate-[nudge_1.4s_ease-out] motion-reduce:group-hover:animate-none"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <HangingGarment
                      image={image}
                      price={`$${Math.round(variantPrice(it.product, it.variant))}`}
                      sizes="120px"
                      hook={bottom ? 0.6 : 0.36}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-16 text-center">
        <p className="text-base font-semibold tracking-[0.012em] text-[#1d1d1b]">
          Crafted in heavyweight cotton. Cut wide. Made to last.
        </p>
        <Link
          href="/collections/all"
          className="mt-6 inline-flex h-11 items-center rounded-pill border border-[#d9d4cc] bg-[#f3f0eb] px-7 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Shop the Collection
        </Link>
      </div>

      <QuickView item={peek} onClose={() => setPeek(null)} />
    </section>
  );
}
