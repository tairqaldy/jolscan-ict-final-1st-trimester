/** Deterministic PRNG (mulberry32). Same seed, same sequence, on server and client. */
export function createRng(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min: number, max: number) => min + next() * (max - min),
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    pick: <T,>(items: readonly T[]) => items[Math.floor(next() * items.length)],
    weighted: <T,>(items: readonly (readonly [T, number])[]) => {
      const total = items.reduce((sum, [, w]) => sum + w, 0);
      let r = next() * total;
      for (const [item, w] of items) {
        r -= w;
        if (r <= 0) return item;
      }
      return items[items.length - 1][0];
    },
  };
}

/** Stable 32-bit hash of a string or bytes (FNV-1a). */
export function hash32(input: string | Uint8Array): number {
  let h = 0x811c9dc5;
  const len = input.length;
  for (let i = 0; i < len; i++) {
    const c = typeof input === "string" ? input.charCodeAt(i) : input[i];
    h ^= c;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
