import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Glob } from "bun";
import { TOUCH_TARGET } from "../src/style/touch-target.ts";

// Every control a finger can hit must be at least 44pt on iOS and 48dp on Android.
//
// There is more than one honest way to get there, and the platforms themselves use
// all of them: a row that is simply 48dp tall, a glyph square with a hitSlop around
// it, a measured control whose touch area is extended to the minimum. What is NOT
// acceptable is a control that is short and has none of them, and that is what this
// enumerates, so a new pressable cannot join the kit unnoticed.
//
// The sizes quoted in KNOWN_GAP were measured in a real browser against the docs'
// iOS and Android preview rows, which render the actual per-OS skins, by walking
// every pressable in each row and comparing its box to that platform's minimum.
// hitSlop is invisible to that measurement, which is why the two lists below are
// separate: one is "reaches it another way", the other is "does not reach it".

const ROOT = join(import.meta.dir, "..");

/**
 * Components that meet the minimum without declaring it, with how.
 *
 * Every entry was checked against the measurement: either the control renders at or
 * above the minimum, or the shell already extends it with its own hitSlop.
 */
const COVERED_ANOTHER_WAY: Record<string, string> = {
  "atoms/chip": "hitSlop on the remove glyph, the only sub-minimum part",
  "atoms/checkbox": "hitSlop around the box when there is no label to press",
  "atoms/input": "a field is 44/56 tall by skin, above both minimums",
  "atoms/pagination": "hitSlop on the page numbers and the arrows",
  "atoms/radio": "hitSlop around the ring when there is no label to press",
  "atoms/select": "the trigger is a field; its rows are 44/48 by skin",
  "atoms/stepper": "hitSlop on both halves; the iOS 32pt group is UIStepper's own size",
  "atoms/tooltip": "wraps the caller's node and adds hitSlop; the target is theirs",
  "molecules/alert": "hitSlop on the dismiss glyph (24 + 2 * 12 = 48 on Android)",
  "molecules/accordion": "triggers are 44/56 tall by skin",
  "molecules/collapsible": "triggers are 44/56 tall by skin",
  "molecules/stacked-lists": "rows are 68/72 tall by skin",
  "organisms/action-sheet": "rows are 48/56 tall by skin",
  "organisms/calendar": "hitSlop on the month chevrons",
  "organisms/carousel": "hitSlop on the dots and the arrows",
  "organisms/command": "rows are 44/48 tall by skin",
  "organisms/data-table": "rows and action buttons carry pressableMinHeight",
  "organisms/filter-panel": "option rows are 44/48 tall by skin",
  "organisms/toast": "hitSlop on the dismiss and the action",
  "charts/shared": "a chart's hit area is the mark it belongs to, sized by the data",
};

/**
 * Controls measured below the minimum with nothing making up the difference.
 *
 * Recorded rather than ignored: each is a real defect, and listing it here is what
 * keeps the gate meaningful for everything else. The measured size is the smallest
 * pressable found in that platform's preview row.
 */
const KNOWN_GAP: Record<string, string> = {
  "atoms/button-group": "segments render 47x32; they abut, so the fix is vertical slop",
  "atoms/dropdown": "the trigger renders 69x30",
  "atoms/listbox": "rows render 310x36, and one shared skin serves all three platforms",
  "molecules/card": "a pressable card is sized by its content, which can be anything",
  "molecules/grid-lists": "tile actions render 63x36",
  "molecules/stats": "a pressable stat tile is sized by its content",
  "organisms/board": "the column and card affordances render 32x32",
  "organisms/navbars": "links render 50x28; they abut, so the fix is vertical slop",
  "organisms/sidebar": "iOS rows render 36 tall against a 44 minimum",
  "organisms/tabs": "items render 77x32; they abut, so the fix is vertical slop",
  "organisms/tab-bar": "the bar owns its own platform heights and is measured with them",
  "organisms/dialog": "only the Android text buttons, at 40 against a 48 minimum",
  "organisms/drawer": "the scrim is a dismiss target, not a control",
  "molecules/alert-dialog": "only the Android text buttons, at 40 against a 48 minimum",
};

