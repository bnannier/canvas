import { useState, type ReactNode } from "react";
import {
  AreaChart,
  Badge,
  BarList,
  BreakpointOverride,
  Button,
  ButtonGroup,
  Card,
  Column,
  Container,
  DashboardGrid,
  DataTable,
  DescriptionList,
  Divider,
  Form,
  Grid,
  GridItem,
  Icon,
  Input,
  MediaObject,
  Navbar,
  Row,
  Select,
  Skeleton,
  Sparkline,
  StackedBar,
  StackedList,
  Stats,
  Swatch,
  Switch,
  Typography,
  View,
  spacing,
  alpha,
  breakpoints,
  useBreakpoint,
  useFormFactor,
  useMeasuredWidth,
  useTheme,
  widths,
  type BreakpointKey,
} from "@nannier/canvas";
import { resolvePhoto } from "../core/photos";
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";
import { GAP_SCALE, RESIZE_PRESETS, SAMPLED_STEPS, SIZING, SIZING_MODES, type SizingMode } from "./layout.data";


// The Layout section page (`Canvas v4.0.0 Layout.dc.html`): its hero vignette and its seven
// cards. The breakpoints, widths, gaps and steps the cards print are the kit's own tables;
// the sizing contract is ./layout.data.ts. The responsive card's mini app is real kit
// components under a BreakpointOverride and a Container step, so picking a width changes
// only the container, as the hand-off's card says.

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | undefined;

/** An in-card mono note: the section card's note line (400 12px/1.6 mono in the third ink). */
function Mono({ children, right }: { children: ReactNode; right?: boolean }) {
  return <Typography cardNote mono right={right}>{children}</Typography>;
}

/** The hero's still frame: a desktop window's twelve-column grid. */
export function Vignette() {
  const { tokens } = useTheme();
  const cyan = alpha(tokens["chart-2"], 0.16);
  return (
    <VignetteStage>
      <Column relaxed alignCenter>
        <Typography eyebrow primary>Desktop · 12 columns</Typography>
        <Card raised compact>
          <Column cozy>
            <Skeleton text small />
            <Grid minTileWidth={60} snug>
              {Array.from({ length: 12 }, (_, index) => (
                <Swatch key={index} block small color={index % 3 === 1 ? cyan : tokens["primary-soft"]} accessibilityLabel={`column ${index + 1}`} />
              ))}
            </Grid>
          </Column>
        </Card>
      </Column>
    </VignetteStage>
  );
}

/** The window's form factors, each with the range of widths it covers. */
const FORM_FACTORS = [
  { name: "Phone", hue: "mint" as const, range: `≤ ${breakpoints.sm}`, items: [{ term: "Overlays", value: "bottom sheets" }, { term: "Shells", value: "drawer" }, { term: "Row stacks", value: "stacked" }] },
  { name: "Tablet", hue: "cyan" as const, range: `${breakpoints.sm + 1} – ${breakpoints.lg}`, items: [{ term: "Overlays", value: "anchored" }, { term: "Shells", value: "drawer" }, { term: "Row spans", value: "by measure" }] },
  { name: "Desktop", hue: "primary" as const, range: `> ${breakpoints.lg}`, items: [{ term: "Overlays", value: "anchored" }, { term: "Shells", value: "rail" }, { term: "Page", value: `capped at page ${widths.page}` }] },
];

/** Breakpoints · form factors: the breakpoint ruler, this window's bucket, the three tiers. */
function BreakpointsCard() {
  const bucket = useBreakpoint();
  const factor = useFormFactor();
  const keys = Object.keys(breakpoints) as BreakpointKey[];
  return (
    <ShowcaseCard
      id="c-breakpoints"
      meta={`${bucket} · ${factor}`}
      caption="A breakpoint applies at its width and below · unknown width (server, first frame) renders the desktop variant · useBreakpoint() and useFormFactor() are for window chrome only"
    >
      <Column snug>
        <StackedBar
          tall
          subtle
          label="Form factors by window width"
          segments={[
            { label: "phone", value: breakpoints.sm },
            { label: "tablet", value: breakpoints.lg - breakpoints.sm },
            { label: "desktop", value: breakpoints["2xl"] - breakpoints.lg },
          ]}
        />
        <Row wrap relaxed alignCenter>
          {keys.map((key) => <Mono key={key}>{`${key} ${breakpoints[key]}`}</Mono>)}
          <Badge outline>{`this window · ${bucket} · ${factor}`}</Badge>
        </Row>
      </Column>
      <Grid minTileWidth={240} columns={3} relaxed>
        {FORM_FACTORS.map((tier) => (
          <Card key={tier.name} sunken>
            <Column snug>
              <Row between alignCenter>
                <Typography tileTitle natural>{tier.name}</Typography>
                <Typography tiny mono medium natural {...{ [tier.hue]: true }}>{tier.range}</Typography>
              </Row>
              <DescriptionList inline items={tier.items} />
            </Column>
          </Card>
        ))}
      </Grid>
    </ShowcaseCard>
  );
}

