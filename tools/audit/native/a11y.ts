// The accessibility tree of the item on screen, as the platform's own assistive layer
// exposes it: Android through UI Automator's dump of the accessibility node tree, iOS
// through Maestro's `hierarchy`, which reads XCUITest's element tree (what VoiceOver
// reads). Both are cut down to the nodes that fall inside the captured card and that a
// screen reader announces or a user can act on: a name, a value, or an interactive
// trait. This is the native half of the audit's structure-first check; the web half is
// the DOM probe.
//
// Maestro is the pinned build from tools/native/maestro.json, installed task-locally by
// scripts/install-maestro.mjs (`node scripts/install-maestro.mjs .audit/tools/maestro-<version>`),
// and needs JDK 17 (JAVA_HOME, defaulting to this Mac's Homebrew openjdk@17).

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../../e2e/support/routes.ts";
import { ADB, run } from "./devices.ts";
import type { Rect } from "../../../docs/src/audit/protocol.ts";

export interface A11yNode {
  /** Android's widget class, or the iOS element type as Maestro reports it. */
  role: string;
  /** What a screen reader announces as the name: content-desc or text, accessibilityText or label. */
  name: string;
  value?: string;
  /** The node's identifier (resource-id / accessibilityIdentifier, React Native's testID). */
  id?: string;
  states: Partial<Record<"checkable" | "checked" | "clickable" | "enabled" | "focusable" | "focused" | "selected" | "scrollable" | "password", boolean>>;
  /** In layout points (dp on Android), window coordinates. */
  bounds: Rect;
  depth: number;
}

export interface A11ySnapshot {
  source: "uiautomator" | "maestro";
  /** The region the nodes were kept for, in layout points. */
  region: Rect;
  nodes: A11yNode[];
  /** Nodes in the whole dump, before the cut to the region. */
  total: number;
}

const intersects = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const announced = (node: A11yNode) => node.name !== "" || Boolean(node.value) || Boolean(node.states.clickable || node.states.checkable || node.states.focusable || node.states.scrollable);

/** Parses "[x1,y1][x2,y2]" into a rect, scaled down by `scale`. */
export function parseBounds(bounds: string, scale = 1): Rect | null {
  const match = /^\[(-?[\d.]+),(-?[\d.]+)\]\[(-?[\d.]+),(-?[\d.]+)\]$/.exec(bounds.trim());
  if (!match) return null;
  const [x1, y1, x2, y2] = match.slice(1).map(Number);
  return { x: x1 / scale, y: y1 / scale, width: (x2 - x1) / scale, height: (y2 - y1) / scale };
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
function decodeXml(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (whole, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(parseInt(entity.slice(1), 10));
    return ENTITIES[entity] ?? whole;
  });
}

/**
 * Every `<node>` of a UI Automator dump, with its depth. The dump is one flat grammar
 * (`<hierarchy>`, then `<node attr="..">` elements, self-closing or not), so a tag scanner
 * reads it exactly; bounds are device pixels and come back divided by `dpr`.
 */
