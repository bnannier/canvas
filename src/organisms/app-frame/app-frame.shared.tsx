import { type ReactNode } from "react";
import { OverlayProvider, ScrollView, View, stepOf, useTheme, type MeasureProps, type WidthKey } from "../../style/index.js";
import { SafeAreaProvider, SafeAreaView } from "../../style/safe-area.js";
import { Container } from "../../atoms/container/container.js";
import { Column } from "../../atoms/layout/layout.js";
import * as s from "./app-frame.styles.js";
import { type AppFrameSkin } from "./app-frame.styles.js";

// App scaffolding: the two pieces every Canvas app used to hand-roll around its screens.
//
// AppFrame is the app's root frame. Inside ThemeProvider it mounts, outermost first:
//   - the safe-area context (the guarded peer wrapper, src/style/safe-area.tsx: the real
//     react-native-safe-area-context provider when it is installed, a View otherwise);
//   - the app-root OverlayProvider. It sits INSIDE the safe-area provider, because a root
//     host is a window layer that reads the window's insets itself to keep cards and
//     sheets clear of the status bar, the Dynamic Island and the home indicator
//     (useSafeAreaInsetsOrNull in src/style/portal.tsx), and OUTSIDE the padded frame,
//     because the layer must fill its window: it subtracts the insets from the box it
//     measures, so a host inside the padding would inset twice, and on Android only a
//     window-filling root host owns the capture plane glass overlays sample;
//   - the frame: a SafeAreaView padding all four edges, painted with the theme's
//     `background` role, holding the optional `header` in a `role="banner"` region and
//     the body (`children`, typically a router's Stack), which fills the height left.
//
// Page is one scrolling screen: a `role="main"` ScrollView that fills its parent, with
// page gutters and its content capped and centered at a step of the width scale (the
// kit's measure axis, MeasureProps; `widest` 1152 by default). The content is its own
// overlay host by default, so an anchored menu opened in the page is framed by it;
// `inheritOverlays` makes it a plain box, for a page wrapped in a viewport-measured
// OverlayProvider whose modals must center in the viewport rather than in the page's
// full scrolled content.

const ALL_EDGES = ["top", "right", "bottom", "left"] as const;

/** The page measure when no step is passed: `widest` (1152), the app-page reading width. */
export const PAGE_MEASURE: WidthKey = "widest";

export interface AppFrameProps {
  /** The app's top chrome (a Navbar), rendered in a `role="banner"` region above the body. */
  header?: ReactNode;
  /** The body, typically a router's Stack: it fills the height the header leaves. */
  children?: ReactNode;
  /** E2E hook forwarded to the frame. */
  testID?: string;
}

export interface PageProps extends MeasureProps {
  /** The page content, stacked in a Column at the loose (24) rhythm. */
  children?: ReactNode;
  /** No cap: the content spans the page between its gutters. Wins over every step. */
  fluid?: boolean;
  /**
   * A plain content box instead of the page's own overlay host, so overlays opened in
   * the page go to an enclosing host (a viewport-measured OverlayProvider around the page).
   */
  inheritOverlays?: boolean;
  /** E2E hook forwarded to the page's scroller. */
  testID?: string;
}

/** The measure a Page's props resolve to: `fluid`, else the narrowest step passed, else `widest`. */
export function pageMeasureOf(p: PageProps): WidthKey | "fluid" {
  if (p.fluid) return "fluid";
  return stepOf(p) ?? PAGE_MEASURE;
}

/** Build AppFrame from a platform skin (the shared frame fill). */
export function createAppFrame(skin: AppFrameSkin) {
  return function AppFrame({ header, children, testID }: AppFrameProps) {
    const { tokens } = useTheme();
    return (
      <SafeAreaProvider style={s.root}>
        <OverlayProvider>
          <SafeAreaView edges={ALL_EDGES} style={[s.root, skin.frame(tokens)]} testID={testID}>
            {header != null ? <View role="banner">{header}</View> : null}
            <View style={s.body}>{children}</View>
          </SafeAreaView>
        </OverlayProvider>
      </SafeAreaProvider>
    );
  };
}

/** Build Page from a platform skin (the shared gutter). */
export function createPage(skin: AppFrameSkin) {
  const gutters = { padding: skin.gutter };
  return function Page(props: PageProps) {
    const { children, inheritOverlays = false, testID } = props;
    const measure = pageMeasureOf(props);
    const content = <Column loose>{children}</Column>;
    return (
      <ScrollView role="main" keyboardShouldPersistTaps="handled" style={s.scroll} contentContainerStyle={gutters} testID={testID}>
        <Container {...(measure === "fluid" ? { fluid: true } : { [measure]: true })} start={props.start}>
          {inheritOverlays ? content : <OverlayProvider style={s.contentHost}>{content}</OverlayProvider>}
        </Container>
      </ScrollView>
    );
  };
}
