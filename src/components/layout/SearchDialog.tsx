"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { products } from "@/data/catalog";
import { garmentImage } from "@/lib/garment-image";
import { formatPrice } from "@/lib/price";

/** A magnifier with a small spark: search that suggests as you type. */
export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="10.5" cy="12.5" r="6.5" />
      <path d="m15.5 17.5 4 4" />
      <path d="M18.5 2.5v5M16 5h5" strokeWidth="1.4" />
    </svg>
  );
}

const entries = products.flatMap((p) =>
  p.variants.map((v) => ({
    key: `${p.slug}-${v.id}`,
    href: `/products/${p.slug}?color=${v.id}`,
    name: p.name,
    colour: v.name,
    words: `${p.name} ${v.name} ${p.category} ${p.garment}`.toLowerCase(),
    price: v.price ?? p.price,
    image: garmentImage(p, v),
  })),
);

const suggestions = ["Hoodie", "Tee", "Cargo", "Black", "Stone"];

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length ? entries.filter((e) => words.every((w) => e.words.includes(w))) : entries.slice(0, 6);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/30 data-[state=open]:animate-[fade-in_250ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-0 z-[100] max-h-dvh overflow-y-auto bg-paper px-4 pt-4 pb-10 shadow-panel outline-none data-[state=open]:animate-[pop-in_300ms_var(--ease-out-quint)] sm:px-10"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <div className="mx-auto flex max-w-[1600px] items-center gap-4">
            <span className="hidden font-display text-[1.6rem] font-extrabold tracking-[-0.07em] sm:block">charflut</span>
            <label className="mx-auto flex h-12 w-full max-w-2xl items-center gap-3 rounded-pill bg-paper-sunk px-4">
              <SearchIcon className="size-6 shrink-0" />
              <span className="sr-only">Search products</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-faint"
              />
            </label>
            <Dialog.Close className="grid size-11 shrink-0 place-items-center rounded-pill hover:bg-paper-sunk" aria-label="Close search">
              <X className="size-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>

          <div className="mx-auto mt-8 max-w-2xl">
            {!words.length && (
              <div className="mb-8">
                <p className="text-sm text-ink-faint">Popular search terms</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-pill bg-paper-sunk px-4 py-2 text-[15px] font-medium hover:bg-[#e5e5e5]"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm text-ink-faint" aria-live="polite">
              {words.length ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Top suggestions"}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
              {results.map((r) => (
                <li key={r.key}>
                  <Link href={r.href} onClick={() => onOpenChange(false)} className="group block">
                    <div className="relative aspect-square bg-paper-sunk">
                      <Image
                        src={r.image.src}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-[15px] font-medium">{r.name}</p>
                    <p className="text-sm text-ink-faint">{r.colour}</p>
                    <p className="mt-1 text-[15px] font-medium">{formatPrice(r.price)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
