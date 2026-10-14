// Entrance holds an overlay's card until its owner is ready to show it (a hosted
// card's fitted placement, see AnchoredOverlay), so a menu never flashes at the wrong
// place and focus never enters a card whose geometry has not committed. While held the
// card is in the tree, laid out and measurable, and its controls stay mounted, but it is
// invisible, takes no touch or click, and is hidden from VoiceOver, TalkBack and the
// web's accessibility tree; its readiness context tells the cards and focus entries
// inside it to wait. It does not take the card's controls out of the web's Tab order:
// no keyboard path reaches them while held, because the owner installs its Tab bridge
// and moves focus in only once the card is shown, a hosted card sits after the page in
// its outlet, and the hold ends as soon as the placement is measured (one or two
// frames). Overlays unmount on close, so there is nothing to hold on the way out.
// There is no motion, and so nothing for Reduce Motion to remove: the card appears in
// place the moment it is ready.

import { type ReactNode, forwardRef, useContext } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { EntranceReadinessContext } from "./entrance-readiness.js";

/** The props of Entrance, the readiness hold an anchored card's owner applies to it. */
export interface EntranceProps {
  /**
   * Whether the owner is ready to show the card (AnchoredOverlay: its placement is
   * measured). Defaults to true, a pass-through. While false, or while an enclosing
   * Entrance holds, the card is held: invisible, untouchable, hidden from VoiceOver,
   * TalkBack and the web's accessibility tree, and its descendants read their readiness
   * as false, so focus waits. Its controls stay mounted, and on the web in the Tab
   * order, so keep a hold to the frame or two a placement takes. It stays held for as
   * long as this stays false, so the owner must release it. True shows it in place,
   * with no motion.
   */
  ready?: boolean;
  /**
   * The wrapper's layout and position only (an anchored card's absolute left, top and
   * cap): never a restyle, since the card inside paints itself. Typed as a full ViewStyle
   * until a major, as the kit's owners pass position keys LayoutStyle omits.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Natively, VoiceOver ignores the views beside this one while it is set: the topmost
   * modal card in an overlay outlet, over the cards opened before it. Dropped on the web.
   */
  accessibilityViewIsModal?: boolean;
  /**
   * Natively, hidden from VoiceOver and TalkBack while set, and still visible and
   * touchable: a card covered by a modal card opened from it. Dropped on the web.
   */
  obscured?: boolean;
  /** The card the hold shows or hides. */
  children: ReactNode;
}

// Invisible and untouchable while held. Not display: the card must lay out (and report its
// size to the owner's fit) while it is hidden. Not opacity either: the card is moved out of
// the window, upward, where no scroller counts it as overflow, at full opacity. Liquid Glass
// does not survive a hold at opacity 0 on iOS: expo-glass-effect installs no glass under an
// ancestor that transparent and installs it later, once the card shows, and in an anchored
// card UIKit never realized that late glass (an option list's or a menu's dense glass drew no
// blur, the page behind it sharp through its fill). Held out of view at full opacity, the
// glass installs as the card first lays out, as every glass in the page does. pointerEvents
// rides in the style, which React Native reads natively and react-native-web without its
// deprecation warning for the prop.
const HELD_OFFSET = -100000;
const HELD: ViewStyle = { transform: [{ translateY: HELD_OFFSET }], pointerEvents: "none" };

/**
 * The readiness hold for an anchored card: renders `children` in one View that is
 * invisible, untouchable and hidden from assistive technology until `ready` (and every
 * enclosing Entrance's readiness, across a portal too) is true, then shows it in place
 * with no motion. While held the card still lays out and reports its size, and its
 * controls stay mounted; its owner moves focus in only at release. Kit internals, behind
 * every anchored card (Popover, Dropdown, Select, Autocomplete and the rest).
 */
export const Entrance = forwardRef<View, EntranceProps>(function Entrance({ ready = true, style, accessibilityViewIsModal, obscured = false, children }, ref) {
  // An unready ancestor holds this card too. Within one tree its own hold already hides
  // the card, but a hosted card renders in the outlet, outside its logical ancestor's
  // view, and must not show (or reach assistive technology) before that ancestor does.
  const inheritedReadiness = useContext(EntranceReadinessContext);
  const held = !ready || !inheritedReadiness;
  const hidden = held || obscured;
  return (
    <EntranceReadinessContext.Provider value={!held}>
      <View
        ref={ref}
        accessibilityViewIsModal={accessibilityViewIsModal}
        accessibilityElementsHidden={hidden}
        importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
        // Only while held: React Native lets a defined aria-hidden overwrite
        // accessibilityElementsHidden, so a false one would undo `obscured` on iOS.
        aria-hidden={held || undefined}
        style={[style, held ? HELD : null]}
      >
        {children}
      </View>
    </EntranceReadinessContext.Provider>
  );
});
