import { useId, useState, type ReactNode } from "react";
import Svg, { Defs, Line, LinearGradient, Pattern, Rect, Stop } from "react-native-svg";
import { Badge, Card, Column, Container, Icon, Row, Typography, View, alpha, breakpoints, statusColors, useMeasuredWidth, useTheme, type ColorTokens } from "@nannier/canvas";
import { shadow } from "../../../../src/style/shadow.js";

// The Layout page's diagrams (`Canvas v4.0.0 Layout.dc.html`, the `c-breakpoints`,
// `c-responsive`, `c-resolution`, `c-dashboard-grid`, `c-layout` and `c-app-frame` cards):
// the window-width ruler, the column strips, the responsive card's staging ground and its
// sizing outlines, the container tier bar, the dashboard's column guides, the gap and
// container-step drawings, the Grid's placeholder tiles and the window-and-phone frame.
// They are explanatory drawings no kit component makes (the brand-illustration exception,
// Layout owner decision OD-1): built from tokens and kit parts at the hand-off's geometry
// around the live kit components, hidden from assistive tech and untouchable.

/** The accent's ring (the hand-off's `--ion-ring`): the accent at .35 on the dark page, .28 on the light. */
const ringOf = (tokens: ColorTokens, dark: boolean) => alpha(tokens.primary, dark ? 0.35 : 0.28);

/** The accent's soft wash (the hand-off's `--ion-soft`). */
const softOf = (tokens: ColorTokens) => tokens["primary-soft"] ?? alpha(tokens.primary, 0.16);

/** The hand-off's `--cyan` and `--mint` at a wash (`color-mix(in oklch, var(--cyan) N%, transparent)`). */
const hueWash = (tokens: ColorTokens, hue: "cyan" | "mint", amount: number) => alpha(tokens[hue === "cyan" ? "chart-2" : "chart-3"], amount);

/**
 * A hatched fill spread over its box (`repeating-linear-gradient(135deg, <color> 0 <stripe>px,
 * transparent <stripe>px <period>px)`): stripes running bottom-left to top-right, `period`
 * apart across them.
 */
