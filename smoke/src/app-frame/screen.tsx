import { type ReactNode } from "react";
import { Column, OverlayProvider, ScrollView, Typography, View } from "@nannier/canvas";
import { journeyTitle, type JourneyRoute } from "../catalog/journeys";

// App-frame scaffolding owns the scroll viewport and readable page measure.
// Page content uses Canvas layout props for all spacing and arrangement.
// A route whose overlays belong to an enclosing viewport-measured host (a candidate
// API) wraps the frame and asks for a plain content box instead of the page's own
// overlay host. A journey screen is headed by its menu title (`journey`), so the menu
// entry and the page always agree.
export function Screen({ children, journey, viewportOverlays = false }: { children: ReactNode; journey?: JourneyRoute; viewportOverlays?: boolean }) {
  // Viewport modals must not center inside the page's full scroll content.
  // Ordinary pages retain their content host for anchored menus.
  const ContentHost = viewportOverlays ? View : OverlayProvider;
  return (
    <ScrollView role="main" keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
      <Column padLoose alignCenter>
        <ContentHost style={{ width: "100%", maxWidth: 1120, flexGrow: 0, flexShrink: 0, flexBasis: "auto" }}>
          <Column loose>
            {journey ? <Typography h2 testID="screen-title">{journeyTitle(journey)}</Typography> : null}
            {children}
          </Column>
        </ContentHost>
      </Column>
    </ScrollView>
  );
}
