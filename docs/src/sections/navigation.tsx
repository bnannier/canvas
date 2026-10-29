import { useState } from "react";
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
import { PagePlaceholder, SectionStage, ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";

// The Navigation section page (`Canvas v4.0.0 Navigation.dc.html`): its hero vignette and
// its six cards. The hand-off's travelling indicators (the gliding underline, thumb and
// rail bar, the Steps pulse) are motion the owner removed (2026-09-21), so a selection
// paints where it is. The RowMenu card draws both menus in place (`inline`), as the
// hand-off shows them open.

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | undefined;

/** A tab bar item's glyph, accent when active. */
const tabIcon = (name: IconName) => (active: boolean) => <Icon {...{ [name]: true }} size={19} primary={active} muted={!active} decorative />;

/** The hero's still frame: underline tabs over a floating tab bar. */
export function Vignette() {
  return (
    <VignetteStage>
      <Column panel>
        <Tabs underline defaultActive={0} tabs={["Overview", "Components", "Tokens", "Changelog"]} />
        <TabBar
          defaultActive="home"
          items={[
            { key: "home", label: "Home", icon: tabIcon("home") },
            { key: "inbox", label: "Inbox", icon: tabIcon("inbox") },
            { key: "boards", label: "Boards", icon: tabIcon("columns2") },
            { key: "messages", label: "Messages", icon: tabIcon("messageCircle") },
            { key: "settings", label: "Settings", icon: tabIcon("settings") },
          ]}
        />
      </Column>
    </VignetteStage>
  );
}

/** Tabs · Segmented · Breadcrumb · Pagination. */
function TabsCard() {
  return (
    <ShowcaseCard id="c-tabs" caption="<Tabs> · <ButtonGroup segmented> · <Breadcrumb> · <Pagination page={1} total={12}>">
      <Tabs underline block defaultActive={1} tabs={["Overview", "Components", "Tokens", "Changelog"]} />
      <ButtonGroup segmented block defaultActive={1} accessibilityLabel="Range" items={["Day", "Week", "Month"]} />
      <Breadcrumb chevron items={["Workspaces", "Riskora", "Tokens"]} />
      <Pagination defaultPage={1} total={12} />
    </ShowcaseCard>
  );
}

/** Tab bar · Steps, at phone width. */
function TabBarCard() {
  return (
    <ShowcaseCard id="c-tab-bar" caption="<TabBar> floats off the edge on the functional glass tint · <Steps segmented current={1}>">
      {/* The 150 px well with its glow, the bar floating off its foot (`left/right/bottom:12px`). */}
      <SectionStage minHeight={150} bottom glow={{ left: "20%", top: "-50%", width: "60%", height: "120%", opacity: 0.5 }}>
        <TabBar
          defaultActive="home"
          items={[
            { key: "home", label: "Home", icon: tabIcon("home") },
            { key: "search", label: "Search", icon: tabIcon("search") },
            { key: "inbox", label: "Inbox", icon: tabIcon("inbox"), unread: true },
            { key: "you", label: "You", icon: tabIcon("user") },
          ]}
        />
      </SectionStage>
      <Steps
        segmented
        current={1}
        steps={[
          { label: "Account", description: "Done" },
          { label: "Workspace", description: "Current" },
          { label: "Invite team", description: "Next" },
        ]}
      />
    </ShowcaseCard>
  );
}

/** Navbar · Sidebar: the two glass-tint shells around placeholder content. */
function NavbarCard() {
  return (
    <ShowcaseCard id="c-navbar" caption="<Navbar> · <Sidebar> · glass comes from <ThemeProvider glass>, never a prop">
      <SectionStage minHeight={340} glow={{ left: "30%", top: "-40%", width: "50%", height: "100%", opacity: 0.4 }}>
        <Navbar
          scrolls
          brand="Canvas"
          brandContent={<CanvasMark size={22} />}
          links={["Docs", "Components", "Tokens", "Changelog"]}
          defaultActive={0}
          actions={
            <Row snug alignCenter>
              <Input small xxs placeholder="Search…" shortcut="⌘K" accessibilityLabel="Search" />
              <Button outline largeIcon accessibilityLabel="Notifications" iconLeft={<Icon bell decorative />} />
              <Avatar small src={photo("/liang-bao.jpg")} name="Liang Bao" />
            </Row>
          }
        />
        <Row stacks stackBreakpoint="md" flush>
          <Sidebar
            defaultActive="overview"
            accessibilityLabel="Example workspace"
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
function TabsVariantsCard() {
  const [active, setActive] = useState(0);
  const panel = SETTINGS[active];
  return (
    <ShowcaseCard id="c-tabs-variants" caption="<Tabs> underline · <Tabs pills> · <Tabs vertical> · every variant takes a count badge">
      <Tabs
        pills
        defaultActive={0}
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
          <Tabs vertical active={active} onSelect={setActive} tabs={SETTINGS.map(({ label, icon }) => ({ label, icon }))} />
          <Column fill>
            <Card sunken calloutCorners insetContent>
              <Column compact>
                <Typography paneTitle level={2}>{panel.label}</Typography>
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
function StepsCard() {
  return (
    <ShowcaseCard id="c-steps" caption="<Steps vertical> · horizontal is the default · the current step carries its own progress">
      <Steps
        vertical
        current={2}
        steps={[
          { label: "Create workspace", description: "Riskora · EU Frankfurt" },
          { label: "Connect repository", description: "bnannier/canvas · main" },
          { label: "Import components", description: "Restyling 72 of 107", progress: 67 },
          { label: "Invite your team", description: "Optional" },
        ]}
      />
    </ShowcaseCard>
  );
}

/** RowMenu · actions · links, both drawn in place. */
function RowMenuCard() {
  return (
    <ShowcaseCard id="c-row-menu" caption="<RowMenu> · every row icon names a real glyph · destructive rows sit last, behind a hairline">
      <RowMenu
        inline
        triggerLabel="Actions"
        items={[
          { label: "Edit details", icon: "pencil", shortcut: "⌘E" },
          { label: "Duplicate", icon: "copy", shortcut: "⌘D" },
          { label: "Move to…", icon: "folderOpen", submenu: true },
          { label: "Archive", icon: "archive", separatorBefore: true },
          { label: "Delete", icon: "trash2", destructive: true, shortcut: "⌘⌫" },
        ]}
      />
      <RowMenu
        inline
        links
        items={[
          { label: "Profile", icon: "userRound" },
          { label: "Notifications", icon: "bell", badge: "3 new" },
          { label: "Integrations", icon: "plug", meta: "3" },
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
