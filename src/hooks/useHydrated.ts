"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` while the calling component is hydrating, `true` right after. Call it inside the
 * component that renders client-only UI (badges from localStorage etc.) — a flag from a
 * parent provider is not enough, because a provider outside a Suspense boundary can re-render
 * before the boundary itself hydrates and push post-hydration state into it.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
