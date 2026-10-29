import { useEffect, useId, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Dimensions, type NativeSyntheticEvent, type TextLayoutEventData, type View as NativeView } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { Typography, View, useTheme, type FontFaces, type FontWeightKey } from "@nannier/canvas";
import { GRADIENT_TEXT, baselineOffset, heroType } from "./library-hero-look";

// A brand illustration: one word in the display role filled by the brand artwork's
// accent-to-cyan-to-mint sweep, the v4 hand-off's `background-clip: text` headline word
// (decision P5-G1, the `v4-library-hero` card). React Native has no text clip, so the word
// is drawn twice: a kit Typography in the display role sets the line box and the width, held
// invisible, and a react-native-svg text over it paints the glyphs
// with a linear gradient across the word's box. The overlay fills that box by its insets and
// the svg and its gradient are sized in percentages of it, so nothing is measured: the word
// sits inline in the headline's text, and an inline view inside text gets no layout event
// on iOS. Two platform rules decide where the word lands. The inline box: the web aligns
// its first baseline (the invisible word's) with the headline's, while React Native sets
// it by its bottom, Android on the baseline (its placeholder span has no descent) and iOS
// at the attachment's line fragment less the font's descender. So once laid out the word
// measures its box and the headline's line in the window (`anchor`, the heading's wrapper)
// and moves the painted word onto that line; on the web the move measures zero. And the
// baseline within a line: iOS centres a line only when it is taller than the font
// (React Native's baseline offset), so the hero's 0.94 line sets the glyphs higher than
// the CSS model does. So the painted word takes the invisible word's own baseline from its
// text layout (`y + height - descender`) where the platform reports one, and the CSS model
// on the web, which reports none. The same code draws it on
// iOS, Android and
// the web. The word is decorative to assistive tech: the heading that holds it names itself
// (Typography `accessibilityLabel`). The values are the table in ./library-hero-look.ts.

/**
 * The face the display role is drawn in, as the kit's text resolves it: a family that
 * carries every weight (the web's variable file, docs/src/ui/fonts.ts) is drawn at the
 * role's weight, which the svg text must then name itself; a face registered per weight
 * (iOS and Android) carries its weight, so none is named, and where the weight maps to
 * optical cuts the cut nearest the word's size is taken.
 */
function displayFace(faces: FontFaces | undefined, fontSize: number, fontWeight: FontWeightKey): { fontFamily: string; fontWeight?: FontWeightKey } | undefined {
  if (!faces) return undefined;
  if (typeof faces === "string") return { fontFamily: faces, fontWeight };
  const face = faces[fontWeight] ?? Object.values(faces)[0];
  if (!face) return undefined;
  if (typeof face !== "object") return { fontFamily: face };
  const sizes = Object.keys(face).map(Number);
  const nearest = sizes.reduce((best, size) => (Math.abs(size - fontSize) <= Math.abs(best - fontSize) ? size : best), sizes[0]!);
  const cut = face[nearest];
  return cut ? { fontFamily: cut } : undefined;
}

// The window's width as the kit's Typography `hero` reads it (src/style/responsive.ts
// `useViewportWidth`): 0 on the server and through hydration, so the word renders the same
// 56 px markup the server sent, then the live width.
const subscribeWindow = (onChange: () => void) => {
  const subscription = Dimensions.addEventListener("change", onChange);
  return () => subscription.remove();
};
const windowWidth = () => Dimensions.get("window").width;
const noWidth = () => 0;

export function GradientText({ children, anchor, testID }: { children: string; anchor: RefObject<NativeView | null>; testID?: string }) {
  const { tokens, fonts } = useTheme();
  const id = `sweep${useId().replace(/[^A-Za-z0-9]/g, "")}`;
  // The hero role sizes the word by the window, as the headline around it does.
  const type = heroType(useSyncExternalStore(subscribeWindow, windowWidth, noWidth));
  const face = displayFace(fonts.display, type.fontSize, type.fontWeight) ?? displayFace(fonts.sans, type.fontSize, type.fontWeight);
  const box = useRef<NativeView>(null);
  const shift = useLineShift(anchor, box, type.lineHeight);
  const [glyphBaseline, setGlyphBaseline] = useState<number | null>(null);
  const onTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    const line = event.nativeEvent.lines[0];
    if (line) setGlyphBaseline(line.y + line.height - line.descender);
  };
  return (
    <View ref={box} testID={testID} style={{ alignSelf: "flex-start" }}>
      {/* The word's line box, held invisible; the gradient paints over it. The heading
          around the word carries its accessible name, so both layers are hidden from
          assistive tech. */}
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ opacity: 0 }}>
        <Typography hero onTextLayout={onTextLayout}>{children}</Typography>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: "absolute", top: shift, right: 0, bottom: -shift, left: 0, pointerEvents: "none" }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2="100%" y2={0}>
              {GRADIENT_TEXT.stops.map((stop) => <Stop key={stop.offset} offset={stop.offset} stopColor={tokens[stop.role]} />)}
            </LinearGradient>
          </Defs>
          <SvgText
            x={0}
            y={glyphBaseline ?? baselineOffset(type.fontSize, type.lineHeight)}
            fill={`url(#${id})`}
            fontFamily={face?.fontFamily}
            fontWeight={face?.fontWeight}
            fontSize={type.fontSize}
            letterSpacing={type.letterSpacing}
          >
            {children}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}

/**
 * How far the word's box sits from the top of the headline line it is on, measured in the
 * window once both are laid out (and again when the size changes). The line is the one the
 * box's middle falls in, counted from the anchor's top in whole line heights.
 */
function useLineShift(anchor: RefObject<NativeView | null>, box: RefObject<NativeView | null>, lineHeight: number): number {
  const [shift, setShift] = useState(0);
  useEffect(() => {
    let frame = requestAnimationFrame(function measure() {
      anchor.current?.measureInWindow((_ax, anchorTop) => {
        box.current?.measureInWindow((_bx, boxTop, _w, boxHeight) => {
          const line = Math.round((boxTop + boxHeight / 2 - anchorTop - lineHeight / 2) / lineHeight);
          setShift(Math.round((anchorTop + line * lineHeight - boxTop) * 100) / 100);
        });
      });
      frame = 0;
    });
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [anchor, box, lineHeight]);
  return shift;
}
