// AnchoredOverlay: a floating card fitted beside a trigger, with
// cross-platform outside-tap dismissal, from RN primitives only.
//
// Android's hardware back dismisses an open card too, on both paths below: it is
// the platform's own "back out of this", so it closes the menu and never reaches
// the navigator underneath (a page that went back with its menu still open was the
// bug). The press routes through the owner's escape scope, the same request an
// iOS accessibility escape makes, so a card nested in another overlay closes first.
//
// When an <OverlayProvider> is mounted (an app root, or a docs example stage),
// the card plus a full-bleed dismiss backdrop are portaled into an outlet and
// the card is positioned at the trigger's coordinates measured RELATIVE TO the
// outlet (measureInWindow on both, subtract). So the card escapes the trigger's
// bounds with NO position:"fixed" and NO Platform.OS branch, and a tap anywhere
// off the card dismisses it on every platform.
//
// Which outlet: the nearest provider is the FRAME the card is placed in (its
// edges clamp the card, its visible band caps it), and a card that can close
// paints in its window's LAYER, the outermost provider (src/style/overlay-layer.tsx),
// so its backdrop covers the whole window and not only a nested provider's box (a
// docs stage caught taps inside itself and let a tap beside it through). The card's
// frame placement is carried over by the frame's offset inside the layer, so it
// lands exactly where the frame would have put it, as wide as the frame lets it grow.
// A card opened inside such a card keeps the same frame (OverlayFrameContext), not
// the layer it now renders in. A card that cannot close stays in its frame's own
// outlet and scrolls with the content.
//
// Placement: the card prefers below its trigger, above it (`above`), or beside it at
// the leading or trailing side (`besideStart`, `besideEnd`), and resolves collisions
// against the visible band: the window's safe area less the app's declared chrome
// and the keyboard, on all four edges, every edge kept 8px inside it. Leading and
// trailing follow the app's layout direction, and the physical insets go out under
// the style keys React Native resolves in a right-to-left layout. At the phone form
// factor a card that offers a sheet (`sheetStyle`) and can close is a sheet on the
// bottom edge of the window instead, over the app's declared chrome.
//
// Tracking: while the backdrop is up the page under it takes no touches or wheel, but
// a keyboard or an app can still scroll it, and no layout event reports a scroll. An
// open card re-places on the layout events of its frame and window and on every
// scroll the kit hears (src/style/scroll-ancestry.tsx), reading where its trigger
// sits only then; under a scroller the kit cannot hear (React Native's own, used
// directly) it reads that each frame, the way an Android PopupWindow follows its
// anchor. A closed overlay holds no state and hears nothing.
//
// Focus: on the web an open card's controls keep their place in the tab order right
// after the trigger, a menu or option list closes on a Tab out of it (`dismissOnTab`),
// and focus the card held goes back to what opened it when it closes. On iOS and
// Android a card that can close (and is no combobox's popup) is modal to VoiceOver and
// TalkBack while open: its window's page is hidden from them, a card opened from it
// covers it in turn, the owner moves them into it at onCardMount, and they go back to
// the trigger on close.
//
// With no provider it degrades to the kit's pre-portal inline anchor (the
// caller's own absolute top:100% style, passed as `inlineStyle`), so an unhosted
// consumer still renders, just without the over-the-page escape, the backdrop or
// the screen-reader modality, exactly as the kit behaved before the portal layer.
//
// Width is the caller's concern: it already measures its trigger (onLayout) and
// passes the card's width/min-width via `cardStyle`. This helper owns only the
// placement, available height, the backdrop, and the card's surface material.
//
// Surface: an anchored card is a functional-layer overlay, so by default it
// renders through GlassSurface and takes the active material (Dark Factory's plain
// frost on the web, real Liquid Glass on iOS 26+, the frosted blur on Android and
// earlier iOS) whenever the theme's surface mode is glass. The OPTION-LIST MENUS ask
// for the DENSE layer with `dense`: a dropdown / select / autocomplete / row menu /
// split-button overflow menu is a card of content rows the user reads and picks
// from, and the functional layer's sheer tint let the page's own rows and rules read
// straight between them. The dense layer is the same material under the model's
// densest tint (glass-tint-dense), so the rows stay legible and the card still takes
// the material. Popovers, the command palette, and the calendar peek keep the
// functional layer. `opaque` remains for a consumer that wants the plain surface
// outright: the skin's own `popover` fill on a plain box, in glass mode exactly as in
// solid mode.

import { createContext, type ReactNode, type RefObject, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { I18nManager, View, Pressable, StyleSheet, type LayoutChangeEvent, type StyleProp, type ViewStyle, type ViewProps } from "react-native";
import { useOverlayHost, type OverlayHost } from "./portal.js";
import { overlayLayerOf, OverlayFrameContext, PortalInto } from "./overlay-layer.js";
import { GlassSurface } from "./glass-surface/glass-surface.js";
import { PlainSurface } from "./glass-surface/glass-surface.shared.js";
import { Entrance } from "./entrance.js";
import { EntranceReadinessContext } from "./entrance-readiness.js";
import { fitOverlayHeight, type OverlayBesideSide, type OverlaySide, type OverlayVerticalSide } from "./overlay-layout.js";
import { isRTL } from "./rtl.js";
import { useFormFactor } from "./responsive.js";
import { useTheme } from "./theme.js";
import { scrimFill } from "./scrim.js";
import { OverlayRowsContext, OverlayScrollContext, OverlayScrollView } from "./overlay-scroll.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";
import { useHardwareBack } from "./use-hardware-back.js";
import { FocusFrameContext, useFocusFrame } from "./focus-frame.js";
import { ScrollAncestryContext, subscribeDocumentScroll, useUnheardScroller } from "./scroll-ancestry.js";
import { useAnchoredCardFocus } from "./use-dialog-focus.js";
import { moveAccessibilityFocus } from "./accessibility-focus.js";

const OverlaySideContext = createContext<{ side: OverlaySide; centerX?: number; cardWidth?: number }>({ side: "below" });
/**
 * The side of its trigger an anchored card actually took once collisions were
 * resolved (`above`, `below`, or beside at the `start` or `end`), for a decoration
 * that points at the trigger. Read inside the card.
 */
export const useOverlaySide = () => useContext(OverlaySideContext).side;
/**
 * The resolved side plus where the trigger's center sits along the card (`centerX`,
 * measured from the card edge a decoration's `left` inset is measured from: the
 * physical left, or the start edge where React Native swaps `left` and `right` in a
 * right-to-left layout) and the card's width, for a decoration that aims at the trigger.
 */
export const useOverlayAnchor = () => useContext(OverlaySideContext);

// A transparent layer filling the outlet (the window's layer, for a card that can
// close): it catches a tap anywhere off the card and dismisses. Transparent (no
// fill): anchored menus do not dim the page.
const BACKDROP: ViewStyle = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 };

/**
 * The props of AnchoredOverlay. The defaults: below the trigger, by its leading edge,
 * 4 apart, in the app's layout direction, closable by an outside tap and Android's
 * back, the functional layer under glass, anchored at every form factor.
 */