export function Hatch({ color, stripe, period }: { color: string; stripe: number; period: number }) {
  const id = `hatch${useId().replace(/[^A-Za-z0-9]/g, "")}`;
  return (
    <View aria-hidden style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" }}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} x={0} y={0} width={period} height={period} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect x={0} y={0} width={stripe} height={period} fill={color} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** The ruler's right end: the window widths it draws run 0 to 1800 px. */
const RULER_END = 1800;
const at = (px: number) => `${(px / RULER_END) * 100}%` as const;

/**
 * A label centred on a point of its parent's width (the hand-off's `left:N%;
 * transform:translateX(-50%)`): a box wide enough for the label, centred on `left`.
 */
function Anchor({ left, top, children }: { left: `${number}%`; top: number; children: ReactNode }) {
  return (
    <View style={{ position: "absolute", left, top, width: 240, marginLeft: -120, alignItems: "center", pointerEvents: "none" }}>
      {children}
    </View>
  );
}

/** JetBrains Mono's advance (0.6 em): the width of a mono label of `chars` at `size` px. */
const monoWidth = (chars: number, size: number) => chars * size * 0.6;

/**
 * The breakpoints card's window-width ruler (`padding:26px 0 30px` round a 46 px strip at
 * radius 12): the phone, tablet and desktop segments to scale over 0 to 1800 px in the
 * mint, cyan and accent washes, each named at its bottom-left; the breakpoints' ticks above
 * at their widths, dashed guides at md, xl and 2xl, and a marker at this window's width
 * with its readout `label` (the kit `Badge tick contrast`) under it, once the width is known
 * (0 on the server and the first frame draws no marker). The ruler measures itself: where it
 * is too narrow for every name (a phone), a tick that would overlap the one before it and a
 * segment name wider than its segment drop out, and the readout stays inside the ruler.
 */
export function WindowRuler({ width, label }: { width: number; label: string }) {
  const { tokens } = useTheme();
  const ruler = useMeasuredWidth();
  const [readout, setReadout] = useState(0);
  const span = ruler.width;
  const edge = tokens["field-border"] ?? tokens.input;
  const px = (value: number) => (value / RULER_END) * span;
  const segments = [
    { name: "phone", width: at(breakpoints.sm), share: breakpoints.sm, fill: hueWash(tokens, "mint", 0.14), hue: "mint" as const },
    { name: "tablet", width: at(breakpoints.lg - breakpoints.sm), share: breakpoints.lg - breakpoints.sm, fill: hueWash(tokens, "cyan", 0.14), hue: "cyan" as const },
    { name: "desktop", share: RULER_END - breakpoints.lg, fill: softOf(tokens), hue: "primary" as const },
  ];
  // Every tick on the unmeasured frame; once measured, each one clear of the last kept.
  const ticks: { key: keyof typeof breakpoints; x: `${number}%` }[] = [];
  let last: { at: number; width: number } | null = null;
  for (const key of Object.keys(breakpoints) as (keyof typeof breakpoints)[]) {
    const text = `${key} ${breakpoints[key]}`;
    const tickWidth = monoWidth(text.length, 10) + 8;
    const x = px(breakpoints[key]);
    if (span > 0 && last && x - last.at < (tickWidth + last.width) / 2) continue;
    if (span > 0 && x + tickWidth / 2 > span) continue;
    ticks.push({ key, x: at(breakpoints[key]) });
    last = { at: x, width: tickWidth };
  }
  const guides = [breakpoints.md, breakpoints.xl, breakpoints["2xl"]].map(at);
  const markerAt = Math.min(0.995, width / RULER_END);
  const marker = `${markerAt * 100}%` as const;
  // The readout centred under the marker, held inside the ruler at either end.
  const readoutLeft = Math.max(0, Math.min(span - readout, markerAt * span - readout / 2));
  return (
    <View aria-hidden onLayout={ruler.onLayout} style={{ paddingTop: 26, paddingBottom: 30 }}>
      <View style={{ height: 46, borderRadius: 12, overflow: "hidden", flexDirection: "row", borderWidth: 1, borderColor: tokens.border }}>
        {segments.map((segment, index) => (
          <View
            key={segment.name}
            style={{
              ...(segment.width ? { width: segment.width } : { flexGrow: 1, flexShrink: 1, flexBasis: "0%" }),
              backgroundColor: segment.fill,
              borderLeftWidth: index > 0 ? 1 : 0,
              borderColor: edge,
              justifyContent: "flex-end",
              paddingVertical: 7,
              paddingHorizontal: 10,
            }}
          >
            {span === 0 || px(segment.share) - 20 >= monoWidth(segment.name.length, 11) ? (
              <Typography tiny mono medium natural {...{ [segment.hue]: true }}>{segment.name}</Typography>
            ) : null}
          </View>
        ))}
      </View>
      {ticks.map((tick) => (
        <Anchor key={tick.key} left={tick.x} top={0}>
          <Typography tick mono subtle>{`${tick.key} ${breakpoints[tick.key]}`}</Typography>
        </Anchor>
      ))}
      <View style={{ position: "absolute", top: 18, left: 0, right: 0, height: 56, pointerEvents: "none" }}>
        <Svg width="100%" height="100%">
          {guides.map((x) => <Line key={x} x1={x} x2={x} y1={0} y2={56} stroke={edge} strokeWidth={1} strokeDasharray="3 3" />)}
        </Svg>
      </View>
      {width > 0 && span > 0 ? (
        <>
          <View style={{ position: "absolute", top: 18, left: marker, width: 2, marginLeft: -1, height: 62, borderRadius: 1, backgroundColor: tokens.foreground }} />
          <View
            onLayout={(event) => setReadout(Math.round(event.nativeEvent.layout.width))}
            style={{ position: "absolute", top: 84, left: readoutLeft, pointerEvents: "none" }}
          >
            <Badge tick contrast>{label}</Badge>
          </View>
        </>
      ) : null}
    </View>
  );
}

/**
 * A form factor's column strip (`display:grid;grid-template-columns:repeat(N,1fr);height:52px;
 * padding:0 <pad>px;border-radius:9px;background:var(--sf)`): `count` columns `gap` apart
 * in the tier's hue at 22%.
 */
export function ColumnStrip({ count, gap, pad, hue }: { count: number; gap: number; pad: number; hue: "mint" | "cyan" | "primary" }) {
  const { tokens } = useTheme();
  const fill = hue === "primary" ? softOf(tokens) : hueWash(tokens, hue, 0.22);
  return (
    <View aria-hidden style={{ height: 52, borderRadius: 9, backgroundColor: tokens.card, paddingHorizontal: pad, flexDirection: "row", gap }}>
      {Array.from({ length: count }, (_, key) => <View key={key} style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", backgroundColor: fill }} />)}
    </View>
  );
}

/**
 * The responsive card's staging ground (`padding:22px 26px 22px 22px;border-radius:16px;
 * background:repeating-linear-gradient(135deg,var(--sf3) 0 1px,transparent 1px 9px),
 * var(--bg2);border:1px solid var(--ln)`): the kit sunken Card, hatched, holding the frame.
 */
export function StagingGround({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <Card sunken flush clip>
      <Hatch color={tokens.secondary} stripe={1} period={9} />
      <View style={{ paddingTop: 22, paddingRight: 26, paddingBottom: 22, paddingLeft: 22 }}>{children}</View>
    </Card>
  );
}

/**
 * The staged app's frame (`border-radius:14px;background:var(--bg);border:1px solid
 * var(--ln2);box-shadow:var(--sh-lg)`, its content clipped at 13): a window on the page
 * colour, lifted off the ground.
 */
export function StageFrame({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ borderRadius: 14, backgroundColor: tokens.background, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.input, ...shadow("lg", tokens) }}>
      <View style={{ borderRadius: 13, overflow: "hidden" }}>{children}</View>
    </View>
  );
}

/** What a sizing outline marks: a fill, a hug, a fixed size or a tile grid. */
export type SizingKind = "fill" | "hug" | "fixed" | "grid";

/**
 * The responsive card's "Show sizing" layer (`outline:1.5px dashed var(--ion|--cyan|--mint|
 * --warn);outline-offset:N`): with `on`, a dashed outline `offset` px outside the part it
 * wraps and the part's tag pinned inside its top-right corner, the part itself unchanged.
 * A part too small to carry its tag (a hugging button) takes it `beside` it instead, at its
 * start, centred on it.
 */
export function SizingOutline({ on, kind, offset = 2, radius = 0, tag, beside, children }: { on: boolean; kind: SizingKind; offset?: number; radius?: number; tag?: ReactNode; beside?: boolean; children: ReactNode }) {
  const { tokens } = useTheme();
  const color = kind === "fill"
    ? tokens.primary
    : kind === "hug"
      ? tokens["chart-2"]
      : kind === "fixed"
        ? tokens["chart-3"]
        : statusColors(tokens, "warning").dot;
  return (
    <View>
      {children}
      {on ? (
        <View
          aria-hidden
          style={{ position: "absolute", top: -offset, right: -offset, bottom: -offset, left: -offset, borderWidth: 1.5, borderStyle: "dashed", borderColor: color, borderRadius: radius ? radius + offset : 0, pointerEvents: "none" }}
        >
          {tag ? (
            beside ? (
              <View style={{ position: "absolute", top: 0, bottom: 0, right: "100%", marginRight: 6, justifyContent: "center" }}>{tag}</View>
            ) : (
              <View style={{ position: "absolute", top: 6, right: 6 }}>{tag}</View>
            )
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/**
 * The resolution card's container tier bar (`display:flex;height:26px;border-radius:8px;
 * overflow:hidden`): three segments in the mint, cyan and accent washes at 16%, split by
 * `--ln2`, each named in 500 10 px mono in its own ink.
 */
export function TierBar({ tiers }: { tiers: readonly { label: string; share: number }[] }) {
  const { tokens } = useTheme();
  const looks = [
    { fill: hueWash(tokens, "mint", 0.16), hue: "mint" },
    { fill: hueWash(tokens, "cyan", 0.16), hue: "cyan" },
    { fill: softOf(tokens), hue: "primary" },
  ] as const;
  return (
    <View aria-hidden style={{ height: 26, borderRadius: 8, overflow: "hidden", flexDirection: "row" }}>
      {tiers.map((tier, index) => (
        <View
          key={tier.label}
          style={{ flexGrow: tier.share, flexShrink: 1, flexBasis: "0%", minWidth: 0, paddingHorizontal: 8, justifyContent: "center", backgroundColor: looks[index]!.fill, borderLeftWidth: index > 0 ? 1 : 0, borderColor: tokens["field-border"] ?? tokens.input }}
        >
          <Typography tick mono {...{ [looks[index]!.hue]: true }}>{tier.label}</Typography>
        </View>
      ))}
    </View>
  );
}

/**
 * The dashboard card's stage (`position:relative;padding:10px;border-radius:16px;
 * background:var(--bg2);border:1px solid var(--ln)`): the kit sunken Card, its twelve
 * column guides (`--ion-soft`, radius 4, 8 apart) laid behind the live grid it holds.
 */
export function ColumnGuides({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <Card sunken flush>
      <View style={{ padding: 10 }}>
        <View aria-hidden style={{ position: "absolute", top: 10, right: 10, bottom: 10, left: 10, flexDirection: "row", gap: 8, pointerEvents: "none" }}>
          {Array.from({ length: 12 }, (_, key) => <View key={key} style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 4, backgroundColor: softOf(tokens) }} />)}
        </View>
        {children}
      </View>
    </Card>
  );
}

/** The 34 by 22 tile the gap rows space apart (`border-radius:6px;background:var(--sf3);border:1px solid var(--ln2)`). */
function GapTile() {
  const { tokens } = useTheme();
  return <View style={{ width: 34, height: 22, borderRadius: 6, backgroundColor: tokens.secondary, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.input }} />;
}

/**
 * A gap-scale row (`grid-template-columns:60px auto 1fr;gap:12px`): the step's name, three
 * tiles set apart by the live kit Row at that gap over a hatched accent strip (radius 7),
 * and the gap in px.
 */
export function GapRow({ name, value }: { name: "flush" | "tight" | "snug" | "cozy" | "relaxed" | "loose"; value: number }) {
  const { tokens } = useTheme();
  return (
    <Row cozy alignCenter>
      <View style={{ width: 60 }}><Typography codeLabel mono subtle>{name}</Typography></View>
      <View aria-hidden style={{ borderRadius: 7, overflow: "hidden" }}>
        <Hatch color={softOf(tokens)} stripe={3} period={6} />
        <Row {...{ [name]: true }}>
          <GapTile />
          <GapTile />
          <GapTile />
        </Row>
      </View>
      <Typography tiny mono muted natural>{String(value)}</Typography>
    </Row>
  );
}

/**
 * A Container step's bar (`grid-template-columns:44px 1fr;gap:10px`): the step's name, and a
 * 20 px bar at the step's share of the page width (min 40) in the accent wash inside its
 * ring, its width at its end; the `page` step solid, with the accent's glow.
 */
export function StepBar({ name, value, page }: { name: string; value: number; page: number }) {
  const { tokens, scheme } = useTheme();
  const full = value >= page;
  return (
    <Row comfortable alignCenter>
      <View style={{ width: 44 }}><Typography codeLabel mono subtle>{name}</Typography></View>
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0 }}>
        <View
          aria-hidden
          style={{
            width: `${(value / page) * 100}%`,
            minWidth: 40,
            height: 20,
            borderRadius: 6,
            alignItems: "flex-end",
            justifyContent: "center",
            paddingHorizontal: full ? 0 : 6,
            ...(full
              ? { backgroundColor: tokens.primary, boxShadow: `0px 6px 16px -8px ${tokens.glow ?? tokens.ring}` }
              : { backgroundColor: softOf(tokens), borderWidth: 1, borderColor: ringOf(tokens, scheme === "dark") }),
          }}
        >
          {full ? <Badge tick default>{String(value)}</Badge> : <Typography tick mono primary>{String(value)}</Typography>}
        </View>
      </View>
    </Row>
  );
}

/**
 * A Grid card's placeholder tile (`height:58px;border-radius:12px;background:var(--sf3);
 * border:1px solid var(--ln2)`, its label centred in 500 11 px mono): with `reflows`, the
 * dashed tile at .6 that stands for the one that wraps.
 */
export function PlaceholderTile({ label, reflows }: { label: string; reflows?: boolean }) {
  const { tokens } = useTheme();
  return (
    <View
      aria-hidden
      style={{ height: 58, borderRadius: 12, backgroundColor: tokens.secondary, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.input, alignItems: "center", justifyContent: "center", ...(reflows ? { borderStyle: "dashed" as const, opacity: 0.6 } : null) }}
    >
      <Typography tiny mono medium muted natural>{label}</Typography>
    </View>
  );
}

/** A placeholder bar (`height:H;width:W;border-radius:H/2;background:var(--sf4)`). */
function Bar({ height, width }: { height: number; width: `${number}%` }) {
  const { tokens } = useTheme();
  return <View style={{ height, width, borderRadius: height / 2, backgroundColor: tokens["surface-raised"] ?? tokens.muted }} />;
}

/** A placeholder card (`height:H;border-radius:R;background:var(--sf);border:1px solid var(--ln)`). */
function Block({ height, radius, lifted, grow }: { height: number; radius: number; lifted?: boolean; grow?: boolean }) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        height,
        borderRadius: radius,
        backgroundColor: tokens.card,
        borderWidth: 1,
        borderColor: tokens.border,
        ...(lifted ? shadow("sm", tokens) : null),
        ...(grow ? { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0 } : null),
      }}
    />
  );
}

