import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Chip,
  Column,
  Divider,
  Emblem,
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
import { NAMES as GLYPHS } from "../../../src/atoms/icon/icon.glyphs.js";
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";

// The Foundations section page (`Canvas v4.0.0 Foundations.dc.html`): its hero vignette and
// its eight cards. Every value a card prints is read from the kit's own tables (the tokens,
// the type roles, the shape and motion tables, the glyph set), so the page shows the values
// Canvas ships where they differ from the hand-off's; the differences are recorded in the
// Phase 5 report.

/** A mono caption under a sample (the hand-off's 10 to 11 px mono label). */
function Mono({ children, right }: { children: ReactNode; right?: boolean }) {
  return <Typography caption mono subtle right={right}>{children}</Typography>;
}

/** A sample over its mono caption. */
function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Column tight alignCenter>
      {children}
      <Mono>{label}</Mono>
    </Column>
  );
}

/** Each palette's accent in the active scheme. */
function useAccents() {
  const { scheme } = useTheme();
  return PALETTES.map((palette) => ({ palette, hue: paletteHue[palette], color: colorsFor(palette, scheme).primary }));
}

/** The hero's still frame: the display face beside the five accent hues. */
export function Vignette() {
  const accents = useAccents();
  return (
    <VignetteStage testID="vignette-foundations">
      <Row wrap loose alignCenter center>
        <Typography display accessibilityRole="text">Aa</Typography>
        <Column relaxed>
          <Row snug>
            {accents.map((accent) => (
              <Swatch key={accent.palette} circle small color={accent.color} accessibilityLabel={`${accent.palette} accent`} />
            ))}
          </Row>
          <Typography eyebrow subtle>wght 300 → 800 · one hue · one spring</Typography>
        </Column>
      </Row>
    </VignetteStage>
  );
}

/** Color · Ion spectrum: the five accents, the status fills and washes, the chart series. */
function ColorCard() {
  const { tokens, scheme } = useTheme();
  const accents = useAccents();
  const status = [
    { name: "primary", fill: tokens.primary, soft: tokens["primary-soft"] },
    { name: "success", fill: tokens.success, soft: tokens["success-soft"] },
    { name: "warning", fill: tokens.warning, soft: tokens["warning-soft"] },
    { name: "destructive", fill: tokens.destructive, soft: tokens["destructive-soft"] },
  ];
  const series = ([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => tokens[`chart-${n}`]);
  const violet = colorsFor("violet", scheme).primary;
  return (
    <ShowcaseCard
      id="c-color"
      caption={`primary: oklch(.74 .17 var(--hue))  dark\nprimary: oklch(.5 .22 var(--hue))  light\ncolorsFor("violet", "${scheme}").primary = "${violet}"`}
    >
      <Row wrap between>
        {accents.map((accent) => (
          <Swatch key={accent.palette} circle color={accent.color} value={String(accent.hue)}>{accent.palette}</Swatch>
        ))}
      </Row>
      <Column snug>
        <Row snug>
          {status.map((tone) => (
            <Column key={tone.name} fill>
              <Swatch block color={tone.fill}>{tone.name}</Swatch>
            </Column>
          ))}
        </Row>
        <Row snug>
          {status.map((tone) => (
            <Column key={tone.name} fill>
              <Swatch block small color={tone.soft}>{`${tone.name}-soft`}</Swatch>
            </Column>
          ))}
        </Row>
      </Column>
      <Column tight>
        <Row tight>
          {series.map((color, index) => (
            <Column key={color} fill>
              <Swatch block small color={color} accessibilityLabel={`chart-${index + 1}`} />
            </Column>
          ))}
        </Row>
        <Row between>
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
      <Column snug>
        {NEUTRALS.map((role) => (
          <Row key={role} cozy alignCenter>
            <Column fill>
              <Typography caption mono>{role}</Typography>
            </Column>
            <Column fill>
              <Swatch small inline color={dark[role]} value={dark[role]} />
            </Column>
            <Column fill>
              <Swatch small inline color={light[role]} value={light[role]} />
            </Column>
          </Row>
        ))}
      </Column>
    </ShowcaseCard>
  );
}

type RoleName = keyof typeof typeRoles;

/** The type card's rows: a role, its sample, and the face the hand-off names beside it. */
const TYPE_ROWS: { role: RoleName; sample: string; face?: string }[] = [
  { role: "display", sample: "Charged surfaces" },
  { role: "h1", sample: "One API, three native looks" },
  { role: "h2", sample: "Section title sets the room" },
  { role: "h3", sample: "Card title, dialog title, stat label" },
  { role: "label", sample: "Row title, control label, button", face: "Instrument" },
  { role: "body", sample: "Body. Every visual variation is a boolean prop, named for what it means. Passing the prop turns it on." },
  { role: "small", sample: "Small. Descriptions, helper text, table cells, toasts." },
  { role: "eyebrow", sample: "Meta · 0x3DA3F5 · 12:04 · ⌘K", face: "Mono" },
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
      <Column cozy>
        {TYPE_ROWS.map((row, index) => (
          <Column key={row.role} cozy>
            {index > 0 ? <Divider soft /> : null}
            <Row between alignEnd wrap relaxed>
              <Column shrink>
                {/* A specimen of the role, not a heading of the page. */}
                <Typography {...{ [row.role]: true }} accessibilityRole="text">{row.sample}</Typography>
              </Column>
              <Mono right>{roleSpec(row.role, row.face)}</Mono>
            </Row>
          </Column>
        ))}
      </Column>
    </ShowcaseCard>
  );
}

