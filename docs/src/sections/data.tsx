import { SectionVignette } from "../ui/showcase/section-vignette";
import { useState, type ComponentProps, type ReactNode } from "react";
import { PLATFORM_COPY } from "../data/platform-copy";
import {
  Accordion,
  ActionPanel,
  Avatar,
  Badge,
  Board,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardSeparator,
  CardTitle,
  Carousel,
  Chat,
  CodeBlock,
  Collapsible,
  Column,
  DataTable,
  DescriptionList,
  Emblem,
  Feed,
  FlowEditor,
  Grid,
  GridItem,
  GridList,
  Icon,
  Image,
  Input,
  MediaObject,
  Progress,
  ProgressRing,
  QRCode,
  Row,
  Sparkline,
  StackedList,
  Stats,
  Switch,
  ThemeProvider,
  Typography,
  Video,
  useTheme,
  type BoardItem,
  type ChatMessageData,
  type DataTableSort,
  type FlowSelection,
} from "@nannier/canvas";
import { resolvePhoto } from "../core/photos";
import { COMPONENTS } from "../core/data/components";
import { ShowcaseCard, ShowcaseGrid, ShowcaseGroup } from "../ui/showcase";
import { ShowcaseDemoFrame, useShowcaseDemo } from "../ui/showcase/demo";
import {
  BOARD_COLUMNS,
  BOARD_ITEMS,
  CALENDAR_EVENTS,
  CHAT_REPLIES,
  CHAT_THREAD,
  CODE_TABS,
  FLOW_EDGES,
  FLOW_NODES,
  MEMBERS,
  QUESTIONS,
  SELECTED_MEMBERS,
} from "./data.data";

// The Surfaces & data section page (`Canvas v4.0.0 Data.dc.html`): its hero vignette, the
// four Card specimens, the full-width anatomy, Stats and DataTable cards, then the three
// subsections (Lists & disclosure, Content & media, Workspace) with their cards, composed
// of live kit components with the hand-off's copy. Where the kit has no prop for something
// the hand-off draws (the anatomy card's labelled dashed outlines, a GridList tile's icon,
// a Monday-first calendar) the card shows what the kit has, and the difference is recorded
// in the Phase 5 report rather than drawn by hand here. The FlowEditor card after the Board
// is the repository's own (the hand-off predates FlowEditor; REPOSITORY_CARDS in
// tools/v4/repository-components.ts), built the way its Workspace neighbours are.

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | undefined;

/** The animated hero: the installs stat, its spark drawn in full. */
export function Vignette() {
  return <SectionVignette kind="data" />;
}

// ── The Card specimens ──────────────────────────────────────────────────────────────

/** The specimen's label: the mono eyebrow the hand-off sets over each Card. */
const specimenLabel = (label: string) => <Typography eyebrow subtle>{label}</Typography>;

/** Card · default: the page's own card at rest, its chip linking the Card page. */
const SAVE_FRAMES = ["ready", "saving", "saved", "saved"] as const;

function CardDefault() {
  const { value, setValue, active } = useShowcaseDemo("c-card", SAVE_FRAMES, { interval: 1900 });
  return (
    <ShowcaseCard id="c-card" title="Card · default">
      <Column snug>
        <Typography subheading semibold>Welcome to Canvas</Typography>
        <Typography small muted>Rests at elevation sm. Lifts to md on hover, on the spring.</Typography>
      </Column>
      <Row snug>
        <Button primary small loading={active && value === "saving"} onPress={() => setValue("saved")} testID="section-demo-card-save">
          {value === "saved" ? "Saved" : "Save"}
        </Button>
        <Button ghost small onPress={() => setValue("ready")}>Later</Button>
      </Row>
    </ShowcaseCard>
  );
}

/** Card · raised: the big number, counted from the docs' component list. */
function CardRaised() {
  return (
    <Card raised testID="showcase-c-card-raised">
      {specimenLabel("Card · raised")}
      <Typography small muted>Canvas v4.0.0</Typography>
      <Typography bigNumber tabular>
        {String(COMPONENTS.length)}
        <Typography unit muted> components</Typography>
      </Typography>
      <Typography small muted>{PLATFORM_COPY.statFoot}</Typography>
    </Card>
  );
}

/**
 * Card · glass: the same Card under a glass ThemeProvider. A nested provider resolves its
 * own scheme and palette, so it is handed the page's.
 */