export function parseUiAutomator(xml: string, dpr: number): A11yNode[] {
  const nodes: A11yNode[] = [];
  let depth = 0;
  for (const tag of xml.matchAll(/<(\/?)node\b([^>]*?)(\/?)>/g)) {
    const [, closing, body, selfClosing] = tag;
    if (closing) {
      depth--;
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const [, key, value] of body.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[key] = decodeXml(value);
    const bounds = parseBounds(attrs.bounds ?? "", dpr);
    if (bounds) {
      const flag = (key: string) => attrs[key] === "true";
      nodes.push({
        role: attrs.class ?? "",
        name: attrs["content-desc"] || attrs.text || "",
        ...(attrs["content-desc"] && attrs.text && attrs.text !== attrs["content-desc"] ? { value: attrs.text } : {}),
        ...(attrs["resource-id"] ? { id: attrs["resource-id"] } : {}),
        states: {
          checkable: flag("checkable"), checked: flag("checked"), clickable: flag("clickable"), enabled: flag("enabled"),
          focusable: flag("focusable"), focused: flag("focused"), selected: flag("selected"), scrollable: flag("scrollable"), password: flag("password"),
        },
        bounds,
        depth,
      });
    }
    if (!selfClosing) depth++;
  }
  return nodes;
}

interface MaestroElement {
  attributes?: Record<string, string | undefined>;
  children?: MaestroElement[];
  clickable?: boolean | null;
  enabled?: boolean | null;
  focused?: boolean | null;
  checked?: boolean | null;
  selected?: boolean | null;
}

/** Every element of a Maestro `hierarchy` tree (iOS bounds are in points). */
export function parseMaestroHierarchy(root: MaestroElement): A11yNode[] {
  const nodes: A11yNode[] = [];
  const visit = (element: MaestroElement, depth: number) => {
    const attrs = element.attributes ?? {};
    const bounds = parseBounds(attrs.bounds ?? "");
    if (bounds) {
      const bool = (own: boolean | null | undefined, attr: string | undefined) => own ?? (attr === undefined ? undefined : attr === "true");
      const value = attrs.value || undefined;
      nodes.push({
        role: attrs.elementType ?? attrs.class ?? "",
        name: attrs.accessibilityText || attrs.title || attrs.text || "",
        ...(value ? { value } : {}),
        ...(attrs["resource-id"] ? { id: attrs["resource-id"] } : {}),
        states: Object.fromEntries(Object.entries({
          clickable: bool(element.clickable, attrs.clickable),
          enabled: bool(element.enabled, attrs.enabled),
          focused: bool(element.focused, attrs.focused),
          checked: bool(element.checked, attrs.checked),
          selected: bool(element.selected, attrs.selected),
        }).filter(([, flag]) => flag !== undefined)) as A11yNode["states"],
        bounds,
        depth,
      });
    }
    for (const child of element.children ?? []) visit(child, depth + 1);
  };
  visit(root, 0);
  return nodes;
}

// How far a node may reach past the card and still count as the card's: a focus ring or
// a shadow that layout rounds outward, not the page around it.
const SLACK = 8;
const within = (node: Rect, region: Rect) =>
  node.x >= region.x - SLACK && node.y >= region.y - SLACK &&
  node.x + node.width <= region.x + region.width + SLACK && node.y + node.height <= region.y + region.height + SLACK;

/**
 * The nodes of the card that a screen reader announces or a user can act on: inside
 * `region`, so the page's scroller and the screen's containers around the card drop out.
 */
export function cut(nodes: A11yNode[], region: Rect): A11yNode[] {
  return nodes.filter((node) => node.bounds.width > 0 && node.bounds.height > 0 && intersects(node.bounds, region) && within(node.bounds, region) && announced(node));
}

const DUMP = "/sdcard/canvas-audit-a11y.xml";

/** The Android accessibility tree of the screen, cut to `region` (dp). */
export async function androidSnapshot(serial: string, dpr: number, region: Rect): Promise<A11ySnapshot> {
  await run(ADB, ["-s", serial, "shell", "uiautomator", "dump", DUMP], { timeoutMs: 60_000 });
  const xml = (await run(ADB, ["-s", serial, "exec-out", "cat", DUMP])).stdout.toString("utf8");
  await run(ADB, ["-s", serial, "shell", "rm", "-f", DUMP]);
  const nodes = parseUiAutomator(xml, dpr);
  return { source: "uiautomator", region, nodes: cut(nodes, region), total: nodes.length };
}

const MAESTRO_VERSION = (JSON.parse(readFileSync(join(ROOT, "tools", "native", "maestro.json"), "utf8")) as { version: string }).version;
const HOMEBREW_JDK = "/opt/homebrew/opt/openjdk@17";

/** Where scripts/install-maestro.mjs puts the pinned Maestro for the audit. */
export const MAESTRO_DIR = join(ROOT, ".audit", "tools", `maestro-${MAESTRO_VERSION}`);

/** The pinned Maestro CLI: `MAESTRO`, else the audit's task-local install, else null. */
export function findMaestro(): string | null {
  if (process.env.MAESTRO) return process.env.MAESTRO;
  const local = join(MAESTRO_DIR, "maestro", "bin", "maestro");
  return existsSync(local) ? local : null;
}

/** Every node of the iOS accessibility tree of the screen. */
async function iosNodes(udid: string, maestro: string): Promise<A11yNode[]> {
  const env = {
    ...process.env,
    JAVA_HOME: process.env.JAVA_HOME || HOMEBREW_JDK,
    MAESTRO_CLI_NO_ANALYTICS: "1",
    MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true",
  };
  const out = (await run(maestro, ["--device", udid, "hierarchy"], { timeoutMs: 180_000, env })).stdout.toString("utf8");
  // The tree is the JSON document on stdout; anything Maestro prints before it is progress.
  const start = out.indexOf("{");
  if (start < 0) throw new Error(`maestro hierarchy printed no tree: ${out.slice(0, 200)}`);
  return parseMaestroHierarchy(JSON.parse(out.slice(start)) as MaestroElement);
}

/** The iOS accessibility tree of the screen, cut to `region` (points). */
export async function iosSnapshot(udid: string, region: Rect, maestro: string): Promise<A11ySnapshot> {
  const nodes = await iosNodes(udid, maestro);
  return { source: "maestro", region, nodes: cut(nodes, region), total: nodes.length };
}

/**
 * The iOS tab bar's frame, in points, from the accessibility tree: UIKit lays it over the
 * content, and neither the scroller's insets nor any safe area the app can read reports it.
 */
export async function iosTabBar(udid: string, maestro: string): Promise<Rect | null> {
  return (await iosNodes(udid, maestro)).find((node) => node.name === "Tab Bar")?.bounds ?? null;
}
