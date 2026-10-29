import { Accordion } from "radix-ui";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/schema";

function Item({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <Accordion.Item value={value} className="border-b border-line">
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium">
          {title}
          <Plus
            className="size-4 shrink-0 text-ink-soft transition-transform duration-300 ease-[var(--ease-out-quint)] group-data-[state=open]:rotate-45"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden text-sm text-ink-soft data-[state=closed]:animate-[accordion-up_220ms_var(--ease-in-out-soft)] data-[state=open]:animate-[accordion-down_300ms_var(--ease-out-quint)]">
        <div className="max-w-prose pb-5">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  return (
    <Accordion.Root type="multiple" defaultValue={["description"]} className="border-t border-line">
      <Item value="description" title="Description and fit">
        <p>{product.description}</p>
        <p className="mt-3">{product.fit}</p>
      </Item>
      <Item value="details" title="Details">
        <ul className="list-disc space-y-1.5 pl-4 marker:text-ink-faint">
          {product.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Item>
      <Item value="materials" title="Materials and care">
        <p>{product.materials}</p>
        <ul className="mt-3 space-y-1.5">
          {product.care.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Item>
      <Item value="delivery" title="Delivery and returns">
        <p>Free standard delivery on orders over $150, otherwise $8. Orders ship in 1–2 working days.</p>
        <p className="mt-3">Return unworn items within 30 days for a full refund. Returns are free.</p>
      </Item>
    </Accordion.Root>
  );
}