function CardGlass() {
  const { scheme, palette } = useTheme();
  return (
    <ThemeProvider glass scheme={scheme} {...{ [palette]: true }}>
      <Card testID="showcase-c-card-glass">
        {specimenLabel("Card · glass")}
        <Typography subheading semibold>glass-tint-content</Typography>
        <Typography small muted>Denser than the shell tint, so this paragraph stays at 4.5:1 over anything.</Typography>
      </Card>
    </ThemeProvider>
  );
}

/** Card · selected: the ion border and ring, with a specimen well for the media slot. */
const CARD_SELECTION = [true, false, true, true];

function CardSelected() {
  const { value, setValue } = useShowcaseDemo("c-card-selected", CARD_SELECTION, { interval: 2000 });
  return (
    <ShowcaseDemoFrame id="c-card-selected">
      <Card
        selected={value}
        onPress={() => setValue(!value)}
        accessibilityLabel={value ? "Deselect Team, 24 members" : "Select Team, 24 members"}
        testID="showcase-c-card-selected"
      >
        <Row between alignCenter>
          {specimenLabel("Card · selected")}
          <Icon circleCheck={value} circle={!value} primary={value} muted={!value} size={18} decorative />
        </Row>
        <Typography subheading semibold>Team · 24 members</Typography>
        <Typography small muted>Selection is a 1px ion border and a 4px ring. Never a fill.</Typography>
        <Card flat flush>
          <CardMedia compact>
            <Typography caption mono subtle>media slot · 16:9</Typography>
          </CardMedia>
        </Card>
      </Card>
    </ShowcaseDemoFrame>
  );
}

// ── Card · anatomy · modes ──────────────────────────────────────────────────────────

/** One special mode's tile, its prop and what it is for in mono under it. */
function Mode({ name, note, children }: { name: string; note: string; children: ReactNode }) {
  return (
    <Column snug>
      {children}
      <Row between cozy>
        <Typography caption mono>{name}</Typography>
        <Typography caption mono subtle right>{note}</Typography>
      </Row>
    </Column>
  );
}

const ANATOMY_FRAMES = [
  { complete: 14, glass: true, scheme: 0, applyTheme: false },
  { complete: 16, glass: false, scheme: 0, applyTheme: true },
  { complete: 18, glass: true, scheme: 1, applyTheme: true },
  { complete: 18, glass: true, scheme: 0, applyTheme: true },
];

function CardAnatomy() {
  const { value, setValue } = useShowcaseDemo("c-card-anatomy", ANATOMY_FRAMES);
  const { scheme, palette, surface } = useTheme();
  return (
    <ShowcaseCard
      id="c-card-anatomy"
      caption="<Card> with <CardMedia> · <CardHeader> · <CardTitle> · <CardDescription> · <CardSeparator> · <CardContent> · <CardFooter> · modes: featured · promo · artwork · illustration · controls · referenceKey + referenceSource · inset note / version / gate"
    >
      <Row stacks stackBreakpoint="md" relaxed>
        <Column span={5}>
          <Card flush>
            <CardMedia src={photo("/noor-park.jpg")} alt="Noor Park" />
            <CardHeader>
              <CardTitle>Mobile release 6.3</CardTitle>
              <CardDescription>{`Tab bar spacing and the ${PLATFORM_COPY.samplePlatform} blur rebuild.`}</CardDescription>
            </CardHeader>
            <CardSeparator />
            <CardContent>
              <Progress value={value.complete / 18} description={`${value.complete} / 18`} testID="section-demo-qa-progress">QA checklist</Progress>
            </CardContent>
            <CardFooter>
              <Row end snug>
                <Button ghost small>Later</Button>
                <Button primary small onPress={() => setValue((current) => ({ ...current, complete: 18 }))}>Review</Button>
              </Row>
            </CardFooter>
          </Card>
        </Column>
        <Column span={7}>
          <Grid minTileWidth={150} relaxed>
            <Mode name="featured" note="brand gradient">
              <Card featured title="Canvas v4.0.0 is live" description={`${COMPONENTS.length} components`} />
            </Mode>
            <Mode name="promo" note="CTA on a wash">
              <Card promo title="Glass ships in v4.0.0" actions={<Button secondary small>Read the guide</Button>} />
            </Mode>
            <Mode name="artwork" note="image fills the card">
              <Card flush clip>
                <CardMedia src={photo("/grace-hopper.jpg")} alt="Grace Hopper" height={96} />
                <CardContent>
                  <Typography small medium>Grace Hopper</Typography>
                </CardContent>
              </Card>
            </Mode>
            <Mode name="reference" note="referenceKey · source">
              <Card referenceStacked referenceKey="DESIGN.md · Shapes" title="A nested surface is never rounder than its container." description="bnannier/canvas" />
            </Mode>
            <Mode name="inset panels" note="note · version · gate">
              <Column snug>
                <Card notePanel><Typography small>Note · glass is a theming mode</Typography></Card>
                <Card versionPanel><Typography caption mono>v6.3.0 · Oct 26</Typography></Card>
                <Card gatePanel><Typography caption>Experimental</Typography></Card>
              </Column>
            </Mode>
            <Mode name="controls" note="a settings surface">
              <ThemeProvider
                scheme={value.applyTheme ? (value.scheme === 0 ? "dark" : "light") : scheme}
                surface={value.applyTheme ? (value.glass ? "glass" : "solid") : surface}
                {...{ [palette]: true }}
              >
                <Card controls>
                  <Switch checked={value.glass} onChange={(glass) => setValue((current) => ({ ...current, glass, applyTheme: true }))}>Glass</Switch>
                  <ButtonGroup segmented block active={value.scheme} onSelect={(scheme) => setValue((current) => ({ ...current, scheme, applyTheme: true }))} accessibilityLabel="Scheme" items={["Dark", "Light"]} />
                </Card>
              </ThemeProvider>
            </Mode>
          </Grid>
        </Column>
      </Row>
    </ShowcaseCard>
  );
}