/** The skin module in a component directory (its name is not always the directory's). */
function skinFile(component: string): string {
  const dir = join(ROOT, "src", component);
  const [file] = [...new Glob("*.styles.ts").scanSync(dir)];
  return join(dir, file);
}

/** Component directories whose shell renders a Pressable. */
function pressableComponents(): string[] {
  const out: string[] = [];
  for (const rel of new Glob("src/*/*/*.styles.ts").scanSync(ROOT)) {
    const dir = dirname(rel);
    const sources = [...new Glob("*.tsx").scanSync(join(ROOT, dir))]
      .filter((f) => !f.endsWith(".ios.tsx") && !f.endsWith(".android.tsx"))
      .map((f) => readFileSync(join(ROOT, dir, f), "utf8"));
    if (sources.some((text) => /<Pressable\b/.test(text))) out.push(dir.replace(/^src\//, ""));
  }
  return out.sort();
}

const components = pressableComponents();

it("finds the pressable components", () => {
  expect(components.length).toBeGreaterThan(30);
});

describe("every pressable is accounted for", () => {
  for (const component of components) {
    const skin = readFileSync(skinFile(component), "utf8");
    const declares = /minTarget/.test(skin);

    it(component, () => {
      if (declares) return;
      const reason = COVERED_ANOTHER_WAY[component] ?? KNOWN_GAP[component];
      expect(
        reason,
        `${component} has a pressable, declares no minTarget, and is in neither list. ` +
          `Either declare one (src/style/touch-target.ts) or record how it meets the minimum.`,
      ).toBeDefined();
    });
  }
});

describe("a declared target is the platform's own number", () => {
  for (const component of components) {
    const file = skinFile(component);
    const skin = readFileSync(file, "utf8");
    if (!/minTarget/.test(skin)) continue;

    it(component, async () => {
      const mod = (await import(file)) as Record<string, { minTarget?: number | null }>;
      const shared = mod.iosSkin === mod.webSkin && mod.androidSkin === mod.webSkin;
      if (shared) {
        // One skin for all three platforms, so the number comes from the platform at
        // runtime. The harness runs as web, where a pointer target is visual-sized.
        expect(mod.webSkin.minTarget, `${component} shared skin`).toBeNull();
        expect(skin).toContain("platformMinTarget");
        return;
      }
      expect(mod.iosSkin?.minTarget, `${component} iOS`).toBe(TOUCH_TARGET.ios);
      expect(mod.androidSkin?.minTarget, `${component} Android`).toBe(TOUCH_TARGET.android);
      // The web has three legitimate answers, and the kit uses all three. null and 0
      // both say "no minimum", which is right for a mouse: a pointer is not a
      // fingertip, and padding a control out to 44 would be a layout change nobody
      // asked for. 44 is the third: Avatar and Breadcrumb opt into the touch floor on
      // the web too, because a small image or text link is genuinely hard to hit on a
      // touch screen running a browser. What is wrong is a number in between.
      const web = mod.webSkin?.minTarget ?? null;
      expect(
        web === null || web === 0 || web >= TOUCH_TARGET.ios,
        `${component} web declares ${web}, which is neither "no minimum" nor a real one`,
      ).toBe(true);
    });
  }
});

describe("the lists stay honest", () => {
  it("names only components that exist and still have a pressable", () => {
    const known = new Set(components);
    const stale = [...Object.keys(COVERED_ANOTHER_WAY), ...Object.keys(KNOWN_GAP)].filter(
      (c) => !known.has(c),
    );
    expect(stale, "listed but no longer a pressable component").toEqual([]);
  });

  it("lists nothing that already declares a target", () => {
    const redundant = [...Object.keys(COVERED_ANOTHER_WAY), ...Object.keys(KNOWN_GAP)].filter((c) => {
      try {
        return /minTarget/.test(readFileSync(skinFile(c), "utf8"));
      } catch {
        return false;
      }
    });
    expect(redundant, "declares a target, so delete the list entry").toEqual([]);
  });
});
