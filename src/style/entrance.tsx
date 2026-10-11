// Entrance holds an overlay's card until its owner is ready to show it (a hosted
// card's fitted placement, see AnchoredOverlay). While held the card is in the
// tree, laid out and measurable, but invisible and inert, so a menu never flashes
// at the wrong place and focus never lands on a card whose geometry has not
// committed. Overlays unmount on close, so there is nothing to hold on the way
// out. There is no motion: the card appears in place the moment it is ready.

import { type ReactNode, forwardRef, useContext } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { EntranceReadinessContext } from "./entrance-readiness.js";

export interface EntranceProps {
  /** Hold visibility until the owner has measured its final placement. */
  ready?: boolean;
  /** Layout/position for the wrapper (a menu's absolute left/top; a dialog's width caps). */
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
  children: ReactNode;
}

// Invisible and untouchable while held. Opacity, not display: the card must lay out
// (and report its size to the owner's fit) while it is hidden. pointerEvents rides in
// the style, which React Native reads natively and react-native-web without its
// deprecation warning for the prop.
const HELD: ViewStyle = { opacity: 0, pointerEvents: "none" };

export const Entrance = forwardRef<View, EntranceProps>(function Entrance({ ready = true, style, accessibilityViewIsModal, obscured = false, children }, ref) {
  const inheritedReadiness = useContext(EntranceReadinessContext);
  const held = !ready;
  const hidden = held || obscured;
  return (
    <EntranceReadinessContext.Provider value={inheritedReadiness && !held}>
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