// ── Stats ───────────────────────────────────────────────────────────────────────────

const STAT_FRAMES = [
  { revenue: "$128.4k", gain: "+18.2%", revenueSpark: [30, 42, 38, 50, 46, 58, 64, 80], members: "1,204", joined: 72, newMembers: "+6", latency: 212, change: "+41ms", slow: true, latencySpark: [40, 38, 44, 52, 48, 60, 66, 74], ios: 64, mobile: 18, web: 9 },
  { revenue: "$131.8k", gain: "+21.3%", revenueSpark: [42, 38, 50, 46, 58, 64, 80, 87], members: "1,227", joined: 73, newMembers: "+23", latency: 184, change: "−28ms", slow: false, latencySpark: [38, 44, 52, 48, 60, 66, 74, 53], ios: 65, mobile: 19, web: 10 },
  { revenue: "$136.2k", gain: "+25.4%", revenueSpark: [38, 50, 46, 58, 64, 80, 87, 94], members: "1,260", joined: 75, newMembers: "+33", latency: 171, change: "−13ms", slow: false, latencySpark: [44, 52, 48, 60, 66, 74, 53, 43], ios: 66, mobile: 19, web: 11 },
];

function StatsCard() {
  const { value } = useShowcaseDemo("c-stats", STAT_FRAMES, { interval: 2400 });
  return (
    <ShowcaseCard id="c-stats" caption="<Stats items={…}> · deltas and sparks · <ProgressRing>">
      <Stats
        testID="section-demo-stats"
        items={[
          { label: "Revenue", value: value.revenue, delta: value.gain, spark: value.revenueSpark },
          { label: "Active members", value: value.members, delta: value.newMembers, description: `${value.joined}% of 1,680 invited`, share: [{ label: "Joined", value: value.joined }, { label: "Invited", value: 100 - value.joined }] },
          { label: "p95 latency", value: `${value.latency} ms`, delta: value.change, down: value.slow, spark: value.latencySpark },
        ]}
      />
      <Row cozy alignCenter>
        <ProgressRing value={value.ios + value.mobile + value.web} compact />
        <Column tight>
          <Typography eyebrow subtle>Platforms</Typography>
          <Typography small muted>{`iOS ${value.ios}% · ${PLATFORM_COPY.samplePlatform} ${value.mobile}% · Web ${value.web}%`}</Typography>
        </Column>
      </Row>
    </ShowcaseCard>
  );
}

// ── DataTable ───────────────────────────────────────────────────────────────────────

interface MembersFrame {
  selected: Array<string | number>;
  sort: DataTableSort | null;
  invitationAccepted: boolean;
}

const MEMBER_FRAMES: MembersFrame[] = [
  { selected: [...SELECTED_MEMBERS], sort: null, invitationAccepted: false },
  { selected: [1, 3, 2], sort: null, invitationAccepted: true },
  { selected: [2, 5], sort: { column: "Balance", descending: true }, invitationAccepted: true },
  { selected: [5], sort: { column: "Balance" }, invitationAccepted: true },
];

const MEMBER_ROWS = MEMBERS.map((member, key) => ({ ...member, key }));

