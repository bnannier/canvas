import { describe, expect, test } from "bun:test";
import sharp from "sharp";
import { components, pages, NATIVE_CELLS_PER_VARIANT } from "../inventory.ts";
import { cut, parseBounds, parseMaestroHierarchy, parseUiAutomator } from "./a11y.ts";
import { parseDeviceOverrides } from "./devices.ts";
import { fingerprint, meanAbsDiff } from "./fingerprint.ts";
import { buildQueue, lookFor, parseRunArgs, runStamp } from "./run.ts";

describe("the native run's queue", () => {
  const button = components().find((c) => c.slug === "button");
  if (!button) throw new Error("the inventory has no button");

  test("holds every variant in every look and surface, look-major", () => {
    const queue = buildQueue("ios", { only: ["button"], looks: ["blush", "mint", "dark"], surfaces: ["solid", "glass"], a11y: "none" });
    expect(queue).toHaveLength(button.variants.length * NATIVE_CELLS_PER_VARIANT);
    // One look and surface at a time: the theme changes six times, not once an item.
    const looks = queue.map(({ item }) => `${item.look.scheme}.${item.look.palette}.${item.look.surface}`);
    const changes = looks.filter((look, i) => i > 0 && look !== looks[i - 1]).length;
    expect(changes).toBe(5);
    expect(queue[0].item).toMatchObject({ kind: "component", id: `ios/button/${button.variants[0].variant}/blush.solid`, route: "/components/button" });
    expect(new Set(queue.map(({ item }) => item.id)).size).toBe(queue.length);
  });

  test("spells the looks the way the docs theme sets them", () => {
    expect(lookFor("blush", "glass")).toEqual({ scheme: "light", surface: "glass", palette: "blush" });
    expect(lookFor("mint", "solid")).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
    expect(lookFor("dark", "glass")).toEqual({ scheme: "dark", surface: "glass", palette: "blush" });
  });

  test("dumps accessibility for every variant in blush solid and the first example elsewhere by default", () => {
    const queue = buildQueue("android", { only: ["button"], looks: ["blush", "mint", "dark"], surfaces: ["solid", "glass"], a11y: "default" });
    const dumped = queue.filter((q) => q.a11y).map(({ item }) => item.id);
    expect(dumped).toHaveLength(button.variants.length + NATIVE_CELLS_PER_VARIANT - 1);
    expect(dumped.filter((id) => id.endsWith("/blush.solid"))).toHaveLength(button.variants.length);
    expect(dumped.filter((id) => !id.endsWith("/blush.solid")).every((id) => id.startsWith(`android/button/${button.variants[0].variant}/`))).toBe(true);
    expect(buildQueue("android", { only: ["button"], looks: ["dark"], surfaces: ["glass"], a11y: "all" }).every((q) => q.a11y)).toBe(true);
  });

  test("takes pages by id or slug and refuses a name it does not know", () => {
    const page = pages()[0];
    const byId = buildQueue("ios", { only: [page.id], looks: ["blush"], surfaces: ["solid"], a11y: "none" });
    expect(byId.map(({ item }) => item)).toEqual([expect.objectContaining({ kind: "page", id: `ios-pages/${page.id}/blush.solid`, route: page.route, page: page.id })]);
    expect(buildQueue("ios", { only: [page.slug], looks: ["blush"], surfaces: ["solid"], a11y: "none" })).toHaveLength(1);
    expect(() => buildQueue("ios", { only: ["buton"], looks: ["blush"], surfaces: ["solid"], a11y: "none" })).toThrow("buton");
  });

  test("reads its options and rejects values outside the axes", () => {
    const options = parseRunArgs(["--platform=ios", "--only=button,switch", "--looks=dark", "--surfaces=glass", "--a11y=all", "--devices=ios:ABC", "--keep-motion"]);
    expect(options).toEqual({ platforms: ["ios"], only: ["button", "switch"], looks: ["dark"], surfaces: ["glass"], a11y: "all", devices: { ios: "ABC" }, dev: false, reduceMotion: false });
    expect(parseRunArgs([])).toMatchObject({ platforms: ["ios", "android"], only: null, looks: ["blush", "mint", "dark"], surfaces: ["solid", "glass"], a11y: "default", reduceMotion: true });
    expect(() => parseRunArgs(["--platform=web"])).toThrow("web");
    expect(() => parseRunArgs(["--looks=sepia"])).toThrow("sepia");
    expect(() => parseRunArgs(["--a11y=some"])).toThrow("some");
    expect(() => parseDeviceOverrides("windows:1")).toThrow("windows:1");
    expect(runStamp(new Date("2026-10-09T06:12:30.123Z"))).toBe("20261009T061230Z");
  });
});

