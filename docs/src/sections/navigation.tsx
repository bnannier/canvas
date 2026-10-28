import { useState, type ReactNode } from "react";
import {
  Avatar,
  Breadcrumb,
  ButtonGroup,
  Card,
  Column,
  Container,
  Grid,
  GridItem,
  Icon,
  Input,
  MediaObject,
  Navbar,
  Pagination,
  RowMenu,
  Row,
  Sidebar,
  Skeleton,
  Steps,
  TabBar,
  Tabs,
  Typography,
  type IconName,
} from "@nannier/canvas";
import { COMPONENTS } from "../core/data/components";
import { resolvePhoto } from "../core/photos";
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";

// The Navigation section page (`Canvas v4.0.0 Navigation.dc.html`): its hero vignette and
// its six cards. The hand-off's travelling indicators (the gliding underline and thumb)
// are motion the owner removed (2026-09-21), so a selection paints where it is. The
// RowMenu cards show their ⋯ triggers closed: an open menu is an anchored overlay that
// would cover the rest of the card (and a page sheet on a phone).

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | undefined;

/** A tab bar item's glyph, accent when active. */
const tabIcon = (name: IconName) => (active: boolean) => <Icon {...{ [name]: true }} size={19} primary={active} muted={!active} decorative />;

/** The hero's still frame: underline tabs over a floating tab bar. */
export function Vignette() {
  return (
    <VignetteStage testID="vignette-navigation">
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
    <ShowcaseCard id="c-tab-bar" caption="<TabBar> floats off the edge on the functional glass tint · <Steps current={1}>">
      <Container xs>
        <Card flat flush clip>
          <Column padLoose>
            <TabBar
              defaultActive="home"
              items={[
                { key: "home", label: "Home", icon: tabIcon("home") },
                { key: "search", label: "Search", icon: tabIcon("search") },
                { key: "inbox", label: "Inbox", icon: tabIcon("inbox") },
                { key: "you", label: "You", icon: tabIcon("user") },
              ]}
            />
          </Column>
        </Card>
      </Container>
      <Steps
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
      <Card flat flush clip>
        <Navbar
          bordered
          brand="Canvas"
          links={["Docs", "Components", "Tokens", "Changelog"]}
          defaultActive={0}
          actions={
            <Row snug alignCenter>
              <Input search small xxs placeholder="Search…" accessibilityLabel="Search" />
              <Avatar small src={photo("/liang-bao.jpg")} name="Liang Bao" />
            </Row>
          }
        />
        <Row stacks stackBreakpoint="md" flush>
          <Sidebar
            embedded
            compact
            defaultActive="overview"
            accessibilityLabel="Example workspace"
            sections={[
              {
                title: "Workspace",
                items: [
                  { id: "overview", label: "Overview", icon: "layoutDashboard" },
                  { id: "members", label: "Members", icon: "users", badge: "24" },
                  { id: "integrations", label: "Integrations", icon: "plug" },
                  { id: "tokens", label: "Tokens", icon: "palette", badge: "New" },
                ],
              },
            ]}
            footer={<MediaObject compact src={photo("/grace-hopper.jpg")} title="Riskora" description="24 members" />}
          />
          <Column fill relaxed padLoose>
            <Skeleton text long />
            <Grid minTileWidth={160} columns={3} relaxed>
              <Skeleton card />
              <Skeleton card />
              <Skeleton card />
            </Grid>
            <Skeleton card />
          </Column>
        </Row>
      </Card>
    </ShowcaseCard>
  );
}

/** How many components the docs list in a category. */
const countOf = (category: (typeof COMPONENTS)[number]["category"]) => String(COMPONENTS.filter((c) => c.category === category).length);

/** The vertical tabs' panels (the hand-off's settings sections). */
const SETTINGS: { label: string; body: string }[] = [
  { label: "General", body: "Name, URL and region. Shown to everyone in the workspace." },
  { label: "Members", body: "24 members and 3 pending invites. Roles map straight onto board permissions." },
  { label: "Integrations", body: "GitHub and Figma are connected. Token changes open a pull request." },
  { label: "Security", body: "SSO is enforced. Sessions end after 12 idle hours." },
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
      <Row relaxed alignStart>
        <Tabs vertical active={active} onSelect={setActive} tabs={SETTINGS.map((entry) => entry.label)} />
        <Column fill>
          <Card>
            <Typography h5 level={2}>{panel.label}</Typography>
            <Typography small subtle>{panel.body}</Typography>
          </Card>
        </Column>
      </Row>
    </ShowcaseCard>
  );
}

/** Steps · vertical · with progress. */
function StepsCard() {
  return (
    <ShowcaseCard id="c-steps" caption="<Steps vertical> · horizontal is the default · <Steps progress> carries a step's own progress">
      <Steps
        vertical
        current={2}
        steps={[
          { label: "Create workspace", description: "Riskora · EU Frankfurt" },
          { label: "Connect repository", description: "bnannier/canvas · main" },
          { label: "Import components", description: "Restyling 72 of 107" },
          { label: "Invite your team", description: "Optional" },
        ]}
      />
      <Steps progress value={67} label="Import components" steps={[{ label: "Import components" }]} />
    </ShowcaseCard>
  );
}

/** A RowMenu's trigger with its name beside it. */
function NamedMenu({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Row cozy alignCenter>
      {children}
      <Typography caption mono subtle>{name}</Typography>
    </Row>
  );
}

/** RowMenu · actions · links. */
function RowMenuCard() {
  return (
    <ShowcaseCard id="c-row-menu" caption="<RowMenu> · every row icon names a real glyph · destructive rows sit last, behind a hairline">
      <NamedMenu name="actions">
        <RowMenu
          triggerLabel="Actions"
          items={[
            { label: "Edit details", icon: "pencil" },
            { label: "Duplicate", icon: "copy" },
            { label: "Move to…", icon: "folderOpen" },
            { label: "Archive", icon: "archive", separatorBefore: true },
            { label: "Delete", icon: "trash2", destructive: true },
          ]}
        />
      </NamedMenu>
      <NamedMenu name="links">
        <RowMenu
          links
          triggerLabel="Account"
          items={[
            { label: "Profile", icon: "userRound" },
            { label: "Notifications", icon: "bell" },
            { label: "Integrations", icon: "plug" },
          ]}
        />
      </NamedMenu>
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