function MembersTable() {
  const { value, setValue, stop } = useShowcaseDemo("c-data-table", MEMBER_FRAMES, { interval: 2600 });
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const members = MEMBER_ROWS.filter((member) => `${member.name} ${member.email} ${member.team}`.toLowerCase().includes(term));
  const visibleKeys = new Set<string | number>(members.map((member) => member.key));
  const selected = value.selected.filter((key) => visibleKeys.has(key));
  const statusOf = (member: (typeof MEMBER_ROWS)[number]) => value.invitationAccepted && member.status === "Invited" ? "Active" : member.status;
  return (
    <ShowcaseCard id="c-data-table" caption="<DataTable selectable sortable> · rows select on press · cells take any node">
      <Row between alignCenter wrap cozy>
        <Column tight>
          <Typography subheading semibold>Members</Typography>
          <Typography small muted>{`${selected.length} selected · ${members.length} ${members.length === 1 ? "row" : "rows"} · click a row`}</Typography>
        </Column>
        <Row snug alignCenter>
          <Input sm leadingIcon icon="search" placeholder="Filter members" accessibilityLabel="Filter members" value={query} onFocus={stop} onChangeText={(text) => { stop(); setQuery(text); }} />
          <Button outline small>Export</Button>
          <Button primary small>Invite</Button>
        </Row>
      </Row>
      <DataTable
        attached
        selectable
        sortable
        testID="section-demo-members"
        selectedKeys={selected}
        onSelectionChange={(selected) => setValue((current) => ({
          ...current,
          selected: [...current.selected.filter((key) => !visibleKeys.has(key)), ...selected],
        }))}
        sort={value.sort}
        onSortChange={(sort) => setValue((current) => ({ ...current, sort }))}
        rowKey={(_, index) => members[index]!.key}
        columns={[
          { label: "Member", sortValue: (_cell, _row, i) => members[i]!.name },
          "Team",
          { label: "Status", sortValue: (_cell, _row, i) => statusOf(members[i]!) },
          { label: "Balance", numeric: true, sortValue: (_cell, _row, i) => Number(members[i]!.balance.replaceAll(",", "")) },
          { label: "Activity · 8w", sortable: false },
        ]}
        rows={members.map((member) => [
          <Row key="member" snug alignCenter>
            <Avatar small src={photo(member.photo)} name={member.name} />
            <Column flush>
              <Typography small medium>{member.name}</Typography>
              <Typography caption muted>{member.email}</Typography>
            </Column>
          </Row>,
          member.team,
          <Badge key="status" status success={statusOf(member) === "Active"} info={statusOf(member) === "Invited"} error={statusOf(member) === "Suspended"}>{statusOf(member)}</Badge>,
          <Typography key="balance" small mono tabular right>{`$${member.balance}`}</Typography>,
          <Sparkline key="activity" compact values={member.activity} />,
        ])}
      />
      <Row between alignCenter>
        <Typography caption muted>{term ? `${members.length} matching ${members.length === 1 ? "member" : "members"}` : `Showing 1–${MEMBERS.length} of 24`}</Typography>
        <Row snug>
          <Button ghost small>‹ Prev</Button>
          <Button ghost small>Next ›</Button>
        </Row>
      </Row>
    </ShowcaseCard>
  );
}

// ── Lists & disclosure ──────────────────────────────────────────────────────────────

const LIST_FRAMES = [
  { grace: "Admin · 2h ago", kira: "Invited", liang: "Viewer · yesterday", accepted: false },
  { grace: "Admin · online", kira: "Invited", liang: "Viewer · yesterday", accepted: false },
  { grace: "Admin · online", kira: "Joined", liang: "Viewer · online", accepted: true },
  { grace: "Admin · 1m ago", kira: "Joined", liang: "Viewer · online", accepted: true },
];

function StackedListCard() {
  const { value } = useShowcaseDemo("c-stacked-list", LIST_FRAMES, { interval: 2300 });
  return (
    <ShowcaseCard id="c-stacked-list" caption="<StackedList> · rows take onPress and the whole row is the target · inset hairlines on iOS">
      <StackedList
        items={[
          { name: "Ada Lovelace", detail: "ada@ionize.io", meta: "Owner · online", avatar: photo("/ada-lovelace.jpg") },
          { name: "Grace Hopper", detail: "grace@ionize.io", meta: value.grace, avatar: photo("/grace-hopper.jpg") },
          { name: "Kira Tanaka", detail: "kira@ionize.io", badge: value.kira, info: !value.accepted, success: value.accepted, avatar: photo("/kira-tanaka.jpg") },
          { name: "Liang Bao", detail: "liang@ionize.io", meta: value.liang, avatar: photo("/liang-bao.jpg") },
        ]}
      />
    </ShowcaseCard>
  );
}

