import { useEffect, type ComponentType } from "react";
import { ActivityIndicator, type ViewProps } from "react-native";
import { LoopView, createLoopChannel, shape, type LoopChannel, type LoopTrack } from "../../style/index.js";

// The loader a loading Button shows while it waits, one per platform, chosen by the
// skin (`ButtonSkin.loader`, button.styles.ts) and rendered by the shell: the web draws
// the hand-off's arc, iOS and Android the platform's own activity indicator. The shell
// hides it from assistive tech (the button announces the wait itself, busy and named),
// so each loader passes those props through to the node it draws.

/** What the shell hands a loader: the label's ink, and the props that hide it from assistive tech. */
export interface ButtonLoaderArgs extends Pick<ViewProps, "aria-hidden" | "accessibilityElementsHidden" | "importantForAccessibility"> {
  color: string;
}

export type ButtonLoader = ComponentType<ButtonLoaderArgs>;

// The hand-off's loading arc (`K.btn`, tools/v4/handoff/cv-kit.js line 44):
//   `width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;
//    border-radius:50%;animation:spin .8s linear infinite;flex:none`
// spun by `@keyframes spin{to{transform:rotate(360deg)}}` (Component.dc.html line 85): a
// 14 px box whose 2 px edge is the label's ink with the right edge open, so three
// quarters of a ring turn and nothing is drawn where the fourth would be.
const ARC = { size: 14, stroke: 2, period: 800 };

// One channel turns every loading arc on the page, once per 800 ms, on the loop primitive
// (src/style/loop.tsx: a compositor animation on the web, so nothing commits through React
// per frame), and runs only while one is mounted. Made on the first arc, not at import, so
// a build whose skin never draws the arc (iOS, Android) carries no channel.
let arc: { channel: LoopChannel; turn: LoopTrack } | null = null;
let turning = 0;

function arcTrack(): { channel: LoopChannel; turn: LoopTrack } {
  if (!arc) {
    const channel = createLoopChannel({ period: ARC.period });
    arc = { channel, turn: { channel, inputRange: [0, 1], outputRange: [0, 360] } };
  }
  return arc;
}

/** The web's loader: the hand-off's open arc in the label's ink. */
export function LoadingArc({ color, ...hidden }: ButtonLoaderArgs) {
  const { channel, turn } = arcTrack();
  useEffect(() => {
    if (turning++ === 0) channel.play();
    return () => {
      if (--turning === 0) channel.stop();
    };
  }, [channel]);
  return (
    <LoopView
      {...hidden}
      rotate={turn}
      style={{
        width: ARC.size,
        height: ARC.size,
        // The pill role: the hand-off's `border-radius:50%` on a square.
        borderRadius: shape.web.pill,
        borderWidth: ARC.stroke,
        borderColor: color,
        borderRightColor: "transparent",
        flexShrink: 0,
      }}
    />
  );
}

/** The iOS and Android loader: the platform's own activity indicator, in the label's ink, at its default `small` size. */
export function PlatformLoader(props: ButtonLoaderArgs) {
  return <ActivityIndicator {...props} />;
}