export interface AnchoredOverlayProps {
  /** Whether the card is shown. */
  open: boolean;
  /** Called when a tap off the card should dismiss it. */
  onDismiss: () => void;
  /** Native accessibility escape for the owning overlay scope. */
  onAccessibilityEscape?: ViewProps["onAccessibilityEscape"];
  /** Ref to the trigger view the card is placed against. */
  triggerRef: RefObject<View | null>;
  /** Gap between the trigger and the card, on whichever side the card resolves to (default 4). */
  gap?: number;
  /** The floating card's contents. */
  children: ReactNode;
  /** Non-scrolling card decoration, such as an anchor arrow. */
  decoration?: ReactNode;
  /** Style for the card wrapper (the skin's card fill/border/shadow + width). */
  cardStyle?: StyleProp<ViewStyle>;
  /** The caller's inline absolute anchor (e.g. position:absolute, top:"100%"),
   *  used only in the no-host fallback. */
  inlineStyle?: StyleProp<ViewStyle>;
  /**
   * Whether an outside tap or Android's hardware back can actually dismiss the
   * card (default true). Pass false when dismissal is a no-op (a controlled
   * `open` with no change handler, e.g. a docs example pinned open), so the
   * full-bleed dismiss backdrop is skipped instead of silently swallowing every
   * tap under an overlay that can never close, and back is left to the page.
   */
  dismissable?: boolean;
  /**
   * The card's known width, when the caller fixes it. Enables horizontal
   * placement logic: the card is clamped inside the outlet's bounds (8px
   * inset), so a card anchored to a trigger near the outlet's right edge slides
   * left instead of overflowing. Omit it to anchor the card by its leading edge;
   * a card that then renders too wide for the room is pinned by its far edge, 8px
   * inside the outlet, instead (see placeOverlay).
   */
  cardWidth?: number;
  /** With `cardWidth`: center the card on the trigger (tooltip-style) instead
   *  of aligning to its left edge. Still clamped inside the outlet. */
  centered?: boolean;
  /**
   * Align the card's TRAILING edge with the trigger's trailing edge instead of
   * its leading edge (the default). Needs no `cardWidth`: the card is pinned by
   * an inset from the outlet's own edge. A card that renders too wide to fit that
   * way is pinned by its other edge, 8px inside the outlet, instead.
   */
  alignEnd?: boolean;
  /**
   * The layout direction the card's logical alignment follows: leading is the
   * physical left in a left-to-right layout and the physical right in a right-to-left
   * one, and `besideStart` / `besideEnd` mirror the same way. Defaults to the app's
   * layout direction (`I18nManager`); pass it only to override that.
   */
  rtl?: boolean;
  /**
   * Prefer placing the card ABOVE the trigger. It flips below when the band above
   * is too short and the band below has more room, and is otherwise capped to the
   * larger band; it never falls back to beside. Placement axis: `besideStart` >
   * `besideEnd` > `above` > below (the default).
   */
  above?: boolean;
  /**
   * Prefer placing the card BESIDE the trigger at its LEADING side (the left in a
   * left-to-right layout), top-aligned with it; then at its trailing side; and when
   * neither side has room, above or below it, centered on it. Needs the card's width:
   * `cardWidth`, or the width a content-sized card reports before it is revealed.
   */
  besideStart?: boolean;
  /**
   * Prefer placing the card BESIDE the trigger at its TRAILING side (the right in a
   * left-to-right layout), then its leading side, then above or below it as
   * `besideStart` does. For popovers anchored to small cells (a calendar day peek)
   * where below the trigger would cover the grid.
   */
  besideEnd?: boolean;
  /** @deprecated The old name of `besideEnd`, which it now means (trailing side first); it keeps working. */
  preferSide?: boolean;
  /**
   * Paint the card as an OPAQUE surface: the skin's own `popover` fill on a
   * plain box, with NO glass material, in glass mode exactly as in solid mode.
   * The kit's own option lists take the dense layer instead (`dense`); this stays
   * for a consumer that wants the plain surface outright. Not a per-component
   * glass prop and no hand-painted glass: it selects the kit's plain surface.
   */
  opaque?: boolean;
  /**
   * Paint the card on the DENSE layer of the glass model: the same material as
   * every anchored card, under the densest tint (`glass-tint-dense`), for the
   * anchored surfaces that are option lists (Dropdown, Select, Autocomplete,
   * RowMenu, SplitButton's overflow menu, the PhoneInput country list, and so the
   * AvatarMenu built on Dropdown). Those cards carry rows the user reads and picks
   * from, and under the functional layer's sheer tint the page behind them read
   * through between the rows; the dense tint keeps them legible while the card
   * still takes the material. Not a per-component glass prop and no hand-painted
   * glass: it selects the layer, and in solid mode it changes nothing. `opaque`
   * wins when both are passed.
   */
  dense?: boolean;
  /**
   * Fired once per opening after the card's children mount and its measured
   * placement is committed. `open` flipping true is not that moment on the hosted
   * path: there the card is held back until the trigger measurement lands, so a
   * caller that moves focus into its content (the WAI-ARIA menu pattern: focus
   * the first row on open) would otherwise focus a card that does not exist yet.
   * This fires on both paths, from an effect inside the card's own subtree.
   * Hosted cards also wait for fitting, so focusing a child cannot scroll the
   * page toward an uncapped, still-invisible card. A card that cannot close
   * (`dismissable` false: pinned open, a docs example) is content on the page that
   * nobody opened, so it never fires: nothing moves focus into it as the page loads.
   */
  onCardMount?: () => void;
  /**
   * The children own the card's scrolling: they mount exactly one OverlayScrollView
   * themselves (an option list with its own scroll handling), and the card does not
   * wrap them in one. The contract of the kit's option lists.
   */
  ownsScroll?: boolean;
  /**
   * The card is a menu or an option list: a Tab that takes keyboard focus out of the
   * card (or off its trigger anywhere but into the card) closes it, and focus goes on
   * in the page's order (the WAI-ARIA menu and listbox patterns). Its rows are its one
   * tab stop, so its scrollport takes none. Without it the card stays open, Tab moves
   * through and past it in that order, and an overflowing scrollport is a stop.
   */
  dismissOnTab?: boolean;
  /**
   * The card is a combobox's popup: its field keeps editing focus and must stay
   * reachable, so the card is not modal to VoiceOver and TalkBack. Every other card
   * that can close is modal to them while open (see the header).
   */
  combobox?: boolean;
  /**
   * The trigger control focus returns to when the card closes, where `triggerRef` is a
   * wrapper around it (TalkBack moves only to an accessibility element). Defaults to
   * `triggerRef`.
   */
  returnFocusRef?: RefObject<View | null>;
  /**
   * Present the card as a SHEET at the phone form factor: on the bottom edge of its
   * window (the keyboard's top while it is up), over the app's declared chrome as a modal
   * sheet covers a tab bar, across the window's safe width up to 640, over a dimming
   * scrim, wearing this style (the skin's sheet: its corners, padding, fill and any float
   * off the edges) in place of `cardStyle`, with no `decoration`; its content is padded
   * clear of the home indicator. Only a card that can close becomes a sheet; a card
   * pinned open stays anchored. Omit it to stay anchored at every form factor (menus and
   * option lists do, as HIG and Material 3 keep them).
   */
  sheetStyle?: StyleProp<ViewStyle>;
}

