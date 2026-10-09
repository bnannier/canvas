import { Linking, Platform } from "react-native";
import { View, Navbar, Column, Typography, Button, ButtonGroup, Kbd, Icon, useTheme, useBreakpoint, liquidGlassAvailable } from "@nannier/canvas";
import { usePathname } from "expo-router";
import { getComponent } from "../core/data/components";
import { getTemplate } from "../core/data/templates";
import { getPattern } from "../core/data/patterns";
import { useDocsTheme } from "../theme/docs-theme";
import { Github } from "../brand/brand-logos";

// The public repository the GitHub button in the bar links back to (mirrors the home page's link).
const REPO_URL = "https://github.com/bnannier/canvas";

// The topbar overlays the scrolling content (so its glass frost refracts what
// scrolls behind it). Content scrollers add this as a top inset so their first row
// starts below the bar.
export const TOPBAR_HEIGHT = 72;

// Top inset content scrollers add for the overlaying top bar. On web the custom Topbar is
// an absolute overlay, so content must clear it (TOPBAR_HEIGHT). On native the real
// UINavigationBar owns the inset via contentInsetAdjustmentBehavior="automatic", so the
// content adds nothing (0) and lets iOS place it under the collapsing large title.
export const CONTENT_TOP_INSET = Platform.OS === "web" ? TOPBAR_HEIGHT : 0;

// Bottom inset content scrollers add for the narrow web shell's floating TabBar, which
// overlays the page the way the iOS 26 tab bar does (content scrolls beneath its glass):
// the capsule's 58 plus its 8 of float plus breathing room, so a page's last row can
// scroll clear of it. Applied on web only; the native tab bars inset their own screens.
// A desktop page gets the same tail, which is only extra space after its last row.
export const CONTENT_BOTTOM_INSET = Platform.OS === "web" ? 80 : 0;

function titleize(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const STATIC_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "Canvas", subtitle: "Design System" },
  "/components": { title: "All components", subtitle: "Overview" },
  "/tokens/colors": { title: "Colors & Theme", subtitle: "Tokens" },
  "/tokens/spacing": { title: "Spacing & Shape", subtitle: "Tokens" },
  "/tokens/typography": { title: "Typography", subtitle: "Tokens" },
  "/tokens/layout": { title: "Layout & Flexbox", subtitle: "Tokens" },
  "/theming": { title: "Theming", subtitle: "Foundations" },
  "/integration": { title: "Integration", subtitle: "Guides" },
  "/browser-support": { title: "Browser Support", subtitle: "Guides" },
  "/rn-primitives": { title: "React Native", subtitle: "Guides" },
  "/privacy": { title: "Privacy Policy", subtitle: "Guides" },
  "/licenses": { title: "Open Source Licenses", subtitle: "Guides" },
  "/boilerplate": { title: "Boilerplate", subtitle: "Overview" },
};

export function titleFor(pathname: string): { title: string; subtitle?: string } {
  if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname];
  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "components" && seg[1]) {
    const c = getComponent(seg[1]);
    if (c) return { title: c.name, subtitle: c.category };
  }
  if (seg[0] === "templates" && seg[1]) return { title: getTemplate(seg[1])?.name ?? titleize(seg[1]), subtitle: "Templates" };
  if (seg[0] === "patterns" && seg[1]) return { title: getPattern(seg[1])?.name ?? titleize(seg[1]), subtitle: "Patterns" };
  return { title: "Canvas" };
}

export function Topbar({ showMenu, onMenu, onSearch }: { showMenu: boolean; onMenu: () => void; onSearch?: () => void }) {
  const { tokens } = useTheme();
  const { scheme, surface, toggleScheme, setSurface } = useDocsTheme();
  const { title, subtitle } = titleFor(usePathname());
  const wideEnough = useBreakpoint() !== "sm";
  return (
    <View role="banner"><Navbar
      brandContent={<>
        {showMenu ? <Button ghost icon small accessibilityLabel="Toggle menu" iconLeft={<Icon menu />} onPress={onMenu} /> : null}
        <Column flush shrink>
          <Typography semibold>{title}</Typography>
          {subtitle && wideEnough ? <Typography tiny subtle>{subtitle}</Typography> : null}
        </Column>
      </>}
      actions={<>
        {onSearch ? (wideEnough ?
          <Button secondary small iconLeft={<Icon search />} iconRight={<Kbd>⌘K</Kbd>} onPress={onSearch}>Search components...</Button> :
          <Button ghost icon small accessibilityLabel="Search" iconLeft={<Icon search />} onPress={onSearch} />) : null}
        <Button ghost icon small accessibilityLabel="View Canvas on GitHub" iconLeft={<Github size={16} color={tokens.foreground} />} onPress={() => Linking.openURL(REPO_URL)} />
        {!liquidGlassAvailable() ? <ButtonGroup segmented small accessibilityLabel="Surface" items={["Solid", "Glass"]} active={surface === "solid" ? 0 : 1} onSelect={(i) => setSurface(i === 0 ? "solid" : "glass")} /> : null}
        <Button ghost icon small accessibilityLabel="Toggle color scheme" iconLeft={scheme === "dark" ? <Icon sun /> : <Icon moon />} onPress={toggleScheme} />
      </>}
    /></View>
  );
}