/**
 * The app-frame card's window (`flex:1 1 520px;height:320px;border-radius:16px;border:1px
 * solid var(--ln2);background:var(--bg2)`): the `banner` the caller passes (the live kit
 * Navbar) over a page whose 28 px gutters are hatched in the accent and whose capped column
 * (dashed in the accent's ring, the `md` step, 448) holds a heading bar, two cards and a
 * block, with its `label` under them at the column's foot.
 */
function WindowFrame({ banner, label }: { banner: ReactNode; label: string }) {
  const { tokens, scheme } = useTheme();
  const ring = ringOf(tokens, scheme === "dark");
  return (
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 520, minWidth: 0, height: 320, borderRadius: 16, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.input, backgroundColor: tokens["surface-sunken"] ?? tokens.muted, overflow: "hidden" }}>
      {banner}
      <View aria-hidden style={{ flexGrow: 1, paddingVertical: 20, overflow: "hidden" }}>
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 28 }}><Hatch color={softOf(tokens)} stripe={3} period={7} /></View>
        <View style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 28 }}><Hatch color={softOf(tokens)} stripe={3} period={7} /></View>
        <Container md>
          <View style={{ paddingHorizontal: 16, gap: 12, borderLeftWidth: 1, borderRightWidth: 1, borderStyle: "dashed", borderColor: ring }}>
            <Bar height={14} width="45%" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Block height={72} radius={14} lifted grow />
              <Block height={72} radius={14} lifted grow />
            </View>
            <Block height={96} radius={14} lifted />
            <View style={{ alignItems: "center" }}>
              <Typography tick mono primary>{label}</Typography>
            </View>
          </View>
        </Container>
      </View>
    </View>
  );
}

