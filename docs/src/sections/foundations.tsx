import { SectionVignette } from "../ui/showcase/section-vignette";
import type { ReactNode } from "react";
import {
  Badge,
  Card,
  Column,
  Divider,
  Emblem,
  Grid,
  GridItem,
  Icon,
  type IconName,
  PALETTES,
  Reveal,
  Row,
  Skeleton,
  Spinner,
  Swatch,
  Switch,
  ThemeProvider,
  Typography,
  colorsFor,
  paletteHue,
  shape,
  useTheme,
  type Palette,
} from "@nannier/canvas";
import { typeRoles } from "../../../src/style/type-scale.js";
import { webSkin as revealSkin } from "../../../src/atoms/reveal/reveal.styles.js";
import { HOVER, HOVER_EASING } from "../../../src/style/motion.js";
import { oklchHex } from "../../../src/style/color.js";
import { statusColors } from "../../../src/style/status.js";
import { primaryText } from "../../../src/style/primary-text.js";
import { NAMES as GLYPHS } from "../../../src/atoms/icon/icon.glyphs.js";
import { GlassWell, RadiusSample, ShowcaseCard, ShowcaseGrid, SpecimenRows } from "../ui/showcase";

// The Foundations section page (`Canvas v4.0.0 Foundations.dc.html`): its hero vignette and
// its eight cards. Every value a card prints is read from the kit's own tables (the tokens,
// the type roles, the shape and motion tables, the glyph set), so the page shows the values
// Canvas ships where they differ from the hand-off's; the differences are recorded in the
// Phase 5 report.

/** A mono caption under a sample (the hand-off's 400 11 px mono label in `--tx3`, the `sampleLabel` role). */
function Mono({ children, right, single }: { children: ReactNode; right?: boolean; single?: boolean }) {
  return <Typography sampleLabel mono muted right={right} numberOfLines={single ? 1 : undefined}>{children}</Typography>;
}

/** A sample's mono meta line (the hand-off's 400 10 px mono value in `--tx3`, the `sampleMeta` role). */
function Meta({ children }: { children: ReactNode }) {
  return <Typography sampleMeta mono muted>{children}</Typography>;
}

/** The animated hero: the display face beside the five accent hues. */
export function Vignette() {
  return <SectionVignette kind="foundations" />;
}