const DIRECTORY_FRAMES: Array<{ noor?: string; marcus?: string }> = [
  {},
  { noor: "Available" },
  { noor: "In review", marcus: "Available" },
  { marcus: "Away" },
];

function GridListCard() {
  const { value } = useShowcaseDemo("c-grid-list", DIRECTORY_FRAMES, { interval: 2600 });
  return (
    <ShowcaseCard id="c-grid-list" caption="<GridList> people directories · collections · galleries · tiles lift on the spring">
      <GridList
        cols2
        items={[
          { title: "Noor Park", subtitle: "Mobile lead", avatar: photo("/noor-park.jpg"), badge: value.noor, actions: [{ label: "Mail", outline: true }, { label: "Chat", outline: true }] },
          { title: "Marcus Allen", subtitle: "Growth", avatar: photo("/marcus-allen.jpg"), badge: value.marcus, actions: [{ label: "Mail", outline: true }, { label: "Chat", outline: true }] },
          { title: "Tokens", subtitle: "48 roles" },
          { title: "Charts", subtitle: `${COMPONENTS.filter((c) => c.section === "Charts").length} types` },
        ]}
      />
    </ShowcaseCard>
  );
}

const MEDIA_OBJECT_FRAMES = [
  { title: "Ready for review", glyph: "gitPullRequest", time: "9:41" },
  { title: "Review approved", glyph: "circleCheck", time: "9:43" },
  { title: "Merged into main", glyph: "gitMerge", time: "9:46" },
] as const;

function MediaObjectCard() {
  const { value } = useShowcaseDemo("c-media-object", MEDIA_OBJECT_FRAMES, { interval: 2600 });
  return (
    <ShowcaseCard id="c-media-object" caption="<MediaObject> · avatar, Emblem or Image in the media slot · the base of every row above">
      <MediaObject
        src={photo("/kira-tanaka.jpg")}
        title="Kira Tanaka"
        meta="2m"
        description="The ion ring reads better at 4px than 3. Shipping it with the field update."
      />
      <MediaObject
        icon={<Emblem primary small><Icon {...{ [value.glyph]: true }} size={16} decorative /></Emblem>}
        title={value.title}
        meta={value.time}
        description="#482 · Overlays move to glass-tint-dense"
      />
      <MediaObject
        src={photo("/liang-bao.jpg")}
        title={PLATFORM_COPY.articleSkins.title}
        description={PLATFORM_COPY.articleSkins.description}
        meta="8 min read"
      />
    </ShowcaseCard>
  );
}

type FeedItems = NonNullable<ComponentProps<typeof Feed>["items"]>;

const FEED_ITEMS: FeedItems = [
  { id: "merge", actor: "Kira", action: "merged", target: "#482 into main", time: "2 min ago", icon: "gitMerge" },
  { id: "palette", actor: "Bobby", action: "moved", target: "--hue from 285 to 205", time: "1 hour ago", icon: "palette" },
  { id: "comment", actor: "Liang", action: "commented", time: "3 hours ago", avatar: photo("/liang-bao.jpg"), content: "Filtering a series out never renumbers the rest. Keep chart-3 mint." },
  { id: "publish", actor: "v6.2.0", action: "published to npm", time: "yesterday", icon: "rocket" },
];

const FEED_FRAMES: FeedItems[] = [
  FEED_ITEMS,
  [
    { id: "review", actor: "Noor", action: "approved", target: "the QA checklist", time: "just now", icon: "circleCheck" },
    ...FEED_ITEMS.slice(0, 3),
  ],
  [
    { id: "release", actor: "v6.3.0", action: "published to npm", time: "just now", icon: "rocket" },
    { id: "review", actor: "Noor", action: "approved", target: "the QA checklist", time: "2 min ago", icon: "circleCheck" },
    ...FEED_ITEMS.slice(0, 2),
  ],
];

function FeedCard() {
  const { value } = useShowcaseDemo("c-feed", FEED_FRAMES, { interval: 2700 });
  return (
    <ShowcaseCard id="c-feed" caption="<Feed> · the icon names the event · one hairline spine, never a card per row">
      <Feed items={value} testID="section-demo-feed" />
    </ShowcaseCard>
  );
}

