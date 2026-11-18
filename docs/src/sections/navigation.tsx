import { SectionVignette } from "../ui/showcase/section-vignette";
import {
  Avatar,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Column,
  Divider,
  GridItem,
  Icon,
  Input,
  Navbar,
  Pagination,
  RowMenu,
  Row,
  Sidebar,
  Steps,
  TabBar,
  Tabs,
  Typography,
  type IconName,
} from "@nannier/canvas";
import { CanvasMark } from "../brand/canvas-mark";
import { COMPONENTS } from "../core/data/components";
import { resolvePhoto } from "../core/photos";
import { PagePlaceholder, SectionStage, ShowcaseCard, ShowcaseGrid } from "../ui/showcase";
import { useShowcaseDemo } from "../ui/showcase/demo";

// The Navigation section page (`Canvas v4.0.0 Navigation.dc.html`): its hero vignette and
// its six cards. Selection in the examples drives the kit's underline, segment thumb,
// rail marker and step styles. Both RowMenu variants stay in place (`inline`).

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | undefined;

/** A tab bar item's glyph, accent when active. */
const tabIcon = (name: IconName) => (active: boolean) => <Icon {...{ [name]: true }} size={19} primary={active} muted={!active} decorative />;

/** The animated hero: underline tabs over a floating tab bar. */
export function Vignette() {
  return <SectionVignette kind="navigation" />;
}

/** Tabs · Segmented · Breadcrumb · Pagination. */
const SECTION_TABS = ["Overview", "Components", "Tokens", "Changelog"];
const trailTo = (label: string) => ["Workspaces", "Riskora", label];
const TAB_FRAMES = [
  { tab: 1, range: 1, page: 1, trail: trailTo("Tokens") },
  { tab: 2, range: 1, page: 2, trail: trailTo("Tokens") },
  { tab: 2, range: 2, page: 3, trail: trailTo("Tokens") },
  { tab: 3, range: 2, page: 4, trail: trailTo("Changelog") },
  { tab: 0, range: 0, page: 1, trail: trailTo("Overview") },
];

function TabsCard() {
  const { value, setValue } = useShowcaseDemo("c-tabs", TAB_FRAMES, { interval: 1200 });
  return (
    <ShowcaseCard id="c-tabs" caption="<Tabs> · <ButtonGroup segmented> · <Breadcrumb> · <Pagination page={1} total={12}>">
      <Tabs underline block active={value.tab} onSelect={(tab) => setValue((current) => ({ ...current, tab, trail: trailTo(SECTION_TABS[tab]!) }))} tabs={SECTION_TABS} testID="section-demo-tabs" />
      <ButtonGroup segmented block active={value.range} onSelect={(range) => setValue((current) => ({ ...current, range }))} accessibilityLabel="Range" items={["Day", "Week", "Month"]} />
      <Breadcrumb chevron items={value.trail} onItemPress={(_item, index) => setValue((current) => ({ ...current, trail: current.trail.slice(0, index + 1) }))} />
      <Pagination page={value.page} onChange={(page) => setValue((current) => ({ ...current, page }))} total={12} testID="section-demo-pagination" />
    </ShowcaseCard>
  );
}

/** Tab bar · Steps, at phone width. */
const TAB_BAR_FRAMES = [
  { tab: "home", current: 1, unread: true },
  { tab: "search", current: 1, unread: true },
  { tab: "inbox", current: 1, unread: false },
  { tab: "you", current: 2, unread: false },
  { tab: "home", current: 0, unread: false },
];
const SETUP_LABELS = ["Account", "Workspace", "Invite team"];

function TabBarCard() {
  const { value, setValue } = useShowcaseDemo("c-tab-bar", TAB_BAR_FRAMES, { interval: 1280 });
  return (
    <ShowcaseCard id="c-tab-bar" caption="<TabBar> floats off the edge on the functional glass tint · <Steps segmented current={1}>">
      {/* The 150 px well with its glow, the bar floating off its foot (`left/right/bottom:12px`). */}
      <SectionStage minHeight={150} bottom glow={{ left: "20%", top: "-50%", width: "60%", height: "120%", opacity: 0.5 }}>
        <TabBar
          active={value.tab}
          onSelect={(tab) => setValue((current) => ({ ...current, tab, unread: tab === "inbox" ? false : current.unread }))}
          testID="section-demo-tab-bar"
          items={[
            { key: "home", label: "Home", icon: tabIcon("home") },
            { key: "search", label: "Search", icon: tabIcon("search") },
            { key: "inbox", label: "Inbox", icon: tabIcon("inbox"), unread: value.unread },
            { key: "you", label: "You", icon: tabIcon("user") },
          ]}
        />
      </SectionStage>
      <Steps
        segmented
        current={value.current}
        steps={SETUP_LABELS.map((label, index) => ({ label, description: index < value.current ? "Done" : index === value.current ? "Current" : "Next" }))}
        testID="section-demo-segmented-steps"
      />
    </ShowcaseCard>
  );
}

