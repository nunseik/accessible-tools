"use client";
import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // The service worker caches an immutable production build. In development,
    // Next's HMR regenerates chunks with new hashes on every recompile, so a
    // SW that caches and claims clients fights Fast Refresh and causes reload
    // loops. Only register in production; in dev, unregister any stale worker
    // left over from a previous prod-like run so the page stops looping.
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration is best-effort
      });
    } else {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
    }
  }, []);

  return null;
}
