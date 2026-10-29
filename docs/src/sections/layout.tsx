import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Dimensions, type LayoutChangeEvent } from "react-native";
import {
  Avatar,
  Badge,
  BreakpointOverride,
  Button,
  ButtonGroup,
  Card,
  Column,
  Container,
  DashboardGrid,
  DataTable,
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
} from "@nannier/canvas";
import { CanvasMark } from "../brand/canvas-mark";
import { resolvePhoto } from "../core/photos";
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";
import {
  AppFrameDiagram,
  ColumnGuides,
  ColumnStrip,
  GapRow,
  PlaceholderTile,
  SizingOutline,
  StageFrame,
  StagingGround,
  StepBar,
  TierBar,
  WindowRuler,
} from "../ui/showcase/layout-diagrams";
import { GAP_SCALE, RESIZE_PRESETS, SAMPLED_STEPS, SIZING, SIZING_MODES, type SizingMode } from "./layout.data";


// The Layout section page (`Canvas v4.0.0 Layout.dc.html`): its hero vignette and its seven
// cards. The breakpoints, widths, gaps and steps the cards print are the kit's own tables;
// the sizing contract is ./layout.data.ts. The responsive card's mini app is real kit
// components under a BreakpointOverride and a Container step, so picking a width changes
// only the container, as the hand-off's card says. The drawings round them (the ruler, the
// staging ground, the tier bar, the column guides, the gap and step bars, the app frame)
// are docs/src/ui/showcase/layout-diagrams.tsx.

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

// The window's width as the kit reads it for window-sized type (src/style/responsive.tsx
// `useViewportWidth`, docs/src/brand/gradient-text.tsx): 0 on the server and through
// hydration, so the ruler renders the markup the server sent, then the live width.
const subscribeWindow = (onChange: () => void) => {
  const subscription = Dimensions.addEventListener("change", onChange);
  return () => subscription.remove();
};
const windowWidth = () => Dimensions.get("window").width;
const noWidth = () => 0;

/** The window's form factors: each tier's range, its column strip and what changes in it. */
const FORM_FACTORS = [
  { name: "Phone", hue: "mint" as const, range: `≤ ${breakpoints.sm}`, strip: { count: 4, gap: 8, pad: 10 }, note: "Overlays as bottom sheets · Shells as drawers · Rows stack" },
  { name: "Tablet", hue: "cyan" as const, range: `${breakpoints.sm + 1} – ${breakpoints.lg}`, strip: { count: 8, gap: 6, pad: 14 }, note: "Overlays anchored · Shells as drawers · Row spans by measure" },
  { name: "Desktop", hue: "primary" as const, range: `> ${breakpoints.lg}`, strip: { count: 12, gap: 4, pad: 20 }, note: `Overlays anchored · Shells as rails · Page capped at ${widths.page}` },
];

