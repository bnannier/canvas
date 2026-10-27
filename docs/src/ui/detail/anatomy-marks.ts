// Where the Anatomy figure's numbered markers go (Component.dc.html `_measure`), kept free
// of React so it is unit-tested on its own (test/detail-knobs.test.ts). Each measured part
// gets a 22 px marker on a leader line, alternating above and below the part in part
// order, 30 px off its edge, kept 14 px inside the figure; a marker that would land within
// 28 px of one already placed steps 28 px along, wrapping to the next row outward.

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

const EDGE = 14;
const OFFSET = 30;
const STEP = 28;
const RADIUS = 11;

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
