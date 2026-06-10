import { useState } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import * as s from "./overlays.styles.js";
import { type Placement } from "./overlays.styles.js";

// Overlay: a dim backdrop with a surface anchored to a side or the center,
// rendered INLINE for the docs preview. Rather than a full-screen portal/Modal,
// this is a CONTAINED backdrop View (a rounded, clipped scrim with explicit
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
  // Trigger button label. When set, the overlay renders the button and opens
  // itself on press (uncontrolled). Omit when you drive `open` yourself.
  trigger?: string;
  // Controlled open state. Omit for uncontrolled (the trigger opens it).
  open?: boolean;
  // Fired when the open state changes (trigger press, done).
  onOpenChange?: (open: boolean) => void;
  // Placement (pick one; first match wins, default is the right-side drawer).
  drawer?: boolean;
  sheet?: boolean;
  modal?: boolean;
  // Footer action label.
  doneLabel?: string;
  // Action handler.
  onDone?: () => void;
  /** Escape hatch for layout/positioning composition on the overlay surface. */
  style?: StyleProp<ViewStyle>;
}

// Placement precedence when more than one is passed: first match wins.
function placementOf(p: OverlayProps): Placement {
  if (p.drawer) return "drawer";
  if (p.sheet) return "sheet";
  if (p.modal) return "modal";
  return "drawer";
}

export function Overlay(props: OverlayProps) {
  const { title, description, trigger, open: openProp, onOpenChange, doneLabel = "Done", onDone, style } = props;
  const { tokens } = useTheme();

  // Uncontrolled by default: the trigger opens the overlay and Done closes it;
  // a controlled `open` prop overrides this.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const placement = placementOf(props);

  // Optional trigger button plus the overlay. The overlay is a contained dim
  // backdrop: a rounded, clipped scrim with explicit presence in the preview
  // (minHeight) so the surface reads as an overlay within the area.
  return (
    <View style={s.root}>
      {trigger != null ? (
        <View style={s.triggerWrap}>
          <Button outline small onPress={() => setOpen(true)}>
            {trigger}
          </Button>
        </View>
      ) : null}
      {open ? (
        <View
          style={[
            trigger != null ? s.backdropWithTrigger : null,
            s.backdrop(),
            s.backdropPlacement[placement],
            { minHeight: 280 },
          ]}
        >
          <View style={[s.surface(tokens, placement), style]}>
            {title != null ? <Text style={s.title(tokens)}>{title}</Text> : null}
            {description != null ? <Text style={s.description(tokens)}>{description}</Text> : null}
            <View style={s.footer}>
              <Button
                primary
                small
                onPress={() => {
                  onDone?.();
                  setOpen(false);
                }}
              >
                {doneLabel}
              </Button>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
