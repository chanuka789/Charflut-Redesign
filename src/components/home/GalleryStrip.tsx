import Link from "next/link";
import Image from "next/image";
import { looks } from "@/data/looks";

/** Tinted backdrops, one per look, drawn from the outfit's own colours. */
const tints = ["#d9d6cf", "#e7dfd2", "#d8c8bb", "#d5d8d6", "#cfd6de", "#d6dacb"];

export function GalleryStrip({ title }: { title: string }) {
  return (
    <section aria-labelledby="gallery-title" className="bg-paper pt-[76px] pb-20">
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:scroll-px-10 sm:px-10">
        {looks.map((look, i) => (
          <li key={look.id} className="w-[78vw] shrink-0 snap-start sm:w-[430px]">
            <Link href="/runway" className="group relative block aspect-[430/536] overflow-hidden" style={{ background: tints[i % tints.length] }}>
              <span className="absolute inset-x-[10%] bottom-[5%] h-[3%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.22),transparent)]" />
              <Image
                src={look.image.src}
                alt={look.image.alt}
                fill
                sizes="(min-width: 640px) 430px, 78vw"
                className="object-contain object-bottom pt-[6%] pb-[5%] transition-transform duration-700 [transition-timing-function:var(--ease-out-quint)] group-hover:scale-[1.04]"
              />
              <span className="absolute top-5 left-5 text-[11px] font-semibold tracking-[0.17em] uppercase">
                {String(i + 1).padStart(2, "0")} {look.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 id="gallery-title" className="display-type mt-16 text-center text-[32px] leading-none uppercase sm:text-[40px]">
        {title}
      </h2>
    </section>
  );
}
