"use client";

import { RadioGroup } from "radix-ui";
import type { Variant } from "@/lib/schema";
import { luminance } from "@/lib/color";
import { inStock } from "@/lib/product-utils";
import { cn } from "@/lib/cn";

interface SwatchGroupProps {
  variants: Variant[];
  value: string;
  onChange: (id: string) => void;
  size?: "md" | "sm";
}

export function SwatchGroup({ variants, value, onChange, size = "md" }: SwatchGroupProps) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onChange}
      aria-label="Colour"
      orientation="horizontal"
      loop
      className="flex flex-wrap gap-2"
    >
      {variants.map((v) => {
        const light = luminance(v.hex) > 0.6;
        const soldOut = !inStock(v);
        return (
          <RadioGroup.Item
            key={v.id}
            value={v.id}
            aria-label={`${v.name}${soldOut ? ", sold out" : ""}`}
            className={cn(
              "group relative grid place-items-center rounded-pill outline-offset-2 transition-transform active:scale-95",
              size === "md" ? "size-11" : "size-9",
            )}
          >
            <span
              className={cn(
                "absolute inset-0 rounded-pill border border-transparent transition-colors",
                "group-data-[state=checked]:border-ink group-hover:border-line-strong group-data-[state=checked]:group-hover:border-ink",
              )}
            />
            <span
              className={cn("rounded-pill", size === "md" ? "size-8" : "size-6", light && "ring-1 ring-line-strong ring-inset")}
              style={{ backgroundColor: v.hex }}
            />
            {soldOut && (
              <span
                className="absolute h-px w-7 rotate-45 bg-ink/60"
                aria-hidden="true"
              />
            )}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