const WORKSPACE_FRAMES = [
  { count: 24, syncing: false },
  { count: 24, syncing: true },
  { count: 25, syncing: false },
  { count: 26, syncing: false },
];

function DescriptionListCard() {
  const { value, stop } = useShowcaseDemo("c-description-list", WORKSPACE_FRAMES, { interval: 2500 });
  return (
    <ShowcaseCard id="c-description-list" caption="<DescriptionList> rows flagged update edit in place · ↵ saves, esc cancels · <ActionPanel> one decision, one action">
      <DescriptionList
        inline
        onUpdate={stop}
        items={[
          { term: "Display name", value: "Bobby Nannier", update: true },
          { term: "Email", value: "bobby@nannier.com", update: true },
          { term: "Workspace", value: <Row snug alignCenter><Typography base>Riskora · {value.count} members</Typography><Badge status success={!value.syncing} info={value.syncing}>{value.syncing ? "Syncing" : "Active"}</Badge></Row> },
        ]}
      />
      <ActionPanel title="Export workspace" description="Every board, token and asset as one .zip." actionLabel="Export" inline />
      <ActionPanel title="Delete workspace" description={`Removes Riskora for all ${value.count} members. There is no undo.`} actionLabel="Delete" destructive inline />
    </ShowcaseCard>
  );
}

const DISCLOSURE_FRAMES: Array<{ accordion: string | string[]; collapsible: boolean }> = [
  { accordion: "glass", collapsible: false },
  { accordion: "variant", collapsible: false },
  { accordion: "rebrand", collapsible: false },
  { accordion: [], collapsible: true },
];

function AccordionCard() {
  const { value, setValue } = useShowcaseDemo("c-accordion", DISCLOSURE_FRAMES, { interval: 2800 });
  return (
    <ShowcaseCard id="c-accordion" caption="<Accordion items={…}> a stack of disclosures · <Collapsible title=&quot;…&quot;> exactly one">
      <Accordion
        card
        value={value.accordion}
        onValueChange={(accordion) => setValue((current) => ({ ...current, accordion }))}
        testID="section-demo-accordion"
        items={QUESTIONS.map((q) => ({ key: q.key, title: q.title, content: <Typography small muted>{q.body}</Typography> }))}
      />
      <Collapsible title="3 removed props" open={value.collapsible} onOpenChange={(collapsible) => setValue((current) => ({ ...current, collapsible }))}>
        <Row wrap snug>
          <Badge mono>variant="primary"</Badge>
          <Badge mono>size="lg"</Badge>
          <Badge mono>tone="destructive"</Badge>
        </Row>
      </Collapsible>
    </ShowcaseCard>
  );
}

// ── Content & media ─────────────────────────────────────────────────────────────────

const CODE_FRAMES = [
  { tab: 0, lines: [5] },
  { tab: 0, lines: [6] },
  { tab: 1, lines: [2, 3] },
  { tab: 1, lines: [4, 5] },
];

function CodeBlockCard() {
  const { value, setValue } = useShowcaseDemo("c-code-block", CODE_FRAMES, { interval: 2100 });
  return (
    <ShowcaseCard id="c-code-block" caption="<CodeBlock> highlight · line emphasis · diff · folding · tabbed alternatives · copy via expo-clipboard on native">
      <CodeBlock
        tabs={CODE_TABS}
        numbered
        copy
        active={value.tab}
        onTabChange={(tab) => setValue({ tab, lines: CODE_FRAMES.find((frame) => frame.tab === tab)?.lines ?? [] })}
        highlightLines={value.lines}
        testID="section-demo-code-block"
      />
    </ShowcaseCard>
  );
}

/** One of the Carousel's title slides: a mono eyebrow over its line on a brand wash. */
function Slide({ eyebrow, title, promo }: { eyebrow: string; title: string; promo?: boolean }) {
  return promo
    ? <Card promo eyebrow={eyebrow} title={title} />
    : <Card featured eyebrow={eyebrow} title={title} />;
}

const CAROUSEL_FRAMES = [0, 1, 2, 3, 2, 1];

