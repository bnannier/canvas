/**
 * The component audit's in-page probe: what one platform row of a preview card renders,
 * read off the DOM after the cell is photographed.
 *
 * For every text leaf (an element with text of its own, HTML or SVG): its text, box, size,
 * weight, family and colour, the opacity groups it paints inside, whether its own box or an
 * ancestor's clips it (scrollWidth/Height against the client box, the text's line boxes
 * against each clipping ancestor up to the row), and the paint stack under its first line:
 * `document.elementsFromPoint` at that point, each element read as a layer (its background,
 * an SVG shape's fill) or as something the DOM cannot resolve (a backdrop filter, a
 * gradient, an image, a blend, a colour filter). For every interactive element (a native
 * control, an ARIA widget role, a tab stop): its role, an approximate accessible name, its
 * ARIA state and its visible box. And how far the row overflows its own box.
 *
 * The probe only reads; what the readings mean (the composited background, the contrast,
 * the floors, the targets, the flags) is decided in tools/audit/probe-math.ts, which is
 * unit tested and shared with the analysis step.
 *
 * `elementsFromPoint` skips elements that take no pointer events, and react-native-web
 * renders `pointerEvents="none"` (a decorative fill, a glass pane) as exactly that, so the
 * stack is read under a style that gives every element pointer events back, and the style
 * is removed before the function returns. It changes hit testing only, not paint or
 * layout, and the card has already been photographed. Everything else reads; nothing is
 * written to the page.
 *
 * The row's platform watermark (the absolute, pointer-events-none "iOS" / "Android" /
 * "Web" tag the Playground floats over each row) is docs chrome, not the component, and is
 * left out. Runs in the page, so the collectors must stay self-contained.
 */
import type { Locator } from "@playwright/test";
import type { RawLayer, RawPageOverflow, RawRow, RawText, RawInteractive, RowPlatform } from "../../tools/audit/probe-math.ts";

/** Read one platform row (`[data-platform-row]`) of the preview card. */
export async function probeRow(row: Locator, platform: RowPlatform): Promise<RawRow> {
  const raw = await row.evaluate(collectRow);
  return { ...raw, platform };
}

/** Read how far the document, the page scroller and the card overflow horizontally. */
export async function probePageOverflow(card: Locator): Promise<RawPageOverflow> {
  return card.evaluate(collectPageOverflow);
}

function collectPageOverflow(card: Element): RawPageOverflow {
  const doc = document.documentElement;
  const scroller = document.querySelector<HTMLElement>("[data-page-scroll]");
  const box = card.getBoundingClientRect();
  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    document: { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth },
    page: scroller ? { scrollWidth: scroller.scrollWidth, clientWidth: scroller.clientWidth } : null,
    card: { scrollWidth: card.scrollWidth, clientWidth: card.clientWidth, left: box.left, right: box.right },
  };
}

