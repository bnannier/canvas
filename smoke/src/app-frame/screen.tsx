import { type ReactNode } from "react";
import { Page, Typography } from "@nannier/canvas";
import { journeyTitle, type JourneyRoute } from "../catalog/journeys";

// A smoke screen is a Canvas Page (the main region, its gutters, the page measure and its
// overlay host) headed by its menu title when it is a journey (`journey`), so the menu
// entry and the page always agree. A route whose overlays belong to an enclosing
// viewport-measured host wraps the screen and passes `viewportOverlays`, which makes the
// page a plain content box (Page's `inheritOverlays`).
export function Screen({ children, journey, viewportOverlays = false }: { children: ReactNode; journey?: JourneyRoute; viewportOverlays?: boolean }) {
  return (
    <Page inheritOverlays={viewportOverlays}>
      {journey ? <Typography h2 testID="screen-title">{journeyTitle(journey)}</Typography> : null}
      {children}
    </Page>
  );
}