/** Color · Ion spectrum: the five accent hues, the status fills and washes, the chart series. */
function ColorCard() {
  const { tokens } = useTheme();
  // Each tone's fill under its on-fill ink, and its wash under its text ink (the accent's
  // `--ion-tx`, the status inks solved to 4.5:1 on their washes).
  const status = [
    { name: "primary", fill: tokens.primary, onFill: tokens["primary-foreground"], soft: tokens["primary-soft"], ink: primaryText(tokens) },
    { name: "success", fill: tokens.success, onFill: tokens["success-foreground"], soft: tokens["success-soft"], ink: statusColors(tokens, "success").ink },
    { name: "warning", fill: tokens.warning, onFill: tokens["warning-foreground"], soft: tokens["warning-soft"], ink: statusColors(tokens, "warning").ink },
    { name: "destructive", fill: tokens.destructive, onFill: tokens["destructive-foreground"], soft: tokens["destructive-soft"], ink: statusColors(tokens, "error").ink },
  ];
  const series = ([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => tokens[`chart-${n}`]);
  return (
    <ShowcaseCard
      id="c-color"
      caption={`primary: oklch(.74 .17 var(--hue))  dark\nprimary: oklch(.5 .22 var(--hue))  light\ncolorsFor(palette, scheme).primary → ${tokens.primary}`}
    >
      {/* The five hues as the hand-off draws them, `oklch(.72 .17 hue)` in both schemes. */}
      <Row cozy>
        {PALETTES.map((palette) => (
          <Column key={palette} fill>
            <Swatch fluid circle glow centered bare color={oklchHex(0.72, 0.17, paletteHue[palette])} value={String(paletteHue[palette])} accessibilityLabel={`${palette}, hue ${paletteHue[palette]}`} />
          </Column>
        ))}
      </Row>
      <Column snug>
        <Row snug>
          {status.map((tone) => (
            <Column key={tone.name} fill>
              <Swatch tile bare color={tone.fill} ink={tone.onFill}>{tone.name}</Swatch>
            </Column>
          ))}
        </Row>
        <Row snug>
          {status.map((tone) => (
            <Column key={tone.name} fill>
              <Swatch tile small bare color={tone.soft} ink={tone.ink}>{`${tone.name}-soft`}</Swatch>
            </Column>
          ))}
        </Row>
      </Column>
      <Column snug>
        <Swatch segmented steps={series} accessibilityLabel="The chart series, chart-1 to chart-8" />
        <Row between snug>
          <Mono>chart-1</Mono>
          <Mono>series order is fixed</Mono>
          <Mono>chart-8</Mono>
        </Row>
      </Column>
    </ShowcaseCard>
  );
}

/** The neutral roles, each with its value in both schemes. */
const NEUTRALS = [
  "background",
  "surface-sunken",
  "card",
  "secondary",
  "surface-raised",
  "foreground",
  "muted-foreground",
  "subtle-foreground",
] as const;

/** Color · Neutrals: each neutral role in the dark and the light scheme. */
function NeutralsCard() {
  const { palette } = useTheme();
  const dark = colorsFor(palette, "dark");
  const light = colorsFor(palette, "light");
  return (
    <ShowcaseCard id="c-neutrals" caption="Neutrals carry 1–2% blue chroma. Hairlines are alpha white / alpha ink, never a fixed grey.">
      <Column compact>
        {NEUTRALS.map((role) => (
          // The role names are the kit's (longer than the hand-off's `bg`, `text-2`): the name
          // track takes the share that holds the longest on one line in the 340 px card.
          <Row key={role} snug alignCenter>
            <Column weight={1.35}>
              <Typography codeLabel mono subtle>{role}</Typography>
            </Column>
            <Column weight={1}>
              <Swatch bar inline compact color={dark[role]} value={dark[role]} />
            </Column>
            <Column weight={1}>
              <Swatch bar inline compact color={light[role]} value={light[role]} />
            </Column>
          </Row>
        ))}
      </Column>
    </ShowcaseCard>
  );
}

type RoleName = keyof typeof typeRoles;

/** The type card's rows: a role, its sample, its ink, and the face the hand-off names beside it. */
const TYPE_ROWS: { role: RoleName; sample: string; ink?: "foreground" | "subtle" | "muted"; face?: string }[] = [
  { role: "display", sample: "Charged surfaces" },
  { role: "h1", sample: "One API, three native looks" },
  { role: "h2", sample: "Section title sets the room" },
  { role: "h3", sample: "Card title, dialog title, stat label" },
  { role: "label", sample: "Row title, control label, button", ink: "foreground", face: "Instrument" },
  { role: "body", sample: "Body. Every visual variation is a boolean prop, named for what it means. Passing the prop turns it on.", ink: "subtle" },
  { role: "small", sample: "Small. Descriptions, helper text, table cells, toasts.", ink: "subtle" },
  { role: "eyebrow", sample: "Meta · 0x3DA3F5 · 12:04 · ⌘K", ink: "muted", face: "Mono" },
];

/** A role's spec line from the kit's own table: size/leading · weight · tracking. */
function roleSpec(role: RoleName, face?: string): string {
  const style = typeRoles[role] as { fontSize: number; lineHeight: number; fontWeight: string; letterSpacing?: number };
  const parts = [role, `${style.fontSize}/${style.lineHeight}`, style.fontWeight];
  if (face) parts.push(face);
  if (style.letterSpacing) {
    const em = Math.round((style.letterSpacing / style.fontSize) * 1000) / 10;
    parts.push(`${em < 0 ? "−" : "+"}${Math.abs(em)}%`);
  }
  return parts.join(" · ");
}

/** Type · Scale: each role set in its own face, its spec at the end of the line. */
function TypographyCard() {
  return (
    <ShowcaseCard
      id="c-typography"
      title="Type · Scale"
      meta="Bricolage Grotesque · Instrument Sans · JetBrains Mono"
      caption="<Typography display> · <Typography h3> · <Typography body muted> · <Typography tiny> · <Text numberOfLines> for truncation"
    >
      <SpecimenRows>
        {TYPE_ROWS.map((row) => (
          <Row key={row.role} between baseline wrap relaxed>
            <Column shrink>
              {/* A specimen of the role, not a heading of the page; the display line keeps to one line. */}
              <Typography {...{ [row.role]: true }} {...(row.ink ? { [row.ink]: true } : null)} numberOfLines={row.role === "display" ? 1 : undefined} accessibilityRole="text">{row.sample}</Typography>
            </Column>
            <Mono right single>{roleSpec(row.role, row.face)}</Mono>
          </Row>
        ))}
      </SpecimenRows>
    </ShowcaseCard>
  );
}

/** The shape card's samples: each role of the kit's web corner table on a blank box. */
function shapeSamples(web: typeof shape.web): { role: string; radius: number; width: number; height?: number }[] {
  return [
    { role: "control", radius: web.control, width: 48 },
    { role: "tile", radius: web.tile, width: 64 },
    { role: "card", radius: web.card, width: 80 },
    { role: "dialog", radius: web.dialog, width: 96 },
    { role: "sheet", radius: web.sheet, width: 112 },
    { role: "pill", radius: web.pill, width: 64, height: 32 },
  ];
}

/** Shape · Radius: each role's corner on a blank sample, at the kit's own radius. */
function ShapeCard() {
  const web = shape.web;
  return (
    <ShowcaseCard
      id="c-shape"
      caption={`shape.web = { control: ${web.control}, tile: ${web.tile}, card: ${web.card}, dialog: ${web.dialog}, sheet: ${web.sheet} }`}
    >
      <Row wrap cozy alignEnd>
        {shapeSamples(web).map((sample) => (
          <Column key={sample.role} snug alignCenter>
            <RadiusSample width={sample.width} height={sample.height} radius={sample.radius} />
            <Mono>{`${sample.radius >= 9999 ? "full" : sample.radius} · ${sample.role}`}</Mono>
          </Column>
        ))}
      </Row>
    </ShowcaseCard>
  );
}

/** The depth card's tiers: each Card elevation on an empty sample, named by its prop. */
const DEPTHS: { label: string; elevation: "flat" | "heroShadow" | "raised" | null }[] = [
  { label: "flat", elevation: "flat" },
  { label: "card", elevation: null },
  { label: "heroShadow", elevation: "heroShadow" },
  { label: "raised", elevation: "raised" },
];

/** Depth · Elevation: the card's four elevations, then the floating glass material. */
function DepthCard() {
  const { scheme, palette } = useTheme();
  const accent: Partial<Record<Palette, boolean>> = { [palette]: true };
  return (
    <ShowcaseCard id="c-depth" caption="the shade tokens: shade · shade-md · shade-lg · ≤ .2 α in light">
      <Row cozy alignEnd>
        {DEPTHS.map((depth) => (
          <Column key={depth.label} fill snug>
            <Card sample calloutCorners {...(depth.elevation ? { [depth.elevation]: true } : null)} />
            <Mono single>{depth.label}</Mono>
          </Column>
        ))}
      </Row>
      <ThemeProvider scheme={scheme} {...accent} glass>
        <GlassWell>
          <Card floating heroShadow calloutCorners flush grow>
            <Column grow center pad>
              <Row comfortable alignCenter>
                <Badge dot primary />
                <Typography label foreground>glass · blur 20 · saturate 1.6 · the layer's under-fill</Typography>
              </Row>
            </Column>
          </Card>
        </GlassWell>
      </ThemeProvider>
    </ShowcaseCard>
  );
}

/** Motion · Spring: an entrance, the placeholder, and the spinner that never stops. */
function MotionCard() {
  return (
    <ShowcaseCard
      id="c-motion"
      caption={`reveal  ease-out cubic · ${revealSkin.duration}ms (brisk ${revealSkin.durationBrisk}ms)\nhover   ${HOVER_EASING} · ${HOVER.button.duration}–${HOVER.card.duration}ms\n<Reveal> · <RevealGroup> rise ${revealSkin.travel}px once, then stay`}
    >
      <Column roomy>
        <Reveal>
          <Card flat compact>
            <Switch defaultChecked>Glass surfaces</Switch>
          </Card>
        </Reveal>
        {/* The hand-off's 2 by 1fr placeholder grid: two bars, then a third at 60% of its cell. */}
        <Column snug>
          <Row snug>
            <Column fill><Skeleton text large /></Column>
            <Column fill><Skeleton text large /></Column>
          </Row>
          <Row snug>
            <Column fill><Skeleton text large short /></Column>
            <Column fill />
          </Row>
        </Column>
        <Spinner small description="Spinner keeps spinning under reduced motion; it carries information." />
      </Column>
    </ShowcaseCard>
  );
}

/** The hand-off's icon sample (its `ICON_SET`). */
const ICON_SET: IconName[] = [
  "search", "bell", "settings", "user", "users", "home", "inbox", "calendar", "mail", "lock", "shield", "sparkles",
  "layers", "layoutGrid", "chartLine", "database", "cloud", "code", "gitBranch", "rocket", "zap", "star", "heart", "trash2",
];

/** The icon tones, each on the glyph the hand-off pairs it with. */
const ICON_TONES: { icon: IconName; tone?: "primary" | "success" | "warning" | "destructive" | "muted"; label: string }[] = [
  { icon: "bell", label: "default" },
  { icon: "sparkles", tone: "primary", label: "primary" },
  { icon: "circleCheck", tone: "success", label: "success" },
  { icon: "alertTriangle", tone: "warning", label: "warning" },
  { icon: "trash2", tone: "destructive", label: "destructive" },
  { icon: "eyeOff", tone: "muted", label: "muted" },
];

/** Icon · N glyphs: a sample of the set, the tones and the sizes. */
function IconCard() {
  return (
    <ShowcaseCard
      id="c-icon"
      title={`Icon · ${GLYPHS.length} glyphs`}
      caption="<Icon search /> · <Icon trash2 destructive /> · <Icon bell primary size={20} /> · one weight, everywhere"
    >
      <Grid minTileWidth={40} compact>
        {ICON_SET.map((name) => <Icon key={name} cell subtle {...{ [name]: true }} size={20} accessibilityLabel={name} />)}
      </Grid>
      <Column relaxed>
        <Divider />
        <Row wrap airy alignCenter>
          {ICON_TONES.map((entry) => (
            <Row key={entry.label} compact alignCenter>
              <Icon {...{ [entry.icon]: true }} {...(entry.tone ? { [entry.tone]: true } : null)} size={20} decorative />
              <Mono>{entry.label}</Mono>
            </Row>
          ))}
        </Row>
      </Column>
      <Row spacious alignEnd>
        {[16, 20, 24, 32].map((size) => (
          <Column key={size} compact alignCenter>
            <Icon rocket size={size} decorative />
            <Meta>{String(size)}</Meta>
          </Column>
        ))}
      </Row>
    </ShowcaseCard>
  );
}

/** The accent ramp's steps (the hand-off's Swatch block ramp): lightness and chroma in oklch. */
const RAMP: readonly (readonly [number, number])[] = [[0.32, 0.1], [0.42, 0.14], [0.52, 0.19], [0.62, 0.19], [0.74, 0.17], [0.84, 0.11], [0.93, 0.05]];

/** An oklch lightness as the hand-off writes it, without the leading zero (`.32`). */
const lightness = (l: number) => String(l).replace(/^0\./, ".");

/** Emblem · Swatch: the emblem tones, a monogram, named samples and the accent ramp. */
function EmblemCard() {
  const { tokens, palette } = useTheme();
  const hue = paletteHue[palette];
  return (
    <ShowcaseCard id="c-emblem" caption="<Emblem primary><Icon sparkles /></Emblem> · <Emblem success small> · <Swatch block>">
      <Row wrap cozy alignCenter>
        <Emblem primary><Icon sparkles /></Emblem>
        <Emblem success><Icon shieldCheck /></Emblem>
        <Emblem warning><Icon alertTriangle /></Emblem>
        <Emblem destructive><Icon flame /></Emblem>
        <Emblem secondary><Icon layers /></Emblem>
        <Emblem cyan circle><Icon globe /></Emblem>
        <Emblem primary small label="Rk" />
      </Row>
      <Column relaxed>
        <Divider />
        <Row comfortable>
          <Column fill><Swatch block compact bare color={tokens.primary} value={tokens.primary}>primary</Swatch></Column>
          <Column fill><Swatch block compact bare color={tokens["chart-2"]} value="chart-2">cyan</Swatch></Column>
          <Column fill><Swatch block compact bare color={tokens.success} value="success">success</Swatch></Column>
          <Column fill><Swatch block compact color={tokens.secondary} value="recess">secondary</Swatch></Column>
        </Row>
      </Column>
      <Column compact>
        <Swatch small steps={RAMP.map(([l, c]) => oklchHex(l, c, hue))} accessibilityLabel="The accent ramp, lightness 0.32 to 0.93" />
        <Row between>
          <Meta>{lightness(RAMP[0][0])}</Meta>
          <Meta>accent ramp · L in oklch</Meta>
          <Meta>{lightness(RAMP[RAMP.length - 1][0])}</Meta>
        </Row>
      </Column>
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <ShowcaseGrid minTileWidth={340}>
      <ColorCard />
      <NeutralsCard />
      <GridItem full><TypographyCard /></GridItem>
      <ShapeCard />
      <DepthCard />
      <MotionCard />
      <IconCard />
      <EmblemCard />
    </ShowcaseGrid>
  );
}
