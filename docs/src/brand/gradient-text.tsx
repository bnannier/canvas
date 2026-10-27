import { useId, useState } from "react";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { Typography, View, useTheme, type FontFaces } from "@nannier/canvas";
import { DISPLAY_TYPE, GRADIENT_TEXT, baselineOffset } from "./library-hero-look";

// A brand illustration: one word in the display role filled by the brand artwork's
// accent-to-cyan-to-mint sweep, the v4 hand-off's `background-clip: text` headline word
// (decision P5-G1, the `v4-library-hero` card). React Native has no text clip, so the word
// is drawn twice: a kit Typography in the display role sets the line box and the width, held
// invisible, and a react-native-svg text over it paints the glyphs
// with a linear gradient across the word's box. The same code draws it on iOS, Android and
// the web. The word is decorative to assistive tech: the heading that holds it names itself
// (Typography `accessibilityLabel`). The values are the table in ./library-hero-look.ts.

/** The face the display role is drawn in, at the role's weight. */
function displayFace(faces: FontFaces | undefined): string | undefined {
  if (!faces) return undefined;
  if (typeof faces === "string") return faces;
  return faces[DISPLAY_TYPE.fontWeight] ?? Object.values(faces)[0];
}

export function GradientText({ children, testID }: { children: string; testID?: string }) {
  const { tokens, fonts } = useTheme();
  const id = `sweep${useId().replace(/[^A-Za-z0-9]/g, "")}`;
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const family = displayFace(fonts.display) ?? displayFace(fonts.sans);
  return (
    <View
      testID={testID}
      style={{ alignSelf: "flex-start" }}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
      }}
    >
      {/* The word's line box, held invisible; the gradient paints over it. The heading
          around the word carries its accessible name, so both layers are hidden from
          assistive tech. */}
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ opacity: 0 }}>
        <Typography display>{children}</Typography>
      </View>
      {box ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          <Svg width={box.width} height={box.height}>
            <Defs>
              <LinearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={box.width} y2={0}>
                {GRADIENT_TEXT.stops.map((stop) => <Stop key={stop.offset} offset={stop.offset} stopColor={tokens[stop.role]} />)}
              </LinearGradient>
            </Defs>
            <SvgText
              x={0}
              y={baselineOffset(DISPLAY_TYPE.fontSize, DISPLAY_TYPE.lineHeight)}
              fill={`url(#${id})`}
              fontFamily={family}
              fontSize={DISPLAY_TYPE.fontSize}
              fontWeight={DISPLAY_TYPE.fontWeight}
              letterSpacing={DISPLAY_TYPE.letterSpacing}
            >
              {children}
            </SvgText>
          </Svg>
        </View>
      ) : null}
    </View>
  );
}
