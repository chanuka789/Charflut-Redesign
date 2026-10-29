import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="display-type text-5xl">Page not found</h1>
      <p className="mt-4 text-ink-soft">This product may have sold out for good, or the link has a typo.</p>
      <Link href="/" className="mt-8 inline-block rounded-pill bg-ink px-6 py-3 text-sm text-paper">
        Shop all
      </Link>
    </div>
  );
}
