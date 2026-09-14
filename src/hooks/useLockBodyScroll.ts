"use client";

import { useEffect } from "react";

let locks = 0;

/** Prevents background scrolling while a modal/drawer is open (reference-counted). */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      locks--;
      if (locks === 0) document.body.style.overflow = prev;
    };
  }, [active]);
}
