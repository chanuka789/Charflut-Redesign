import Link from "next/link";
import { navLinks } from "./nav";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div className="max-w-sm">
          <p className="display-type text-4xl leading-none">charflut</p>
          <p className="mt-4 text-sm text-ink-soft">
            Heavyweight basics cut wide, made in small runs in Portugal and Turkey.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-medium">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-medium">Help</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>Free delivery on orders over $150</li>
            <li>Free returns within 30 days</li>
            <li>Ships in 1–2 working days</li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-[1600px] px-4 pb-10 text-xs text-ink-faint sm:px-6 lg:px-10">
        © {new Date().getFullYear()} Charflut. Demo store: no real orders are taken.
      </p>
    </footer>
  );
}