function CarouselCard() {
  const { value, setValue } = useShowcaseDemo("c-carousel", CAROUSEL_FRAMES, { interval: 3000 });
  return (
    <ShowcaseCard id="c-carousel" caption={PLATFORM_COPY.carouselCaption}>
      <Carousel
        showArrows
        showDots
        index={value}
        onIndexChange={setValue}
        testID="section-demo-carousel"
        items={[
          { key: "material", content: <Slide eyebrow={PLATFORM_COPY.slideEyebrow} title="Light is the material" /> },
          { key: "accent", content: <Slide promo eyebrow="02 · Accent" title="One charged hue does every job" /> },
          { key: "motion", content: <Slide eyebrow="03 · Motion" title="Every press runs on one spring" /> },
          {
            key: "noor",
            content: (
              <Card flush clip>
                <CardMedia src={photo("/noor-park.jpg")} alt="Noor Park" />
                <CardContent>
                  <Typography small medium>Noor Park</Typography>
                  <Typography caption muted>Mobile lead · Seoul</Typography>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </ShowcaseCard>
  );
}

const IMAGE_FIT_FRAMES = [false, false, true, true];

function MediaCard() {
  const { value: swapFit } = useShowcaseDemo("c-media", IMAGE_FIT_FRAMES, { interval: 2500 });
  return (
    <ShowcaseCard id="c-media" caption={"<Image cover> · <Image contain> · <Video poster autoplay muted loop> · <QRCode value=\"…\">"}>
      <Row cozy>
        {[!swapFit, swapFit].map((cover, i) => (
          <Column key={i === 0 ? "first" : "second"} fill snug>
            <Image source={{ uri: photo("/marcus-allen.jpg") }} cover={cover} contain={!cover} height={96} radius="lg" alt={cover ? "Marcus Allen, cropped to fill" : "Marcus Allen, letterboxed"} />
            <Typography caption mono subtle>{cover ? "cover · crops" : "contain · letterboxes"}</Typography>
          </Column>
        ))}
      </Row>
      <Video
        source={{ uri: resolvePhoto("/video-sample.mp4") as string }}
        poster={{ uri: resolvePhoto("/video-sample.jpg") as string }}
        controls
        accessibilityLabel="Sample clip with controls"
      />
      <Row cozy alignCenter>
        <QRCode small value="https://canvas.nannier.com" accessibilityLabel="QR code for canvas.nannier.com" />
        <Column fill tight>
          <Typography small medium>canvas.nannier.com</Typography>
          <Typography caption muted>Always dark on white so any camera reads it, whatever the scheme.</Typography>
        </Column>
      </Row>
    </ShowcaseCard>
  );
}

// ── Workspace ───────────────────────────────────────────────────────────────────────

const CALENDAR_FRAMES = [26, 28, 30, 12, 21];

function CalendarCard() {
  const { value, setValue } = useShowcaseDemo("c-calendar", CALENDAR_FRAMES, { interval: 2300 });
  return (
    <ShowcaseCard id="c-calendar" caption="<Calendar events={…}> · dots in the month grid, blocks on the week and day timelines">
      <Calendar
        month="October 2026"
        daysInMonth={31}
        startWeekday={4}
        today={26}
        selected={value}
        onSelect={setValue}
        dayPeek
        events={CALENDAR_EVENTS}
        testID="section-demo-calendar"
      />
    </ShowcaseCard>
  );
}

type ChatFrame = { messages: ChatMessageData[]; pending?: boolean };

const CHAT_DEMO_QUESTION: ChatMessageData = { id: 4, role: "user", content: "How does a component get its width?" };
const CHAT_DEMO_ANSWER: ChatMessageData = { id: 5, role: "assistant", provider: "Claude", content: CHAT_REPLIES[0] };
const CHAT_QUESTION_THREAD = [...CHAT_THREAD, CHAT_DEMO_QUESTION];
const CHAT_COMPLETE_THREAD = [...CHAT_QUESTION_THREAD, CHAT_DEMO_ANSWER];
const CHAT_FRAMES: ChatFrame[] = [
  { messages: CHAT_THREAD },
  { messages: CHAT_QUESTION_THREAD, pending: true },
  { messages: [...CHAT_QUESTION_THREAD, { ...CHAT_DEMO_ANSWER, content: "Every component takes its width from its parent:", streaming: true }] },
  { messages: CHAT_COMPLETE_THREAD },
  { messages: CHAT_COMPLETE_THREAD },
];

function ChatCard() {
  const { value, setValue, stop, active, manual } = useShowcaseDemo("c-chat", CHAT_FRAMES, { interval: 1900 });
  const [draft, setDraft] = useState("");
  const streaming = value.messages.some((message) => message.streaming);
  const pending = active && value.pending;
  const unfinished = value.pending || streaming;
  const responding = pending || (active && streaming);
  let messages = value.messages;
  if (unfinished && manual) messages = CHAT_COMPLETE_THREAD;
  else if (unfinished && !active) messages = CHAT_QUESTION_THREAD;
  const send = (text: string) => {
    const content = text.trim();
    if (!content) return;
    const thread = unfinished ? CHAT_COMPLETE_THREAD : value.messages;
    const reply = CHAT_REPLIES[Math.floor(thread.length / 2) % CHAT_REPLIES.length]!;
    setValue({ messages: [
      ...thread,
      { id: thread.length + 1, role: "user", content },
      { id: thread.length + 2, role: "assistant", provider: "Claude", content: reply },
    ] });
    setDraft("");
  };
  return (
    <ShowcaseCard id="c-chat" caption="<Chat> = <ChatThread> + <ChatMessage> + <ChatComposer> · replies render through <Markdown> · bubbles 18 with a 6 tail · composer 20 on glass">
      <MediaObject
        icon={<Emblem primary small><Icon sparkles size={16} decorative /></Emblem>}
        title="Canvas assistant"
        description="provider · Claude"
        action={<Badge status success={!responding} info={responding}>{responding ? "responding" : "online"}</Badge>}
      />
      <Chat
        messages={messages}
        pending={pending}
        value={draft}
        onChangeText={(text) => { stop(); setDraft(text); }}
        onSend={send}
        placeholder="Ask about a component…"
        onAttach={stop}
        testID="section-demo-chat"
      />
    </ShowcaseCard>
  );
}

const BOARD_FRAMES = [
  BOARD_ITEMS,
  BOARD_ITEMS.map((item) => item.id === "timeline" ? { ...item, columnId: "progress" } : item),
  BOARD_ITEMS.map((item) => item.id === "timeline" ? { ...item, columnId: "review", badge: "ready" } : item),
];
const BOARD_LANES = BOARD_COLUMNS.map(({ id, label }) => ({ id, label }));

function BoardCard() {
  const { value, setValue } = useShowcaseDemo<BoardItem[]>("c-board", BOARD_FRAMES, { interval: 2900 });
  return (
    <ShowcaseCard id="c-board" caption="<Board columns={…}> on <DragDropProvider> · every column is a <DropZone>, every card a <Draggable> with a <DragHandle>">
      <Board draggable columns={BOARD_LANES} items={value} onItemsChange={setValue} testID="section-demo-board" />
    </ShowcaseCard>
  );
}

/** A repository card: the hand-off predates FlowEditor (tools/v4/repository-components.ts). */
const FLOW_FRAMES: Array<FlowSelection | null> = [
  null,
  { kind: "node", id: "product" },
  { kind: "node", id: "design" },
  { kind: "node", id: "build" },
  { kind: "edge", id: "e3" },
];

function FlowEditorCard() {
  const { value, setValue } = useShowcaseDemo("c-flow-editor", FLOW_FRAMES, { interval: 2000 });
  return (
    <ShowcaseCard id="c-flow-editor" caption="<FlowEditor readOnly nodes={…} edges={…}> · pan, zoom and select stay · a rework edge is dashed">
      <FlowEditor readOnly label="Delivery workflow" nodes={FLOW_NODES} edges={FLOW_EDGES} selected={value} onSelectionChange={setValue} testID="section-demo-flow-editor" />
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <Column chapter>
      <ShowcaseGrid minTileWidth={300}>
        <CardDefault />
        <CardRaised />
        <CardGlass />
        <CardSelected />
        <GridItem full><CardAnatomy /></GridItem>
        <GridItem full><StatsCard /></GridItem>
        <GridItem full><MembersTable /></GridItem>
      </ShowcaseGrid>
      <ShowcaseGroup id="g-lists">
        <ShowcaseGrid minTileWidth={340}>
          <StackedListCard />
          <GridListCard />
          <MediaObjectCard />
          <FeedCard />
          <DescriptionListCard />
          <AccordionCard />
        </ShowcaseGrid>
      </ShowcaseGroup>
      <ShowcaseGroup id="g-content">
        <ShowcaseGrid minTileWidth={340}>
          <CodeBlockCard />
          <CarouselCard />
          <MediaCard />
        </ShowcaseGrid>
      </ShowcaseGroup>
      <ShowcaseGroup id="g-workspace">
        <ShowcaseGrid minTileWidth={440}>
          <CalendarCard />
          <ChatCard />
          <GridItem full><BoardCard /></GridItem>
          <GridItem full><FlowEditorCard /></GridItem>
        </ShowcaseGrid>
      </ShowcaseGroup>
    </Column>
  );
}
