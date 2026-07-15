import { Platform, useWindowDimensions } from "react-native";
import { Sidebar as KitSidebar, Row, Column, Typography, type IconName, type SidebarSection } from "@nannier/canvas";
import { usePathname, useRouter } from "expo-router";
import { CanvasMark } from "../brand/canvas-mark";
import { ThemeToggles } from "./theme-toggles";
import { NAV_GROUPS, getActiveSlug, type NavItem } from "../data/nav";

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
  responsive = false,
  open,
  onOpenChange,
  drawerContentInsetBottom,
  drawerRight,
  drawerTop,
  drawerBottom,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  collapsible?: boolean;
  onToggleCollapse?: () => void;
  /** Below the lg breakpoint, render as a start-edge drill-down drawer (opened by `open`). */
  responsive?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Bottom clearance for the drawer content (e.g. the native tab bar on Android). */
  drawerContentInsetBottom?: number;
  /** Which edge the drawer slides from (default left). */
  drawerRight?: boolean;
  drawerTop?: boolean;
  drawerBottom?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSlug = getActiveSlug(pathname);
  // At and below lg the sidebar is the drill-down drawer; the drawer footer hosts the appearance
  // toggles on mobile-web (the old bottom-sheet footer's home), matching the Android header bar.
  const { width } = useWindowDimensions();
  const narrow = width > 0 && width <= 1024;

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
      responsive={responsive}
      open={open}
      onOpenChange={onOpenChange}
      drawerContentInsetBottom={drawerContentInsetBottom}
      drawerRight={drawerRight}
      drawerTop={drawerTop}
      drawerBottom={drawerBottom}
      onSelect={(item) => {
        if (item.href) router.push(item.href as never);
        onNavigate?.();
      }}
      header={(isCollapsed) =>
        isCollapsed ? (
          <CanvasMark size={26} />
        ) : (
          // The brand lockup is row zero of the nav, so it sits on the same two columns the
          // items below use: the header's 14px inset + a 26 mark puts the mark's ink center on
          // the item ICON column's center (x=28), and + the `snug` 8px gap starts the wordmark
          // exactly on the item LABEL column (x=48). `lead` keeps the wordmark on `foreground`
          // (the `small` role would mute it); `tiny` alone is already muted-foreground, and
          // adding `muted` would win the role axis and render the tagline at the wordmark's
          // own 14px. `flush` lets the two line boxes set the lockup's rhythm: 24 + 16 = 40,
          // which centers in the 56px header with even breathing room above and below.
          <Row snug alignCenter>
            <CanvasMark size={26} />
            <Column flush>
              <Typography lead semibold>
                Canvas
              </Typography>
              <Typography tiny>design system</Typography>
            </Column>
          </Row>
        )
      }
      footer={
        // Only the mobile-web drawer carries a footer: the appearance toggles (their old
        // bottom-sheet-footer home). Native puts appearance in the header bar; the desktop
        // rail has no footer.
        Platform.OS === "web" && narrow ? <ThemeToggles /> : undefined
      }
      sections={sections}
    />
  );
}
