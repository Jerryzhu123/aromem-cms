/** Next.js hands `searchParams` to a page as a promise of a plain object. */
export type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The source site writes the same id in two shapes:
 *   /products?id=5.html   and   /products.html?id=5
 * so the numeric part is all that can be trusted.
 */
export function parseNumericId(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const raw = firstValue(value);
  if (!raw) return fallback;
  // NOTE: `/\d+/` has no capture group, so the match lives at index 0.
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

/** Clamp a 1-based page number coming from `?p=`. */
export function parsePageNumber(
  value: string | string[] | undefined,
  fallback: number,
  max: number,
): number {
  const n = parseNumericId(value, fallback);
  return Math.min(Math.max(n, 1), max);
}
