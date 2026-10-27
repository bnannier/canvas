import { type ReactNode, type RefObject, createContext, useContext, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { ScrollView, View, Column, Container, OverlayProvider } from "@nannier/canvas";
import { ScreenFrame } from "../shell/native-header";
import { Footer } from "../shell/footer";
import { RAIL_INSET, useShellFrame } from "../shell/frame";
import { SHELL } from "../shell/page-look";
import { H1, Lead } from "./prose";
import { DocsHead } from "./docs-head";
import { useAuditProbe } from "../audit/probe-context";

// The standard scrollable content frame: the v4 hand-off's page frame (design-language
// item 8). The content sits in a column capped at the hand-off's 1440 px and centred
// (docs scaffolding: 1440 is off the kit's widths scale), inside the kit Container's 24 px
// gutter, starting 96 px down on the web under the floating pill (../shell/pill-nav.tsx),
// and clearing the rail where the web shell stands one at its start edge
// (../shell/rail.tsx). The footer closes every page (../shell/footer.tsx). ScreenFrame
// adds the native header + search overlay on iOS/Android and is a transparent passthrough
// on web.
//
// The OverlayProvider is the page-level overlay host: overlays opened anywhere in
// the page body (a Dropdown in a Do/Don't card, a Select in a template preview) are
// placed by its outlet, so they paint ABOVE later page content and overflow their
// card instead of being clipped by it or painted under a sibling (every
// react-native-web View is its own stacking context, so an inline menu can never
// z-lift past its card's later siblings). It sits INSIDE the scroll content, so a
// card pinned open for a demo scrolls with the page and stays glued to its trigger.
// A card that closes on an outside tap paints in the app root's outlet instead,
// placed exactly where this one would put it, so its backdrop spans the window and
// holds the page still while it is open. Playground stages mount their own nearer
// host and place their overlays within the stage the same way.
// The page's scroller, for docs-only scaffolding that scrolls the page itself (the detail
// page's jump strip bringing a section to the top). Null outside a Page.
const PageScrollContext = createContext<RefObject<ScrollView | null> | null>(null);
export function usePageScroller(): RefObject<ScrollView | null> | null {
  return useContext(PageScrollContext);
}

export function Page({ children, viewportOverlays = false }: { children: ReactNode; viewportOverlays?: boolean }) {
  // The scroller, published to the native audit driver (docs/src/audit/probe-context.tsx)
  // so it can bring a card taller than the screen into view one segment at a time. The
  // probe is null outside the audit build, where this registers nothing and no sensor
  // renders.
  const probe = useAuditProbe();
  const Sensor = probe?.Sensor;
  const scrollerRef = useRef<ScrollView>(null);
  const { rail } = useShellFrame();
  useEffect(() => probe?.scroller({ ref: scrollerRef }), [probe]);
  // Runtime fixtures need viewport modals and a sibling capture plane. Keep the
  // catalogue's content host by default so anchored previews scroll as before.
  const ContentHost = viewportOverlays ? View : OverlayProvider;
  const content = (
      <ScrollView
        ref={scrollerRef}
        // The audit driver scrolls a page's ends to where a user's scroll rests on iOS,
        // under the transparent header and above the tab bar (the automatic inset
        // adjustment), which React Native's scrollTo otherwise clamps away. Not passed
        // outside the audit build.
        {...(probe ? { scrollToOverflowEnabled: true } : null)}
        // Marks the page's scroller for tooling. The docs scroll in an INNER view, not
        // the window, so a check for "does this page scroll sideways" has to ask this
        // node and not the document. It paints no fill: the page look behind it
        // (docs/src/shell/page-backdrop.tsx) shows through. Web-only attribute; a
        // no-op on native.
        {...(Platform.OS === "web" ? ({ dataSet: { pageScroll: "" } } as object) : null)}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          // Web: the hand-off's 96 px, clearing the pill floating over the page's top.
          // Native: iOS owns the inset via contentInsetAdjustmentBehavior, so the content
          // only takes a gutter's breathing room under the transparent nav bar. The footer
          // closes the page, so the foot adds nothing.
          paddingTop: Platform.OS === "web" ? SHELL.contentTop : SHELL.gutter,
          width: "100%",
          alignItems: "center",
        }}
      >
        {/* The longhands override the provider's app-root default (flex: 1) so the
            box wraps its content: react-native-web expands `flex: 0` to basis 0%,
            which collapses a content-sized scroll child to 0 height, so basis is
            set to auto explicitly. The column gap moves here from the content
            container, which now has one child. The host is the frame: full width, capped
            at 1440 and centred by the content container. */}
        <ContentHost style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "100%", maxWidth: SHELL.frameMax }}>
          <View
            // Marked for the document root's pre-hydration rule (docs/src/app/+html.tsx),
            // which drops the rail's inset on a phone until the bundle runs. Web-only.
            {...(Platform.OS === "web" ? ({ dataSet: { shellContent: "" } } as object) : null)}
            style={{ paddingLeft: rail ? RAIL_INSET : 0 }}
          >
            <Container padLoose><Column loose>{children}</Column></Container>
          </View>
          <Footer />
        </ContentHost>
      </ScrollView>
  );
  return (
    <ScreenFrame>
      <PageScrollContext.Provider value={scrollerRef}>
        {viewportOverlays ? <OverlayProvider viewport>{content}</OverlayProvider> : content}
      </PageScrollContext.Provider>
      {Sensor ? <Sensor /> : null}
    </ScreenFrame>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <Column snug>
      <DocsHead title={title} />
      <H1>{title}</H1>
      {description ? <Lead>{description}</Lead> : null}
    </Column>
  );
}