/**
 * The kit's anchored card: a floating card placed against a trigger (below it by
 * default, above it or beside it on request), fitted inside the window's visible band
 * and safe area, over a transparent backdrop that closes it on an outside tap, on the
 * window layer of the nearest OverlayProvider. It renders the card's surface (the
 * functional or dense glass layer, or a plain surface) and one scrollport for the
 * children, holds the card hidden until its placement is measured, and at the phone
 * form factor presents a card that offers a sheet as one. It never renders a trigger,
 * never dims the page (except behind a sheet), never sizes the card's width (the
 * caller's `cardStyle` does), and never moves focus into the card itself: the caller
 * does that at `onCardMount`. With no OverlayProvider it renders the card inline under
 * the trigger.
 */
export function AnchoredOverlay({
  open,
  onDismiss,
  onAccessibilityEscape,
  triggerRef,
  gap = 4,
  children,
  decoration,
  cardStyle,
  inlineStyle,
  dismissable = true,
  cardWidth,
  centered = false,
  above = false,
  besideStart = false,
  besideEnd = false,
  preferSide = false,
  alignEnd = false,
  rtl,
  opaque = false,
  dense = false,
  onCardMount,
  ownsScroll = false,
  dismissOnTab = false,
  combobox = false,
  returnFocusRef,
  sheetStyle,
}: AnchoredOverlayProps) {
  const host = useOverlayHost();
  // The frame the card is placed in: the nearest provider, or, inside a card that paints
  // in its window's layer, that card's own frame.
  const frame = useContext(OverlayFrameContext) ?? host;

  // Hardware back closes a card that can close, hosted or inline. The owner's escape
  // scope takes the request when it passes one (every kit consumer does), so a card
  // open inside another overlay closes before its parent; without one, back does what
  // an outside tap does.
  useHardwareBack(open && dismissable, onAccessibilityEscape ?? onDismiss);
  // Focus moves in only for an opening: a card pinned open is page content (see onCardMount).
  const opening = dismissable ? onCardMount : undefined;

  // No provider: render the card inline in place, exactly as the kit did before
  // the portal layer (absolute anchor under the trigger, no backdrop). Entrance
  // owns the absolute anchor position and holds the card until it is laid out.
  if (!host) {
    return open ? (
      <InlineAnchoredOverlay onAccessibilityEscape={onAccessibilityEscape} onDismiss={onDismiss} triggerRef={triggerRef} returnFocusRef={returnFocusRef} dismissable={dismissable} dismissOnTab={dismissOnTab} combobox={combobox} inlineStyle={inlineStyle} cardStyle={cardStyle} opaque={opaque} dense={dense} onCardMount={opening} ownsScroll={ownsScroll} decoration={decoration}>
        {children}
      </InlineAnchoredOverlay>
    ) : null;
  }

  // The hosted card's state, measurements and subscriptions exist only while it is
  // open: a closed overlay (a Board renders one per card) holds nothing and hears
  // nothing, and every opening starts from a clean placement.
  if (!open) return null;
  return (
    <HostedAnchoredOverlay
      host={host}
      frame={frame ?? host}
      onDismiss={onDismiss}
      onAccessibilityEscape={onAccessibilityEscape}
      triggerRef={triggerRef}
      gap={gap}
      cardStyle={cardStyle}
      dismissable={dismissable}
      cardWidth={cardWidth}
      centered={centered}
      above={above}
      besideStart={besideStart}
      besideEnd={besideEnd || preferSide}
      alignEnd={alignEnd}
      rtl={rtl ?? isRTL()}
      opaque={opaque}
      dense={dense}
      onCardMount={opening}
      ownsScroll={ownsScroll}
      dismissOnTab={dismissOnTab}
      modal={dismissable && !combobox}
      combobox={combobox}
      returnFocusRef={returnFocusRef}
      sheetStyle={sheetStyle}
      decoration={decoration}
    >
      {children}
    </HostedAnchoredOverlay>
  );
}

/**
 * Keyboard and screen-reader focus around an open card, on both paths. On the web: the
 * card's controls keep their place in the tab order right after the trigger, a menu or
 * list closes on a Tab out of it, and when the card closes the focus its closing
 * orphaned returns to the trigger (useAnchoredCardFocus, src/style/use-dialog-focus.ts).
 * Natively, a modal card sends VoiceOver and TalkBack back to the trigger when it
 * closes. `shown` is the instant the card is revealed and focusable.
 */
function useCardFocus({ shown, cardRef, triggerRef, returnFocusRef, dismissOnTab, onDismiss, modal, combobox }: {
  shown: boolean;
  cardRef: RefObject<View | null>;
  triggerRef: RefObject<View | null>;
  returnFocusRef?: RefObject<View | null>;
  dismissOnTab: boolean;
  onDismiss: () => void;
  modal: boolean;
  /** A combobox's field owns focus (refocusing it would reopen the list): no restore. */
  combobox: boolean;
}) {
  const returnTo = returnFocusRef ?? triggerRef;
  useAnchoredCardFocus({ shown, cardRef, triggerRef, returnRef: returnTo, onLeave: dismissOnTab ? onDismiss : undefined, restore: !combobox });
  // Whether the card was ever shown, and whether it was modal then, for the close below.
  const wasShown = useRef(false);
  const modalRef = useRef(modal);
  modalRef.current = modal;
  useIsomorphicLayoutEffect(() => {
    if (shown) wasShown.current = true;
  });
  useEffect(() => () => {
    if (wasShown.current && modalRef.current) moveAccessibilityFocus(returnTo.current);
  }, [returnTo]);
}

// The no-provider path: the card renders inline in place, exactly as the kit did before
// the portal layer (absolute anchor under the trigger, no backdrop), so it is already
// in the tab order after its trigger. Entrance owns the absolute anchor position.
function InlineAnchoredOverlay({ onAccessibilityEscape, onDismiss, triggerRef, returnFocusRef, dismissable, dismissOnTab, combobox, inlineStyle, cardStyle, opaque, dense, onCardMount, ownsScroll, decoration, children }: {
  onAccessibilityEscape?: ViewProps["onAccessibilityEscape"];
  onDismiss: () => void;
  triggerRef: RefObject<View | null>;
  returnFocusRef?: RefObject<View | null>;
  dismissable: boolean;
  dismissOnTab: boolean;
  combobox: boolean;
  inlineStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  opaque: boolean;
  dense: boolean;
  onCardMount?: () => void;
  ownsScroll: boolean;
  decoration?: ReactNode;
  children: ReactNode;
}) {
  const cardRef = useRef<View>(null);
  // No layer to hide a page in: an unhosted card is never modal.
  useCardFocus({ shown: true, cardRef, triggerRef, returnFocusRef, dismissOnTab: dismissOnTab && dismissable, onDismiss, modal: false, combobox });
  return (
    <Entrance ref={cardRef} style={inlineStyle}>
      <OverlayCard onAccessibilityEscape={onAccessibilityEscape} cardStyle={cardStyle} opaque={opaque} dense={dense} onMount={onCardMount} ownsScroll={ownsScroll} rows={dismissOnTab} decoration={decoration}>{children}</OverlayCard>
    </Entrance>
  );
}

