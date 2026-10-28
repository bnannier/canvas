import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import * as web from "../docs/src/core/platforms-shown";
import * as ios from "../docs/src/core/platforms-shown.ios";
import * as android from "../docs/src/core/platforms-shown.android";
import { PLATFORM_COPY as webCopy } from "../docs/src/data/platform-copy";
import { PLATFORM_COPY as iosCopy } from "../docs/src/data/platform-copy.ios";
import { PLATFORM_COPY as androidCopy } from "../docs/src/data/platform-copy.android";

// The docs show only their own platform on a device (the owner's decision of 2026-10-28):
// the iOS app ships to the App Store, whose guideline 2.3.10 rejects an app that shows
// another mobile platform's name or imagery, and the Android app mirrors it. The web keeps
// the three platforms side by side. docs/src/core/platforms-shown.* is the one seam that
// decides it, resolved by Metro per build.

/** Words that name Android or its design system, which the iOS app must never show. */
const NOT_ON_IOS = /\b(Android|Material|M3|Google|Roboto|Pixel)\b/;
/** Words that name iOS or Apple's controls, which the Android app must never show. */
const NOT_ON_ANDROID = /\b(iOS|iPhone|iPad|SF Pro|Liquid Glass)\b/;

describe("docs platform content", () => {
  it("shows all three platforms on the web, in the hand-off's order", () => {
    expect(web.HOST).toBe("web");
    expect(web.PLATFORMS_SHOWN).toEqual(["web", "ios", "android"]);
    for (const p of web.PLATFORMS_SHOWN) expect(web.PLATFORM_LABELS[p]).toBeDefined();
  });

  it("shows the iOS look alone in the iOS app and names no other mobile platform", () => {
    expect(ios.HOST).toBe("ios");
    expect(ios.PLATFORMS_SHOWN).toEqual(["ios"]);
    expect(ios.shows("android")).toBe(false);
    expect(JSON.stringify(ios.PLATFORM_LABELS)).not.toMatch(NOT_ON_IOS);
    expect(ios.PLATFORM_LABELS.ios).toEqual(web.PLATFORM_LABELS.ios!);
  });

  it("shows the Android look alone in the Android app", () => {
    expect(android.HOST).toBe("android");
    expect(android.PLATFORMS_SHOWN).toEqual(["android"]);
    expect(android.shows("ios")).toBe(false);
    expect(JSON.stringify(android.PLATFORM_LABELS)).not.toMatch(NOT_ON_ANDROID);
    expect(android.PLATFORM_LABELS.android).toEqual(web.PLATFORM_LABELS.android!);
  });

  it("keeps the copy that names platforms to the build's own", () => {
    expect(Object.keys(iosCopy).sort()).toEqual(Object.keys(webCopy).sort());
    expect(Object.keys(androidCopy).sort()).toEqual(Object.keys(webCopy).sort());
    expect(JSON.stringify(iosCopy)).not.toMatch(NOT_ON_IOS);
    expect(JSON.stringify(androidCopy)).not.toMatch(NOT_ON_ANDROID);
    // The web keeps the hand-off's words, the three platforms side by side.
    expect(webCopy.heroBody.startsWith("One component API, three native looks.")).toBe(true);
    expect(webCopy.skinsLead).toBe("One tree. iOS capsule, Material stadium, Canvas web.");
  });

  it("picks the value for the build it runs in", () => {
    const values = { web: "w", ios: "i", android: "a" };
    expect([web.pick(values), ios.pick(values), android.pick(values)]).toEqual(["w", "i", "a"]);
  });

  // A docs file that checks for iOS or Android itself would decide what a platform shows
  // outside the seam. These are the mechanisms that need the check for behavior, not
  // content: keyboard events and the search field's placement, the native tab bar and
  // header (which render only their own platform's chrome).
  const ALLOWED: Record<string, number> = {
    "docs/src/app/(search)/search.tsx": 3,
    "docs/src/shell/tab-shell.tsx": 1,
    "docs/src/shell/native-header.tsx": 1,
    "docs/src/shell/navbar.tsx": 2,
  };

  it("leaves every other iOS or Android check out of the docs", () => {
    const root = join(import.meta.dir, "..");
    const found: Record<string, number> = {};
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
          if (name !== "testing" && name !== "audit") walk(path);
        } else if (/\.tsx?$/.test(name)) {
          const hits = readFileSync(path, "utf8").match(/Platform\.OS\s*[!=]==\s*"(ios|android)"/g);
          if (hits) found[relative(root, path)] = hits.length;
        }
      }
    };
    walk(join(root, "docs", "src"));
    expect(found).toEqual(ALLOWED);
  });
});
