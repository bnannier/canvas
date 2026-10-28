import type { ReactNode } from "react";
import { shows, type DocsPlatform } from "../core/platforms-shown";

// Docs content about one platform, shown only in a build that shows that platform: the web
// shows every platform's guidance, and a native app only its own (../core/platforms-shown,
// the owner's decision of 2026-10-28 for App Store guideline 2.3.10). It renders nothing of
// its own.

export function ShownOn({ platform, children }: { platform: DocsPlatform; children: ReactNode }) {
  return shows(platform) ? <>{children}</> : null;
}

/** The items of a list that this build shows: an item tagged with a platform it does not show is left out. */
export function shownItems<T>(items: readonly (T | { on: DocsPlatform; item: T })[]): T[] {
  return items.flatMap((entry) =>
    entry !== null && typeof entry === "object" && "on" in (entry as object) && "item" in (entry as object)
      ? shows((entry as { on: DocsPlatform }).on) ? [(entry as { item: T }).item] : []
      : [entry as T],
  );
}
