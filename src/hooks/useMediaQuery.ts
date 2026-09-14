"use client";

import { useSyncExternalStore } from "react";

/** SSR-safe media query hook; returns `false` on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
export const useCanHover = () => useMediaQuery("(hover: hover) and (pointer: fine)");