/** The phone's brand mark: a 9 px diamond in the accent-to-cyan sweep. */
function Diamond() {
  const { tokens } = useTheme();
  const id = `diamond${useId().replace(/[^A-Za-z0-9]/g, "")}`;
  return (
    <Svg width={13} height={13} viewBox="0 0 13 13">
      <Defs>
        <LinearGradient id={id} x1={0} y1={0} x2={1} y2={1}>
          <Stop offset={0} stopColor={tokens.primary} />
          <Stop offset={1} stopColor={tokens["chart-2"]} />
        </LinearGradient>
      </Defs>
      <Rect x={2} y={2} width={9} height={9} rx={2} fill={`url(#${id})`} transform="rotate(45 6.5 6.5)" />
    </Svg>
  );
}

/** A safe-area band (`repeating-linear-gradient(135deg,var(--warn-soft) 0 3px,transparent 3px 7px)`). */
function SafeBand({ height, children }: { height: number; children?: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ height, alignItems: "center", justifyContent: "center" }}>
      <Hatch color={statusColors(tokens, "warning").wash} stripe={3} period={7} />
      {children}
    </View>
  );
}

/**
 * The app-frame card's phone (`flex:0 0 200px;height:400px;border-radius:36px;border:1px solid
 * var(--ln2);background:var(--bg2);box-shadow:var(--sh-md)`): the hatched top safe area, a
 * 44 px bar with the brand and its menu, a page of a heading bar and three cards inside
 * hatched 16 px gutters, and the hatched bottom inset with its home indicator.
 */
