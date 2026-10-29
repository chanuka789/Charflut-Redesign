"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { Garment } from "@/lib/schema";

const tops = {
  head: ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
  rows: [
    ["XS", "116", "64", "56"],
    ["S", "122", "66", "57"],
    ["M", "128", "68", "58"],
    ["L", "134", "70", "59"],
    ["XL", "140", "72", "60"],
    ["XXL", "146", "74", "61"],
  ],
};

const bottoms = {
  head: ["Waist (in)", "Waist (cm)", "Inseam (cm)", "Leg opening (cm)"],
  rows: [
    ["28", "71", "80", "27"],
    ["30", "76", "81", "28"],
    ["32", "81", "82", "29"],
    ["34", "86", "83", "30"],
    ["36", "91", "84", "31"],
    ["38", "97", "85", "32"],
  ],
};

export function SizeGuideDialog({ garment, fit }: { garment: Garment; fit: string }) {
  const table = garment === "cargo" ? bottoms : tops;
  return (
    <Dialog.Root>
      <Dialog.Trigger className="text-xs text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink">
        Size guide
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-[fade-in_250ms_ease-out]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[100] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md bg-paper-raised p-6 shadow-panel data-[state=open]:animate-[pop-in_300ms_var(--ease-out-quint)]">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-medium">Size guide</Dialog.Title>
            <Dialog.Close className="-mt-2 -mr-2 grid size-11 place-items-center rounded-pill hover:bg-paper-sunk" aria-label="Close">
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">{fit} Garment measurements, laid flat and doubled.</Dialog.Description>
          <div className="mt-5 overflow-x-auto">
            <table className="tabular w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-soft">
                  {table.head.map((h) => (
                    <th key={h} scope="col" className="py-2 pr-4 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-line/60 last:border-0">
                    {r.map((c, i) =>
                      i === 0 ? (
                        <th key={i} scope="row" className="py-2.5 pr-4 font-medium">
                          {c}
                        </th>
                      ) : (
                        <td key={i} className="py-2.5 pr-4">
                          {c}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
