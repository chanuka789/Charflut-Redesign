import { formatPrice } from "@/lib/price";
import { cn } from "@/lib/cn";

export function PriceTag({ price, compareAt, className }: { price: number; compareAt?: number; className?: string }) {
  const onSale = compareAt !== undefined && compareAt > price;
  return (
    <p className={cn("tabular flex items-baseline gap-2", className)}>
      <span className={cn(onSale && "text-signal")}>
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <s className="text-[0.8em] text-ink-faint">
          <span className="sr-only">Was </span>
          {formatPrice(compareAt)}
        </s>
      )}
    </p>
  );
}