describe("the accessibility trees", () => {
  test("reads UI Automator's dump in dp, with names, states and depth", () => {
    const xml = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><hierarchy rotation="0">
      <node index="0" text="" class="android.widget.FrameLayout" content-desc="" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" scrollable="false" selected="false" password="false" bounds="[0,0][1080,2400]">
        <node index="0" text="Save &amp; close" resource-id="save" class="android.widget.Button" content-desc="" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" scrollable="false" selected="false" password="false" bounds="[105,420][525,546]" />
        <node index="1" text="" class="android.widget.Switch" content-desc="Wi-Fi" checkable="true" checked="true" clickable="true" enabled="false" focusable="true" focused="false" scrollable="false" selected="false" password="false" bounds="[105,630][315,735]" />
      </node>
    </hierarchy>`;
    const nodes = parseUiAutomator(xml, 2.625);
    expect(nodes).toHaveLength(3);
    expect(nodes[1]).toEqual({
      role: "android.widget.Button", name: "Save & close", id: "save", depth: 1,
      states: { checkable: false, checked: false, clickable: true, enabled: true, focusable: true, focused: false, selected: false, scrollable: false, password: false },
      bounds: { x: 40, y: 160, width: 160, height: 48 },
    });
    expect(nodes[2]).toMatchObject({ role: "android.widget.Switch", name: "Wi-Fi", states: { checked: true, enabled: false } });
    // Cut to a card around the button: the switch below it and the frame (nothing to announce) drop.
    expect(cut(nodes, { x: 0, y: 150, width: 400, height: 70 }).map((n) => n.name)).toEqual(["Save & close"]);
  });

  test("reads Maestro's iOS hierarchy in points", () => {
    const tree = {
      attributes: { bounds: "[0,0][402,874]" },
      children: [
        { attributes: { accessibilityText: "Primary", bounds: "[20,300][140,344]", "resource-id": "primary-button", enabled: "true" }, clickable: true, children: [] },
        { attributes: { accessibilityText: "", value: "1", bounds: "[20,360][71,391]" }, checked: true, children: [] },
      ],
    };
    const nodes = parseMaestroHierarchy(tree);
    expect(nodes.map((n) => [n.name, n.depth])).toEqual([["", 0], ["Primary", 1], ["", 1]]);
    expect(nodes[1]).toMatchObject({ id: "primary-button", states: { clickable: true, enabled: true }, bounds: { x: 20, y: 300, width: 120, height: 44 } });
    expect(nodes[2]).toMatchObject({ value: "1", states: { checked: true } });
    expect(parseBounds("[1,2][3]")).toBeNull();
  });
});

describe("frame fingerprints", () => {
  test("are identical for identical frames and differ for different ones", async () => {
    const frame = (gray: number) => sharp({ create: { width: 200, height: 100, channels: 3, background: { r: gray, g: gray, b: gray } } }).png().toBuffer();
    const size = { width: 64, height: 32 };
    const a = await fingerprint(await frame(10), size);
    expect(a).toHaveLength(64 * 32);
    expect(meanAbsDiff(a, await fingerprint(await frame(10), size))).toBe(0);
    expect(meanAbsDiff(a, await fingerprint(await frame(30), size))).toBe(20);
    expect(() => meanAbsDiff(a, Buffer.alloc(3))).toThrow("differ in size");
  });
});
