"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state exposed through useSyncExternalStore, so server rendering and
 * hydration always see the initial value (no mismatches, even inside late-hydrating Suspense
 * boundaries) and the stored value takes over right after hydration. Cross-tab changes sync too.
 */
interface Store<T> {
  value: T;
  listeners: Set<() => void>;
  loaded: boolean;
  /** Writes a new value, persists it and notifies subscribers. */
  write: (next: T | ((prev: T) => T)) => void;
}

const stores = new Map<string, Store<unknown>>();

function getStore<T>(key: string, initial: T): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    const created: Store<T> = {
      value: initial,
      listeners: new Set(),
      loaded: false,
      write(next) {
        created.value = typeof next === "function" ? (next as (p: T) => T)(created.value) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(created.value));
        } catch {
          /* storage may be unavailable */
        }
        created.listeners.forEach((l) => l());
      },
    };
    store = created;
    stores.set(key, store as Store<unknown>);
  }
  if (!store.loaded && typeof window !== "undefined") {
    store.loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) store.value = JSON.parse(raw) as T;
    } catch {
      /* ignore corrupt or unavailable storage */
    }
    window.addEventListener("storage", (e) => {
      if (e.key !== key || !store) return;
      try {
        store.value = e.newValue ? (JSON.parse(e.newValue) as T) : initial;
        store.listeners.forEach((l) => l());
      } catch {
        /* ignore */
      }
    });
  }
  return store;
}

const subscribeHydration = () => () => {};

export function useLocalStorageState<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const store = getStore(key, initial);

  const value = useSyncExternalStore(
    useCallback(
      (onChange) => {
        store.listeners.add(onChange);
        return () => store.listeners.delete(onChange);
      },
      [store]
    ),
    () => store.value,
    () => initial
  );

  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );

  const set = useCallback((next: T | ((prev: T) => T)) => store.write(next), [store]);

  return [value, set, hydrated];
}
