"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useCart, cartTotals } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { navLinks, utilityLinks } from "./nav";
import { SearchDialog, SearchIcon } from "./SearchDialog";

export function Header() {
  const pathname = usePathname();
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const count = mounted ? cartTotals(lines).count : 0;

  return (
    <>
      <div className="hidden h-[34px] bg-paper-sunk sm:block">
        <ul className="mx-auto flex h-full max-w-[1600px] items-center justify-end px-10 text-[11.9px] font-medium text-[#333]">
          {utilityLinks.map((l, i) => (
            <li key={l.label} className="flex items-center">
              {i > 0 && (
                <span className="px-2.5 text-[#333]/70" aria-hidden="true">
                  |
                </span>
              )}
              <Link href={l.href} className="hover:text-ink-faint">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <header className="sticky top-0 z-50 bg-paper">
        <div className="mx-auto grid h-[60px] max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-[70px] sm:px-6 lg:px-10">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="-ml-2 grid size-11 place-items-center rounded-pill hover:bg-paper-sunk lg:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
            <Link href="/" className="font-display text-[1.6rem] leading-none font-extrabold tracking-[-0.07em]" aria-label="Charflut home">
              charflut
            </Link>
          </div>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-[22px] font-display text-[15px] font-semibold tracking-[-0.01em]">
              {navLinks.map((l) => {
                const current = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "relative block py-2 text-[#3a3a3a] transition-colors hover:text-ink",
                        "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100",
                        current && "text-ink",
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-11 items-center justify-center gap-3 rounded-pill px-3 text-[15px] text-[#555] transition-colors hover:bg-[#e5e5e5] sm:h-12 sm:w-40 sm:bg-paper-sunk"
              aria-label="Search"
            >
              <SearchIcon className="size-6" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <Link
              href="/help#account"
              className="hidden size-11 place-items-center rounded-pill transition-colors hover:bg-paper-sunk sm:grid"
              aria-label="Account"
            >
              <User className="size-[22px]" strokeWidth={1.6} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative -mr-2 grid size-11 place-items-center rounded-pill transition-colors hover:bg-paper-sunk"
              aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
              data-testid="bag-button"
            >
              <ShoppingBag className="size-[22px]" strokeWidth={1.6} />
              {count > 0 && (
                <span
                  key={count}
                  className="tabular absolute top-[13px] left-1/2 -translate-x-1/2 animate-[bump_400ms_var(--ease-out-quint)] text-[9px] font-bold"
                  aria-hidden="true"
                >
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="left">
        <nav aria-label="Mobile">
          <ul className="flex flex-col py-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className="block px-5 py-3 font-display text-[28px] font-semibold tracking-[-0.02em] aria-[current=page]:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/collections/all"
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-3 font-display text-[28px] font-semibold tracking-[-0.02em]"
              >
                Shop all
              </Link>
            </li>
          </ul>
          <ul className="mt-4 space-y-3 border-t border-line px-5 pt-6 text-sm text-ink-soft">
            {utilityLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} onClick={() => setMenuOpen(false)} className="hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Sheet>
    </>
  );
}
