// AnchoredOverlay: a floating card pinned just below a trigger, with
// cross-platform outside-tap dismissal, from RN primitives only.
//
// When an <OverlayProvider> is mounted (an app root, or a docs example stage),
// the card plus a full-bleed dismiss backdrop are portaled into its outlet and
// the card is positioned at the trigger's coordinates measured RELATIVE TO the
// outlet (measureInWindow on both, subtract). So the card escapes the trigger's
// bounds with NO position:"fixed" and NO Platform.OS branch, and a tap anywhere
// off the card dismisses it on every platform.
//
// With no provider it degrades to the kit's pre-portal inline anchor (the
// caller's own absolute top:100% style, passed as `inlineStyle`), so an unhosted
// consumer still renders — just without the over-the-page escape or the backdrop,
// exactly as the kit behaved before the portal layer.
//
// Width is the caller's concern: it already measures its trigger (onLayout) and
// passes the card's width/min-width via `cardStyle`. This helper owns only the
// x/y placement and the backdrop.

import { type ReactNode, type RefObject, useEffect, useState } from "react";
import { View, Pressable, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { Portal, useOverlayHost, type OverlayHost } from "./portal.js";
import { GlassSurface } from "./glass-surface/glass-surface.js";

// A transparent layer filling the outlet: it catches a tap anywhere off the card
// and dismisses. Transparent (no fill) — anchored menus don't dim the page.
const BACKDROP: ViewStyle = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 };

export interface AnchoredOverlayProps {
  /** Whether the card is shown. */
  open: boolean;
  /** Called when a tap off the card should dismiss it. */
  onDismiss: () => void;
  /** Ref to the trigger view the card anchors below. */
  triggerRef: RefObject<View | null>;
  /** Gap between the trigger's bottom edge and the card's top (default 4). */
  gap?: number;
  /** The floating card's contents. */
  children: ReactNode;
  /** Style for the card wrapper (the skin's card fill/border/shadow + width). */
  cardStyle?: StyleProp<ViewStyle>;
  /** The caller's inline absolute anchor (e.g. position:absolute, top:"100%"),
   *  used only in the no-host fallback. */
  inlineStyle?: StyleProp<ViewStyle>;
}

export function AnchoredOverlay({
  open,
  onDismiss,
  triggerRef,
  gap = 4,
  children,
  cardStyle,
  inlineStyle,
}: AnchoredOverlayProps) {
  const host = useOverlayHost();

  // No provider: render the card inline in place, exactly as the kit did before
  // the portal layer (absolute anchor under the trigger, no backdrop).
  if (!host) {
    return open ? <GlassSurface style={[inlineStyle, cardStyle]}>{children}</GlassSurface> : null;
  }

  return (
    <HostedAnchoredOverlay
      host={host}
      open={open}
      onDismiss={onDismiss}
      triggerRef={triggerRef}
      gap={gap}
      cardStyle={cardStyle}
    >
      {children}
    </HostedAnchoredOverlay>
  );
}

interface HostedProps {
  host: OverlayHost;
  open: boolean;
  onDismiss: () => void;
  triggerRef: RefObject<View | null>;
  gap: number;
  cardStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function HostedAnchoredOverlay({ host, open, onDismiss, triggerRef, gap, cardStyle, children }: HostedProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  // Re-measure on viewport changes (rotation / resize). Width/height feed the
  // effect deps; the values themselves aren't read.
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    let cancelled = false;
    // rAF so the trigger is laid out before we measure (measuring in the same
    // tick as open returns zeros).
    const raf = requestAnimationFrame(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      // measureInWindow on BOTH the trigger and the outlet, then subtract, gives
      // the trigger's box relative to the outlet — correct for a screen-level
      // host and a stage-scoped one alike, with scroll offsets cancelling out.
      trigger.measureInWindow((tx, ty, tw, th) => {
        host.measureOutlet((ox, oy) => {
          if (cancelled) return;
          setRect({ x: tx - ox, y: ty - oy, width: tw, height: th });
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [open, width, height, host, triggerRef, gap]);

  if (!open) return null;

  return (
    <Portal>
      <Pressable accessible={false} style={BACKDROP} onPress={onDismiss} />
      {/* Hold the card until the first measurement lands, so it never flashes at
          (0,0). The backdrop above is transparent, so a frame before the card
          shows nothing. */}
      {rect ? (
        <GlassSurface style={[{ position: "absolute", left: rect.x, top: rect.y + rect.height + gap }, cardStyle]}>
          {children}
        </GlassSurface>
      ) : null}
    </Portal>
  );
}