const MEMBERS = [
  { name: "Ada Lovelace", detail: "Owner", photo: "/ada-lovelace.jpg", badge: "Active", tone: "success" as const, spend: "$12.4k" },
  { name: "Grace Hopper", detail: "Admin", photo: "/grace-hopper.jpg", badge: "Active", tone: "success" as const, spend: "$9.1k" },
  { name: "Kira Tanaka", detail: "Editor", photo: "/kira-tanaka.jpg", badge: "Invited", tone: "info" as const, spend: "$4.3k" },
  { name: "Noor Park", detail: "Viewer", photo: "/noor-park.jpg", badge: "Active", tone: "success" as const, spend: "$7.8k" },
];

/** The responsive card's mini app: one screen of kit components, sized by its container. */
function MiniApp({ sizing, tier }: { sizing: boolean; tier: string }) {
  const note = (text: string) => (sizing ? <Badge soft small>{text}</Badge> : null);
  return (
    <Card flat flush clip>
      <Navbar
        compact
        bordered
        brand="Riskora"
        links={["Overview", "Boards", "Members"]}
        defaultActive={0}
        actionLabel="New"
        avatar="Liang Bao"
      />
      <Column relaxed padLoose>
        <Row between alignCenter wrap cozy>
          <Typography h4 level={2}>Overview</Typography>
          <Button outline small iconLeft={<Icon calendar size={14} decorative />}>Last 30 days</Button>
        </Row>
        {note(`auto-fit · no JS · ${tier}`)}
        <Stats
          items={[
            { label: "Revenue", value: "$128k" },
            { label: "Members", value: "1,204" },
            { label: "Uptime", value: "99.9%" },
            { label: "p95", value: "212ms" },
          ]}
        />
        <Row stacks stackBreakpoint="lg" relaxed>
          <Column span={6}>
            {note("fill · the field Grid measures itself")}
            <Card>
              <Form submitLabel="Send invite" cancelLabel="Cancel" accessibilityLabel="Invite people">
                <Typography tileTitle natural level={3}>Invite people</Typography>
                {/* The fields pair up where two fit and stack where they do not: the Grid
                    measures its own width. */}
                <Grid minTileWidth={200} columns={2} relaxed>
                  <Input label="Name" defaultValue="Kira Tanaka" />
                  <Input label="Email" defaultValue="kira@ionize.io" />
                  <Select label="Role" defaultValue="Editor" options={["Owner", "Admin", "Editor", "Viewer"]} />
                  <Select label="Team" defaultValue="Design" options={["Platform", "Design", "Mobile", "Data"]} />
                </Grid>
              </Form>
            </Card>
          </Column>
          <Column span={6}>
            {note("fill · rows stack when narrow")}
            <StackedList
              card
              title={
                <Row snug baseline>
                  <Typography tileTitle natural>Members</Typography>
                  <Typography tiny mono medium muted natural>24</Typography>
                </Row>
              }
              items={MEMBERS.map((member) => ({
                name: member.name,
                detail: member.detail,
                avatar: photo(member.photo),
                badge: member.badge,
                [member.tone]: true,
                trailing: <Typography specMeta mono medium natural>{member.spend}</Typography>,
              }))}
            />
          </Column>
        </Row>
      </Column>
    </Card>
  );
}

