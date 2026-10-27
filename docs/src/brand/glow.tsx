import { useId, useMemo, useState, type ReactNode } from "react";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { View, useTheme } from "@nannier/canvas";
import { AURORA, HERO_FRAME, auroraDiscs } from "./library-hero-look";

// A brand illustration: the v4 hand-off's Library hero aurora (decision P5-G2, the
// `v4-library-hero` card), three soft discs of the brand sweep behind the hero, and the
// frame that holds them. The hand-off blurs a radial gradient with CSS `filter: blur()`;
// here each disc is one react-native-svg radial gradient whose stops are that blur already
// applied (`blurredDisc`, integrated once per size), so the same drawing paints on iOS,
// Android and the web with no filter. Static: the hand-off's 22 to 28 s drift is not
// reproduced. The values are the table in ./library-hero-look.ts.

/** The glow layer: the hero section's box, from the page's top to the hero's foot, edge to edge. */
function AuroraGlow() {
  const { tokens, dark } = useTheme();
  const key = useId().replace(/[^A-Za-z0-9]/g, "");
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const discs = useMemo(() => (box ? auroraDiscs(box.width, box.height) : []), [box]);
  const layer = dark ? AURORA.opacity.dark : AURORA.opacity.light;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((prev) => (prev && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1 ? prev : { width, height }));
      }}
      style={{
        position: "absolute",
        top: -HERO_FRAME.above,
        left: -HERO_FRAME.bleed,
        right: -HERO_FRAME.bleed,
        bottom: 0,
        pointerEvents: "none",
      }}
    >
      {box ? (
        <Svg width={box.width} height={box.height}>
          <Defs>
            {discs.map((disc, index) => (
              <RadialGradient key={disc.role} id={`${key}aurora${index}`} gradientUnits="userSpaceOnUse" cx={disc.cx} cy={disc.cy} r={disc.r} fx={disc.cx} fy={disc.cy}>
                {disc.stops.map((stop) => (
                  <Stop key={stop.offset} offset={stop.offset} stopColor={tokens[disc.role]} stopOpacity={stop.opacity * layer} />
                ))}
              </RadialGradient>
            ))}
          </Defs>
          {discs.map((disc, index) => <Circle key={disc.role} cx={disc.cx} cy={disc.cy} r={disc.r} fill={`url(#${key}aurora${index})`} />)}
        </Svg>
      ) : null}
    </View>
  );
}

/**
 * The hero's frame: the hand-off section's room above and below its content, with the
 * aurora behind it. Its children are the hero's kit components.
 */
export function AuroraFrame({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <View testID={testID} style={{ paddingTop: HERO_FRAME.top, paddingBottom: HERO_FRAME.bottom }}>
      <AuroraGlow />
      {children}
    </View>
  );
}
