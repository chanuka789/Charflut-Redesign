"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import type { ModelGender, Product } from "@/lib/schema";
import { nearestIndex, shortestDelta, slideDepth, slideDistance, wrapIndex } from "@/lib/carousel-math";
import { ModelFigure } from "@/components/figure/ModelFigure";
import { cn } from "@/lib/cn";
import { Hotspot } from "./Hotspot";

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

const AUTOPLAY_MS = 5000;

interface Layout {
  spacing: number;
  radius: number;
  maxBlur: number;
}

function layoutFor(width: number): Layout {
  // Phones: one model with neighbours peeking in at the edges.
  if (width < 480) return { spacing: width * 0.6, radius: 1, maxBlur: 3 };
  // Narrow stages (small tablets, the 1024px two-column layout): three models.
  if (width < 800) return { spacing: width * 0.31, radius: 1, maxBlur: 4 };
  if (width < 1100) return { spacing: width * 0.25, radius: 2, maxBlur: 5 };
  return { spacing: width * 0.205, radius: 2, maxBlur: 6 };
}

interface VariantCarouselProps {
  product: Product;
  gender: ModelGender;
  active: number;
  onActiveChange: (index: number) => void;
  reducedMotion: boolean;
}

export function VariantCarousel({ product, gender, active, onActiveChange, reducedMotion }: VariantCarouselProps) {
  const { variants } = product;
  const n = variants.length;
  const loop = n > 2;

  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef({ value: active });
  const layout = useRef<Layout>({ spacing: 260, radius: 2, maxBlur: 6 });
  const dragging = useRef(false);
  // The index this component last reported (or is travelling to), so an
  // `active` prop that merely echoes it back doesn't restart the motion.
  const reported = useRef(active);
  const autoplayStep = useRef(false);
  const draggable = useRef<Draggable | null>(null);

  const [settled, setSettled] = useState(true);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [hovering, setHovering] = useState(false);

  const onChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onChangeRef.current = onActiveChange;
  });

  const render = useCallback(() => {
    const p = pos.current.value;
    const nearest = nearestIndex(p, n, loop);
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = slideDistance(i, p, n, loop);
      const depth = slideDepth(d, layout.current);
      gsap.set(el, {
        xPercent: -50,
        x: depth.x,
        y: depth.y,
        scale: depth.scale,
        opacity: depth.opacity,
        zIndex: depth.zIndex,
        filter: depth.blur > 0.2 ? `blur(${depth.blur.toFixed(2)}px)` : "none",
        visibility: depth.visible ? "visible" : "hidden",
      });
      el.dataset.active = String(i === nearest);
    });
    if (dragging.current && nearest !== reported.current) {
      reported.current = nearest;
      onChangeRef.current(nearest);
    }
  }, [n, loop]);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const measure = () => {
        layout.current = layoutFor(stage.clientWidth);
        render();
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(stage);

      const proxy = document.createElement("div");
      const snapX = (x: number) => Math.round(x / layout.current.spacing) * layout.current.spacing;

      const settle = () => {
        dragging.current = false;
        if (loop) pos.current.value = wrapIndex(Math.round(pos.current.value), n);
        else pos.current.value = Math.round(pos.current.value);
        render();
        setSettled(true);
      };

      const [d] = Draggable.create(proxy, {
        type: "x",
        trigger: stage,
        inertia: !reducedMotion,
        minimumMovement: 6,
        zIndexBoost: false,
        allowContextMenu: true,
        ...(loop
          ? {}
          : { bounds: { minX: -(n - 1) * layout.current.spacing, maxX: 0 }, edgeResistance: 0.8 }),
        snap: { x: snapX },
        onPress() {
          gsap.killTweensOf(pos.current);
          gsap.set(proxy, { x: -pos.current.value * layout.current.spacing });
          this.update();
        },
        onDragStart() {
          dragging.current = true;
          setSettled(false);
          setPlaying(false);
        },
        onDrag() {
          pos.current.value = -this.x / layout.current.spacing;
          render();
        },
        onThrowUpdate() {
          pos.current.value = -this.x / layout.current.spacing;
          render();
        },
        onThrowComplete: settle,
        onDragEnd() {
          if (reducedMotion) {
            pos.current.value = -snapX(this.x) / layout.current.spacing;
            render();
            settle();
          }
        },
        onClick(e: PointerEvent) {
          // A tap on a side model brings it to the front.
          const el = (e.target as HTMLElement).closest<HTMLElement>("[data-slide]");
          if (!el) return;
          const i = Number(el.dataset.slide);
          if (i !== nearestIndex(pos.current.value, n, loop)) {
            setPlaying(false);
            reported.current = i;
            onChangeRef.current(i);
          }
        },
      });
      draggable.current = d ?? null;

      const tweened = pos.current;
      return () => {
        ro.disconnect();
        d?.kill();
        // travelTo() tweens are started from handlers, outside this context.
        gsap.killTweensOf(tweened);
      };
    },
    { scope: stageRef, dependencies: [n, loop, reducedMotion, render], revertOnUpdate: true },
  );

  const travelTo = useCallback(
    (index: number) => {
    const from = pos.current.value;
    const target = Math.round(from) + shortestDelta(nearestIndex(from, n, loop), index, n, loop);
    gsap.killTweensOf(pos.current);
    if (reducedMotion) {
      pos.current.value = target;
      render();
      return;
    }
    setSettled(false);
    gsap.to(pos.current, {
      value: target,
      duration: Math.min(1.1, 0.55 + Math.abs(target - from) * 0.12),
      ease: "expo.out",
      onUpdate: render,
      onComplete: () => {
        if (loop) pos.current.value = wrapIndex(Math.round(pos.current.value), n);
        render();
        setSettled(true);
      },
    });
    },
    [n, loop, reducedMotion, render],
  );

  // Follow `active` when it changes from outside (swatches, arrows, URL, autoplay).
  useEffect(() => {
    const here = nearestIndex(pos.current.value, n, loop);
    if (active === here && !dragging.current) return;
    if (dragging.current) return;
    if (!autoplayStep.current && active !== reported.current) setPlaying(false);
    autoplayStep.current = false;
    reported.current = active;
    travelTo(active);
  }, [active, n, loop, travelTo]);

  // Re-render when the model set changes (men / women), the motion stays put.
  useEffect(() => {
    render();
  }, [gender, render]);

  // Autoplay: one step every 5s. Stops for good once someone takes over.
  useEffect(() => {
    if (!playing || hovering || reducedMotion) return;
    const t = window.setTimeout(() => {
      if (document.hidden) return;
      autoplayStep.current = true;
      const next = wrapIndex(active + 1, n);
      reported.current = next;
      onChangeRef.current(next);
      travelTo(next);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [playing, hovering, reducedMotion, active, n, travelTo]);

  const step = (dir: -1 | 1) => {
    setPlaying(false);
    const next = loop ? wrapIndex(active + dir, n) : Math.min(n - 1, Math.max(0, active + dir));
    reported.current = next;
    onActiveChange(next);
    travelTo(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else return;
    e.preventDefault();
  };

  const current = variants[active]!;
  const autoplayRunning = playing && !hovering && !reducedMotion;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${product.name} colours`}
      className="relative flex h-full flex-col"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`Showing ${current.name}. Use the left and right arrow keys to change colour.`}
        className="studio-floor relative h-[clamp(25rem,60svh,46rem)] w-full cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing focus-visible:outline-offset-[-2px] md:h-[clamp(28rem,56svh,44rem)]"
        data-testid="carousel-stage"
      >
        {variants.map((v, i) => {
          const img = v.images[gender];
          const isActive = i === active;
          return (
            <div
              key={v.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              data-slide={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${v.name}, ${i + 1} of ${n}`}
              aria-hidden={!isActive}
              className="absolute bottom-[4%] left-1/2 aspect-[2/5] h-[88%] origin-bottom will-change-transform"
            >
              <div className="absolute inset-0">
                {img ? (
                  <Image
                    src={img.src}
                    alt={isActive ? img.alt : ""}
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 640px) 26vw, 60vw"
                    className="object-contain object-bottom"
                    priority={isActive}
                    draggable={false}
                  />
                ) : (
                  <ModelFigure
                    garment={product.garment}
                    color={v.hex}
                    gender={gender}
                    personaIndex={i}
                    className="h-full w-full"
                  />
                )}
              </div>
              {isActive && settled && product.hotspots.length > 0 && (
                <div className="absolute inset-0">
                  {product.hotspots.map((h) => (
                    <Hotspot key={h.id} hotspot={h} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <p className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-pill bg-paper-raised/80 px-3 py-1.5 text-2xs text-ink-soft backdrop-blur md:hidden">
          Swipe to change colour
        </p>
      </div>

      <div className="flex items-center gap-3 px-4 pt-4 pb-1 sm:gap-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!loop && active === 0}
          className="grid size-11 shrink-0 place-items-center rounded-pill border border-line-strong transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
          aria-label="Previous colour"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
        </button>

        <ol className="flex min-w-0 flex-1 items-end gap-1.5" aria-label="Colours">
          {variants.map((v, i) => (
            <li key={v.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  if (i === active) return;
                  setPlaying(false);
                  reported.current = i;
                  onActiveChange(i);
                  travelTo(i);
                }}
                className="group block w-full py-2 text-left"
                aria-label={`${v.name}${i === active ? ", current" : ""}`}
                aria-current={i === active ? "true" : undefined}
              >
                <span
                  className={cn(
                    "mb-2 hidden truncate text-2xs transition-colors md:block",
                    i === active ? "text-ink" : "text-ink-faint group-hover:text-ink-soft",
                  )}
                >
                  {v.name}
                </span>
                <span className="relative block h-[2px] overflow-hidden rounded-pill bg-line">
                  <span
                    key={`${active}-${autoplayRunning}`}
                    className={cn(
                      "absolute inset-y-0 left-0 w-full origin-left rounded-pill bg-ink",
                      i < active && "scale-x-100",
                      i > active && "scale-x-0",
                      i === active && (autoplayRunning ? "animate-[progress_5s_linear_forwards]" : "scale-x-100"),
                    )}
                  />
                </span>
              </button>
            </li>
          ))}
        </ol>

        <span className="tabular shrink-0 text-xs text-ink-soft md:hidden" aria-hidden="true">
          {active + 1}/{n}
        </span>

        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="grid size-11 shrink-0 place-items-center rounded-pill text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
            aria-label={playing ? "Pause colour slideshow" : "Play colour slideshow"}
            aria-pressed={!playing}
          >
            {playing ? <Pause className="size-4" strokeWidth={1.5} /> : <Play className="size-4" strokeWidth={1.5} />}
          </button>
        )}

        <button
          type="button"
          onClick={() => step(1)}
          disabled={!loop && active === n - 1}
          className="grid size-11 shrink-0 place-items-center rounded-pill border border-line-strong transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
          aria-label="Next colour"
        >
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