/** Live · resize the container: the same screen at four container widths. */
function ResponsiveCard() {
  const [preset, setPreset] = useState(2);
  const [sizing, setSizing] = useState(false);
  const { width, onLayout } = useMeasuredWidth();
  const current = RESIZE_PRESETS[preset];
  const tier = width === 0 ? "base" : width <= breakpoints.sm ? "sm" : width <= breakpoints.lg ? "lg" : "base";
  const rules = [
    { text: "Navbar folds its links into a menu", on: tier === "sm" },
    { text: "Stats auto-fit, no JS", on: true },
    { text: "Form and table sit side by side", on: tier === "base" },
    { text: "Form fields in two columns", on: tier !== "sm" },
    { text: "Table rows stack", on: tier === "sm" },
  ];
  const app = <MiniApp sizing={sizing} tier={tier} />;
  return (
    <ShowcaseCard
      id="c-responsive"
      caption="Same page, same props. The window never changes here: only the container does. The form's field Grid measures its own width, so in a narrow column it stacks its fields."
    >
      <Column cozy>
        <ButtonGroup
          segmented
          block
          active={preset}
          onSelect={setPreset}
          accessibilityLabel="Container width"
          items={RESIZE_PRESETS.map((entry) => ({ label: entry.label, icon: entry.icon }))}
        />
        <Row between wrap cozy alignCenter>
          <Row comfortable alignCenter>
            <Typography caption mono medium muted natural>container</Typography>
            <Typography specMeta mono medium natural>{`${width}px`}</Typography>
            {tier === "sm" ? <Badge mint>{tier}</Badge> : tier === "lg" ? <Badge cyan>{tier}</Badge> : <Badge soft>{tier}</Badge>}
          </Row>
          <Switch checked={sizing} onValueChange={setSizing}>Show sizing</Switch>
        </Row>
      </Column>
      <BreakpointOverride value={current.bucket}>
        {/* The readout measures the mini app itself, inside the step that caps it. */}
        {current.step ? (
          <Container {...{ [current.step]: true }}>
            <View onLayout={onLayout}>{app}</View>
          </Container>
        ) : (
          <View onLayout={onLayout}>{app}</View>
        )}
      </BreakpointOverride>
      <Row wrap snug>
        {rules.map((rule) => (rule.on ? <Badge key={rule.text} soft dot>{rule.text}</Badge> : <Badge key={rule.text} outline>{rule.text}</Badge>))}
      </Row>
    </ShowcaseCard>
  );
}

/** A sizing mode's pill. */
function ModeBadge({ mode }: { mode: SizingMode }) {
  if (mode === "fill") return <Badge soft mono>fill</Badge>;
  if (mode === "hug") return <Badge cyan mono>hug</Badge>;
  if (mode === "fixed") return <Badge mint mono>fixed</Badge>;
  return <Badge warning mono>tiles</Badge>;
}

/** Sizing contract · every family. */
function SizingCard() {
  return (
    <ShowcaseCard
      id="c-sizing"
      caption="Floors are minWidth plus wrapping, never a fixed width · caps are Container steps · a nested surface is never wider or rounder than what holds it"
    >
      <Row wrap relaxed alignCenter>
        {SIZING_MODES.map((entry) => (
          <Row key={entry.mode} snug alignCenter>
            <ModeBadge mode={entry.mode} />
            <Typography small subtle natural>{entry.note}</Typography>
          </Row>
        ))}
      </Row>
      <DataTable
        compact
        columns={[
          { label: "Family", minWidth: 200, grow: 1.4 },
          { label: "Width", width: 90 },
          { label: "Height", minWidth: 120 },
          { label: "Floor", minWidth: 110 },
          { label: "Cap", minWidth: 110 },
          { label: "Reflows", minWidth: 220, grow: 2 },
        ]}
        rows={SIZING.map((row) => [
          <Column key="family" tight>
            <Typography small medium>{row.family}</Typography>
            <Typography tiny subtle>{row.members}</Typography>
          </Column>,
          <ModeBadge key="mode" mode={row.mode} />,
          <Typography key="height" caption mono>{row.height}</Typography>,
          <Typography key="floor" caption mono>{row.floor}</Typography>,
          <Typography key="cap" caption mono>{row.cap}</Typography>,
          <Typography key="reflows" small subtle>{row.reflows}</Typography>,
        ])}
      />
    </ShowcaseCard>
  );
}

