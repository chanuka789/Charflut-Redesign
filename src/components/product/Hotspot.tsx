"use client";

import { Popover } from "radix-ui";
import type { Hotspot as HotspotData } from "@/lib/schema";

export function Hotspot({ hotspot }: { hotspot: HotspotData }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        className="group absolute grid size-11 -translate-x-1/2 -translate-y-1/2 animate-[pop-in_400ms_var(--ease-out-quint)] place-items-center"
        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
        aria-label={`Detail: ${hotspot.title}`}
      >
        <span className="absolute size-6 animate-ping rounded-pill bg-paper-raised/60 [animation-duration:2.4s] motion-reduce:hidden" />
        <span className="relative grid size-5 place-items-center rounded-pill bg-paper-raised shadow-[0_2px_8px_rgb(0_0_0/0.25)] transition-transform group-hover:scale-110 group-data-[state=open]:scale-110">
          <span className="size-1.5 rounded-pill bg-ink" />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          align="center"
          sideOffset={6}
          collisionPadding={16}
          className="z-[60] w-60 animate-[pop-in_220ms_var(--ease-out-quint)] rounded-md bg-ink p-4 text-paper shadow-panel"
        >
          <p className="text-sm font-medium">{hotspot.title}</p>
          <p className="mt-1 text-xs text-paper/75">{hotspot.body}</p>
          <Popover.Arrow className="fill-ink" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