// The floating card itself, shared by the hosted and inline paths so both report
// the same lifecycle. Its mount effect is the ONE instant at which the card's
// contents exist and placement is ready on either path. React attaches every
// descendant's ref before the effect, so callers can safely move focus here.
function OverlayCard({
  cardStyle,
  opaque,
  dense,
  onMount,
  children,
  decoration,
  ownsScroll,
  onLayout,
  onAccessibilityEscape,
  ready = true,
  rows = false,
}: {
  cardStyle?: StyleProp<ViewStyle>;
  opaque?: boolean;
  dense?: boolean;
  onMount?: () => void;
  children: ReactNode;
  decoration?: ReactNode;
  ownsScroll?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  onAccessibilityEscape?: ViewProps["onAccessibilityEscape"];
  ready?: boolean;
  /** The card's rows are its one tab stop (a menu or an option list): its port takes none. */
  rows?: boolean;
}) {
  // Latch the callback so the usual fresh-closure-per-render caller cannot re-arm
  // the effect; it must fire once per opening, not once per render.
  const mount = useRef(onMount);
  mount.current = onMount;
  const notified = useRef(false);
  const entranceReady = useContext(EntranceReadinessContext);
  useEffect(() => {
    // The owner's fitted placement and Entrance's own layout must both be
    // committed before focus enters the card. Ancestor readiness propagates
    // through nested entrances without replaying a notified opening.
    if (ready && entranceReady && !notified.current) {
      notified.current = true;
      mount.current?.();
    }
  }, [ready, entranceReady]);
  // An opaque card takes the kit's plain surface: one View wearing the skin's
  // style untouched, which is byte for byte what GlassSurface itself renders in
  // solid mode, so an option list looks and lays out the same under either
  // theming surface, and no glass is hand-painted anywhere.
  //
  // The card frames the scrollport's keyboard focus: the port sits flush inside the
  // card's clip, so the card draws the ring for it (src/style/focus-frame.tsx), for the
  // one it wraps here and for an owner's own (Autocomplete's, Command's). A menu's or an
  // option list's port takes no stop: its rows are the card's one (`rows`).
  const focusFrame = useFocusFrame();
  const content = (
    <FocusFrameContext.Provider value={focusFrame.target}>
      <OverlayRowsContext.Provider value={rows}>
        {ownsScroll ? children : <OverlayScrollView>{children}</OverlayScrollView>}
      </OverlayRowsContext.Provider>
    </FocusFrameContext.Provider>
  );
  const style = [cardStyle, focusFrame.ring()];
  if (opaque) return <PlainSurface style={style} onLayout={onLayout} onAccessibilityEscape={onAccessibilityEscape}>{decoration}{content}</PlainSurface>;
  return <GlassSurface layer={dense ? "dense" : "functional"} style={style} onLayout={onLayout} onAccessibilityEscape={onAccessibilityEscape}>{decoration}{content}</GlassSurface>;
}

