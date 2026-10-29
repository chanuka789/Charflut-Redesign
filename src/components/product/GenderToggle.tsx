"use client";

import { RadioGroup } from "radix-ui";
import type { ModelGender } from "@/lib/schema";

const labels: Record<ModelGender, string> = { men: "Men", women: "Women" };

export function GenderToggle({
  options,
  value,
  onChange,
}: {
  options: ModelGender[];
  value: ModelGender;
  onChange: (g: ModelGender) => void;
}) {
  if (options.length < 2) return null;
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(v) => onChange(v as ModelGender)}
      aria-label="Shown on"
      orientation="horizontal"
      className="inline-flex rounded-pill border border-line-strong p-0.5"
    >
      {options.map((g) => (
        <RadioGroup.Item
          key={g}
          value={g}
          className="h-9 rounded-pill px-4 text-xs text-ink-soft transition-colors hover:text-ink data-[state=checked]:bg-ink data-[state=checked]:text-paper"
        >
          {labels[g]}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