function PhoneFrame() {
  const { tokens } = useTheme();
  return (
    <View aria-hidden style={{ width: 200, height: 400, borderRadius: 36, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.input, backgroundColor: tokens["surface-sunken"] ?? tokens.muted, overflow: "hidden", ...shadow("md", tokens) }}>
      <SafeBand height={38}><Typography tick mono warning>safe area · top</Typography></SafeBand>
      <View style={{ height: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, backgroundColor: tokens.card, borderBottomWidth: 1, borderColor: tokens["field-border"] ?? tokens.input }}>
        <Diamond />
        <Typography small semibold>Riskora</Typography>
        <View style={{ flexGrow: 1 }} />
        <Icon menu size={16} subtle decorative />
      </View>
      <View style={{ flexGrow: 1, paddingVertical: 14, paddingHorizontal: 16, gap: 10 }}>
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 16 }}><Hatch color={softOf(tokens)} stripe={3} period={7} /></View>
        <View style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 16 }}><Hatch color={softOf(tokens)} stripe={3} period={7} /></View>
        <Bar height={12} width="55%" />
        <Block height={64} radius={12} />
        <Block height={64} radius={12} />
        <Block height={64} radius={12} />
      </View>
      <SafeBand height={30}><View style={{ width: 72, height: 4, borderRadius: 2, backgroundColor: tokens["muted-foreground"] }} /></SafeBand>
    </View>
  );
}