function collectRow(row: Element): Omit<RawRow, "platform"> {
  const card = row.closest("[data-preview-card]") ?? row;
  const cardBox = card.getBoundingClientRect();
  const round = (n: number) => Math.round(n * 10) / 10;
  const boxOf = (r: { left: number; top: number; width: number; height: number }) => ({
    x: round(r.left - cardBox.left),
    y: round(r.top - cardBox.top),
    width: round(r.width),
    height: round(r.height),
  });
  const styleOf = (el: Element) => getComputedStyle(el);
  const transparent = (color: string) => color === "transparent" || /^rgba\(.*,\s*0\)$/.test(color);

  // Opacity groups: every element with opacity under 1 flattens what it contains, so a
  // layer and the text above it are told which groups they paint inside.
  const groupIds = new Map<Element, number>();
  const groupOpacity: number[] = [];
  const groupsOf = (el: Element): number[] => {
    const chain: number[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) {
      const opacity = parseFloat(styleOf(node).opacity);
      if (!(opacity < 1)) continue;
      let id = groupIds.get(node);
      if (id === undefined) {
        id = groupOpacity.length;
        groupOpacity.push(opacity);
        groupIds.set(node, id);
      }
      chain.unshift(id);
    }
    return chain;
  };

  // The Playground's platform watermark, floated over the row's corner.
  const chrome = Array.from(row.children).filter((child) => {
    const style = styleOf(child);
    return style.position === "absolute" && style.pointerEvents === "none";
  });
  const inChrome = (el: Element) => chrome.some((c) => c.contains(el));
  const visible = (el: Element) => {
    const style = styleOf(el);
    return style.display !== "none" && style.visibility === "visible";
  };

  const UNPAINTED = new Set(["script", "style", "title", "desc", "noscript", "template", "metadata"]);
  const SHAPES = new Set(["rect", "circle", "ellipse", "path", "polygon"]);
  const IMAGES = new Set(["img", "canvas", "video", "picture", "iframe", "image"]);
  const DROP_SHADOWS_ONLY = /^(?:\s*drop-shadow\((?:[^()]|\([^()]*\))*\))+\s*$/;

  const layerOf = (el: Element): RawLayer => {
    const style = styleOf(el);
    const tag = el.localName;
    const kinds: string[] = [];
    const backdrop = style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter");
    if (backdrop && backdrop !== "none") kinds.push("backdrop-filter");
    if (style.backgroundImage && style.backgroundImage !== "none") kinds.push(/gradient\(/.test(style.backgroundImage) ? "gradient" : "image");
    if (style.mixBlendMode && style.mixBlendMode !== "normal") kinds.push("blend");
    // A drop shadow paints outside the box and leaves its colours alone; any other
    // filter changes them.
    if (style.filter && style.filter !== "none" && !DROP_SHADOWS_ONLY.test(style.filter)) kinds.push("filter");
    if (IMAGES.has(tag)) kinds.push("image");
    let fill: string | null = style.backgroundColor;
    let fillAlpha = 1;
    if (el instanceof SVGElement && tag !== "svg") {
      fill = null;
      if (SHAPES.has(tag) && style.fill && style.fill !== "none") {
        if (style.fill.startsWith("url(")) kinds.push("gradient");
        else {
          fill = style.fill;
          fillAlpha = parseFloat(style.fillOpacity || "1");
        }
      }
    }
    return { tag, fill, fillAlpha, kinds, groups: groupsOf(el) };
  };
  const paints = (el: Element) => {
    const layer = layerOf(el);
    return layer.kinds.length > 0 || (layer.fill !== null && !transparent(layer.fill));
  };

  // Pass one: every text leaf's styles, boxes and clipping, read before the stack style
  // goes in, so pointer-events reads its real value above.
  const pending: { el: Element; raw: RawText; point: { x: number; y: number } }[] = [];
  const range = document.createRange();
  for (const el of [row, ...Array.from(row.querySelectorAll("*"))]) {
    if (UNPAINTED.has(el.localName) || inChrome(el) || !visible(el)) continue;
    const textNodes = Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "");
    if (!textNodes.length) continue;
    const rects: DOMRect[] = [];
    for (const node of textNodes) {
      range.selectNodeContents(node);
      rects.push(...Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0));
    }
    if (!rects.length) continue;
    const groups = groupsOf(el);
    if (groups.some((id) => groupOpacity[id] === 0)) continue;
    const union = {
      left: Math.min(...rects.map((r) => r.left)),
      top: Math.min(...rects.map((r) => r.top)),
      right: Math.max(...rects.map((r) => r.right)),
      bottom: Math.max(...rects.map((r) => r.bottom)),
    };
    const style = styleOf(el);
    const svg = el instanceof SVGElement;
    const html = el as HTMLElement;
    const selfOverflow = !svg && html.clientWidth > 0
      ? { x: html.scrollWidth - html.clientWidth, y: html.scrollHeight - html.clientHeight }
      : null;
    const lineClamp = style.getPropertyValue("-webkit-line-clamp");
    let clipper: RawText["clipper"] = null;
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const s = styleOf(ancestor);
      const clipX = s.overflowX !== "visible";
      const clipY = s.overflowY !== "visible";
      if (clipX || clipY) {
        const r = ancestor.getBoundingClientRect();
        const left = r.left + ancestor.clientLeft;
        const top = r.top + ancestor.clientTop;
        const right = left + (ancestor.clientWidth || r.width);
        const bottom = top + (ancestor.clientHeight || r.height);
        const excess = Math.max(
          clipX ? Math.max(left - union.left, union.right - right) : 0,
          clipY ? Math.max(top - union.top, union.bottom - bottom) : 0,
        );
        if (excess > 1) {
          clipper = { overflow: clipX && (left - union.left > 1 || union.right - right > 1) ? s.overflowX : s.overflowY, excess: round(excess) };
          break;
        }
      }
      if (ancestor === row) break;
    }
    const first = rects[0]!;
    pending.push({
      el,
      point: { x: first.left + first.width / 2, y: first.top + first.height / 2 },
      raw: {
        text: textNodes.map((n) => n.textContent ?? "").join("").replace(/\s+/g, " ").trim().slice(0, 80),
        box: boxOf({ left: union.left, top: union.top, width: union.right - union.left, height: union.bottom - union.top }),
        size: parseFloat(style.fontSize),
        weight: Number(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400),
        family: (style.fontFamily.split(",")[0] ?? "").trim().replace(/^["']|["']$/g, ""),
        color: svg ? style.fill : style.color,
        colorAlpha: svg ? parseFloat(style.fillOpacity || "1") : 1,
        svg,
        ariaHidden: el.closest('[aria-hidden="true"]') !== null,
        disabled: el.closest('[aria-disabled="true"], [disabled]') !== null,
        groups,
        selfOverflow,
        clipsSelf: style.overflowX !== "visible" || style.overflowY !== "visible",
        ellipsis: style.textOverflow === "ellipsis" || (lineClamp !== "" && lineClamp !== "none"),
        clipper,
        stack: null,
        stackNote: null,
        covered: false,
      },
    });
  }

  // Pass two: the paint stack under each text's first line.
  const unblock = document.createElement("style");
  unblock.textContent = "*, *::before, *::after { pointer-events: auto !important; }";
  document.head.appendChild(unblock);
  try {
    for (const { el, raw, point } of pending) {
      if (point.x < 0 || point.y < 0 || point.x >= window.innerWidth || point.y >= window.innerHeight) {
        raw.stackNote = "offscreen";
        continue;
      }
      const hits = document.elementsFromPoint(point.x, point.y);
      let at = hits.indexOf(el);
      let below: Element[];
      if (at !== -1) below = hits.slice(at);
      else {
        // Chromium leaves a disabled form control out of elementsFromPoint whatever its
        // pointer-events say, so a text directly inside a disabled <button> is not hit
        // at its own point; it sits above the first hit that contains it.
        const host = el.closest(":disabled") ? hits.findIndex((hit) => hit.contains(el)) : -1;
        if (host === -1) {
          raw.stackNote = "not-hit";
          continue;
        }
        at = host;
        below = [el, ...hits.slice(host)];
      }
      // For the same reason a disabled control can be missing between the text and what
      // it sits on. An ancestor paints under everything it contains and over the rest, so
      // each one missing goes in just above the first layer it does not contain.
      for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (below.includes(ancestor)) continue;
        const box = ancestor.getBoundingClientRect();
        if (point.x < box.left || point.x >= box.right || point.y < box.top || point.y >= box.bottom) continue;
        const outside = below.findIndex((layer, i) => i > 0 && !ancestor!.contains(layer));
        below.splice(outside === -1 ? below.length : outside, 0, ancestor);
      }
      raw.covered = hits.slice(0, at).some((hit) => !el.contains(hit) && !inChrome(hit) && paints(hit));
      raw.stack = below.map(layerOf);
    }
  } finally {
    unblock.remove();
  }

  // Interactive elements: native controls, ARIA widget roles and tab stops.
  const INTERACTIVE = [
    "button", "a[href]", 'input:not([type="hidden"])', "textarea", "select",
    ...["button", "link", "checkbox", "radio", "switch", "tab", "menuitem", "menuitemcheckbox", "menuitemradio",
      "option", "slider", "spinbutton", "textbox", "combobox", "searchbox", "treeitem"].map((role) => `[role="${role}"]`),
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");
  const STATES = ["aria-checked", "aria-selected", "aria-expanded", "aria-pressed", "aria-current", "aria-invalid",
    "aria-busy", "aria-readonly", "aria-required", "aria-haspopup", "aria-disabled", "aria-valuenow", "aria-valuetext"];
  const implicitRole = (el: Element): string => {
    const tag = el.localName;
    if (tag === "button") return "button";
    if (tag === "a") return "link";
    if (tag === "textarea") return "textbox";
    if (tag === "select") return "combobox";
    if (tag === "input") {
      const type = (el as HTMLInputElement).type;
      if (type === "checkbox" || type === "radio") return type;
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      if (type === "search") return "searchbox";
      if (type === "button" || type === "submit" || type === "reset") return "button";
      return "textbox";
    }
    return "focusable";
  };
  const nameOf = (el: Element): string => {
    const clean = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
    const label = clean(el.getAttribute("aria-label"));
    if (label) return label;
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const text = clean(labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" "));
      if (text) return text;
    }
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const labelled = clean(el.labels?.[0]?.textContent);
      if (labelled) return labelled;
      const placeholder = clean(el.placeholder);
      if (placeholder) return placeholder;
    }
    return clean(el.getAttribute("alt")) || clean(el.getAttribute("title")) || clean(el.textContent);
  };
  const interactive: RawInteractive[] = [];
  for (const el of Array.from(row.querySelectorAll(INTERACTIVE))) {
    if (inChrome(el) || !visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const state: Record<string, string> = {};
    for (const attribute of STATES) {
      const value = el.getAttribute(attribute);
      if (value !== null) state[attribute] = value;
    }
    if ((el as HTMLButtonElement).disabled) state.disabled = "true";
    interactive.push({
      role: el.getAttribute("role") ?? implicitRole(el),
      name: nameOf(el),
      tag: el.localName,
      box: boxOf(r),
      state,
      focusable: (el as HTMLElement).tabIndex >= 0,
    });
  }

  return {
    box: boxOf(row.getBoundingClientRect()),
    scroll: { scrollWidth: row.scrollWidth, clientWidth: row.clientWidth, scrollHeight: row.scrollHeight, clientHeight: row.clientHeight },
    groupOpacity,
    texts: pending.map((p) => p.raw),
    interactive,
  };
}
