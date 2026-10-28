import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import {
  ActionSheet, Alert, AlertDialog, Card, Carousel, Command, DataTable, Dialog, Drawer, Dropdown, Icon, LineChart, Navbar, Popover,
  Select, Sidebar, Stats, TabBar, Tabs, Toast, Tooltip, Video,
} from "../src/index.ts";
import { WEB_FROST, webBackdrop } from "../src/style/glass-surface/web-frost.ts";
import { LOOKS, lookProps } from "./fixtures/looks.ts";
import { PANE_HOSTS } from "./fixtures/pane-hosts.tsx";

// The web's glass contract (the owner's 2026-10-28 decision): the web matches the v4
// hand-off pixel for pixel, and the hand-off frosts only what floats over the page (the
// navbar pill, the tab bar, dialogs, alert dialogs, action sheets, drawers, popovers, the
// command palette, toasts, carousel arrows, video controls). Every other surface (cards,
// buttons, fields, chips, badges, tables, lists, charts, option-list menus, tooltips,
// sidebars, tabs tracks) keeps its complete solid skin on the web under glass: exactly the
// markup `<ThemeProvider solid>` renders, with no pane and no material. Native builds keep
// the material on in-page surfaces; the suites that hold that mechanism render under
// test/fixtures/material-platform.ts.

afterEach(cleanup);

// React's ids count up across mounts; number each by its first appearance before comparing.
function normalized(html: string): string {
  const ids = new Map<string, string>();
  return html.replace(/«[^»]*»|:r[0-9a-z]+:|_r_[0-9a-z]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `id${ids.size}`);
    return ids.get(id)!;
  });
}

const settle = async () => { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); }); };
const materialsIn = (root: ParentNode) => Array.from(root.querySelectorAll<HTMLElement>('[data-testid="glass-material"]'));
const frostsIn = (root: ParentNode) => materialsIn(root).filter((m) => Array.from(m.children).some((c) => (c as HTMLElement).style.backdropFilter === webBackdrop(WEB_FROST.blur)));

// Inside an OverlayProvider, as an app renders; an anchored card (a Popover, the Command
// palette) renders in place without one, where it needs no measured layout to appear.
async function markup(node: ReactNode, look: (typeof LOOKS)[number], glass: boolean, drive?: (result: ReturnType<typeof render>) => void, inPlace = false) {
  const body = inPlace ? node : <OverlayProvider>{node}</OverlayProvider>;
  const result = render(<ThemeProvider {...lookProps(look)} glass={glass} solid={!glass}>{body}</ThemeProvider>);
  drive?.(result);
  await settle();
  const out = { html: normalized(document.body.innerHTML), materials: materialsIn(document.body).length, frosts: frostsIn(document.body).length };
  cleanup();
  return out;
}

// The pane hosts whose surface floats over the page: they are held below, with the overlays.
const FLOATING_HOSTS = new Set(["Video controls", "Carousel", "Navbar", "TabBar"]);

// The in-page surfaces that render a GlassSurface of their own rather than a pane.
const IN_PAGE_SURFACES: { name: string; node: ReactNode; inPlace?: boolean; shows?: string }[] = [
  { name: "Card", node: <Card title="Usage" description="This month"><Text>Body</Text></Card> },
  { name: "Alert", node: <Alert success title="Saved">All changes are live.</Alert> },
  { name: "DataTable", node: <DataTable columns={["Name", "Role"]} rows={[["Ada", "Admin"], ["Grace", "Member"]]} /> },
  { name: "Sidebar", node: <Sidebar defaultActive="Dashboard" items={[{ label: "Dashboard" }, { label: "Inbox" }]} /> },
  { name: "Tabs track", node: <Tabs tabs={["General", "Security"]} /> },
  { name: "Stats", node: <Stats items={[{ label: "Users", value: "1,204" }, { label: "Revenue", value: "$9k" }]} /> },
  { name: "LineChart", node: <LineChart labels={["Mon", "Tue"]} series={[{ label: "Requests", values: [4, 7] }]} /> },
  { name: "Dropdown menu", node: <Dropdown trigger="Account" open items={[{ label: "Profile" }, { label: "Sign out" }]} />, inPlace: true, shows: 'role="menu"' },
  { name: "Select option list", node: <Select label="Region" open options={["Americas", "Europe"]} />, inPlace: true, shows: 'role="listbox"' },
  { name: "Tooltip", node: <Tooltip label="Copy link" open textTrigger="Share" />, inPlace: true, shows: "Copy link" },
];