interface HostedProps {
  onAccessibilityEscape?: ViewProps["onAccessibilityEscape"];
  /** The nearest provider: where a card that cannot close paints. */
  host: OverlayHost;
  /** The provider whose outlet the card is placed in (see AnchoredOverlay's header). */
  frame: OverlayHost;
  onDismiss: () => void;
  triggerRef: RefObject<View | null>;
  gap: number;
  cardStyle?: StyleProp<ViewStyle>;
  dismissable: boolean;
  cardWidth?: number;
  centered?: boolean;
  above: boolean;
  besideStart: boolean;
  besideEnd: boolean;
  alignEnd?: boolean;
  rtl: boolean;
  opaque?: boolean;
  dense?: boolean;
  onCardMount?: () => void;
  ownsScroll?: boolean;
  dismissOnTab: boolean;
  /** Modal to VoiceOver and TalkBack while open: it can close and is no combobox's popup. */
  modal: boolean;
  combobox: boolean;
  returnFocusRef?: RefObject<View | null>;
  sheetStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
  decoration?: ReactNode;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// The inset every card keeps from the edges of the visible band it is placed in.
const CLAMP_INSET = 8;
// A sheet's widest (Material 3's bottom-sheet cap, the kit's other sheets' too), and the
// band it leaves the page above it, so a tall sheet still reads as one over the page.
const SHEET_MAX_WIDTH = 640;
const SHEET_TOP_GAP = 48;
// The legacy scrim alpha for a theme without a `scrim` role (src/style/scrim.ts).
const SHEET_SCRIM_ALPHA = 0.32;

// Where a frame's edges sit inside the layer's outlet, each measured inward from the
// layer's own edge. All zero when the card paints in its frame's own outlet.
interface FrameOffset { left: number; top: number; right: number; bottom: number }
const IN_PLACE: FrameOffset = { left: 0, top: 0, right: 0, bottom: 0 };
// A frame-relative edge distance moved to the layer's edge; an unset edge stays unset.
const toLayer = (edge: number | undefined, offset: number) => (edge == null ? undefined : edge + offset);
// A skin's style length in points: a number, or nothing for anything else.
const lengthOf = (value: unknown) => (typeof value === "number" ? value : 0);

/** What placeOverlay reads besides the trigger's box. */
export interface PlaceOverlayOptions {
  /** The card's caller-fixed width, when it has one. */
  cardWidth?: number;
  /** The width a card without a fixed one rendered at, once its layout reports it. */
  measuredWidth?: number | null;
  /** With `cardWidth`: center the card on the trigger instead of aligning an edge. */
  centered?: boolean;
  /** Prefer beside the trigger at its leading side, then its trailing side. */
  besideStart?: boolean;
  /** Prefer beside the trigger at its trailing side, then its leading side. */
  besideEnd?: boolean;
  /** @deprecated The old name of `besideEnd`; it keeps working. */
  preferSide?: boolean;
  /** Align the card's trailing edge with the trigger's instead of its leading edge. */
  alignEnd?: boolean;
  /** The layout direction is right to left: leading is the physical right. */
  rtl?: boolean;
  /** The trigger-to-card gap. */
  gap: number;
  /** The outlet's width, once measured. */
  outletWidth: number | null;
  /** The visible band's left edge in the outlet (the window's safe area); default 0. */
  visibleLeft?: number;
  /** The visible band's right edge in the outlet; default the outlet's width. */
  visibleRight?: number;
}

/**
 * The card's outlet-relative position (pure, so the branch logic is testable). The
 * result is PHYSICAL: `left` and `right` are insets from the outlet's left and right
 * edges, and the hosted overlay hands them to the renderer under the keys it resolves
 * them by (React Native swaps `left` and `right` in a right-to-left layout). `rtl`
 * only selects the logical preferences: which physical side is leading.
 *
 * Every edge keeps 8px inside the visible band (`visibleLeft` to `visibleRight`, the
 * outlet less the window's unsafe edges).
 *
 * Beside (`besideStart`, `besideEnd`, or the old `preferSide`): the card is placed
 * beside the trigger, top-aligned, at the preferred side when it fits there, then at
 * the other side; `side` names the side it took. When neither fits, or before a card
 * of no fixed width has reported its width, it falls back to the vertical placement,
 * centered on the trigger.
 *
 * Above or below (the vertical side is fitOverlayHeight's): `top` is the below
 * placement's top edge, and the horizontal alignment is the card's leading edge on
 * the trigger's leading edge (default), its trailing edge on the trigger's (`alignEnd`),
 * or its center on the trigger's (`centered`).
 *
 * A card of known width (`cardWidth`) is clamped inside the band. A card without one is
 * kept inside the band by the width it rendered at (`measuredWidth`, which the hosted
 * overlay reads from the card's own layout before it reveals it): when anchoring it by
 * the trigger would cross the far edge, it is pinned by that far edge instead, and it
 * stays exactly where it was anchored whenever it fits. It is PINNED, not shifted by its
 * width: a content-sized card is as wide as the room its anchor leaves, so moving it
 * over by its measured width would give it more room, let it grow and move it again, a
 * frame at a time. Pinned by the far edge, it takes the width it wants in one layout,
 * and a wider card only confirms the pin. Without a measurement yet, it is placed as
 * anchored.
 */
export function placeOverlay(
  rect: Rect,
  opts: PlaceOverlayOptions,
): { left?: number; right?: number; top: number; side?: OverlayBesideSide } {
  const { cardWidth, measuredWidth, centered, preferSide, besideStart, besideEnd, alignEnd, rtl = false, gap, outletWidth } = opts;
  const outlet = outletWidth != null && outletWidth > 0 ? outletWidth : null;
  // The leftmost and rightmost a card's edges may sit, 8px inside the visible band.
  const lo = (opts.visibleLeft ?? 0) + CLAMP_INSET;
  const hi = (opts.visibleRight ?? outlet ?? Infinity) - CLAMP_INSET;
  const measured = measuredWidth != null && measuredWidth > 0 ? measuredWidth : null;
  const width = cardWidth ?? measured;
  const below = rect.y + rect.height + gap;

  const beside: OverlayBesideSide | null = besideStart ? "start" : besideEnd || preferSide ? "end" : null;
  if (beside && outlet != null && width != null) {
    for (const side of beside === "start" ? (["start", "end"] as const) : (["end", "start"] as const)) {
      // The trailing side is the physical right in a left-to-right layout.
      const right = (side === "end") !== rtl;
      const left = right ? rect.x + rect.width + gap : rect.x - gap - width;
      if (left >= lo && left + width <= hi) return { left, top: rect.y, side };
    }
  }

  // The card's trailing edge goes on the trigger's when `alignEnd`, its leading edge
  // otherwise; which physical edge that is flips with `rtl`.
  const pinRight = !!alignEnd !== rtl;

  if (cardWidth != null) {
    let x = centered || beside ? rect.x + rect.width / 2 - cardWidth / 2 : pinRight ? rect.x + rect.width - cardWidth : rect.x;
    x = Math.min(x, hi - cardWidth);
    return { left: Math.max(lo, x), top: below };
  }

  if (pinRight && outlet != null) {
    // Pinned by its right edge, expressed as an inset from the outlet's right edge.
    const right = Math.max(outlet - hi, outlet - (rect.x + rect.width));
    return measured != null && outlet - right - measured < lo ? { left: lo, top: below } : { right, top: below };
  }
  // Pinned by its left edge (or, with the outlet not measured yet, the leading anchor
  // rather than a guessed inset the card would then jump out of).
  const left = Math.max(lo, rect.x);
  return measured != null && left + measured > hi && outlet != null ? { right: outlet - hi, top: below } : { left, top: below };
}

// Whether the renderer swaps the `left` and `right` style keys in a right-to-left
// layout: React Native does by default (they then mean start and end), React Native
// Web does not (its I18nManager reports no such constant). placeOverlay's insets are
// physical, so where the renderer swaps, a physical left inset goes out under `right`.
function swapsLeftAndRight(): boolean {
  const constants = I18nManager.getConstants() as { isRTL: boolean; doLeftAndRightSwapInRTL?: boolean };
  return !!constants.doLeftAndRightSwapInRTL && constants.isRTL;
}

function HostedAnchoredOverlay({ host, frame, onDismiss, onAccessibilityEscape, triggerRef, gap, cardStyle, dismissable, cardWidth, centered, above, besideStart, besideEnd, alignEnd, rtl, opaque, dense, onCardMount, ownsScroll, dismissOnTab, modal, combobox, returnFocusRef, sheetStyle, children, decoration }: HostedProps) {
  // A card that offers a sheet and can close is one at the phone form factor (the
  // owner's AO-6 decision; the window read is bucket-granular, and only while open).
  const sheet = useFormFactor() === "phone" && sheetStyle != null && dismissable;
  const { tokens } = useTheme();
  // The outlet the card paints in: its window's layer when an outside tap can close
  // it, so the backdrop spans the window; otherwise its nearest provider's (see the
  // header). `inPlace` when that is the frame's own outlet.
  const layer = dismissable ? overlayLayerOf(frame) : host;
  const inPlace = layer === frame;
  const [rect, setRect] = useState<Rect | null>(null);
  // Where the frame sits in the layer, measured with the trigger.
  const [frameOffset, setFrameOffset] = useState<FrameOffset>(IN_PLACE);
  // The outlet's width, captured alongside the trigger measure.
  const [outletWidth, setOutletWidth] = useState<number | null>(null);
  // The outlet's height and the visible band (the window's safe area less declared
  // chrome and the keyboard) on all four edges, in the outlet's coordinates; its
  // horizontal edges are cut to the frame's box.
  const [outlet, setOutlet] = useState<{ height: number; visibleTop: number; visibleBottom: number; visibleLeft: number; visibleRight: number } | null>(null);
  const [layoutRevision, setLayoutRevision] = useState(0);
  // A sheet's window: the layer's box cut at the keyboard, and its safe area, in the
  // coordinates of the layer the sheet paints in (null for a host that cannot say, whose
  // sheet stands in the band instead).
  const [sheetWindow, setSheetWindow] = useState<{ window: Rect; safe: Rect } | null>(null);
  // `cap` is the height cap the card was wearing when it reported `card`; the
  // readiness gate below compares it with the cap the fit now applies.
  const [sizes, setSizes] = useState<{ content: number | null; viewport: number | null; card: number | null; width: number | null; cap: number | null }>({ content: null, viewport: null, card: null, width: null, cap: null });
  // The vertical side the card is fitted to first: the preferred one.
  const lastSide = useRef<OverlayVerticalSide>(above ? "above" : "below");
  const appliedCap = useRef<number | null>(null);
  const revealed = useRef(false);
  const report = useMemo(() => ({
    contentHeight: (content: number) => setSizes((previous) => previous.content === content ? previous : { ...previous, content }),
    viewportHeight: (viewport: number) => setSizes((previous) => previous.viewport === viewport ? previous : { ...previous, viewport }),
  }), []);
  const onCardLayout = useCallback((event: LayoutChangeEvent) => {
    const { height: card, width: cardWidth } = event.nativeEvent.layout;
    const cap = appliedCap.current;
    setSizes((previous) => previous.card === card && previous.width === cardWidth && previous.cap === cap ? previous : { ...previous, card, width: cardWidth, cap });
  }, []);

  // A layout event of the frame or anything around it (a resize or rotation, a changed
  // header or safe area, the keyboard) re-measures the placement. The window layer's
  // outlet fills the window, so its layout event is the window resizing.
  useEffect(() => frame.subscribeLayout?.(() => setLayoutRevision((revision) => revision + 1)), [frame]);
  // The scrolls that can move the trigger under the card (src/style/scroll-ancestry.tsx).
  const ancestry = useContext(ScrollAncestryContext);
  const unheard = useUnheardScroller();

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    let landed = false;
    let raf = 0;
    // The trigger's box, the outlet's box and the visible band (and the layer's
    // outlet, when the card paints there) are independent reads, so they are issued
    // together and joined, not chained:
    // react-native-web answers every measureInWindow on a macrotask of its own,
    // so a chain cost three task hops before the card could mount, and Fabric
    // answers synchronously, so from a layout effect the rect lands inside the
    // same commit as the opening render and the card mounts in that frame.
    // Measuring in the layout phase is sound on both: the DOM read forces layout
    // and Fabric's shadow tree is laid out before layout effects run.
    //
    // Bounded retry: during initial page mount (an overlay that is open on its
    // very first render, e.g. a docs example pinned open) the measure callbacks
    // can silently not complete, or report a zero-size box for a not-yet-laid-out
    // trigger, and a one-shot leaves the card unmounted forever. Re-attempt on a
    // later frame until a real measurement lands, capped so a pathological case
    // (trigger gone while open) cannot spin indefinitely. An attempt whose
    // answers are still in flight is given a few frames before another is
    // issued: on the web the answers are macrotasks that a busy main thread can
    // hold past a frame, and re-issuing every frame meanwhile only piles up
    // duplicate reads. The first landing wins, so a late answer from an earlier
    // attempt never re-places the card.
    let frames = 0;
    let issuedAt = 0;
    let unusable = false;
    const MAX_FRAMES = 60;
    const PATIENCE = 3;
    let stopTracking: (() => void) | undefined;
    const attempt = () => {
      if (cancelled || landed) return;
      issuedAt = frames;
      unusable = false;
      const trigger = triggerRef.current;
      if (trigger) {
        let triggerBox: Rect | null = null;
        let outletBox: Rect | null = null;
        let layerBox: Rect | null = null;
        let band: Rect | null = null;
        // A sheet stands in its layer's window rather than its frame's band.
        const wantsWindow = sheet && layer.measureWindowBounds != null;
        let windowBounds: { window: Rect; safe: Rect } | null = null;
        const settle = () => {
          if (cancelled || landed || !triggerBox || !outletBox || (!inPlace && !layerBox) || (wantsWindow && !windowBounds)) return;
          // A host without a visible band is bounded by its outlet.
          const visible = frame.measureVisibleBounds ? band : outletBox;
          if (!visible) return;
          // A zero box is a trigger that has not been laid out yet: try again next frame.
          if (triggerBox.width === 0 && triggerBox.height === 0) { unusable = true; return; }
          landed = true;
          // measureInWindow on BOTH the trigger and the outlet, then subtract, gives
          // the trigger's box relative to the outlet, correct for a screen-level
          // host and a stage-scoped one alike, with scroll offsets cancelling out.
          setRect({ x: triggerBox.x - outletBox.x, y: triggerBox.y - outletBox.y, width: triggerBox.width, height: triggerBox.height });
          setOutletWidth(outletBox.width);
          // Vertically the band alone caps the card (a content-sized frame's card may
          // run past the frame's own bottom); horizontally the frame's edges clamp it
          // too, so the band is cut to the frame's box there.
          setOutlet({
            height: outletBox.height,
            visibleTop: visible.y - outletBox.y,
            visibleBottom: visible.y + visible.height - outletBox.y,
            visibleLeft: Math.max(0, visible.x - outletBox.x),
            visibleRight: Math.min(outletBox.width, visible.x + visible.width - outletBox.x),
          });
          // Everything above is in the frame's coordinates, as if the card painted in
          // the frame; the offset moves the result to the layer the card paints in
          // (only measured when that is another outlet).
          setFrameOffset(!layerBox ? IN_PLACE : {
            left: outletBox.x - layerBox.x,
            top: outletBox.y - layerBox.y,
            right: layerBox.x + layerBox.width - (outletBox.x + outletBox.width),
            bottom: layerBox.y + layerBox.height - (outletBox.y + outletBox.height),
          });
          const paint = layerBox ?? outletBox;
          const inPaint = (box: Rect): Rect => ({ x: box.x - paint.x, y: box.y - paint.y, width: box.width, height: box.height });
          setSheetWindow(windowBounds ? { window: inPaint(windowBounds.window), safe: inPaint(windowBounds.safe) } : null);
          stopTracking = track(trigger, placed(triggerBox, outletBox, layerBox));
        };
        trigger.measureInWindow((x, y, w, h) => {
          triggerBox = { x, y, width: w, height: h };
          settle();
        });
        frame.measureOutlet((x, y, w, h) => {
          outletBox = { x, y, width: w, height: h };
          settle();
        });
        if (wantsWindow) layer.measureWindowBounds!((window, safe) => {
          windowBounds = { window, safe };
          settle();
        });
        frame.measureVisibleBounds?.((bounds) => {
          band = bounds;
          settle();
        });
        if (!inPlace) layer.measureOutlet((x, y, w, h) => {
          layerBox = { x, y, width: w, height: h };
          settle();
        });
      } else unusable = true;
      if (!landed) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      if (cancelled || landed) return;
      frames += 1;
      if (frames >= MAX_FRAMES) return;
      if (unusable || frames - issuedAt >= PATIENCE) attempt();
      else raf = requestAnimationFrame(tick);
    };
    // Where the trigger and the frame sit relative to the outlet the card paints in, and
    // the trigger's size: what the placement above was computed from.
    const placed = (triggerBox: Rect, outletBox: Rect, layerBox: Rect | null) => {
      const paint = layerBox ?? outletBox;
      return [triggerBox.x - paint.x, triggerBox.y - paint.y, triggerBox.width, triggerBox.height, outletBox.x - paint.x, outletBox.y - paint.y];
    };
    // After the card lands it follows its trigger on the events that can move it: a
    // scroll the kit hears (any scroll on the web, a kit scroller's natively) is read
    // once, on the next frame, and re-places the card (a new layout revision re-runs
    // this effect) only if the trigger or the frame moved. Layout events re-run it
    // directly (above). Nothing reads layout while nothing happens, except under a
    // scroller the kit cannot hear (React Native's own, used directly), where the card
    // reads where its trigger sits each frame, the way an Android PopupWindow follows
    // its anchor. React only commits when something moved.
    const track = (trigger: View, at: number[]) => {
      let scheduled = false;
      const check = () => {
        if (cancelled || scheduled) return;
        scheduled = true;
        raf = requestAnimationFrame(() => {
          scheduled = false;
          if (cancelled) return;
          let triggerBox: Rect | null = null;
          let outletBox: Rect | null = null;
          let layerBox: Rect | null = null;
          const compare = () => {
            if (cancelled || !triggerBox || !outletBox || (!inPlace && !layerBox)) return;
            const now = placed(triggerBox, outletBox, layerBox);
            if (now.some((value, index) => Math.abs(value - at[index]!) > 0.5)) setLayoutRevision((revision) => revision + 1);
            else if (unheard) check();
          };
          trigger.measureInWindow((x, y, w, h) => { triggerBox = { x, y, width: w, height: h }; compare(); });
          frame.measureOutlet((x, y, w, h) => { outletBox = { x, y, width: w, height: h }; compare(); });
          if (!inPlace) layer.measureOutlet((x, y, w, h) => { layerBox = { x, y, width: w, height: h }; compare(); });
        });
      };
      const stops = [subscribeDocumentScroll(check), ancestry?.subscribe(check)];
      if (unheard) check();
      return () => stops.forEach((stop) => stop?.());
    };
    attempt();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopTracking?.();
    };
  }, [frame, layer, inPlace, triggerRef, gap, layoutRevision, ancestry, unheard, sheet]);

  // The visible band's width, and the room a card has inside it once its 8px insets
  // are kept on both sides.
  const bandWidth = outlet ? Math.max(0, outlet.visibleRight - outlet.visibleLeft) : null;
  const room = bandWidth != null ? Math.max(0, bandWidth - 2 * CLAMP_INSET) : null;
  // A width-aware card never renders wider than that room: on a phone-width screen or
  // docs stage, the card is clamped to it and placeOverlay pins it at the inset. The
  // minWidth in the override also retires any trigger-derived minWidth in cardStyle,
  // which would be unsatisfiable there. A content-sized card is capped to the same
  // room (the wrapper's maxWidth below) and so is its trigger-derived minWidth, which
  // would otherwise beat that cap when the trigger nearly spans the band.
  const flatCardStyle = StyleSheet.flatten(cardStyle);
  const styleMinWidth = typeof flatCardStyle?.minWidth === "number" ? flatCardStyle.minWidth : 0;
  const requestedWidth = cardWidth == null ? undefined : Math.max(cardWidth, styleMinWidth);
  const fittedCardWidth = requestedWidth != null && room != null ? Math.min(requestedWidth, room) : requestedWidth;
  const fittedCardStyle =
    fittedCardWidth != null
      ? fittedCardWidth !== cardWidth ? [cardStyle, { width: fittedCardWidth, minWidth: fittedCardWidth }] : cardStyle
      : room != null && styleMinWidth > room ? [cardStyle, { minWidth: room }] : cardStyle;

  const chrome = sizes.card !== null && sizes.viewport !== null ? Math.max(0, sizes.card - sizes.viewport) : null;
  const reported = sizes.content !== null && chrome !== null;
  const skinMaxHeight = typeof flatCardStyle?.maxHeight === "number" ? flatCardStyle.maxHeight : Infinity;
  const desiredHeight = reported ? Math.min(sizes.content! + chrome!, skinMaxHeight) : null;
  // A card with no caller-fixed width is kept inside the band by the width it
  // rendered at. The reveal below already waits for the card's own layout, which
  // reports that width together with its height, so the card is never shown at a
  // placement it is about to leave.
  const measuredWidth = fittedCardWidth == null ? sizes.width : null;
  const horizontal = rect && outlet
    ? placeOverlay(rect, { cardWidth: fittedCardWidth, measuredWidth, centered, besideStart, besideEnd, alignEnd, rtl, gap, outletWidth, visibleLeft: outlet.visibleLeft, visibleRight: outlet.visibleRight })
    : null;
  const renderedCardWidth = sizes.width ?? fittedCardWidth;
  const cardLeft = horizontal?.left ?? (horizontal?.right != null && outletWidth != null && renderedCardWidth != null ? outletWidth - horizontal.right - renderedCardWidth : undefined);
  // Where the renderer swaps left and right, a decoration's `left` inset is measured
  // from the card's right edge, so the trigger's center is handed over from that edge.
  const swap = swapsLeftAndRight();
  const triggerCenter = rect ? rect.x + rect.width / 2 : undefined;
  const anchorCenter = triggerCenter == null || cardLeft == null ? undefined
    : swap ? (renderedCardWidth == null ? undefined : cardLeft + renderedCardWidth - triggerCenter) : triggerCenter - cardLeft;
  // Host bounds are measured in one native window and inherited through
  // content-sized providers; the card does not guess keyboard/screen offsets.
  const fit = rect && outlet ? fitOverlayHeight({ triggerTop: rect.y, triggerHeight: rect.height, outletHeight: outlet.height, visibleTop: outlet.visibleTop, visibleBottom: outlet.visibleBottom, desiredHeight, currentSide: lastSide.current, gap, beside: horizontal?.side }) : null;
  const fittedSide = fit?.side;
  const anchorGeometry = useMemo(() => ({ side: fittedSide ?? "below", centerX: anchorCenter, cardWidth: renderedCardWidth ?? undefined }), [fittedSide, anchorCenter, renderedCardWidth]);
  // A sheet stands in its layer's window, in the layer's coordinates: on the window's
  // bottom edge (the keyboard's top while it is up) over the app's declared chrome, as a
  // modal sheet covers a tab bar, across the window's safe width (centered, up to
  // SHEET_MAX_WIDTH), rising at most to SHEET_TOP_GAP below the safe area's top. Its fill
  // runs to that edge (less the skin's own bottom margin, a detached sheet's float), and
  // the part of it below the safe area (the home indicator, the gesture bar) pads its
  // content clear. A host that cannot measure its window stands it in the band.
  const paintWidth = outletWidth != null ? frameOffset.left + outletWidth + frameOffset.right : null;
  const paintHeight = outlet ? frameOffset.top + outlet.height + frameOffset.bottom : null;
  const band: Rect | null = outlet ? { x: outlet.visibleLeft + frameOffset.left, y: outlet.visibleTop + frameOffset.top, width: Math.max(0, outlet.visibleRight - outlet.visibleLeft), height: Math.max(0, outlet.visibleBottom - outlet.visibleTop) } : null;
  const stand = sheet ? sheetWindow ?? (band ? { window: band, safe: band } : null) : null;
  const flatSheet = sheet ? StyleSheet.flatten(sheetStyle) : undefined;
  const sheetMargin = lengthOf(flatSheet?.marginBottom ?? flatSheet?.marginVertical ?? flatSheet?.margin);
  const sheetPadding = lengthOf(flatSheet?.paddingBottom ?? flatSheet?.paddingVertical ?? flatSheet?.padding);
  const sheetEdge = stand ? stand.window.y + stand.window.height : null;
  const sheetSide = stand ? Math.max(0, (stand.safe.width - SHEET_MAX_WIDTH) / 2) : 0;
  const sheetCap = stand && sheetEdge != null ? Math.max(0, sheetEdge - sheetMargin - stand.safe.y - SHEET_TOP_GAP) : null;
  const sheetInset = stand && sheetEdge != null ? Math.max(0, sheetEdge - sheetMargin - (stand.safe.y + stand.safe.height)) : 0;
  const cap = sheet ? sheetCap : fit ? Math.min(fit.maxHeight, skinMaxHeight) : null;
  // The card mounts under the cap of the side it is first fitted to, and its
  // reports can move the fit to the other side with a different cap (a list
  // opened near the bottom of the screen flips above), after which the card
  // lays out again at another height. Readiness waits for that second layout
  // when the new cap is bound to change the card's height (the card stands
  // taller than the new cap, or it was standing at the old cap with content
  // that wants the room the new one gives), so the material never starts
  // growing toward a size and edge the card is about to leave. A cap change
  // that cannot move the card reveals at once, so nothing waits for a layout
  // that will never come. Once revealed, an opening stays ready: a filter that
  // flips the side mid-interaction must never hide the card again.
  const cappedBefore = sizes.cap !== null && sizes.card !== null && Math.abs(sizes.card - sizes.cap) <= 0.5;
  const willShrink = cap !== null && sizes.card !== null && sizes.card > cap + 0.5;
  const willGrow = cappedBefore && cap !== null && cap > sizes.cap! + 0.5 && desiredHeight !== null && desiredHeight > sizes.cap! + 0.5;
  const settled = sizes.cap === cap || !(willShrink || willGrow);
  const measured = reported && (revealed.current || settled);
  useIsomorphicLayoutEffect(() => {
    appliedCap.current = cap;
    if (measured) revealed.current = true;
  });
  useEffect(() => {
    // Only a vertical side is remembered: it keeps a list that still fits on its side
    // while a filter shortens it.
    if (measured && (fittedSide === "above" || fittedSide === "below")) lastSide.current = fittedSide;
  }, [measured, fittedSide]);
  const cappedStyle = sheet ? [sheetStyle, sheetInset > 0 ? { maxHeight: cap!, paddingBottom: sheetPadding + sheetInset } : { maxHeight: cap! }]
    : fit ? [fittedCardStyle, { maxHeight: cap! }] : fittedCardStyle;

  // A card that can close is modal to VoiceOver and TalkBack while it is shown (the
  // owner's AO-2 decision, as HIG treats a popover): it holds its window layer's page
  // hidden, a card opened from it covers it in turn, and the topmost one is the view
  // VoiceOver keeps to. The consumer moves the screen reader into it at onCardMount;
  // the trigger takes it back on close (useCardFocus). The web keeps the page.
  const cardRef = useRef<View>(null);
  const modalId = useId();
  const shown = rect != null && horizontal != null && fit != null && measured;
  const holdsModal = modal && shown;
  useEffect(() => (holdsModal ? layer.holdModal?.(modalId) : undefined), [holdsModal, layer, modalId]);
  const subscribeModal = useCallback((listener: () => void) => layer.subscribeModal?.(listener) ?? (() => {}), [layer]);
  const topModal = useSyncExternalStore(subscribeModal, () => layer.topModal?.() ?? null, () => null);
  useCardFocus({ shown, cardRef, triggerRef, returnFocusRef, dismissOnTab: dismissOnTab && dismissable, onDismiss, modal, combobox });
  // In the frame's own outlet a card anchored by one edge may grow to the frame's far
  // edge; in the layer's outlet that room is the layer's, so it is handed the frame's.
  // Either way it never grows past the band's room.
  const anchorEdge = horizontal?.left ?? horizontal?.right;
  const frameRoom = !inPlace && anchorEdge != null && outletWidth != null && outletWidth > 0 ? outletWidth - anchorEdge : undefined;
  const maxWidth = frameRoom != null && room != null ? Math.min(frameRoom, room) : frameRoom ?? room ?? undefined;
  // The physical insets, moved to the layer, under the keys the renderer resolves. A
  // sheet stands where its window puts it (above); a card sits where placeOverlay and
  // the fit put it.
  const left = sheet ? (stand ? stand.safe.x + sheetSide : undefined)
    : horizontal ? toLayer(horizontal.left, frameOffset.left) : undefined;
  const right = sheet ? (stand && paintWidth != null ? paintWidth - (stand.safe.x + stand.safe.width) + sheetSide : undefined)
    : horizontal ? toLayer(horizontal.right, frameOffset.right) : undefined;
  const top = sheet ? undefined : fit ? toLayer(fit.top, frameOffset.top) : undefined;
  const bottom = sheet ? (sheetEdge != null && paintHeight != null ? paintHeight - sheetEdge : undefined)
    : fit ? toLayer(fit.bottom, frameOffset.bottom) : undefined;

  return (
    <PortalInto host={layer}>
      {/* A card opened from inside this one is placed by the same frame, not by the
          layer this one renders in (which would clamp it to the window and drop the
          frame's insets). Only needed when those differ. */}
      <OverlayFrameContext.Provider value={inPlace ? null : frame}>
        {/* The dismiss backdrop only earns its keep when a tap on it can close the
            card; a non-dismissable overlay renders without it so the page under an
            always-open card stays interactive. */}
        {dismissable ? <Pressable accessible={false} focusable={false} tabIndex={-1} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden aria-hidden style={sheet ? [BACKDROP, { backgroundColor: scrimFill(tokens, SHEET_SCRIM_ALPHA) }] : BACKDROP} onPress={onDismiss} /> : null}
        {/* Hold the card until the first measurement lands, so it never flashes at
            (0,0). The backdrop above is transparent, so a frame before the card
            shows nothing. */}
        {rect && horizontal && fit ? (
          <OverlaySideContext.Provider value={anchorGeometry}>
            <OverlayScrollContext.Provider value={report}>
              <Entrance
                ref={cardRef}
                ready={measured}
                accessibilityViewIsModal={holdsModal && topModal === modalId}
                obscured={holdsModal && topModal != null && topModal !== modalId}
                style={{ position: "absolute", left: swap ? right : left, right: swap ? left : right, top, bottom, maxWidth: sheet ? undefined : maxWidth }}
              >
                <OverlayCard onAccessibilityEscape={onAccessibilityEscape} cardStyle={cappedStyle} opaque={opaque} dense={dense} onMount={onCardMount} ownsScroll={ownsScroll} rows={dismissOnTab} onLayout={onCardLayout} ready={measured} decoration={sheet ? null : decoration}>{children}</OverlayCard>
              </Entrance>
            </OverlayScrollContext.Provider>
          </OverlaySideContext.Provider>
        ) : null}
      </OverlayFrameContext.Provider>
    </PortalInto>
  );
}