/** A legend swatch (`width:14px;height:14px;border-radius:4px`): the banner's wash or a hatch. */
function LegendSwatch({ kind }: { kind: "banner" | "gutter" | "safe" }) {
  const { tokens, scheme } = useTheme();
  return (
    <View aria-hidden style={{ width: 14, height: 14, borderRadius: 4, overflow: "hidden", ...(kind === "banner" ? { backgroundColor: softOf(tokens), borderWidth: 1, borderColor: ringOf(tokens, scheme === "dark") } : null) }}>
      {kind === "banner" ? null : <Hatch color={kind === "gutter" ? softOf(tokens) : statusColors(tokens, "warning").wash} stripe={2} period={4} />}
    </View>
  );
}

/**
 * The app-frame card's drawing (`display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end`):
 * the window beside the phone, bottom-aligned and wrapping, over the legend row
 * (`gap:10px 24px`, 400 12 px mono in the third ink) that ends with the card's `caption`
 * pushed to its far end.
 */
export function AppFrameDiagram({ banner, label, caption }: { banner: ReactNode; label: string; caption: ReactNode }) {
  return (
    <Column spacious>
      <Row wrap loose alignEnd>
        <WindowFrame banner={banner} label={label} />
        <PhoneFrame />
      </Row>
      <Row wrap loose rowsComfortable alignCenter>
        <Row snug alignCenter><LegendSwatch kind="banner" /><Typography codeLabel mono muted>banner region</Typography></Row>
        <Row snug alignCenter><LegendSwatch kind="gutter" /><Typography codeLabel mono muted>page gutters</Typography></Row>
        <Row snug alignCenter><LegendSwatch kind="safe" /><Typography codeLabel mono muted>safe-area insets, all four edges</Typography></Row>
        <Column grow />
        <Typography codeLabel mono muted>{caption}</Typography>
      </Row>
    </Column>
  );
}
