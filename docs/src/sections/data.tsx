import { useState, type ReactNode } from "react";
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
  type ChatMessageData,
} from "@nannier/canvas";
import { resolvePhoto } from "../core/photos";
import { COMPONENTS } from "../core/data/components";
import { ShowcaseCard, ShowcaseGrid, ShowcaseGroup, VignetteStage } from "../ui/showcase";
import {
  BOARD_COLUMNS,
  BOARD_ITEMS,
  CALENDAR_EVENTS,
  CHAT_REPLIES,
  CHAT_THREAD,
  CODE_TABS,
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
// in the Phase 5 report rather than drawn by hand here.

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | undefined;

/** The hero's still frame: the installs stat, its spark drawn in full. */
export function Vignette() {
  return (
    <VignetteStage testID="vignette-data">
      <Stats
        items={[{
          label: "Installs · this week",
          value: "48.2k",
          delta: "+12.4% vs. last week",
          spark: [4, 8, 6, 14, 12, 20, 18, 26, 24, 32, 30],
        }]}
      />
    </VignetteStage>
  );
}

// ── The Card specimens ──────────────────────────────────────────────────────────────

/** The specimen's label: the mono eyebrow the hand-off sets over each Card. */
const specimenLabel = (label: string) => <Typography eyebrow subtle>{label}</Typography>;

/** Card · default: the page's own card at rest, its chip linking the Card page. */
function CardDefault() {
  return (
    <ShowcaseCard id="c-card" title="Card · default">
      <Column snug>
        <Typography subheading semibold>Welcome to Canvas</Typography>
        <Typography small muted>Rests at elevation sm. Lifts to md on hover, on the spring.</Typography>
      </Column>
      <Row snug>
        <Button primary small>Save</Button>
        <Button ghost small>Later</Button>
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
      <Row snug baseline>
        <Typography statValue tabular>{String(COMPONENTS.length)}</Typography>
        <Typography small muted>components</Typography>
      </Row>
      <Typography small muted>MIT licensed. Web, iOS and Android from one tree.</Typography>
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
function CardSelected() {
  return (
    <Card selected testID="showcase-c-card-selected">
      <Row between alignCenter>
        {specimenLabel("Card · selected")}
        <Icon circleCheck primary size={18} decorative />
      </Row>
      <Typography subheading semibold>Team · 24 members</Typography>
      <Typography small muted>Selection is a 1px ion border and a 4px ring. Never a fill.</Typography>
      <Card flat flush>
        <CardMedia compact>
          <Typography caption mono subtle>media slot · 16:9</Typography>
        </CardMedia>
      </Card>
    </Card>
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

function CardAnatomy() {
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
              <CardDescription>Tab bar spacing and the Android blur rebuild.</CardDescription>
            </CardHeader>
            <CardSeparator />
            <CardContent>
              <Progress value={14 / 18} description="14 / 18">QA checklist</Progress>
            </CardContent>
            <CardFooter>
              <Row end snug>
                <Button ghost small>Later</Button>
                <Button primary small>Review</Button>
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
              <Card controls>
                <Switch defaultChecked>Glass</Switch>
                <ButtonGroup segmented block defaultActive={0} accessibilityLabel="Scheme" items={["Dark", "Light"]} />
              </Card>
            </Mode>
          </Grid>
        </Column>
      </Row>
    </ShowcaseCard>
  );
}

// ── Stats ───────────────────────────────────────────────────────────────────────────

function StatsCard() {
  return (
    <ShowcaseCard id="c-stats" caption="<Stats items={…}> · deltas and sparks · <ProgressRing>">
      <Stats
        items={[
          { label: "Revenue", value: "$128.4k", delta: "+18.2%", spark: [30, 42, 38, 50, 46, 58, 64, 80] },
          { label: "Active members", value: "1,204", delta: "+6", description: "72% of 1,680 invited", share: [{ label: "Joined", value: 72 }, { label: "Invited", value: 28 }] },
          { label: "p95 latency", value: "212 ms", delta: "+41ms", down: true, spark: [40, 38, 44, 52, 48, 60, 66, 74] },
        ]}
      />
      <Row cozy alignCenter>
        <ProgressRing value={91} compact />
        <Column tight>
          <Typography eyebrow subtle>Platforms</Typography>
          <Typography small muted>iOS 64% · Android 18% · Web 9%</Typography>
        </Column>
      </Row>
    </ShowcaseCard>
  );
}

// ── DataTable ───────────────────────────────────────────────────────────────────────

function MembersTable() {
  const [selected, setSelected] = useState<Array<string | number>>([...SELECTED_MEMBERS]);
  return (
    <ShowcaseCard id="c-data-table" caption="<DataTable selectable sortable> · rows select on press · cells take any node">
      <Row between alignCenter wrap cozy>
        <Column tight>
          <Typography subheading semibold>Members</Typography>
          <Typography small muted>{`${selected.length} selected · ${MEMBERS.length} rows · click a row`}</Typography>
        </Column>
        <Row snug alignCenter>
          <Input sm leadingIcon icon="search" placeholder="Filter members" accessibilityLabel="Filter members" />
          <Button outline small>Export</Button>
          <Button primary small>Invite</Button>
        </Row>
      </Row>
      <DataTable
        attached
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        rowKey={(_, index) => index}
        columns={["Member", "Team", "Status", { label: "Balance", numeric: true }, "Activity · 8w"]}
        rows={MEMBERS.map((member) => [
          <Row key="member" snug alignCenter>
            <Avatar small src={photo(member.photo)} name={member.name} />
            <Column flush>
              <Typography small medium>{member.name}</Typography>
              <Typography caption muted>{member.email}</Typography>
            </Column>
          </Row>,
          member.team,
          <Badge key="status" status success={member.status === "Active"} info={member.status === "Invited"} error={member.status === "Suspended"}>{member.status}</Badge>,
          <Typography key="balance" small mono tabular right>{`$${member.balance}`}</Typography>,
          <Sparkline key="activity" compact values={member.activity} />,
        ])}
      />
      <Row between alignCenter>
        <Typography caption muted>{`Showing 1–${MEMBERS.length} of 24`}</Typography>
        <Row snug>
          <Button ghost small>‹ Prev</Button>
          <Button ghost small>Next ›</Button>
        </Row>
      </Row>
    </ShowcaseCard>
  );
}

// ── Lists & disclosure ──────────────────────────────────────────────────────────────

function StackedListCard() {
  return (
    <ShowcaseCard id="c-stacked-list" caption="<StackedList> · rows take onPress and the whole row is the target · inset hairlines on iOS">
      <StackedList
        items={[
          { name: "Ada Lovelace", detail: "ada@ionize.io", meta: "Owner · online", avatar: photo("/ada-lovelace.jpg") },
          { name: "Grace Hopper", detail: "grace@ionize.io", meta: "Admin · 2h ago", avatar: photo("/grace-hopper.jpg") },
          { name: "Kira Tanaka", detail: "kira@ionize.io", badge: "Invited", info: true, avatar: photo("/kira-tanaka.jpg") },
          { name: "Liang Bao", detail: "liang@ionize.io", meta: "Viewer · yesterday", avatar: photo("/liang-bao.jpg") },
        ]}
      />
    </ShowcaseCard>
  );
}

function GridListCard() {
  return (
    <ShowcaseCard id="c-grid-list" caption="<GridList> people directories · collections · galleries · tiles lift on the spring">
      <GridList
        cols2
        items={[
          { title: "Noor Park", subtitle: "Mobile lead", avatar: photo("/noor-park.jpg"), actions: [{ label: "Mail", outline: true }, { label: "Chat", outline: true }] },
          { title: "Marcus Allen", subtitle: "Growth", avatar: photo("/marcus-allen.jpg"), actions: [{ label: "Mail", outline: true }, { label: "Chat", outline: true }] },
          { title: "Tokens", subtitle: "48 roles" },
          { title: "Charts", subtitle: `${COMPONENTS.filter((c) => c.section === "Charts").length} types` },
        ]}
      />
    </ShowcaseCard>
  );
}

function MediaObjectCard() {
  return (
    <ShowcaseCard id="c-media-object" caption="<MediaObject> · avatar, Emblem or Image in the media slot · the base of every row above">
      <MediaObject
        src={photo("/kira-tanaka.jpg")}
        title="Kira Tanaka"
        meta="2m"
        description="The ion ring reads better at 4px than 3. Shipping it with the field update."
      />
      <MediaObject
        icon={<Emblem primary small><Icon gitPullRequest size={16} decorative /></Emblem>}
        title="Ready for review"
        meta="9:41"
        description="#482 · Overlays move to glass-tint-dense"
      />
      <MediaObject
        src={photo("/liang-bao.jpg")}
        title="Designing for three skins"
        description="One tree becomes an iOS capsule, a Material stadium and a lit web control."
        meta="8 min read"
      />
    </ShowcaseCard>
  );
}

function FeedCard() {
  return (
    <ShowcaseCard id="c-feed" caption="<Feed> · the icon names the event · one hairline spine, never a card per row">
      <Feed
        items={[
          { actor: "Kira", action: "merged", target: "#482 into main", time: "2 min ago", icon: "gitMerge" },
          { actor: "Bobby", action: "moved", target: "--hue from 285 to 205", time: "1 hour ago", icon: "palette" },
          { actor: "Liang", action: "commented", time: "3 hours ago", avatar: photo("/liang-bao.jpg"), content: "Filtering a series out never renumbers the rest. Keep chart-3 mint." },
          { actor: "v6.2.0", action: "published to npm", time: "yesterday", icon: "rocket" },
        ]}
      />
    </ShowcaseCard>
  );
}

function DescriptionListCard() {
  return (
    <ShowcaseCard id="c-description-list" caption="<DescriptionList> rows flagged update edit in place · ↵ saves, esc cancels · <ActionPanel> one decision, one action">
      <DescriptionList
        inline
        items={[
          { term: "Display name", value: "Bobby Nannier", update: true },
          { term: "Email", value: "bobby@nannier.com", update: true },
          { term: "Workspace", value: <Row snug alignCenter><Typography small>Riskora · 24 members</Typography><Badge status success>Active</Badge></Row> },
        ]}
      />
      <ActionPanel title="Export workspace" description="Every board, token and asset as one .zip." actionLabel="Export" inline />
      <ActionPanel title="Delete workspace" description="Removes Riskora for all 24 members. There is no undo." actionLabel="Delete" destructive inline />
    </ShowcaseCard>
  );
}

function AccordionCard() {
  return (
    <ShowcaseCard id="c-accordion" caption="<Accordion items={…}> a stack of disclosures · <Collapsible title=&quot;…&quot;> exactly one">
      <Accordion
        card
        defaultValue="glass"
        items={QUESTIONS.map((q) => ({ key: q.key, title: q.title, content: <Typography small muted>{q.body}</Typography> }))}
      />
      <Collapsible title="3 removed props">
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

function CodeBlockCard() {
  return (
    <ShowcaseCard id="c-code-block" caption="<CodeBlock> highlight · line emphasis · diff · folding · tabbed alternatives · copy via expo-clipboard on native">
      <CodeBlock tabs={CODE_TABS} numbered copy highlightLines={[5]} />
    </ShowcaseCard>
  );
}

/** One of the Carousel's title slides: a mono eyebrow over its line on a brand wash. */
function Slide({ eyebrow, title, promo }: { eyebrow: string; title: string; promo?: boolean }) {
  return promo
    ? <Card promo eyebrow={eyebrow} title={title} />
    : <Card featured eyebrow={eyebrow} title={title} />;
}

function CarouselCard() {
  return (
    <ShowcaseCard id="c-carousel" caption="<Carousel> one slide per page · slides take the card radius, 28 on Android">
      <Carousel
        showArrows
        showDots
        items={[
          { key: "material", content: <Slide eyebrow="01 · Material" title="Light is the material" /> },
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

function MediaCard() {
  return (
    <ShowcaseCard id="c-media" caption={"<Image cover> · <Image contain> · <Video poster autoplay muted loop> · <QRCode value=\"…\">"}>
      <Row cozy>
        <Column fill snug>
          <Image source={{ uri: photo("/marcus-allen.jpg") }} cover height={96} radius="lg" alt="Marcus Allen, cropped to fill" />
          <Typography caption mono subtle>cover · crops</Typography>
        </Column>
        <Column fill snug>
          <Image source={{ uri: photo("/marcus-allen.jpg") }} contain height={96} radius="lg" alt="Marcus Allen, letterboxed" />
          <Typography caption mono subtle>contain · letterboxes</Typography>
        </Column>
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

function CalendarCard() {
  return (
    <ShowcaseCard id="c-calendar" caption="<Calendar events={…}> · dots in the month grid, blocks on the week and day timelines">
      <Calendar
        month="October 2026"
        daysInMonth={31}
        startWeekday={4}
        today={26}
        defaultSelected={26}
        dayPeek
        events={CALENDAR_EVENTS}
      />
    </ShowcaseCard>
  );
}

function ChatCard() {
  const [messages, setMessages] = useState<ChatMessageData[]>(CHAT_THREAD);
  const [draft, setDraft] = useState("");
  const send = (text: string) => {
    const content = text.trim();
    if (!content) return;
    setMessages((thread) => [
      ...thread,
      { id: thread.length + 1, role: "user", content },
      { id: thread.length + 2, role: "assistant", provider: "Claude", content: CHAT_REPLIES[(thread.length / 2) % CHAT_REPLIES.length | 0] },
    ]);
    setDraft("");
  };
  return (
    <ShowcaseCard id="c-chat" caption="<Chat> = <ChatThread> + <ChatMessage> + <ChatComposer> · replies render through <Markdown> · bubbles 18 with a 6 tail · composer 20 on glass">
      <MediaObject
        icon={<Emblem primary small><Icon sparkles size={16} decorative /></Emblem>}
        title="Canvas assistant"
        description="provider · Claude"
        action={<Badge status success>online</Badge>}
      />
      <Chat
        messages={messages}
        value={draft}
        onChangeText={setDraft}
        onSend={send}
        placeholder="Ask about a component…"
        onAttach={() => {}}
      />
    </ShowcaseCard>
  );
}

function BoardCard() {
  return (
    <ShowcaseCard id="c-board" caption="<Board columns={…}> on <DragDropProvider> · every column is a <DropZone>, every card a <Draggable> with a <DragHandle>">
      <Board draggable columns={BOARD_COLUMNS} defaultItems={BOARD_ITEMS} />
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
        </ShowcaseGrid>
      </ShowcaseGroup>
    </Column>
  );
}