/** How a component finds its size: the three mechanisms, in the order to try them. */
function ResolutionCard() {
  const step = (n: number) => <Typography label primary>{String(n)}</Typography>;
  return (
    <ShowcaseCard id="c-resolution">
      <MediaObject
        icon={step(1)}
        title="Intrinsic · no JavaScript"
        description="Fill or hug inside the parent's bounds, a minWidth floor, wrapping. Correct on the first frame and on the server."
        body={<Typography tiny mono muted natural>{"<Grid minTileWidth={240}> · <Row wrap> · <Row stacks>"}</Typography>}
      />
      <MediaObject
        icon={step(2)}
        title="Container measurement · its own width"
        description="A component that changes shape measures itself against the shared breakpoints, so every family flips at the same widths."
        body={<Typography tiny mono muted natural>{"useContainerBreakpoint({ base, md, sm }) · first frame renders base"}</Typography>}
      />
      <MediaObject
        icon={step(3)}
        title="Viewport · chrome only"
        description="Only window-level chrome reads the window: Sidebar and FilterPanel drawers, phone sheets, app shells."
        body={<Typography tiny mono muted natural>{"useBreakpoint() · useFormFactor() · BreakpointOverride for previews"}</Typography>}
      />
      <Row wrap snug>
        <Badge destructive>no width at a call site</Badge>
        <Badge destructive>no window reads in a component</Badge>
        <Badge destructive>no style escape hatch</Badge>
      </Row>
    </ShowcaseCard>
  );
}

const REVENUE = [52, 48, 50, 40, 42, 32, 30, 22, 24, 12, 8].map((v) => 70 - v);

/** The dashboard card's widgets: each one's span, its narrow span, and its body. */
const WIDGETS: { id: string; span: number; narrowSpan?: number; title: string; content: ReactNode }[] = [
  {
    id: "revenue",
    span: 8,
    title: "Revenue",
    content: <AreaChart compact hideAxes hideGrid hideLegend labels={REVENUE.map((_, i) => String(i + 1))} series={[{ label: "Revenue", values: REVENUE }]} />,
  },
  { id: "seats", span: 4, title: "Seats", content: <Typography statValue>1,204</Typography> },
  { id: "uptime", span: 4, narrowSpan: 6, title: "Uptime", content: <Sparkline compact success values={[99.2, 99.6, 99.4, 99.9, 99.7, 99.8, 100, 99.9]} accessibilityLabel="Uptime, last 8 days" /> },
  { id: "latency", span: 4, narrowSpan: 6, title: "Latency", content: <Sparkline compact values={[212, 220, 198, 240, 230, 210, 205, 212]} accessibilityLabel="p95 latency, last 8 days" /> },
  { id: "errors", span: 4, narrowSpan: 12, title: "Errors", content: <Sparkline compact destructive values={[20, 24, 22, 30, 28, 26, 40, 38]} accessibilityLabel="Errors, last 8 days" /> },
  { id: "funnel", span: 5, title: "Funnel", content: <Skeleton text /> },
  { id: "members", span: 7, title: "Members", content: <Skeleton text /> },
];

/** DashboardGrid · 12 columns · spans in twelfths. */
function DashboardGridCard() {
  return (
    <ShowcaseCard
      id="c-dashboard-grid"
      caption="<DashboardGrid> measures its own width, never the window · each widget declares span and narrowSpan in twelfths"
    >
      <DashboardGrid
        compact
        items={WIDGETS.map((widget) => ({
          id: widget.id,
          span: widget.span,
          narrowSpan: widget.narrowSpan,
          title: widget.title,
          content: (
            <Card flat compact>
              <Column snug>
                <Row between alignCenter>
                  <Typography gridLabel muted>{widget.title}</Typography>
                  <Typography gridLabel primary>{`span ${widget.span}`}</Typography>
                </Row>
                {widget.content}
              </Column>
            </Card>
          ),
        }))}
      />
      <Grid minTileWidth={120} snug>
        <Column tight><Typography small medium>wide</Typography><Typography tiny subtle>honors every span</Typography></Column>
        <Column tight><Typography small medium>narrow</Typography><Typography tiny subtle>reflows to narrowSpan</Typography></Column>
        <Column tight><Typography small medium>phone</Typography><Typography tiny subtle>stacks full width</Typography></Column>
      </Grid>
    </ShowcaseCard>
  );
}