/** Breakpoints · form factors: the window-width ruler with this window on it, the three tiers. */
function BreakpointsCard() {
  const bucket = useBreakpoint();
  const factor = useFormFactor();
  const width = useSyncExternalStore(subscribeWindow, windowWidth, noWidth);
  return (
    <ShowcaseCard
      id="c-breakpoints"
      meta={`${bucket} · ${factor}`}
      caption="A breakpoint applies at its width and below · unknown width (server, first frame) renders the desktop variant · useBreakpoint() and useFormFactor() are for window chrome only"
    >
      <WindowRuler width={width} label={`this window · ${bucket} · ${factor}`} />
      <Grid minTileWidth={260} columns={3} relaxed>
        {FORM_FACTORS.map((tier) => (
          <Card key={tier.name} sunken calloutCorners insetContent>
            <Column comfortable>
              <Row between baseline snug>
                <Typography tileTitle natural>{tier.name}</Typography>
                <Typography tiny mono medium natural {...{ [tier.hue]: true }}>{tier.range}</Typography>
              </Row>
              <ColumnStrip count={tier.strip.count} gap={tier.strip.gap} pad={tier.strip.pad} hue={tier.hue} />
              <Typography tiny mono muted>{tier.note}</Typography>
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

/** The members panel's title: "Members" and its count. */
function MembersTitle() {
  return (
    <Row snug baseline>
      <Typography tileTitle natural>Members</Typography>
      <Typography tiny mono medium muted natural>24</Typography>
    </Row>
  );
}

/**
 * The invite form's field Grid floor (a field at 260, two beside each other 10 apart) and
 * the form card's inset on each side (`insetContent`, 14, inside a 1 px edge): below this
 * panel width the fields stack and the actions go block.
 */
const FORM_TWO_UP = 260 * 2 + 10 + (14 + 1) * 2;

/** The card width below which the width picker fills its row rather than hugging its segments. */
const CONTROLS_HUG = 400;

/** The members column width below which a stacked row has no room for the spend. */
const MEMBERS_WITH_SPEND = 320;

/** The responsive card's mini app: one screen of kit components, sized by its container. */
function MiniApp({ sizing, narrow, cramped, formWidth, membersWidth, onFormLayout, onMembersLayout }: {
  sizing: boolean;
  /** A phone-wide frame: the page takes the 16 inset rather than 24. */
  narrow: boolean;
  /** A frame too narrow for the bar's avatar beside its folded links and the New button. */
  cramped: boolean;
  formWidth: number;
  membersWidth: number;
  onFormLayout: (event: LayoutChangeEvent) => void;
  onMembersLayout: (event: LayoutChangeEvent) => void;
}) {
  const compactForm = formWidth > 0 && formWidth < FORM_TWO_UP;
  const table = membersWidth >= breakpoints.sm;
  // A members column too narrow for a name beside its status and spend drops the spend.
  const spend = membersWidth === 0 || membersWidth >= MEMBERS_WITH_SPEND;
  return (
    <View>
      <Navbar
        compact
        brand="Riskora"
        brandContent={<CanvasMark size={20} />}
        links={["Overview", "Boards", "Members"]}
        defaultActive={0}
        actions={
          <Row comfortable alignCenter>
            <Button primary small iconLeft={<Icon plus size={14} decorative />}>New</Button>
            {cramped ? null : <Avatar small src={photo("/liang-bao.jpg")} name="Liang Bao" />}
          </Row>
        }
      />
      <Container wider>
        <Column roomy pad={narrow} padLoose={!narrow}>
          <Row between alignCenter wrap comfortable>
            <Typography h4 level={2}>Overview</Typography>
            <SizingOutline on={sizing} kind="hug" radius={999} beside tag={<Badge tiny cyan>hug</Badge>}>
              <Button outline small iconLeft={<Icon calendar size={14} decorative />}>Last 30 days</Button>
            </SizingOutline>
          </Row>
          <SizingOutline on={sizing} kind="grid" radius={12} tag={<Badge tiny warning>auto-fit · no JS</Badge>}>
            {/* The default tiles: their 150 floor is what auto-fits them (the compact metric
                strip keeps one row at any width). */}
            <Stats
              items={[
                { label: "Revenue", value: "$128k" },
                { label: "Members", value: "1,204" },
                { label: "Uptime", value: "99.9%" },
                { label: "p95", value: "212ms" },
              ]}
            />
          </SizingOutline>
          <Row stacks stackBreakpoint="md" roomy>
            <Column span={5}>
              <View onLayout={onFormLayout}>
                <SizingOutline on={sizing} kind="fill" radius={14} tag={<Badge tiny solid>{`fill · ${formWidth}px`}</Badge>}>
                  <Card outlined calloutCorners insetContent>
                    <Form block={compactForm} submitLabel="Send invite" cancelLabel="Cancel" accessibilityLabel="Invite people">
                      <Typography tileTitle natural level={3}>Invite people</Typography>
                      {/* The fields pair up where two fit and stack where they do not: the
                          Grid measures its own width. */}
                      <Grid minTileWidth={260} columns={2} comfortable>
                        <Input label="Name" defaultValue="Kira Tanaka" />
                        <Input label="Email" defaultValue="kira@ionize.io" />
                        <Select label="Role" defaultValue="Editor" options={["Owner", "Admin", "Editor", "Viewer"]} />
                        <Select label="Team" defaultValue="Design" options={["Platform", "Design", "Mobile", "Data"]} />
                      </Grid>
                    </Form>
                  </Card>
                </SizingOutline>
              </View>
            </Column>
            <Column span={7}>
              <View onLayout={onMembersLayout}>
                <SizingOutline on={sizing} kind="fill" radius={14} tag={<Badge tiny solid>{`fill · ${membersWidth}px`}</Badge>}>
                  {table ? (
                    <Card outlined calloutCorners insetContent>
                      <Column comfortable>
                        <MembersTitle />
                        <DataTable
                          compact
                          columns={[{ label: "Member", grow: 2 }, { label: "Status" }, { label: "Spend", numeric: true }]}
                          rows={MEMBERS.map((member) => [
                            <MediaObject key="member" compact src={photo(member.photo)} title={member.name} description={member.detail} />,
                            <Badge key="status" {...{ [member.tone]: true }}>{member.badge}</Badge>,
                            <Typography key="spend" caption mono medium natural>{member.spend}</Typography>,
                          ])}
                        />
                      </Column>
                    </Card>
                  ) : (
                    <StackedList
                      card
                      title={<MembersTitle />}
                      items={MEMBERS.map((member) => ({
                        name: member.name,
                        detail: member.detail,
                        avatar: photo(member.photo),
                        badge: member.badge,
                        [member.tone]: true,
                        trailing: spend ? <Typography caption mono medium natural>{member.spend}</Typography> : undefined,
                      }))}
                    />
                  )}
                </SizingOutline>
              </View>
            </Column>
          </Row>
        </Column>
      </Container>
    </View>
  );
}

/** Live · resize the container: the same screen at four container widths. */
function ResponsiveCard() {
  const [preset, setPreset] = useState(2);
  const [sizing, setSizing] = useState(false);
  const controls = useMeasuredWidth();
  const frame = useMeasuredWidth();
  const form = useMeasuredWidth();
  const members = useMeasuredWidth();
  const current = RESIZE_PRESETS[preset];
  const width = frame.width;
  const tier = width === 0 ? "base" : width <= breakpoints.sm ? "sm" : width <= breakpoints.lg ? "lg" : "base";
  // A phone-wide frame insets its page 16 a side rather than 24.
  const narrow = width > 0 && width <= breakpoints.sm;
  // The page column inside the frame: the frame's 1 px edges, the `wider` cap, the page
  // inset. The form and members Row stacks at md and below.
  const page = Math.min(width - 2, widths.wider) - (narrow ? 32 : 48);
  const compactForm = form.width > 0 && form.width < FORM_TWO_UP;
  // Each rule reads what the mini app measured, so the pills say what the frame shows.
  const rules = [
    { text: "Navbar folds its links into a menu", on: tier === "sm" },
    { text: "Stats auto-fit, no JS", on: true },
    { text: "Form and table sit side by side", on: width > 0 && page > breakpoints.md },
    { text: "Form fields in two columns", on: form.width > 0 && !compactForm },
    { text: "Members table turns into cards", on: members.width > 0 && members.width < breakpoints.sm },
    { text: "Buttons go block", on: compactForm },
  ];
  const app = (
    <StageFrame>
      <MiniApp sizing={sizing} narrow={narrow} cramped={width > 0 && width < widths.xs} formWidth={form.width} membersWidth={members.width} onFormLayout={form.onLayout} onMembersLayout={members.onLayout} />
    </StageFrame>
  );
  return (
    <ShowcaseCard
      id="c-responsive"
      caption="Same page, same props. The window never changes here: only the container does. Note the form: at Desktop it sits in a narrow column, so it measures compact and stacks its fields."
    >
      <View onLayout={controls.onLayout}>
        <Row wrap relaxed rowsComfortable alignCenter>
          <ButtonGroup
            segmented
            compact
            block={controls.width > 0 && controls.width < CONTROLS_HUG}
            active={preset}
            onSelect={setPreset}
            accessibilityLabel="Container width"
            items={RESIZE_PRESETS.map((entry) => ({ label: entry.label, icon: entry.icon }))}
          />
          <Row comfortable alignCenter>
            <Typography caption mono medium muted natural>container</Typography>
            <Typography caption mono medium natural>{`${width}px`}</Typography>
            {tier === "sm" ? <Badge token mint>{tier}</Badge> : tier === "lg" ? <Badge token cyan>{tier}</Badge> : <Badge token>{tier}</Badge>}
          </Row>
          <Column grow />
          <Switch checked={sizing} onValueChange={setSizing}>Show sizing</Switch>
        </Row>
      </View>
      <StagingGround>
        <BreakpointOverride value={current.bucket}>
          {/* The readout measures the frame itself, inside the step that caps it. */}
          {current.step ? (
            <Container {...{ [current.step]: true }} start>
              <View onLayout={frame.onLayout}>{app}</View>
            </Container>
          ) : (
            <View onLayout={frame.onLayout}>{app}</View>
          )}
        </BreakpointOverride>
      </StagingGround>
      <Row wrap snug>
        {rules.map((rule) => (rule.on ? <Badge key={rule.text} large dot>{rule.text}</Badge> : <Badge key={rule.text} large outline dot>{rule.text}</Badge>))}
      </Row>
    </ShowcaseCard>
  );
}

/** A sizing mode's tag. */
function ModeBadge({ mode }: { mode: SizingMode }) {
  if (mode === "fill") return <Badge band mono keyCorners>fill</Badge>;
  if (mode === "hug") return <Badge band mono keyCorners cyan>hug</Badge>;
  if (mode === "fixed") return <Badge band mono keyCorners mint>fixed</Badge>;
  return <Badge band mono keyCorners warning>tiles</Badge>;
}

/** Sizing contract · every family. */
function SizingCard() {
  return (
    <ShowcaseCard
      id="c-sizing"
      caption="Floors are minWidth plus wrapping, never a fixed width · caps are Container steps · a nested surface is never wider or rounder than what holds it"
    >
      <Row wrap spacious rowsSnug alignCenter>
        {SIZING_MODES.map((entry) => (
          <Row key={entry.mode} snug alignCenter>
            <ModeBadge mode={entry.mode} />
            <Typography small subtle natural>{entry.note}</Typography>
          </Row>
        ))}
      </Row>
      <DataTable
        bare
        alignTop
        columns={[
          { label: "Family", minWidth: 230, grow: 1.5 },
          { label: "Width", width: 96 },
          { label: "Height", minWidth: 110, grow: 0.8 },
          { label: "Floor", width: 100 },
          { label: "Cap", width: 92 },
          { label: "Reflows", minWidth: 240, grow: 1.8 },
        ]}
        rows={SIZING.map((row) => [
          <Column key="family" fine>
            <Typography variantTitle>{row.family}</Typography>
            <Typography caption muted>{row.members}</Typography>
          </Column>,
          <ModeBadge key="mode" mode={row.mode} />,
          <Typography key="height" caption mono subtle>{row.height}</Typography>,
          <Typography key="floor" caption mono subtle>{row.floor}</Typography>,
          <Typography key="cap" caption mono subtle>{row.cap}</Typography>,
          <Typography key="reflows" small subtle>{row.reflows}</Typography>,
        ])}
      />
    </ShowcaseCard>
  );
}

/** A resolution step's code line (400 11 px mono in the third ink). */
function Code({ children }: { children: string }) {
  return <Typography tiny mono muted natural>{children}</Typography>;
}

/** How a component finds its size: the three mechanisms, in the order to try them. */
function ResolutionCard() {
  return (
    <ShowcaseCard id="c-resolution">
      <Column roomy>
        <MediaObject
          bareIcon
          icon={<Badge step default>1</Badge>}
          title="Intrinsic · no JavaScript"
          description="Fill or hug inside the parent's bounds, a minWidth floor, wrapping. Correct on the first frame and on the server."
          body={<Code>{"<Grid minTileWidth={240}> · <Row wrap> · <Row stacks>"}</Code>}
        />
        <MediaObject
          bareIcon
          icon={<Badge step>2</Badge>}
          title="Container measurement · its own width"
          description="A component that changes shape measures itself against the shared breakpoints, so every family flips at the same widths."
          body={
            <Column comfortable>
              <TierBar tiers={[{ label: "sm", share: 56 }, { label: `${breakpoints.sm} · md`, share: 34 }, { label: `${breakpoints.md} · base`, share: 30 }]} />
              <Code>{"useContainerBreakpoint({ base, md, sm }) · first frame renders base"}</Code>
            </Column>
          }
        />
        <MediaObject
          bareIcon
          icon={<Badge step secondary>3</Badge>}
          title="Viewport · chrome only"
          description="Only window-level chrome reads the window: Sidebar and FilterPanel drawers, phone sheets, app shells."
          body={<Code>{"useBreakpoint() · useFormFactor() · BreakpointOverride for previews"}</Code>}
        />
        <Column roomy>
          <Divider />
          <Row wrap compact>
            <Badge destructive>no width at a call site</Badge>
            <Badge destructive>no window reads in a component</Badge>
            <Badge destructive>no style escape hatch</Badge>
          </Row>
        </Column>
      </Column>
    </ShowcaseCard>
  );
}

const REVENUE = [52, 48, 50, 40, 42, 32, 30, 22, 24, 12, 8].map((v) => 70 - v);

/** The dashboard card's widgets: each one's span, its narrow span, and its body. */
const WIDGETS: { id: string; span: number; narrowSpan?: number; title: string; content?: ReactNode }[] = [
  { id: "revenue", span: 8, title: "Revenue", content: <Sparkline line tall values={REVENUE} accessibilityLabel="Revenue, last 11 weeks" /> },
  { id: "seats", span: 4, title: "Seats", content: <Typography statValue>1,204</Typography> },
  { id: "uptime", span: 4, narrowSpan: 6, title: "Uptime" },
  { id: "latency", span: 4, narrowSpan: 6, title: "Latency" },
  { id: "errors", span: 4, narrowSpan: 12, title: "Errors" },
  { id: "funnel", span: 5, title: "Funnel" },
  { id: "members", span: 7, title: "Members" },
];

/** The dashboard card's legend: how the grid treats spans at each width. */
const GRID_MODES = [
  { name: "wide", note: "honors every span" },
  { name: "narrow", note: "reflows to narrowSpan" },
  { name: "phone", note: "stacks full width" },
];

/** DashboardGrid · 12 columns · spans in twelfths. */
function DashboardGridCard() {
  return (
    <ShowcaseCard
      id="c-dashboard-grid"
      caption="<DashboardGrid> measures its own width, never the window · each widget declares span and narrowSpan in twelfths"
    >
      <ColumnGuides>
        <DashboardGrid
          compact
          items={WIDGETS.map((widget) => ({
            id: widget.id,
            span: widget.span,
            narrowSpan: widget.narrowSpan,
            title: widget.title,
            content: (
              <Card dense smallCorners>
                <Column compact>
                  <Row between alignCenter>
                    <Typography gridLabel muted>{widget.title}</Typography>
                    <Typography gridLabel primary>{widget.id === "revenue" ? `span ${widget.span}` : String(widget.span)}</Typography>
                  </Row>
                  {widget.content}
                </Column>
              </Card>
            ),
          }))}
        />
      </ColumnGuides>
      <Grid minTileWidth={120} columns={3} comfortable>
        {GRID_MODES.map((mode) => (
          <Card key={mode.name} outlined smallCorners dense>
            <Column flush>
              <Typography tiny mono medium natural>{mode.name}</Typography>
              <Typography caption subtle>{mode.note}</Typography>
            </Column>
          </Card>
        ))}
      </Grid>
    </ShowcaseCard>
  );
}

/** Layout · Row & Column · Container · Grid · Divider. */
function LayoutCard() {
  return (
    <ShowcaseCard id="c-layout">
      <Grid minTileWidth={280} apart>
        <Column comfortable>
          <Typography legendLabel>Gap scale</Typography>
          <Column comfortable>
            {GAP_SCALE.map((gap) => <GapRow key={gap.name} name={gap.name} value={spacing[gap.step]} />)}
          </Column>
          <Mono>{"<Row cozy alignCenter between> · <Column tight> · <Row stacks>"}</Mono>
        </Column>
        <Column comfortable>
          <Typography legendLabel>Container steps</Typography>
          <Column snug>
            {SAMPLED_STEPS.map((step) => <StepBar key={step} name={step} value={widths[step]} page={widths.page} />)}
          </Column>
          <Mono>{`${Object.keys(widths).length} steps, xxxs ${widths.xxxs} → page ${widths.page} · caps and centers, never a raw width`}</Mono>
        </Column>
        <Column comfortable>
          <Typography legendLabel>Grid</Typography>
          <Grid minTileWidth={72} columns={3} snug>
            <PlaceholderTile label="≥ 72" />
            <PlaceholderTile label="≥ 72" />
            <PlaceholderTile label="≥ 72" />
            <PlaceholderTile label="reflows" reflows />
          </Grid>
          <Mono>{"<Grid minTileWidth={72} columns={3}> + <GridItem> · measures its own width: the fourth tile wraps; 3-up, 2-up, 1-up"}</Mono>
          <Column roomy>
            <Divider />
            <Row wrap compact>
              {["View", "Text", "Pressable", "ScrollView", "TextInput"].map((name) => <Badge key={name} token dashed keyCorners>{name}</Badge>)}
            </Row>
          </Column>
          <Typography caption muted>React Native primitives, re-exported as-is. They take plain style objects and no skin; everything above them is Canvas.</Typography>
        </Column>
        <Column relaxed>
          <Typography legendLabel>Divider</Typography>
          <Divider strong />
          <Divider strong>or continue with</Divider>
          <Divider strong>
            <Button outline small iconRight={<Icon chevronDown size={14} decorative />}>Show 12 more</Button>
          </Divider>
          <Row roomy alignCenter>
            <Icon undo2 size={17} subtle accessibilityLabel="Undo" />
            <Icon redo2 size={17} subtle accessibilityLabel="Redo" />
            <Divider vertical strong />
            <Icon link size={17} subtle accessibilityLabel="Link" />
            <Icon image size={17} subtle accessibilityLabel="Image" />
            <Divider vertical strong />
            <Icon code size={17} subtle accessibilityLabel="Code" />
            <Icon listOrdered size={17} subtle accessibilityLabel="Numbered list" />
          </Row>
          <Mono>{"<Divider /> · <Divider>or</Divider> · <Divider vertical> · a hairline, never a grey"}</Mono>
        </Column>
      </Grid>
    </ShowcaseCard>
  );
}

/** AppFrame · Page: the frame's banner over a capped page, beside a phone's safe areas. */
function AppFrameCard() {
  return (
    <ShowcaseCard id="c-app-frame">
      {/* The frame drawn with the parts it holds: a real AppFrame mounts the page's banner
          and main landmarks (and a Page its own main scroller), which a docs page already
          has, so the card draws the frame round the live Navbar instead. */}
      <AppFrameDiagram
        banner={
          <Navbar
            compact
            brand="Riskora"
            brandContent={<CanvasMark size={20} />}
            links={["Boards", "Reports"]}
            defaultActive={0}
            actions={<Badge band mono keyCorners>banner</Badge>}
          />
        }
        label={`Page · capped at md ${widths.md}, centered`}
        caption="<AppFrame> mounts safe area + overlay host · <Page> is one screen"
      />
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
