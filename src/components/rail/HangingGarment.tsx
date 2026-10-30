import Image from "next/image";
import type { GarmentImage } from "@/lib/garment-image";
import { cn } from "@/lib/cn";

interface HangingGarmentProps {
  image: GarmentImage;
  /** Shown on the paper tag tied to the hook; no tag when left out. */
  price?: string;
  /** Hook length as a share of the garment width. */
  hook?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * One garment on a hanger: a wire hook, a wooden hanger for tops or a clip
 * bar for trousers, and a price tag. It fills the width of its parent and
 * swings from the top of the hook (the parent sets the animation).
 */
export function HangingGarment({ image, price, hook = 0.36, sizes, priority, className }: HangingGarmentProps) {
  const top = image.part === "top";
  return (
    <div className={cn("relative [container-type:inline-size]", className)}>
      <div className="relative" style={{ paddingTop: `${hook * 100}%` }}>
        {/* Behind the garment: the wooden hanger, seen only through the neck opening. */}
        {top && (
          <svg viewBox={`0 0 100 ${hook * 100 + 20}`} className="absolute inset-x-0 top-0 w-full overflow-visible" aria-hidden="true">
            <path
              d={`M13 ${hook * 100 + 13} Q50 ${hook * 100 - 3} 87 ${hook * 100 + 13}`}
              fill="none"
              stroke="#6d4129"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        )}
        {/* In front: the wire hook, and the clip bar for trousers. */}
        <svg viewBox={`0 0 100 ${hook * 100 + 6}`} className="absolute inset-x-0 top-0 z-10 w-full overflow-visible" aria-hidden="true">
          <path
            d={`M50 ${hook * 100 + (top ? 4 : 1)} V5.5 a3.4 3.4 0 1 0 -3.4 -3.4`}
            fill="none"
            stroke="#8d9195"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
          {top ? (
            <rect x="47" y={hook * 100 - 1.5} width="6" height="5.5" rx="1.6" fill="#7a4a2e" />
          ) : (
            <g>
              <rect x="17" y={hook * 100 - 1} width="66" height="2.2" rx="1.1" fill="#a3a7ab" />
              <rect x="22" y={hook * 100 - 0.5} width="4.5" height="6" rx="1" fill="#55595d" />
              <rect x="73.5" y={hook * 100 - 0.5} width="4.5" height="6" rx="1" fill="#55595d" />
            </g>
          )}
        </svg>

        {price && (
          <span
            className="absolute z-20 flex origin-[18%_0] rotate-[-9deg] items-center gap-[0.18em] rounded-[0.35em] bg-white px-[0.6em] py-[0.42em] text-[max(8px,7.6cqw)] leading-none font-bold tracking-[0.06em] text-[#2b2b28] shadow-[0_0.15em_0.5em_rgb(0_0_0/0.18)] transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] group-hover:rotate-[4deg]"
            style={{ left: "57%", top: top ? "52%" : "62%" }}
          >
            <span className="absolute top-[0.25em] left-1/2 size-[0.32em] -translate-x-1/2 rounded-full bg-[#c9c6bf]" />
            <span className="pt-[0.3em]">{price}</span>
          </span>
        )}
      </div>

      <div className="relative -mt-[2%]" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain object-top drop-shadow-[0_10px_14px_rgb(0_0_0/0.18)]"
          draggable={false}
        />
      </div>
    </div>
  );
}
