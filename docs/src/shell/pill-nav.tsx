import { usePathname, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { View, Navbar, ButtonGroup, Divider, Switch, liquidGlassAvailable } from "@nannier/canvas";
import { CanvasMark } from "../brand/canvas-mark";
import { PILL_LINKS, pillIndexFor } from "../data/rooms";
import { useDocsTheme } from "../theme/docs-theme";
import { HueSwatches } from "./theme-toggles";
import { SHELL } from "./page-look";

// The web shell's navigation: the v4 hand-off's floating pill (`Canvas v4.0.0
// Controls.dc.html`, its <nav>), built from the kit Navbar as `floating compact scrolls`.
// It is centred 14 px under the window's top and at least 16 px from its sides at every
// width; where its 1177 px do not fit, its content row scrolls sideways inside it (S1).
// The brand and its separator, the ten room links (the eight sections, Skins, Templates),
// then the actions, each group set apart by the hand-off's 1 x 18 px separator (the kit
// Divider `vertical inset strong`):
// the search opener (S4, the hand-off pill has none; ⌘K is wired by the shell), the five hue
// swatches, the Dark | Light scheme switch and the Glass switch (S8, the kit Switch where
// the hand-off draws a chip). The links are real anchors; a plain click routes on the
// client.
//
// The row holding the pill is the page's banner; the pill itself is the Primary
// navigation landmark, as the hand-off's <nav> wraps the whole pill.

const LABELS = PILL_LINKS.map((link) => link.label);
const HREFS = PILL_LINKS.map((link) => link.href);

/** The pill's height, from the kit Navbar's `compact` density. */
export const PILL_HEIGHT = 44;

/** Where the pill's band ends: the top offset and the pill. Content scrolled into view parks below it. */
export const PILL_BAND = SHELL.navTop + PILL_HEIGHT;

export function PillNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <View role="banner" style={styles.band}>
      <View role="navigation" aria-label="Primary" accessibilityLabel="Primary" style={{ maxWidth: "100%" }}>
        <Navbar
          floating
          compact
          scrolls
          brandDivider
          brand="Canvas"
          brandContent={<CanvasMark size={20} />}
          brandHref="/"
          onBrandPress={(event) => {
            // The brand is an anchor home: route on the client instead of loading the page.
            event?.preventDefault();
            router.push("/" as never);
          }}
          links={LABELS}
          hrefs={HREFS}
          active={pillIndexFor(pathname)}
          onSelect={(index, event) => {
            // The link is an anchor: route on the client instead of loading the page.
            event?.preventDefault();
            router.push(HREFS[index] as never);
          }}
          actions={<PillActions />}
        />
      </View>
    </View>
  );
}

// box-none lives in a StyleSheet.create style: react-native-web compiles its box-none
// (the band `pointer-events: none`, its children `auto`) only for a registered style and
// drops an inline one, which left the full-width band swallowing every click beside the
// pill (src/style/portal.tsx explains the same trap).
const styles = StyleSheet.create({
  band: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 40, paddingTop: SHELL.navTop, paddingHorizontal: SHELL.navSide, alignItems: "center", pointerEvents: "box-none" },
});

function PillActions() {
  const { scheme, surface, setScheme, setSurface } = useDocsTheme();
  return (
    <>
      <Divider vertical inset strong />
      <View style={{ paddingHorizontal: 6 }}><HueSwatches /></View>
      <Divider vertical inset strong />
      <ButtonGroup
        segmented
        rounded
        small
        testID="navbar-scheme"
        accessibilityLabel="Scheme"
        items={["Dark", "Light"]}
        active={scheme === "dark" ? 0 : 1}
        onSelect={(index) => setScheme(index === 0 ? "dark" : "light")}
      />
      {/* Only where the surface is the reader's to choose: on iOS 26 glass is the system
          material (the native bars carry their own toggle). */}
      {!liquidGlassAvailable() ? (
        <Switch chip testID="navbar-glass" checked={surface === "glass"} onChange={(on) => setSurface(on ? "glass" : "solid")}>
          Glass
        </Switch>
      ) : null}
    </>
  );
}
