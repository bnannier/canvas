// Where the Anatomy figure's numbered markers go (Component.dc.html `_measure`, lines 342
// to 347), kept free of React so it is unit-tested on its own (test/detail-knobs.test.ts).
// Each measured part gets a 22 px marker on a leader line, alternating above and below the
// part in part order, 30 px off its edge, kept 14 px inside the stage; a marker that would
// land within 28 px of one already placed steps 28 px along, wrapping to the next row
// outward. The hand-off measures its parts against the stage itself (`an`, the padded
// figure well, line 217), so the rectangles the kit's AnatomyProvider reports against its
// own box are first carried into the stage by the box the provider reports beside them
// (`inStage`).

export interface PartRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnatomyMark {
  /** The part's number, its 1-based place in the spec's part list. */
  n: number;
  /** The marker's centre. */
  x: number;
  y: number;
  /** The leader line: from (x, lineTop) down `lineHeight` px. */
  lineTop: number;
  lineHeight: number;
}

// Line 344: `y=Math.max(14,Math.min(y,r.height-14))`, `x=Math.max(14,Math.min(q.cx,r.width-14))`.
const EDGE = 14;
// Line 344: `let y=up?q.top-30:q.bot+30`.
const OFFSET = 30;
// Line 345: `Math.abs(o.x-x)<28&&Math.abs(o.y-y)<28`, `x+=28`, `y+=up?-28:28`.
const STEP = 28;
// Line 346: `up?y+11:q.bot`, half the 22 px marker (line 220).
const RADIUS = 11;

/**
 * The part rectangles carried from the provider's box into the stage it sits in: the
 * provider reports each part against its own box, and that box against the stage.
 */
export function inStage(rects: Readonly<Record<string, PartRect>>, box: { x: number; y: number }): Record<string, PartRect> {
  const out: Record<string, PartRect> = {};
  for (const [name, r] of Object.entries(rects)) out[name] = { x: r.x + box.x, y: r.y + box.y, width: r.width, height: r.height };
  return out;
}

export function placeMarks(parts: readonly string[], rects: Readonly<Record<string, PartRect>>, box: { width: number; height: number }): AnatomyMark[] {
  const points = parts
    .map((name, i) => ({ n: i + 1, rect: rects[name] }))
    .filter((p): p is { n: number; rect: PartRect } => p.rect != null && (p.rect.width > 0 || p.rect.height > 0))
    .map(({ n, rect }) => ({ n, cx: rect.x + rect.width / 2, top: rect.y, bottom: rect.y + rect.height }));
  const placed: AnatomyMark[] = [];
  points.forEach((point, i) => {
    const up = i % 2 === 0;
    let y = Math.max(EDGE, Math.min(up ? point.top - OFFSET : point.bottom + OFFSET, box.height - EDGE));
    let x = Math.max(EDGE, Math.min(point.cx, box.width - EDGE));
    for (let tries = 0; tries < 16 && placed.some((o) => Math.abs(o.x - x) < STEP && Math.abs(o.y - y) < STEP); tries++) {
      x += STEP;
      if (x > box.width - EDGE) {
        x = EDGE;
        y += up ? -STEP : STEP;
      }
    }
    const lineTop = up ? y + RADIUS : point.bottom;
    const lineHeight = up ? point.top - (y + RADIUS) : y - RADIUS - point.bottom;
    placed.push({ n: point.n, x: Math.round(x), y: Math.round(y), lineTop: Math.round(lineTop), lineHeight: Math.max(0, Math.round(lineHeight)) });
  });
  return placed;
}