/** Shape · Radius: each radius on the component that owns it. */
function ShapeCard() {
  const web = shape.web;
  return (
    <ShowcaseCard
      id="c-shape"
      caption={`shape.web = { control: ${web.control}, tile: ${web.tile}, card: ${web.card}, dialog: ${web.dialog}, sheet: ${web.sheet} }`}
    >
      <Row wrap loose alignEnd>
        <Labelled label="pill · badge"><Badge secondary>Badge</Badge></Labelled>
        <Labelled label={`${web.control} · control`}><Button secondary small>Button</Button></Labelled>
        <Labelled label="pill · chip"><Chip>Chip</Chip></Labelled>
      </Row>
      <Row wrap relaxed alignEnd>
        <Column fill>
          <Card smallCorners compact><Mono>{`${web.tile} · tile`}</Mono></Card>
        </Column>
        <Column fill>
          <Card compact><Mono>{`${web.card} · card`}</Mono></Card>
        </Column>
      </Row>
    </ShowcaseCard>
  );
}

/** Depth · Elevation: the card's three resting elevations, then the glass material. */
function DepthCard() {
  const { scheme, palette } = useTheme();
  const accent: Partial<Record<Palette, boolean>> = { [palette]: true };
  return (
    <ShowcaseCard id="c-depth" caption="the shade tokens: shade · shade-md · shade-lg · ≤ .2 α in light">
      <Row snug>
        <Column fill><Card flat compact><Mono>flat</Mono></Card></Column>
        <Column fill><Card compact><Mono>card</Mono></Card></Column>
        <Column fill><Card raised compact><Mono>raised</Mono></Card></Column>
      </Row>
      <ThemeProvider scheme={scheme} {...accent} glass>
        <Card raised>
          <Row snug alignCenter>
            <Badge dot primary>glass</Badge>
            <Typography small>blur 20 · saturate 1.6 · the layer's under-fill</Typography>
          </Row>
        </Card>
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
      <Reveal>
        <Card flat compact>
          <Switch defaultChecked>Glass surfaces</Switch>
        </Card>
      </Reveal>
      <Column snug>
        <Skeleton text />
        <Skeleton text short />
      </Column>
      <Spinner small description="Spinner keeps spinning under reduced motion; it carries information." />
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
      <Row wrap loose>
        {ICON_SET.map((name) => <Icon key={name} {...{ [name]: true }} size={20} accessibilityLabel={name} />)}
      </Row>
      <Divider />
      <Row wrap relaxed>
        {ICON_TONES.map((entry) => (
          <Row key={entry.label} tight alignCenter>
            <Icon {...{ [entry.icon]: true }} {...(entry.tone ? { [entry.tone]: true } : null)} size={16} decorative />
            <Mono>{entry.label}</Mono>
          </Row>
        ))}
      </Row>
      <Row relaxed alignEnd>
        {[16, 20, 24, 32].map((size) => (
          <Labelled key={size} label={String(size)}><Icon rocket size={size} decorative /></Labelled>
        ))}
      </Row>
    </ShowcaseCard>
  );
}

/** Lightness steps of the accent ramp (the hand-off's Swatch block, L in oklch). */
const RAMP = [0.32, 0.42, 0.52, 0.62, 0.72, 0.83, 0.93];

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
        <Emblem muted><Icon layers /></Emblem>
        <Emblem circle><Icon globe /></Emblem>
        <Emblem primary small label="Rk" />
      </Row>
      <Row wrap cozy alignCenter>
        <Emblem primary small><Icon sparkles /></Emblem>
        <Emblem primary><Icon sparkles /></Emblem>
        <Emblem primary large><Icon sparkles /></Emblem>
      </Row>
      <Divider />
      <Row wrap relaxed>
        <Swatch color={tokens.primary} value={tokens.primary}>primary</Swatch>
        <Swatch color={tokens["chart-2"]} value="chart-2">cyan</Swatch>
        <Swatch color={tokens.success} value="success">success</Swatch>
        <Swatch color={tokens.secondary} value="recess">secondary</Swatch>
      </Row>
      <Column tight>
        <Row flush>
          {RAMP.map((L) => (
            <Column key={L} fill>
              <Swatch block small color={oklchHex(L, 0.17, hue)} accessibilityLabel={`L ${L}`} />
            </Column>
          ))}
        </Row>
        <Row between>
          <Mono>{String(RAMP[0])}</Mono>
          <Mono>accent ramp · L in oklch</Mono>
          <Mono>{String(RAMP[RAMP.length - 1])}</Mono>
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