/** Navbar · Sidebar: the two glass-tint shells around placeholder content. */
const NAVBAR_FRAMES: { link: number; section: string | number; query: string; unread: number }[] = [
  { link: 0, section: "overview", query: "", unread: 0 },
  { link: 1, section: "members", query: "", unread: 1 },
  { link: 1, section: "integrations", query: "to", unread: 2 },
  { link: 2, section: "tokens", query: "Tokens", unread: 2 },
  { link: 3, section: "tokens", query: "", unread: 0 },
];

function NavbarCard() {
  const { value, setValue, stop } = useShowcaseDemo("c-navbar", NAVBAR_FRAMES, { interval: 1360 });
  return (
    <ShowcaseCard id="c-navbar" caption="<Navbar> · <Sidebar> · glass comes from <ThemeProvider glass>, never a prop">
      <SectionStage minHeight={340} glow={{ left: "30%", top: "-40%", width: "50%", height: "100%", opacity: 0.4 }}>
        <Navbar
          scrolls
          brand="Canvas"
          brandContent={<CanvasMark size={22} />}
          links={["Docs", "Components", "Tokens", "Changelog"]}
          active={value.link}
          onSelect={(link) => setValue((current) => ({ ...current, link }))}
          testID="section-demo-navbar"
          actions={
            <Row snug alignCenter>
              <Input small xxs placeholder="Search…" shortcut="⌘K" accessibilityLabel="Search" value={value.query}
                onChangeText={(query) => setValue((current) => ({ ...current, query }))} onFocus={stop} />
              <Button outline largeIcon count={value.unread} accessibilityLabel={value.unread ? `Notifications, ${value.unread} unread` : "Notifications"}
                iconLeft={<Icon bell decorative />} onPress={() => setValue((current) => ({ ...current, unread: 0 }))} />
              <Avatar small src={photo("/liang-bao.jpg")} name="Liang Bao" />
            </Row>
          }
        />
        <Row stacks stackBreakpoint="md" flush>
          <Sidebar
            active={value.section}
            onSelect={(item, index) => setValue((current) => ({ ...current, section: item.id ?? index }))}
            accessibilityLabel="Example workspace"
            testID="section-demo-sidebar"
            sections={[
              {
                title: "Workspace",
                items: [
                  { id: "overview", label: "Overview", icon: "layoutDashboard" },
                  { id: "members", label: "Members", icon: "users", meta: "24" },
                  { id: "integrations", label: "Integrations", icon: "plug" },
                  { id: "tokens", label: "Tokens", icon: "palette", badge: "New", badgeAccent: true },
                ],
              },
            ]}
            account={{ name: "Riskora", detail: "24 members", src: photo("/grace-hopper.jpg") }}
          />
          <Column fill>
            <PagePlaceholder />
          </Column>
        </Row>
      </SectionStage>
    </ShowcaseCard>
  );
}

/** How many components the docs list in a category. */
const countOf = (category: (typeof COMPONENTS)[number]["category"]) => String(COMPONENTS.filter((c) => c.category === category).length);

/** The vertical tabs' panels (the hand-off's settings sections) and their rail glyphs. */
const SETTINGS: { label: string; icon: IconName; body: string }[] = [
  { label: "General", icon: "settings2", body: "Name, URL and region. Shown to everyone in the workspace." },
  { label: "Members", icon: "users", body: "24 members and 3 pending invites. Roles map straight onto board permissions." },
  { label: "Integrations", icon: "plug", body: "GitHub and Figma are connected. Token changes open a pull request." },
  { label: "Security", icon: "shieldCheck", body: "SSO is enforced. Sessions end after 12 idle hours." },
];

/** Tabs · pill · vertical · badges. */
const TAB_VARIANT_FRAMES = [
  { pill: 0, rail: 0 }, { pill: 1, rail: 1 },
  { pill: 2, rail: 2 }, { pill: 0, rail: 3 },
];

function TabsVariantsCard() {
  const { value, setValue } = useShowcaseDemo("c-tabs-variants", TAB_VARIANT_FRAMES, { interval: 1550 });
  const panel = SETTINGS[value.rail]!;
  return (
    <ShowcaseCard id="c-tabs-variants" caption="<Tabs> underline · <Tabs pills> · <Tabs vertical> · every variant takes a count badge">
      <Tabs
        pills
        active={value.pill}
        onSelect={(pill) => setValue((current) => ({ ...current, pill }))}
        tabs={[
          { label: "All", badge: String(COMPONENTS.length) },
          { label: "Atoms", badge: countOf("Atoms") },
          { label: "Charts", badge: countOf("Charts") },
        ]}
      />
      {/* The rule over the rail and its panel: the card's 20 above it, 16 below. */}
      <Column relaxed>
        <Divider />
        <Row relaxed alignStart>
          <Tabs vertical active={value.rail} onSelect={(rail) => setValue((current) => ({ ...current, rail }))} tabs={SETTINGS.map(({ label, icon }) => ({ label, icon }))} testID="section-demo-settings-tabs" />
          <Column fill>
            <Card sunken calloutCorners insetContent>
              <Column compact>
                <Typography paneTitle level={2} testID="section-demo-settings-panel">{panel.label}</Typography>
                <Typography small subtle>{panel.body}</Typography>
              </Column>
            </Card>
          </Column>
        </Row>
      </Column>
    </ShowcaseCard>
  );
}

