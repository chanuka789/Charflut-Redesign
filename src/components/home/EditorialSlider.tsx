"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

const SLIDE_MS = 6500;

const slides = [
  {
    id: "built",
    title: "Built to Last",
    body: "Heavyweight cotton that softens with wear and never loses its shape.",
    href: "/products/loop-hoodie?color=washed-black",
    image: "/looks/city-edit.webp",
    background: "radial-gradient(70% 90% at 50% 30%, #f1f1f1 0%, #c9cacc 55%, #9a9c9f 100%)",
  },
  {
    id: "quiet",
    title: "Quiet Colour",
    body: "Moss, stone and bone: shades picked to wear together, season after season.",
    href: "/runway",
    image: "/looks/market-day.webp",
    background: "radial-gradient(70% 90% at 50% 30%, #efe5d6 0%, #c8b294 55%, #8d7458 100%)",
  },
];

/**
 * Full-bleed editorial slides: a close crop of a look with a motion streak
 * behind it, a serif title and a slim progress bar.
 */
export function EditorialSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % slides.length), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, reducedMotion]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Stories"
      className="relative h-[clamp(32rem,100svh,58rem)] overflow-hidden bg-ink text-white"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}`}
          aria-hidden={i !== active}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            i === active ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          style={{ background: s.background }}
        >
          <div className={cn("absolute inset-0 origin-[60%_20%]", i === active && "animate-[ken-burns_9s_ease-out_forwards] motion-reduce:animate-none")}>
            {/* Motion streak: a blurred copy of the figure dragged out to the left. */}
            <div className="absolute top-[5%] left-[54%] aspect-[2/5] h-[165%] origin-right -translate-x-[78%] scale-x-[2.2] opacity-55 blur-[18px] [mask-image:linear-gradient(90deg,transparent,black_45%,black_70%,transparent)] max-sm:left-[62%]">
              <Image src={s.image} alt="" fill sizes="40vw" className="object-contain object-top" />
            </div>
            <div className="absolute top-[5%] left-[54%] aspect-[2/5] h-[165%] -translate-x-1/2 max-sm:left-[62%]">
              <Image src={s.image} alt="" fill sizes="(min-width: 640px) 40vw, 90vw" priority={i === 0} className="object-contain object-top" />
            </div>
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.45),transparent_45%)]" />

          <div className="absolute bottom-[19%] left-4 max-w-md sm:left-8">
            <h2 className="font-serif text-[44px] leading-none tracking-[-0.01em] sm:text-[52px]">{s.title}</h2>
            <p className="mt-6 text-[13px] text-white/90">{s.body}</p>
            <Link
              href={s.href}
              tabIndex={i === active ? 0 : -1}
              className="mt-10 inline-block border-b border-white/80 pb-1 text-xs font-medium tracking-[0.14em] uppercase"
            >
              Shop now
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-4 bottom-[7%] flex items-center justify-between sm:inset-x-8">
        <ol className="flex items-center gap-2" aria-label="Choose a slide">
          {slides.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}: ${s.title}`}
                aria-current={i === active ? "true" : undefined}
                className="group grid h-6 place-items-center"
              >
                <span
                  className={cn(
                    "relative block h-[3px] overflow-hidden rounded-pill bg-white/35 transition-[width] duration-500",
                    i === active ? "w-14" : "w-1",
                  )}
                >
                  {i === active && (
                    <span
                      key={`${active}-${paused}`}
                      className={cn(
                        "absolute inset-0 origin-left bg-white",
                        paused || reducedMotion ? "scale-x-100" : "animate-[progress_6.5s_linear_forwards]",
                      )}
                    />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="tabular text-xs tracking-[0.12em]" aria-live="polite">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <span className="text-white/55"> / {String(slides.length).padStart(2, "0")}</span>
        </p>
      </div>
    </section>
  );
}
