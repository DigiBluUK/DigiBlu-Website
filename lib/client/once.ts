// Runs fn the first time key is seen in this page load. React Strict Mode
// mounts, unmounts and remounts every component in development, so an
// effect that binds window listeners or wraps words in spans would run
// twice; the old scripts ran exactly once and were written that way.
const seen = new Set<string>();

export function once(key: string, fn: () => void | (() => void)): () => void {
  if (seen.has(key)) return () => {};
  seen.add(key);
  return fn() || (() => {});
}