/** Steps · vertical · with progress. */
const IMPORT_TOTAL = 107;
const IMPORT_FRAMES = [
  { step: 2, imported: 72 }, { step: 2, imported: 72 },
  { step: 2, imported: 82 }, { step: 2, imported: 94 },
  { step: 2, imported: 102 }, { step: 3, imported: IMPORT_TOTAL }, { step: 3, imported: IMPORT_TOTAL },
  { step: 0, imported: 0 }, { step: 1, imported: 0 },
  { step: 2, imported: 24 }, { step: 2, imported: 48 },
];

function StepsCard() {
  const { value, setValue } = useShowcaseDemo("c-steps", IMPORT_FRAMES, { interval: 790 });
  const importStatus = value.imported === IMPORT_TOTAL ? `Restyled ${IMPORT_TOTAL} components`
    : value.imported > 0 ? `Restyling ${value.imported} of ${IMPORT_TOTAL}` : "Waiting to start";
  return (
    <ShowcaseCard id="c-steps" caption="<Steps vertical> · horizontal is the default · the current step carries its own progress">
      <Steps
        vertical
        current={value.step}
        onStepPress={(step) => setValue({ step, imported: step < 2 ? 0 : step === 2 ? 72 : IMPORT_TOTAL })}
        testID="section-demo-import-steps"
        steps={[
          { label: "Create workspace", description: "Riskora · EU Frankfurt" },
          { label: "Connect repository", description: "bnannier/canvas · main" },
          { label: "Import components", description: importStatus, progress: Math.round(value.imported / IMPORT_TOTAL * 100) },
          { label: "Invite your team", description: "Optional" },
        ]}
      />
    </ShowcaseCard>
  );
}

/** RowMenu · actions · links, both drawn in place. */
const MENU_REST = { unread: 3, integrations: 3, archived: false, action: "" };
const MENU_FRAMES = [
  MENU_REST, MENU_REST,
  { ...MENU_REST, unread: 4 },
  { ...MENU_REST, unread: 5, archived: true },
  { ...MENU_REST, unread: 0, archived: true, integrations: 4 },
  { ...MENU_REST, unread: 0, integrations: 4 },
];

function RowMenuCard() {
  const { value, setValue } = useShowcaseDemo("c-row-menu", MENU_FRAMES, { interval: 1250 });
  return (
    <ShowcaseCard id="c-row-menu" caption="<RowMenu> · every row icon names a real glyph · destructive rows sit last, behind a hairline">
      <RowMenu
        inline
        triggerLabel="Actions"
        onSelect={(item, index) => setValue((current) => ({
          ...current,
          action: index === 3 ? "" : item.label,
          archived: index === 3 ? !current.archived : current.archived,
        }))}
        items={[
          { label: "Edit details", icon: "pencil", shortcut: "⌘E", meta: value.action === "Edit details" ? "Selected" : undefined },
          { label: "Duplicate", icon: "copy", shortcut: "⌘D", meta: value.action === "Duplicate" ? "Copied" : undefined },
          { label: "Move to…", icon: "folderOpen", submenu: true, meta: value.action === "Move to…" ? "Selected" : undefined },
          { label: value.archived ? "Unarchive" : "Archive", icon: "archive", separatorBefore: true },
          { label: "Delete", icon: "trash2", destructive: true, shortcut: "⌘⌫", meta: value.action === "Delete" ? "Selected" : undefined },
        ]}
      />
      <RowMenu
        inline
        links
        onSelect={(_item, index) => setValue((current) => ({ ...current, unread: index === 1 ? 0 : current.unread }))}
        testID="section-demo-menu-links"
        items={[
          { label: "Profile", icon: "userRound" },
          { label: "Notifications", icon: "bell", badge: value.unread ? `${value.unread} new` : undefined },
          { label: "Integrations", icon: "plug", meta: String(value.integrations) },
        ]}
      />
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <ShowcaseGrid minTileWidth={340}>
      <TabsCard />
      <TabBarCard />
      <GridItem full><NavbarCard /></GridItem>
      <TabsVariantsCard />
      <StepsCard />
      <RowMenuCard />
    </ShowcaseGrid>
  );
}
