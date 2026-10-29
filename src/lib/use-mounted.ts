import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and hydration, true after. Guards browser-only state like the persisted cart. */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
