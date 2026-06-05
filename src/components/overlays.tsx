import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Button } from "./button.js";

// Overlay: a dim backdrop with a surface anchored to a side or the center,
// rendered INLINE for the docs preview. Rather than a full-screen portal/Modal,
// this is a CONTAINED backdrop Box (a rounded, clipped scrim with explicit
// presence in the preview) that holds the overlay surface positioned inside it:
// a right-side drawer, a bottom sheet, or a centered modal/panel.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Dialog/Button). Placement axis (pick one):
//
// - `drawer`: a panel anchored to the right edge, full height (the default).
// - `sheet`: a panel anchored to the bottom edge, spanning the width.
// - `modal`: a centered card floating over the backdrop.

export interface OverlayProps {
  // Content (strings).
  title?: string;
  description?: string;
  // Visibility: render the open overlay when true (default).
  open?: boolean;
  // Placement (pick one; first match wins, default is the right-side drawer).
  drawer?: boolean;
  sheet?: boolean;
  modal?: boolean;
  // Footer action label.
  doneLabel?: string;
  // Action handler.
  onDone?: () => void;
  className?: string;
}

type Placement = "drawer" | "sheet" | "modal";

// Placement precedence when more than one is passed: first match wins.
function placementOf(p: OverlayProps): Placement {
  if (p.drawer) return "drawer";
  if (p.sheet) return "sheet";
  if (p.modal) return "modal";
  return "drawer";
}

// The backdrop's alignment per placement. The modal centers its card; the
// drawer and sheet let the absolutely-positioned surface anchor itself.
const BACKDROP_PLACEMENT: Record<Placement, string> = {
  drawer: "",
  sheet: "",
  modal: "items-center justify-center",
};

// The overlay surface per placement: drawer anchors right + full height, sheet
// anchors to the bottom edge, modal is a self-centered floating card.
const SURFACE_PLACEMENT: Record<Placement, string> = {
  drawer: "absolute top-0 right-0 bottom-0 w-[300px] bg-popover border-l border-border p-5 shadow-xl",
  sheet: "absolute left-0 right-0 bottom-0 bg-popover border-t border-border rounded-t-lg p-5 shadow-xl",
  modal: "self-center my-12 w-full max-w-[420px] bg-popover border border-border rounded-lg p-6 shadow-xl",
};

export function Overlay(props: OverlayProps) {
  const { title, description, open = true, doneLabel = "Done", onDone, className } = props;

  if (!open) return null;

  const placement = placementOf(props);

  // Contained dim backdrop: a rounded, clipped scrim with explicit presence in
  // the preview (minHeight) so the surface reads as an overlay within the area.
  return (
    <Box
      className={cn("relative w-full overflow-hidden rounded-lg bg-black/50", BACKDROP_PLACEMENT[placement])}
      style={{ minHeight: 280 }}
    >
      <Box className={cn(SURFACE_PLACEMENT[placement], className)}>
        {title != null ? (
          <Text className="text-base font-semibold text-popover-foreground">{title}</Text>
        ) : null}
        {description != null ? (
          <Text className="text-sm text-muted-foreground mt-2">{description}</Text>
        ) : null}
        <Box className="flex-row justify-end mt-6">
          <Button primary small onPress={onDone}>
            {doneLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
