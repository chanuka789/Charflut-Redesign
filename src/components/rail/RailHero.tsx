"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { railItems, type RailItem } from "@/data/rail";
import { garmentImage } from "@/lib/garment-image";
import { variantPrice } from "@/lib/product-utils";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";
import { HangingGarment } from "./HangingGarment";
import { QuickView, type QuickViewItem } from "./QuickView";

const scenes = {
  // Soft studio wash: pale stone at the top, lilac to the right, mint and blue at the floor.
  studio: {
    background:
      "radial-gradient(55% 55% at 8% 100%, #a8dc9c 0%, rgb(168 220 156 / 0) 70%), radial-gradient(45% 65% at 100% 95%, #7489c2 0%, rgb(116 137 194 / 0) 72%), radial-gradient(45% 55% at 100% 15%, #c6addb 0%, rgb(198 173 219 / 0) 70%), radial-gradient(60% 50% at 40% 10%, #ece4e6 0%, rgb(236 228 230 / 0) 75%), linear-gradient(180deg, #e7e5e1 0%, #dcd9cf 100%)",
    ink: "text-[#0b0b0b]",
    rail: ["#8f949a", "#f4f5f6", "#6c7177"],
  },
  // Open sky over a sand floor.
  sky: {
    background:
      "radial-gradient(30% 12% at 22% 18%, rgb(255 255 255 / 0.75) 0%, rgb(255 255 255 / 0) 100%), radial-gradient(28% 10% at 70% 26%, rgb(255 255 255 / 0.6) 0%, rgb(255 255 255 / 0) 100%), radial-gradient(40% 9% at 45% 48%, rgb(255 255 255 / 0.45) 0%, rgb(255 255 255 / 0) 100%), linear-gradient(180deg, #2f6fc4 0%, #5b97dc 38%, #a9cbe9 62%, #e6dcbf 70%, #d9c79c 84%, #cdb98a 100%)",
    ink: "text-white",
    rail: ["#a7adb4", "#ffffff", "#7b828a"],
  },
} as const;

interface RailHeroProps {
  scene?: keyof typeof scenes;
  /** The page's h1, or an h2 when the hero sits further down a page. */
  as?: "h1" | "h2";
}

