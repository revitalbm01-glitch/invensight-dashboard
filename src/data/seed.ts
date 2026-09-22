// Deterministic pseudo-random number generator (mulberry32).
// Using a fixed seed means the mock dataset is identical on every run —
// charts and KPIs don't "jump around" between page reloads.

export function createRng(seed: number) {
  let a = seed
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const rng = createRng(20240501)

export function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function randFloat(min: number, max: number, decimals = 2): number {
  const value = rng() * (max - min) + min
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

export function chance(probability: number): boolean {
  return rng() < probability
}
