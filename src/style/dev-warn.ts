// A tiny dev-only warning helper. Canvas components resolve degenerate data
// silently in production: an empty series renders an empty frame, an
// out-of-range value is clamped, an all-zero total is floored to 1 so nothing
// divides by zero or crashes. That resilience is correct at runtime, but it also
// hides call-site mistakes during development. devWarn surfaces the clearest
// data-misuse cases on the console, in DEV only, and only once per unique
// message, so a component that re-renders (or many instances repeating the same
// mistake) does not spam the log.

// Dev-mode check that survives every runtime: Metro defines __DEV__, web bundlers
// define process.env.NODE_ENV, and anything else counts as dev (a misuse warning
// is more useful than silence in unknown environments). Mirrors the guarded check
// in qrcode.shared.tsx.
function isDevMode(): boolean {
  try {
    if (typeof __DEV__ !== "undefined") return __DEV__;
  } catch { /* not defined */ }
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return true;
  }
}

// Messages already warned, so each unique message fires at most once per session.
const warned = new Set<string>();

/**
 * Warn once per unique message, in development only. Use it for degenerate-data
 * misuse the kit otherwise resolves silently (an empty series, a value outside
 * the supported range). It is a no-op when `condition` is false or in production,
 * and it repeats a given message at most once.
 *
 * @param condition Whether the misuse is present; the warning fires only when true.
 * @param message   The console text, formatted `[canvas] <Component />: <problem and effect>`.
 */
export function devWarn(condition: boolean, message: string): void {
  if (!condition) return;
  if (!isDevMode()) return;
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

/**
 * Clear the once-per-message cache. Intended for tests: the dedup is process-wide,
 * so a warning already fired by one test (or one test file) is otherwise swallowed
 * when a later test asserts that the same message fires. Call it before each such
 * assertion to make the once-per-message contract deterministic.
 */
export function resetDevWarnings(): void {
  warned.clear();
}
