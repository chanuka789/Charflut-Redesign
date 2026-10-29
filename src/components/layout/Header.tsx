"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { useCart, cartTotals } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { navLinks } from "./nav";

export function Header() {
  const pathname = usePathname();
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = mounted ? cartTotals(lines).count : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          className="-ml-2 grid size-11 place-items-center rounded-pill lg:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>

        <Link href="/" className="display-type text-[1.65rem] leading-none font-medium tracking-[-0.05em]" aria-label="Charflut home">
          charflut
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className={cn(
                    "rounded-pill px-3.5 py-2 text-sm text-ink-soft transition-colors hover:text-ink",
                    pathname === l.href && "text-ink",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative -mr-2 flex h-11 items-center gap-2 rounded-pill px-3 text-sm transition-colors hover:bg-paper-sunk"
            aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
            data-testid="bag-button"
          >
            <ShoppingBag className="size-5" strokeWidth={1.5} />
            <span
              key={count}
              className={cn(
                "tabular grid h-5 min-w-5 place-items-center rounded-pill px-1.5 text-2xs font-medium transition-colors",
                count ? "animate-[bump_400ms_var(--ease-out-quint)] bg-ink text-paper" : "bg-transparent text-ink-faint",
              )}
              aria-hidden="true"
            >
              {count}
            </span>
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="left">
        <nav aria-label="Mobile">
          <ul className="flex flex-col py-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className="display-type block px-5 py-3 text-3xl aria-[current=page]:text-signal"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Sheet>
    </header>
  );
}
