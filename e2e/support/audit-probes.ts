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
 * A text's size is read twice: the computed `font-size`, and the scale its glyphs paint at,
 * which is what a reader sees. A floating label is laid out at its resting size and floated
 * by a transform (src/style/floating-label.tsx), so a 16 px label can paint at 12. The scale
 * is the vertical one of every transform above the text composed (each element's `zoom`,
 * `rotate`, `scale` and `transform`, the way CSS orders them), and an SVG text's screen CTM,
 * which takes in its viewBox and every ancestor's transform, HTML ones included.
 *
 * A form control paints its text from its value, and the DOM holds that text in no text
 * node, so a text field's value (a password's as the bullets it paints), its placeholder
 * while it shows (in the `::placeholder` style: its own colour, opacity and font) and a
 * drop-down select's chosen label are read from the control. Their box is the control's
 * content box narrowed to the text's width and the font's line metrics (a canvas
 * `measureText` in the control's font), its overflow is the control's own scroll extent where
 * Chromium reports one (a field's value; a textarea's value or placeholder) and the measured
 * width against the content box where it does not (a placeholder in a single-line field, a
 * select's label), and its paint stack starts at the control, so its own background is the
 * first layer under the text.
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
 * written to the page (the canvas that measures a control's text is never attached).
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
  // layer and the text above it are told which groups they paint inside, and where each
  // group's element is (a photograph shows what lies behind a group around its box).
  const groupIds = new Map<Element, number>();
  const groupOpacity: number[] = [];
  const groupBoxes: ReturnType<typeof boxOf>[] = [];
  const groupsOf = (el: Element): number[] => {
    const chain: number[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) {
      const opacity = parseFloat(styleOf(node).opacity);
      if (!(opacity < 1)) continue;
      let id = groupIds.get(node);
      if (id === undefined) {
        id = groupOpacity.length;
        groupOpacity.push(opacity);
        groupBoxes.push(boxOf(node.getBoundingClientRect()));
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

  // How much the transforms above an element scale what it paints: the linear part of the
  // matrix from its own space to the viewport's. CSS composes an element's own transform as
  // translate, rotate, scale, then `transform` (`zoom` scales uniformly, so its place in the
  // order does not matter), and an ancestor's after it. An SVG graphics element's screen CTM
  // is that matrix already (its viewBox, its own and its SVG ancestors' transforms, and every
  // HTML ancestor's), so the walk up stops at one; HTML inside a foreignObject reaches its
  // CTM the same way.
  const toDegrees = (token: string): number => {
    const n = parseFloat(token);
    if (token.endsWith("grad")) return n * 0.9;
    if (token.endsWith("rad")) return (n * 180) / Math.PI;
    if (token.endsWith("turn")) return n * 360;
    return n;
  };
  const AXES: Record<string, [number, number, number]> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  const ownLinear = (el: Element): DOMMatrix => {
    const style = styleOf(el);
    const m = new DOMMatrix();
    const zoom = parseFloat(style.zoom);
    if (zoom > 0 && zoom !== 1) m.scaleSelf(zoom, zoom);
    if (style.rotate && style.rotate !== "none") {
      const parts = style.rotate.trim().split(/\s+/);
      const angle = toDegrees(parts.pop() ?? "0");
      const axis = parts.length === 3 ? (parts.map(Number) as [number, number, number]) : AXES[parts[0] ?? "z"] ?? AXES.z!;
      m.rotateAxisAngleSelf(axis[0], axis[1], axis[2], angle);
    }
    if (style.scale && style.scale !== "none") {
      const [x = 1, y = x, z = 1] = style.scale.trim().split(/\s+/).map((t) => (t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t)));
      m.scaleSelf(x, y, z);
    }
    if (style.transform && style.transform !== "none") m.multiplySelf(new DOMMatrix(style.transform));
    return m;
  };
  const linear = new Map<Element, DOMMatrixReadOnly>();
  const linearOf = (el: Element): DOMMatrixReadOnly => {
    const known = linear.get(el);
    if (known) return known;
    let m: DOMMatrixReadOnly;
    if (el instanceof SVGGraphicsElement) {
      const ctm = el.getScreenCTM();
      m = new DOMMatrixReadOnly(ctm ? [ctm.a, ctm.b, ctm.c, ctm.d, 0, 0] : undefined);
    } else {
      m = (el.parentElement ? linearOf(el.parentElement) : new DOMMatrixReadOnly()).multiply(ownLinear(el));
    }
    linear.set(el, m);
    return m;
  };
  /** The scale an element's glyphs paint at: across (its x axis' length on screen) and up. */
  const scaleOf = (el: Element) => {
    const m = linearOf(el);
    const r4 = (n: number) => Math.round(n * 10000) / 10000;
    return { x: r4(Math.hypot(m.a, m.b)), y: r4(Math.hypot(m.c, m.d)) };
  };

  // The colour glyphs are filled with: -webkit-text-fill-color, which follows `color`
  // unless something sets it (a reset on a disabled field, text clipped to a gradient).
  const inkOf = (style: CSSStyleDeclaration) => style.getPropertyValue("-webkit-text-fill-color") || style.color;
  const weightOf = (style: CSSStyleDeclaration) => Number(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
  const familyOf = (style: CSSStyleDeclaration) => (style.fontFamily.split(",")[0] ?? "").trim().replace(/^["']|["']$/g, "");

  type Edges = { left: number; top: number; right: number; bottom: number };
  /** The first ancestor, up to the row, whose clipping box `union` runs out of. */
  const clipperOf = (el: Element, union: Edges): RawText["clipper"] => {
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
          return { overflow: clipX && (left - union.left > 1 || union.right - right > 1) ? s.overflowX : s.overflowY, excess: round(excess) };
        }
      }
      if (ancestor === row) break;
    }
    return null;
  };

  // A form control's own text, which the DOM holds in no text node: a text field's value, or
  // its placeholder while that shows (in the ::placeholder style), and a drop-down select's
  // chosen label. A list-box select lays its options out as text nodes of their own.
  const TEXT_TYPES = new Set(["text", "search", "email", "url", "tel", "password", "number"]);
  type FieldText = { control: "input" | "textarea" | "select"; part: "value" | "placeholder"; text: string; style: CSSStyleDeclaration };
  const fieldTextOf = (el: Element): FieldText | null => {
    let control: "input" | "textarea";
    let value: string;
    if (el instanceof HTMLInputElement && TEXT_TYPES.has(el.type)) {
      control = "input";
      // A password paints a bullet per character, and its value is not the probe's to record.
      value = el.type === "password" ? "•".repeat(el.value.length) : el.value;
    } else if (el instanceof HTMLTextAreaElement) {
      control = "textarea";
      value = el.value;
    } else if (el instanceof HTMLSelectElement && !el.multiple && el.size <= 1) {
      const label = el.selectedOptions[0]?.label ?? "";
      return label.trim() ? { control: "select", part: "value", text: label, style: styleOf(el) } : null;
    } else {
      return null;
    }
    if (value.trim()) return { control, part: "value", text: value, style: styleOf(el) };
    if (el.placeholder.trim() && el.matches(":placeholder-shown")) {
      return { control, part: "placeholder", text: el.placeholder, style: getComputedStyle(el, "::placeholder") };
    }
    return null;
  };
  const pen = document.createElement("canvas").getContext("2d");
  const transformText = (text: string, transform: string) => {
    if (transform === "uppercase") return text.toUpperCase();
    if (transform === "lowercase") return text.toLowerCase();
    if (transform === "capitalize") return text.replace(/(^|\s)(\S)/g, (_, space: string, first: string) => space + first.toUpperCase());
    return text;
  };
  /** One line of `text` in `style`'s font: its advance, and the font's ascent and descent. */
  const measureLine = (text: string, style: CSSStyleDeclaration) => {
    if (!pen) throw new Error("the probe has no 2D canvas to measure a form control's text with");
    pen.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    pen.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    const metrics = pen.measureText(transformText(text, style.textTransform));
    return { width: metrics.width, ascent: metrics.fontBoundingBoxAscent, descent: metrics.fontBoundingBoxDescent };
  };
  /**
   * Where a control paints its text: the content box, narrowed to the text's width and the
   * font's line metrics (a single-line control centres its line, a textarea wraps at its
   * content width from the top), placed by the text's alignment and carried through the
   * control's own scale. And how far the text overflows the content box, in layout px.
   */
  const fieldGeometry = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, field: FieldText, scale: { x: number; y: number }) => {
    const own = styleOf(el);
    const px = (value: string) => parseFloat(value) || 0;
    const box = el.getBoundingClientRect();
    const padLeft = px(own.paddingLeft);
    const padTop = px(own.paddingTop);
    const contentWidth = Math.max(0, el.clientWidth - padLeft - px(own.paddingRight));
    const contentHeight = Math.max(0, el.clientHeight - padTop - px(own.paddingBottom));
    const lines = field.text.split("\n").map((line) => measureLine(line, field.style));
    const first = lines[0]!;
    const contentArea = first.ascent + first.descent;
    const lineHeight = field.style.lineHeight === "normal" ? contentArea : px(field.style.lineHeight);
    const firstWidth = Math.min(first.width, contentWidth);
    const rtl = own.direction === "rtl";
    const align = field.style.textAlign;
    const startOf = (width: number) => {
      if (align.endsWith("center")) return (contentWidth - width) / 2;
      const right = align.endsWith("right") || (align === "end" && !rtl) || ((align === "start" || align === "justify") && rtl);
      return right ? contentWidth - width : 0;
    };
    let width = firstWidth;
    let height = Math.min(contentHeight, contentArea);
    let x = startOf(firstWidth);
    let y = (contentHeight - contentArea) / 2;
    if (field.control === "textarea") {
      const rows = lines.reduce((n, line) => n + Math.max(1, Math.ceil(line.width / Math.max(contentWidth, 1))), 0);
      if (rows > 1) {
        width = contentWidth;
        x = 0;
      }
      y = (lineHeight - contentArea) / 2;
      height = Math.min(contentHeight, (rows - 1) * lineHeight + contentArea);
    }
    const originX = box.left + (el.clientLeft + padLeft) * scale.x;
    const originY = box.top + (el.clientTop + padTop) * scale.y;
    const left = originX + x * scale.x;
    const top = originY + y * scale.y;
    // Chromium reports a field's value and a textarea's placeholder in the control's scroll
    // extent; a single-line placeholder and a select's label it does not, so those are measured.
    const selfOverflow = field.control === "textarea"
      ? { x: 0, y: el.scrollHeight - el.clientHeight }
      : field.control === "input" && field.part === "value"
        ? { x: el.scrollWidth - el.clientWidth, y: 0 }
        : { x: round(Math.max(0, first.width - contentWidth)), y: 0 };
    return {
      union: { left, top, right: left + width * scale.x, bottom: top + height * scale.y },
      point: { x: originX + (startOf(firstWidth) + firstWidth / 2) * scale.x, y: top + (contentArea * scale.y) / 2 },
      selfOverflow,
    };
  };

  const edgesToBox = (union: Edges) => boxOf({ left: union.left, top: union.top, width: union.right - union.left, height: union.bottom - union.top });
  const flags = (el: Element) => ({
    ariaHidden: el.closest('[aria-hidden="true"]') !== null,
    disabled: el.closest('[aria-disabled="true"], [disabled]') !== null,
  });

  // Pass one: every text leaf's styles, boxes and clipping, read before the stack style
  // goes in, so pointer-events reads its real value above.
  const pending: { el: Element; raw: RawText; point: { x: number; y: number } }[] = [];
  const range = document.createRange();
  for (const el of [row, ...Array.from(row.querySelectorAll("*"))]) {
    if (UNPAINTED.has(el.localName) || inChrome(el) || !visible(el)) continue;
    const field = fieldTextOf(el);
    if (field) {
      const groups = groupsOf(el);
      if (groups.some((id) => groupOpacity[id] === 0)) continue;
      const control = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const scale = scaleOf(el);
      const { union, point, selfOverflow } = fieldGeometry(control, field, scale);
      pending.push({
        el,
        point,
        raw: {
          text: field.text.replace(/\s+/g, " ").trim().slice(0, 80),
          box: edgesToBox(union),
          size: parseFloat(field.style.fontSize),
          scale: scale.y,
          weight: weightOf(field.style),
          family: familyOf(field.style),
          color: inkOf(field.style),
          // A placeholder's own opacity (Firefox's default is 0.54; Chromium's is 1).
          colorAlpha: field.part === "placeholder" ? (Number.isFinite(parseFloat(field.style.opacity)) ? parseFloat(field.style.opacity) : 1) : 1,
          svg: false,
          field: { control: field.control, part: field.part },
          ...flags(el),
          groups,
          selfOverflow,
          // A control clips its text to its content box.
          clipsSelf: true,
          ellipsis: styleOf(el).textOverflow === "ellipsis",
          clipper: clipperOf(el, union),
          stack: null,
          stackNote: null,
          covered: false,
        },
      });
      continue;
    }
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
    const first = rects[0]!;
    pending.push({
      el,
      point: { x: first.left + first.width / 2, y: first.top + first.height / 2 },
      raw: {
        text: textNodes.map((n) => n.textContent ?? "").join("").replace(/\s+/g, " ").trim().slice(0, 80),
        box: edgesToBox(union),
        size: parseFloat(style.fontSize),
        scale: scaleOf(el).y,
        weight: weightOf(style),
        family: familyOf(style),
        color: svg ? style.fill : inkOf(style),
        colorAlpha: svg ? parseFloat(style.fillOpacity || "1") : 1,
        svg,
        field: null,
        ...flags(el),
        groups,
        selfOverflow,
        clipsSelf: style.overflowX !== "visible" || style.overflowY !== "visible",
        ellipsis: style.textOverflow === "ellipsis" || (lineClamp !== "" && lineClamp !== "none"),
        clipper: clipperOf(el, union),
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
    // A field the user cannot edit (react-native-web's `editable={false}`) says so natively.
    if ((el as HTMLInputElement).readOnly) state.readonly = "true";
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
    origin: { x: round(cardBox.left), y: round(cardBox.top) },
    box: boxOf(row.getBoundingClientRect()),
    scroll: { scrollWidth: row.scrollWidth, clientWidth: row.clientWidth, scrollHeight: row.scrollHeight, clientHeight: row.clientHeight },
    groupOpacity,
    groupBoxes,
    texts: pending.map((p) => p.raw),
    interactive,
  };
}