describe("an in-page surface keeps its complete solid skin under glass on the web", () => {
  const hosts = [
    ...PANE_HOSTS.filter((host) => !FLOATING_HOSTS.has(host.name)),
    ...IN_PAGE_SURFACES,
  ] as { name: string; node: ReactNode; act?: (result: ReturnType<typeof render>) => void; inPlace?: boolean; shows?: string }[];
  for (const host of hosts) {
    it(`${host.name}: glass renders solid's markup, with no material`, async () => {
      for (const look of LOOKS) {
        const solid = await markup(host.node, look, false, host.act, host.inPlace);
        const glass = await markup(host.node, look, true, host.act, host.inPlace);
        if (host.shows) expect(glass.html, `${host.name}: the surface is on screen`).toContain(host.shows);
        expect(glass.materials, `${host.name} in ${look.name}: materials`).toBe(0);
        expect(glass.html, `${host.name} in ${look.name}`).toBe(solid.html);
      }
    });
  }
});

// What floats over the page frosts on the web under glass, through the hand-off's material
// (the layer's tint over a `blur(20px) saturate(1.6)` backdrop, a 1 px hairline rim), and
// renders none in solid mode.
const FLOATING: { name: string; node: ReactNode; frosts?: number; inPlace?: boolean }[] = [
  { name: "Dialog card", node: <Dialog open title="Edit profile" description="Make changes." /> },
  { name: "AlertDialog card", node: <AlertDialog open destructive title="Delete project?" description="This cannot be undone." /> },
  { name: "Drawer panel", node: <Drawer open><Text>Drawer body</Text></Drawer> },
  { name: "ActionSheet cards", node: <ActionSheet open title="Share" actions={[{ label: "Copy link", onPress: () => {} }]} />, frosts: 2 },
  { name: "Popover", node: <Popover trigger="Details" open title="Dimensions"><Text>Set the frame size.</Text></Popover>, inPlace: true },
  { name: "Command palette", node: <Command trigger open groups={[{ heading: "Actions", items: [{ label: "New file" }] }]} />, inPlace: true },
  { name: "Toast", node: <Toast success message="Project saved" description="All changes are live." /> },
  { name: "Navbar bar", node: <Navbar brand="Canvas" links={["Dashboard", "Users"]} actionLabel="New" /> },
  { name: "TabBar bar", node: <TabBar items={[{ key: "home", label: "Home", icon: () => <Icon home size={22} /> }, { key: "search", label: "Search", icon: () => <Icon search size={22} /> }]} /> },
  { name: "Carousel arrows", node: <Carousel showArrows items={[{ key: "one", content: "Slide 1" }, { key: "two", content: "Slide 2" }]} />, frosts: 2 },
  { name: "Video controls", node: <Video source={{ uri: "/clip.mp4" }} accessibilityLabel="Clip" controls /> },
];

describe("a surface that floats over the page frosts under glass on the web", () => {
  for (const surface of FLOATING) {
    it(`${surface.name}: frosts under glass and paints none in solid mode`, async () => {
      for (const look of LOOKS) {
        const glass = await markup(surface.node, look, true, undefined, surface.inPlace);
        expect(glass.frosts, `${surface.name} in ${look.name}: frosted materials`).toBeGreaterThanOrEqual(surface.frosts ?? 1);
        const solid = await markup(surface.node, look, false, undefined, surface.inPlace);
        expect(solid.materials, `${surface.name} in ${look.name}: solid`).toBe(0);
      }
    });
  }
});
