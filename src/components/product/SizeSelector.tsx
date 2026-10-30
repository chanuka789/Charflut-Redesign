"use client";

import { forwardRef } from "react";
import { RadioGroup } from "radix-ui";
import type { Variant } from "@/lib/schema";
import { cn } from "@/lib/cn";

interface SizeSelectorProps {
  variant: Variant;
  value: string | null;
  onChange: (size: string) => void;
  invalid?: boolean;
  describedBy?: string;
  /** "grid": four wide boxes per row, as on the product page. */
  layout?: "row" | "grid";
}

export const SizeSelector = forwardRef<HTMLDivElement, SizeSelectorProps>(function SizeSelector(
  { variant, value, onChange, invalid, describedBy, layout = "row" },
  ref,
) {
  return (
    <RadioGroup.Root
      ref={ref}
      value={value ?? ""}
      onValueChange={onChange}
      aria-label="Size"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      orientation="horizontal"
      loop
      className={cn("grid", layout === "grid" ? "grid-cols-4 gap-2.5" : "grid-cols-6 gap-1.5")}
      data-testid="size-selector"
    >
      {variant.sizes.map((s) => {
        const soldOut = s.stock === 0;
        return (
          <RadioGroup.Item
            key={s.label}
            value={s.label}
            disabled={soldOut}
            aria-label={soldOut ? `${s.label}, sold out` : s.label}
            className={cn(
              "tabular relative rounded-[2px] border text-sm transition-colors",
              layout === "grid" ? "h-[46px] border-[#ddd]" : "h-11 border-line-strong",
              "bg-paper-raised hover:border-ink",
              "data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-paper",
              "disabled:border-line disabled:bg-transparent disabled:text-ink-faint disabled:line-through disabled:hover:border-line",
              invalid && "border-danger/70",
            )}
          >
            {s.label}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
});
