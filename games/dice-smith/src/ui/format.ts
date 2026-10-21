/** Chinese-style big numbers: 12,345 → 12,345; 123,456 → 12.3万; 3.2e8 → 3.2亿. */
export function fmt(n: number): string {
  const a = Math.abs(n);
  const trim = (x: number) => (Math.round(x * 10) / 10).toString();
  if (a >= 1e8) return `${trim(n / 1e8)}亿`;
  if (a >= 1e5) return `${trim(n / 1e4)}万`;
  return Math.round(n).toLocaleString();
}
