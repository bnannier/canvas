import type { ApiExport } from "./types";

/**
 * The committed record of the package entry's surface, written by
 * `bun run check:api --write-snapshot` and read by test/public-api.test.ts. It is
 * machine-written from the checker, unlike the hand-authored manifest, so it proves a
 * refactor of the barrels (src/index.ts, src/style/public.ts) left every name and
 * every binding where it was.
 */
export const SNAPSHOT_FILE = "test/fixtures/public-api.json";

export type Binding = "value" | "type";

/** Each export of `.` by name: a runtime value, or type-only. Sorted, so the file diffs cleanly. */
export function surfaceOf(exports: readonly ApiExport[]): Record<string, Binding> {
  return Object.fromEntries([...exports]
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((entry) => [entry.name, entry.value ? "value" : "type"]));
}
