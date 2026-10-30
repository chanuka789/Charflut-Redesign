import Link from "next/link";
import { navLinks, utilityLinks } from "./nav";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-4 py-12 text-[13px] sm:px-6 md:flex-row md:items-start md:justify-between lg:px-10">
        <div>
          <p className="font-display text-[1.6rem] leading-none font-extrabold tracking-[-0.07em]">charflut</p>
          <p className="mt-3 max-w-xs text-ink-soft">Heavyweight basics cut wide, made in small runs in Portugal and Turkey.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-16">
          <ul className="space-y-2.5 font-medium">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ink-soft">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/collections/all" className="hover:text-ink-soft">
                Shop all
              </Link>
            </li>
          </ul>
          <ul className="space-y-2.5 text-ink-soft">
            {utilityLinks.slice(0, 2).map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/help#returns" className="hover:text-ink">
                Returns
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-[1600px] px-4 pb-8 text-xs text-ink-faint sm:px-6 lg:px-10">
        © {new Date().getFullYear()} Charflut. Demo store: no real orders are taken.
      </p>
    </footer>
  );
}
