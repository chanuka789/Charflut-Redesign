/**
 * next/image loader with no server work: model photos come in two pre-made
 * sizes (scripts/process-models.py), so this only picks the file. Anything
 * else is served as is.
 */
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (src.startsWith("/models/") && src.endsWith(".webp") && width <= 400) {
    return src.replace(/\.webp$/, "-sm.webp");
  }
  return src;
}
