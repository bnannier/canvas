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
import { Entrance } from "./entrance.js";

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
  /**
   * Whether an outside tap can actually dismiss the card (default true). Pass
   * false when dismissal is a no-op — a controlled `open` with no change handler
   * (e.g. a docs example pinned open) — so the full-bleed dismiss backdrop is
   * skipped instead of silently swallowing every tap under an overlay that can
   * never close.
   */
  dismissable?: boolean;
  /**
   * The card's known width, when the caller fixes it. Enables horizontal
   * placement logic: the card is clamped inside the outlet's bounds (8px
   * inset), so a card anchored to a trigger near the outlet's right edge slides
   * left instead of overflowing. Omit for the legacy left-edge anchoring.
   */
  cardWidth?: number;
  /** With `cardWidth`: center the card on the trigger (tooltip-style) instead
   *  of aligning to its left edge. Still clamped inside the outlet. */
  centered?: boolean;
}

export function AnchoredOverlay({
  open,
  onDismiss,
  triggerRef,
  gap = 4,
  children,
  cardStyle,
  inlineStyle,
  dismissable = true,
  cardWidth,
  centered = false,
}: AnchoredOverlayProps) {
  const host = useOverlayHost();

  // No provider: render the card inline in place, exactly as the kit did before
  // the portal layer (absolute anchor under the trigger, no backdrop). The card
  // pops open from the trigger corner (Entrance owns the absolute anchor position).
  if (!host) {
    return open ? (
      <Entrance anchor style={inlineStyle}>
        <GlassSurface style={cardStyle}>{children}</GlassSurface>
      </Entrance>
    ) : null;
  }

  return (
    <HostedAnchoredOverlay
      host={host}
      open={open}
      onDismiss={onDismiss}
      triggerRef={triggerRef}
      gap={gap}
      cardStyle={cardStyle}
      dismissable={dismissable}
      cardWidth={cardWidth}
      centered={centered}
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
  dismissable: boolean;
  cardWidth?: number;
  centered?: boolean;
  children: ReactNode;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Horizontal inset kept between a width-aware card and the outlet's edges.
const CLAMP_INSET = 8;

// The card's x: legacy left-edge anchoring without a known width; with one,
// optionally centered on the trigger, then clamped inside the outlet.
function placeX(rect: Rect, cardWidth: number | undefined, centered: boolean, outletWidth: number | null): number {
  if (cardWidth == null) return rect.x;
  let x = centered ? rect.x + rect.width / 2 - cardWidth / 2 : rect.x;
  if (outletWidth != null && outletWidth > 0) x = Math.min(x, outletWidth - cardWidth - CLAMP_INSET);
  return Math.max(CLAMP_INSET, x);
}

function HostedAnchoredOverlay({ host, open, onDismiss, triggerRef, gap, cardStyle, dismissable, cardWidth, centered, children }: HostedProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  // The outlet's width, captured alongside the trigger measure; only needed for
  // width-aware (clamped) placement.
  const [outletWidth, setOutletWidth] = useState<number | null>(null);
  // Re-measure on viewport changes (rotation / resize). Width/height feed the
  // effect deps; the values themselves aren't read.
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    let cancelled = false;
    let raf = 0;
    // Bounded retry: during initial page mount (an overlay that is open on its
    // very first render, e.g. a docs example pinned open) the measure callbacks
    // can silently not complete, or report a zero-size box for a not-yet-laid-out
    // trigger — and a one-shot leaves the card unmounted forever. Re-attempt on
    // the next frame until a real measurement lands, capped so a pathological
    // case (trigger gone while open) cannot spin indefinitely.
    let attempts = 0;
    const MAX_ATTEMPTS = 60;
    const attempt = () => {
      if (cancelled || attempts >= MAX_ATTEMPTS) return;
      attempts += 1;
      let landed = false;
      const trigger = triggerRef.current;
      if (trigger) {
        // measureInWindow on BOTH the trigger and the outlet, then subtract, gives
        // the trigger's box relative to the outlet — correct for a screen-level
        // host and a stage-scoped one alike, with scroll offsets cancelling out.
        trigger.measureInWindow((tx, ty, tw, th) => {
          host.measureOutlet((ox, oy, ow) => {
            if (cancelled || (tw === 0 && th === 0)) return;
            landed = true;
            setRect({ x: tx - ox, y: ty - oy, width: tw, height: th });
            setOutletWidth(ow);
          });
        });
      }
      raf = requestAnimationFrame(() => {
        if (!cancelled && !landed) attempt();
      });
    };
    // First attempt on the next frame, so the trigger is laid out before we
    // measure (measuring in the same tick as open returns zeros).
    raf = requestAnimationFrame(attempt);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [open, width, height, host, triggerRef, gap]);

  if (!open) return null;

  return (
    <Portal>
      {/* The dismiss backdrop only earns its keep when a tap on it can close the
          card; a non-dismissable overlay renders without it so the page under an
          always-open card stays interactive. */}
      {dismissable ? <Pressable accessible={false} style={BACKDROP} onPress={onDismiss} /> : null}
      {/* Hold the card until the first measurement lands, so it never flashes at
          (0,0). The backdrop above is transparent, so a frame before the card
          shows nothing. */}
      {rect ? (
        <Entrance anchor style={{ position: "absolute", left: placeX(rect, cardWidth, centered ?? false, outletWidth), top: rect.y + rect.height + gap }}>
          <GlassSurface style={cardStyle}>{children}</GlassSurface>
        </Entrance>
      ) : null}
    </Portal>
  );
}
