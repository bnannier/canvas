// The kit's ScrollView primitive: React Native's own, with the keyboard focus ring themed
// exactly as the kit's Pressable and TextInput theme theirs (src/style/pressable.tsx,
// src/style/text.tsx). On the web a scroller with nothing focusable inside it is a
// keyboard stop of its own (Chromium and Firefox make an overflowing scroll container
// focusable), and the browser draws its ring on it; this gives that ring the palette's
// `ring` colour, 2 px off the scroller. The ring goes first in the style list, so a
// scroller that hands its ring to the frame around it (FOCUS_RESET, src/style/focus-frame.tsx)
// still wins. As for Pressable, Chromium paints its automatic ring in that colour, and
// Firefox and Safari keep their own unless the CSS hand-off's `:focus-visible` rule is
// loaded. Natively the outline keys draw nothing without a width.

import { forwardRef, useMemo } from "react";
import { ScrollView as RNScrollView, type ScrollViewProps } from "react-native";
import { useFocusRingStyle } from "./pressable.js";

/** The instance a ScrollView ref receives: React Native's own, with its scroll methods. */
export type ScrollView = RNScrollView;

export const ScrollView = forwardRef<RNScrollView, ScrollViewProps>(function ScrollView({ style, ...rest }, ref) {
  const ring = useFocusRingStyle();
  // The ring goes first in the list so a scroller's own outline style wins.
  const themed = useMemo(() => [ring, style], [ring, style]);
  return <RNScrollView ref={ref} {...rest} style={themed} />;
});
