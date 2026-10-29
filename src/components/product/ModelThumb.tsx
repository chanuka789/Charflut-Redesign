import Image from "next/image";
import { cn } from "@/lib/cn";

/** Square crop of a model photo, used in the bag and in "Complete the look". */
export function ModelThumb({ src, focus, className }: { src: string; focus: string; className?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-sm bg-paper-sunk/70", className)}>
      <Image src={src} alt="" fill sizes="80px" className="scale-[1.9] object-cover" style={{ objectPosition: focus, transformOrigin: focus }} />
    </div>
  );
}
