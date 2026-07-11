import { Platform } from "react-native";
import { Sidebar as KitSidebar, Row, Column, Typography, Button, Icon, type IconName, type SidebarSection } from "@olympusoss/canvas";
import { usePathname, useRouter } from "expo-router";
import { CanvasMark } from "../brand/canvas-mark";
import { NAV_GROUPS, COMPARE_ITEM, getActiveSlug, type NavItem } from "../data/nav";

// The docs sidebar is a THIN ADAPTER over the kit `Sidebar` organism: it maps the docs nav
// tree (NAV_GROUPS) + the active route onto the kit component and wires navigation. All the
// chrome (the mini icon-rail collapse, the accordion category groups, the header/footer
// slots, the single active highlight, the internal scroll) lives in the kit now — the docs
// hand-roll nothing. This is the dogfood: the sidebar on the left of the docs IS the kit
// `Sidebar`, so `sidebar.md`'s "same component" line is finally true.

// A docs NavItem -> a kit SidebarItem: the slug is its id (so the active route drives the
// highlight) and the href rides along as data the onSelect handler routes with. The nav
// config's glyph names are Canvas glyph keys already, so they cast straight to IconName.
const toItem = (i: NavItem) => ({ id: i.slug, label: i.label, icon: i.icon as IconName, href: i.href });

export function Sidebar({
  onNavigate,
  collapsed = false,
  collapsible = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  collapsible?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSlug = getActiveSlug(pathname);

  // Overview is pinned (no header); Tokens is pinned with its heading; the category groups
  // are collapsible accordion sections (the kit auto-opens the one holding the active page).
  const sections: SidebarSection[] = [
    { id: "overview", items: NAV_GROUPS[0].items.map(toItem) },
    { id: NAV_GROUPS[1].label, title: NAV_GROUPS[1].label, items: NAV_GROUPS[1].items.map(toItem) },
    ...NAV_GROUPS.slice(2).map(
      (g): SidebarSection => ({ id: g.label, title: g.label, icon: g.icon as IconName, collapsible: true, items: g.items.map(toItem) }),
    ),
  ];

  return (
    <KitSidebar
      compact
      active={activeSlug}
      collapsed={collapsed}
      collapsible={collapsible}
      onToggleCollapse={onToggleCollapse}
      onSelect={(item) => {
        if (item.href) router.push(item.href as never);
        onNavigate?.();
      }}
      header={(isCollapsed) =>
        isCollapsed ? (
          <CanvasMark size={26.62} />
        ) : (
          <Row snug alignCenter>
            <CanvasMark size={26.62} />
            <Column tight>
              <Typography semibold>Canvas</Typography>
              <Typography tiny muted>
                design system
              </Typography>
            </Column>
          </Row>
        )
      }
      footer={
        // /compare is a web-only QA harness (reference imagery); on native it redirects home,
        // so the link is surfaced only on web to avoid a dead end. Icon-only in the rail.
        Platform.OS === "web" ? (
          collapsed ? (
            <Button ghost icon small accessibilityLabel={COMPARE_ITEM.label} iconLeft={<Icon gitCompare size={16} />} onPress={() => router.push(COMPARE_ITEM.href as never)} />
          ) : (
            <Button ghost block small iconLeft={<Icon gitCompare size={16} />} onPress={() => router.push(COMPARE_ITEM.href as never)}>
              {COMPARE_ITEM.label}
            </Button>
          )
        ) : undefined
      }
      sections={sections}
    />
  );
}
