import { useState, type ReactNode } from "react";
import { View } from "@nannier/canvas";
import { COLLAGE, panelTransform, type CollagePanelId } from "./library-hero-look";

// A brand illustration: the v4 hand-off's Library hero collage (decision P5-T1, the
// `v4-library-hero` card), six live kit components laid out in a tilted 3D stack. The
// hand-off builds it from a perspective box, a rotated `preserve-3d` stack and a
// `translateZ` per panel; React Native has neither `preserve-3d` nor `translateZ`, so each
// panel carries its own transform with the stack's rotation and its depth folded in
// (`panelTransform`, held to the hand-off's projection by test/docs-library.test.ts), and the
// panels are drawn back to front. The same transforms render on iOS, Android and the web.
// Static: the hand-off's pointer-follow tilt is not reproduced. The collage only places
// what the page hands it; every panel is a kit component.

/** The collage width the hand-off's desktop column gives it, for the frame before it measures. */
const SEED_WIDTH = 648;

const BACK_TO_FRONT = [...COLLAGE.panels].sort((a, b) => a.z - b.z);

export function HeroCollage({ panels, testID }: { panels: Record<CollagePanelId, ReactNode>; testID?: string }) {
  const [width, setWidth] = useState(SEED_WIDTH);
  return (
    <View
      testID={testID}
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        if (next > 0) setWidth((prev) => (Math.abs(prev - next) < 1 ? prev : next));
      }}
      style={{ height: COLLAGE.height }}
    >
      {BACK_TO_FRONT.map((panel) => (
        <View
          key={panel.id}
          style={{
            position: "absolute",
            left: panel.x,
            top: panel.y,
            ...("width" in panel ? { width: panel.width } : null),
            transformOrigin: [0, 0, 0],
            transform: panelTransform(panel, width),
          }}
        >
          {panels[panel.id]}
        </View>
      ))}
    </View>
  );
}
