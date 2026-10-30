/**
 * next/image loader with no server work: model, look and garment photos come
 * in two pre-made sizes (scripts/process-models.py, process-garments.py), so
 * this only picks the file. Anything else is served as is.
 */
const PRESIZED = /^\/(models|looks|garments)\/.+\.webp$/;

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (PRESIZED.test(src) && !src.endsWith("-sm.webp") && width <= 400) {
    return src.replace(/\.webp$/, "-sm.webp");
  }
  return src;
}
