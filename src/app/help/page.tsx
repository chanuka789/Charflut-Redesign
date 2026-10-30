import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
  description: "Delivery, returns, sizing, stores and accounts.",
};

const sections = [
  {
    id: "delivery",
    title: "Delivery",
    body: "Free standard delivery on orders over $150, otherwise $8. Orders ship in 1–2 working days.",
  },
  {
    id: "returns",
    title: "Returns",
    body: "Return unworn items within 30 days for a full refund. Returns are free.",
  },
  {
    id: "sizing",
    title: "Sizing",
    body: "Every product page has a size guide with garment measurements. Our tops are cut wide: take your usual size for a relaxed fit.",
  },
  {
    id: "stores",
    title: "Find a store",
    body: "Charflut sells online only for now. Pop-up dates will be listed here.",
  },
  {
    id: "account",
    title: "Join us and sign in",
    body: "Accounts are coming soon. This is a demo store, so no orders are taken and your bag is saved in this browser.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6">
      <h1 className="text-[40px] leading-none font-bold tracking-[-0.01em] sm:text-[52px]">Help</h1>
      <div className="mt-12 divide-y divide-line border-y border-line">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="py-7">
            <h2 id={`${s.id}-title`} className="text-lg font-bold">
              {s.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
