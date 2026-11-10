import { useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed store for client state (settings, rules, history).
 *
 * - The server render and the first client render both use `fallback`
 *   (getServerSnapshot), then React swaps in the stored value. No hydration
 *   mismatch, no flash of wrong content in server HTML.
 * - Stays in sync across tabs through the `storage` event.
 * - If storage is unavailable (private mode, quota), it keeps working in memory.
 */
export function createLocalStore<T>(key: string, fallback: T, parse: (raw: unknown) => T) {
  let state: T | undefined;
  const listeners = new Set<() => void>();

  const load = () => {
    try {
      const raw = window.localStorage.getItem(key);
      state = raw ? parse(JSON.parse(raw)) : fallback;
    } catch {
      state = fallback;
    }
  };

  const get = (): T => {
    if (state === undefined) load();
    return state as T;
  };

  const emit = () => listeners.forEach((l) => l());

  const set = (next: T | ((prev: T) => T)) => {
    state = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* in-memory only */
    }
    emit();
  };

  const reset = () => {
    state = fallback;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    emit();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) {
        state = undefined;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  function useStore(): T {
    return useSyncExternalStore(subscribe, get, () => fallback);
  }

  return { key, get, set, reset, subscribe, useStore };
}

const noop = () => () => {};

/** true after hydration. Use to render browser-only details. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
