import type { ReactNode } from "react";
import { Sidebar as KitSidebar, Button, type IconName, type SidebarSection } from "@nannier/canvas";
import { usePathname, useRouter } from "expo-router";
import { CanvasMark } from "../brand/canvas-mark";
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
  footer,
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
  /**
   * The drawer's pinned footer, from the shell that opens it: the appearance toggles in
   * the narrow web drawer, the palette row in the Android menu drawer. The desktop rail
   * has none.
   */
  footer?: ReactNode;
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
      header={(isCollapsed) => {
        // The brand lockup is a link home, the convention for a site logo. Wraps both the
        // collapsed mark and the expanded lockup so the whole logo area is the target, and
        // closes the drawer after (onNavigate) exactly as picking a nav item does.
        const goHome = () => {
          router.push("/");
          onNavigate?.();
        };
        return <Button ghost small href="/" icon={isCollapsed} onPress={goHome}
          accessibilityLabel={isCollapsed ? "Canvas, go to home" : undefined}
          iconLeft={<CanvasMark size={26} />}>
          {isCollapsed ? null : "Canvas design system"}
        </Button>;
      }}
      footer={footer}
      sections={sections}
    />
  );
}