export function RailHero({ scene = "studio", as: Heading = "h1" }: RailHeroProps) {
  const look = scenes[scene];
  const gradientId = useId();
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 1440, h: 796 });
  const [peek, setPeek] = useState<QuickViewItem | null>(null);
  const motion = useRef({ offset: 0, velocity: 0, dragging: false, hovering: false, moved: 0, lastX: 0, lastT: 0 });

  // Enough copies of the rail to cover any screen with room to wrap round.
  const items: (RailItem & { slot: number })[] = [...railItems, ...railItems].map((it, slot) => ({ ...it, slot }));
  const n = items.length;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e!.contentRect.width, h: e!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spacing = Math.max(112, Math.min(176, box.w / 9.2));
  const itemW = spacing * 0.9;
  const railY = box.h * 0.3;
  const sag = Math.min(46, box.h * 0.055);
  const railYAt = (x: number) => {
    const t = Math.min(1, Math.max(0, x / box.w));
    return railY + 4 * sag * t * (1 - t);
  };

  // Places every hanger along the curved rail for the current offset.
  useEffect(() => {
    const m = motion.current;
    const total = n * spacing;
    let raf = 0;
    const place = () => {
      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const x = ((((i * spacing - m.offset) % total) + total) % total) - spacing;
        const t = x / box.w;
        const depth = 0.9 + 0.14 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
        el.style.transform = `translate3d(${x - itemW / 2}px, ${railYAt(x) - 4}px, 0) scale(${depth.toFixed(3)})`;
        el.style.zIndex = String(Math.round(depth * 100));
      }
      if (barRef.current) {
        const progress = (((m.offset % (total / 2)) + total / 2) % (total / 2)) / (total / 2);
        barRef.current.style.transform = `scaleX(${(0.12 + progress * 0.88).toFixed(3)})`;
      }
    };
    const tick = () => {
      if (!m.dragging) {
        const drift = reducedMotion || m.hovering ? 0 : 0.35;
        m.velocity += (drift - m.velocity) * 0.04;
        m.offset += m.velocity;
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    place();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // railYAt only depends on box, already listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box, spacing, itemW, n, reducedMotion]);

  const onPointerDown = (e: React.PointerEvent) => {
    const m = motion.current;
    m.dragging = true;
    m.moved = 0;
    m.lastX = e.clientX;
    m.lastT = performance.now();
    m.velocity = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const m = motion.current;
    if (!m.dragging) return;
    const dx = e.clientX - m.lastX;
    const now = performance.now();
    m.moved += Math.abs(dx);
    if (m.moved > 6 && !stageRef.current?.hasPointerCapture(e.pointerId)) stageRef.current?.setPointerCapture(e.pointerId);
    m.offset -= dx;
    m.velocity = (-dx / Math.max(1, now - m.lastT)) * 16;
    m.lastX = e.clientX;
    m.lastT = now;
  };
  const endDrag = () => {
    motion.current.dragging = false;
  };

  const railPath = `M0 ${railY} Q ${box.w / 2} ${railY + 2 * sag} ${box.w} ${railY}`;

  return (
    <section
      aria-labelledby={`${gradientId}-title`}
      className={cn("relative isolate overflow-hidden", look.ink)}
      style={{ background: look.background }}
    >
      <div
        ref={stageRef}
        className="relative h-[clamp(36rem,calc(100svh-104px),56rem)] cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => (motion.current.hovering = true)}
        onPointerLeave={() => {
          motion.current.hovering = false;
          endDrag();
        }}
      >
        <Heading
          id={`${gradientId}-title`}
          className="eyebrow absolute top-[9%] left-1/2 z-[200] flex -translate-x-1/2 items-center gap-4 whitespace-nowrap"
        >
          <span>New collection</span>
          <span className="h-4 w-px bg-current opacity-30" aria-hidden="true" />
          <span className="opacity-55">Premium streetwear</span>
        </Heading>

        <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id={`${gradientId}-rail`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={look.rail[0]} />
              <stop offset="0.45" stopColor={look.rail[1]} />
              <stop offset="1" stopColor={look.rail[2]} />
            </linearGradient>
          </defs>
          <path d={railPath} transform="translate(0 3)" fill="none" stroke="rgb(0 0 0 / 0.12)" strokeWidth="9" />
          <path d={railPath} fill="none" stroke={`url(#${gradientId}-rail)`} strokeWidth="9" strokeLinecap="round" />
        </svg>

        <ul aria-label="Pieces on the rail" className="absolute inset-0 z-[2]">
          {items.map((it, i) => {
            const image = garmentImage(it.product, it.variant);
            const bottom = image.part === "bottom";
            return (
              <li key={`${it.key}-${it.slot}`}>
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  tabIndex={it.slot >= railItems.length ? -1 : 0}
                  aria-hidden={it.slot >= railItems.length || undefined}
                  aria-label={`${it.product.name} in ${it.variant.name}, $${Math.round(variantPrice(it.product, it.variant))}. Look closer`}
                  onClick={() => {
                    if (motion.current.moved > 6) return;
                    setPeek({ product: it.product, variant: it.variant });
                  }}
                  className="group absolute top-0 left-0 origin-top will-change-transform focus-visible:outline-offset-4"
                  style={{ width: itemW }}
                >
                  <span
                    className="block origin-top animate-[sway_var(--sway-time)_ease-in-out_infinite] motion-reduce:animate-none"
                    style={
                      {
                        "--sway": `${0.8 + (i % 3) * 0.35}deg`,
                        "--sway-time": `${4.2 + (i % 4) * 0.6}s`,
                        animationDelay: `${-(i * 0.7)}s`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="block origin-top transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] group-hover:-translate-y-1.5 group-hover:animate-[nudge_1.4s_ease-out]">
                      <HangingGarment
                        image={image}
                        price={`$${Math.round(variantPrice(it.product, it.variant))}`}
                        sizes="180px"
                        priority={i < 12}
                        className={cn("mx-auto", bottom && "w-[62%]")}
                        hook={bottom ? 0.58 : 0.36}
                      />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="absolute inset-x-0 bottom-0 z-[200] flex items-end justify-between gap-6 px-4 pb-10 sm:px-10 sm:pb-12">
          <p className="hidden items-center gap-4 text-[12.6px] tracking-[0.03em] opacity-70 sm:flex">
            <span className="h-px w-[22px] bg-current" aria-hidden="true" />
            Hover a piece · click to look closer
          </p>
          <span className="absolute bottom-14 left-1/2 hidden h-[2px] w-[140px] -translate-x-1/2 overflow-hidden bg-current/25 sm:block" aria-hidden="true">
            <span ref={barRef} className="block h-full origin-left bg-current" />
          </span>
          <div className="ml-auto text-right">
            <p className="text-base leading-5 font-semibold tracking-[0.012em]">
              Crafted in heavyweight cotton.
              <br />
              Cut wide. Made to last.
            </p>
            <Link
              href="/collections/all"
              className="mt-5 inline-flex items-center gap-2.5 border-b border-current pb-1 text-xs font-medium tracking-[0.03em]"
            >
              Shop the Collection <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>

      <QuickView item={peek} onClose={() => setPeek(null)} />
    </section>
  );
}
