"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { railItems } from "@/data/rail";
import { garmentImage } from "@/lib/garment-image";
import { toLine, variantPrice } from "@/lib/product-utils";
import { formatPrice } from "@/lib/price";
import { nearestIndex, slideDistance, wrapIndex } from "@/lib/carousel-math";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/cn";

const items = railItems.slice(0, 7);
const n = items.length;
/** Degrees between neighbours on the wheel, and where the front piece sits. */
const STEP = 20;
const FRONT = -125;

interface OrbitProps {
  as?: "h1" | "h2";
}

/**
 * Pieces ride round a large wheel whose hub sits below the bottom right
 * corner. Drag the stage or the knurled wheel to turn it; it settles on the
 * nearest piece, which comes to the front at full size.
 */
export function Orbit({ as: Heading = "h2" }: OrbitProps) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const knurlRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 1440, h: 800 });
  const [active, setActive] = useState(1);
  // The size belongs to one piece: turning the wheel clears it.
  const [picked, setPicked] = useState<{ key: string; size: string } | null>(null);
  const motion = useRef({ pos: 1, target: 1, dragging: false, lastX: 0, lastY: 0, scale: 1 });
  const add = useCart((s) => s.add);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e!.contentRect.width, h: e!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = box.w < 768;
  const hub = narrow ? { x: box.w * 1.02, y: box.h * 1.02 } : { x: box.w * 0.8, y: box.h * 1.18 };
  const radius = narrow ? box.w * 0.88 : Math.min(box.w * 0.56, box.h * 1.15);
  const front = narrow ? Math.min(230, box.w * 0.58) : Math.min(330, box.w * 0.22);

  useEffect(() => {
    const m = motion.current;
    let raf = 0;
    let shown = -1;
    const place = () => {
      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const d = slideDistance(i, m.pos, n, true);
        const a = ((FRONT + d * STEP) * Math.PI) / 180;
        const x = hub.x + radius * Math.cos(a);
        const y = hub.y + radius * Math.sin(a);
        const s = Math.exp(-0.62 * Math.abs(d));
        const fade = Math.max(0, Math.min(1, 2.9 - Math.abs(d)));
        el.style.transform = `translate3d(${x - front / 2}px, ${y - front / 2}px, 0) scale(${s.toFixed(3)}) rotate(${(d * -6).toFixed(2)}deg)`;
        el.style.opacity = fade.toFixed(3);
        el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        el.style.visibility = fade < 0.01 ? "hidden" : "visible";
      }
      if (knurlRef.current) knurlRef.current.style.backgroundPosition = `0 0, ${(-m.pos * 46).toFixed(1)}px 0`;
      const now = nearestIndex(m.pos, n, true);
      if (now !== shown) {
        shown = now;
        setActive(now);
      }
    };
    const tick = () => {
      if (!m.dragging) m.pos += (m.target - m.pos) * (reducedMotion ? 1 : 0.12);
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hub.x, hub.y, radius, front, reducedMotion]);

  const startDrag = (e: React.PointerEvent, scale: number) => {
    const m = motion.current;
    m.dragging = true;
    m.lastX = e.clientX;
    m.lastY = e.clientY;
    m.scale = scale;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const m = motion.current;
    if (!m.dragging) return;
    // Up and to the right both turn the wheel forward, like the arc itself.
    const delta = (e.clientX - m.lastX - (e.clientY - m.lastY) * 0.6) / m.scale;
    m.pos -= delta;
    m.lastX = e.clientX;
    m.lastY = e.clientY;
  };
  const endDrag = () => {
    const m = motion.current;
    if (!m.dragging) return;
    m.dragging = false;
    m.target = Math.round(m.pos);
  };
  const go = (step: number) => {
    const m = motion.current;
    m.target = Math.round(m.target) + step;
  };
  const goTo = (i: number) => {
    const m = motion.current;
    m.target = m.pos + slideDistance(i, m.pos, n, true);
  };

  const item = items[active]!;
  const price = variantPrice(item.product, item.variant);
  const size = picked?.key === item.key ? picked.size : null;

  return (
    <section aria-labelledby="orbit-title" aria-roledescription="carousel" className="relative overflow-hidden bg-paper">
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") go(1);
          else if (e.key === "ArrowLeft" || e.key === "ArrowDown") go(-1);
          else return;
          e.preventDefault();
        }}
        onPointerDown={(e) => startDrag(e, 150)}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label={`Showing ${item.product.name} in ${item.variant.name}. Use the arrow keys to turn the wheel.`}
        className="relative h-[clamp(40rem,calc(100svh-104px),54rem)] cursor-grab touch-pan-y select-none active:cursor-grabbing focus-visible:outline-offset-[-2px]"
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx={hub.x} cy={hub.y} r={radius + front * 0.12} fill="none" stroke="#e6e6e6" strokeWidth="1" />
          <circle cx={hub.x} cy={hub.y} r={radius * 0.8} fill="none" stroke="#d6d6d6" strokeWidth="1" strokeDasharray="2 5" />
        </svg>

        {items.map((it, i) => {
          const image = garmentImage(it.product, it.variant);
          return (
            <div
              key={it.key}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 will-change-transform"
              style={{ width: front, height: front, opacity: 0 }}
              aria-hidden={i !== active}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={() => goTo(i)}
                className={cn("group relative block size-full", i === active && "animate-[orbit-float_5s_ease-in-out_infinite] motion-reduce:animate-none")}
                aria-label={`Turn to ${it.product.name} in ${it.variant.name}`}
              >
                <span className="absolute inset-x-[14%] bottom-[2%] h-[7%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.28),transparent)]" />
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="380px"
                  draggable={false}
                  className={cn("object-contain p-[6%] pb-[10%]", image.part === "bottom" && "p-[10%] pb-[12%]")}
                />
              </button>
            </div>
          );
        })}

        <div className="pointer-events-none absolute top-[9%] left-4 z-[150] sm:left-16">
          <p className="tabular text-[11px] tracking-[0.2em] text-ink-soft" aria-hidden="true">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </p>
          <Heading
            id="orbit-title"
            key={item.key}
            className="mt-2 animate-[pop-in_420ms_var(--ease-out-quint)] text-[40px] leading-[0.95] font-bold tracking-[-0.01em] text-[#111] uppercase sm:text-[64px]"
          >
            {item.product.name}
          </Heading>
          <p className="mt-1 text-sm text-ink-soft">{item.variant.name}</p>
          <p className="tabular mt-3 text-lg font-bold">{formatPrice(price)}</p>
          <Link
            href={`/products/${item.product.slug}?color=${item.variant.id}`}
            className="pointer-events-auto mt-4 inline-flex items-center gap-2.5 border-b border-ink pb-1 text-[13px] font-semibold"
          >
            View details <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>

        {/* The wheel control: drag it sideways to turn. */}
        <div className="absolute bottom-6 left-1/2 z-[150] w-[min(320px,80vw)] -translate-x-1/2 text-center sm:bottom-6">
          <span className="mx-auto mb-2 block size-1 rounded-full bg-[#e5482b]" aria-hidden="true" />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Turn the wheel"
            aria-valuemin={1}
            aria-valuemax={n}
            aria-valuenow={active + 1}
            aria-valuetext={`${item.product.name}, ${active + 1} of ${n}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") go(1);
              else if (e.key === "ArrowLeft" || e.key === "ArrowDown") go(-1);
              else return;
              e.preventDefault();
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              startDrag(e, 46);
            }}
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative h-[26px] cursor-ew-resize touch-none rounded-pill border border-[#cfcfcf] bg-white p-[3px] shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)]"
          >
            <span
              ref={knurlRef}
              className="block h-full rounded-pill bg-[linear-gradient(90deg,#111_0%,#5a5a5a_8%,#f2f2f2_30%,#ffffff_50%,#f2f2f2_70%,#5a5a5a_92%,#111_100%),repeating-linear-gradient(90deg,transparent_0_21px,rgb(0_0_0/0.35)_21px_23px)] [background-blend-mode:multiply] [background-size:100%_100%,46px_100%]"
            />
          </div>
          <p className="mt-2 flex justify-between text-[9px] tracking-[0.2em] text-ink-soft" aria-hidden="true">
            <span>01</span>
            <span>Drag the wheel</span>
            <span>{String(n).padStart(2, "0")}</span>
          </p>
        </div>
      </div>

      <div className="z-[150] mx-4 -mt-2 pb-10 sm:absolute sm:right-16 sm:bottom-12 sm:mx-0 sm:mt-0 sm:w-[360px] sm:pb-0">
        <ul className="grid grid-cols-4 gap-2" aria-label="Size">
          {item.variant.sizes.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                disabled={s.stock === 0}
                aria-pressed={size === s.label}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setPicked({ key: item.key, size: s.label })}
                className="tabular h-12 w-full rounded-[3px] border border-[#ddd] bg-white text-[15px] font-bold transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper disabled:text-ink-faint disabled:line-through disabled:hover:border-[#ddd]"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={!size}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => size && add([toLine(item.product, item.variant, size)])}
          className="mt-2 h-12 w-full bg-ink text-sm font-medium text-paper transition-opacity disabled:opacity-0"
          tabIndex={size ? 0 : -1}
        >
          Add {size} to bag
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {wrapIndex(active, n) + 1} of {n}: {item.product.name}, {item.variant.name}
      </p>
    </section>
  );
}