/** Layout · Row & Column · Container · Grid · Divider. */
function LayoutCard() {
  return (
    <ShowcaseCard id="c-layout">
      <Grid minTileWidth={260} loose>
        <Column cozy>
          <Typography label>Gap scale</Typography>
          <BarList
            plain
            compact
            items={GAP_SCALE.map((gap) => ({ label: gap.name, value: spacing[gap.step] }))}
            formatValue={(v) => String(v)}
          />
          <Mono>{"<Row cozy alignCenter between> · <Column tight> · <Row stacks>"}</Mono>
        </Column>
        <Column cozy>
          <Typography label>Container steps</Typography>
          <BarList
            plain
            compact
            items={SAMPLED_STEPS.map((step) => ({ label: step, value: widths[step] }))}
            formatValue={(v) => String(v)}
          />
          <Mono>{`${Object.keys(widths).length} steps, xxxs ${widths.xxxs} → page ${widths.page} · caps and centers, never a raw width`}</Mono>
        </Column>
        <Column cozy>
          <Typography label>Grid</Typography>
          <Grid minTileWidth={72} columns={3} snug>
            <Card flat compact><Mono>≥ 72</Mono></Card>
            <Card flat compact><Mono>≥ 72</Mono></Card>
            <Card flat compact><Mono>≥ 72</Mono></Card>
            <Card flat compact><Mono>≥ 72</Mono></Card>
          </Grid>
          <Mono>{"<Grid minTileWidth={72} columns={3}> + <GridItem> · measures its own width: the fourth tile wraps; 3-up, 2-up, 1-up"}</Mono>
          <Row wrap tight>
            {["View", "Text", "Pressable", "ScrollView", "TextInput"].map((name) => <Badge key={name} mono>{name}</Badge>)}
          </Row>
          <Typography tiny subtle>React Native primitives, re-exported as-is. They take plain style objects and no skin; everything above them is Canvas.</Typography>
        </Column>
      </Grid>
      <Column cozy>
        <Typography label>Divider</Typography>
        <Divider />
        <Divider>or continue with</Divider>
        <Divider>
          <Button ghost small iconRight={<Icon chevronDown size={14} decorative />}>Show 12 more</Button>
        </Divider>
        <Row snug alignCenter>
          <Button ghost small icon accessibilityLabel="Undo" iconLeft={<Icon undo2 size={16} decorative />} />
          <Button ghost small icon accessibilityLabel="Redo" iconLeft={<Icon redo2 size={16} decorative />} />
          <Divider vertical />
          <Button ghost small icon accessibilityLabel="Link" iconLeft={<Icon link size={16} decorative />} />
          <Button ghost small icon accessibilityLabel="Image" iconLeft={<Icon image size={16} decorative />} />
          <Divider vertical />
          <Button ghost small icon accessibilityLabel="Code" iconLeft={<Icon code size={16} decorative />} />
          <Button ghost small icon accessibilityLabel="Numbered list" iconLeft={<Icon listOrdered size={16} decorative />} />
        </Row>
        <Mono>{"<Divider /> · <Divider>or</Divider> · <Divider vertical> · a hairline, never a grey"}</Mono>
      </Column>
    </ShowcaseCard>
  );
}

/** AppFrame · Page: the frame's banner over a capped page of placeholder content. */
function AppFrameCard() {
  return (
    <ShowcaseCard id="c-app-frame" caption="<AppFrame> mounts safe area + overlay host · <Page> is one screen">
      {/* The frame drawn with the parts it holds: a real AppFrame mounts the page's banner
          and main landmarks (and a Page its own main scroller), which a docs page already
          has, so the card shows its header and its capped page instead. */}
      <Card flat flush clip>
        <Navbar bordered compact brand="Riskora" links={["Boards", "Reports"]} defaultActive={0} />
        <Column padLoose>
          <Container xxl>
            <Column loose>
              <Skeleton text short />
              <Grid minTileWidth={160} relaxed>
                <Skeleton card />
                <Skeleton card />
              </Grid>
            </Column>
          </Container>
        </Column>
      </Card>
      <Mono>{`Page · capped at xxl ${widths.xxl}, centered`}</Mono>
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <ShowcaseGrid minTileWidth={440}>
      <GridItem full><BreakpointsCard /></GridItem>
      <GridItem full><ResponsiveCard /></GridItem>
      <GridItem full><SizingCard /></GridItem>
      <ResolutionCard />
      <DashboardGridCard />
      <GridItem full><LayoutCard /></GridItem>
      <GridItem full><AppFrameCard /></GridItem>
    </ShowcaseGrid>
  );
}
