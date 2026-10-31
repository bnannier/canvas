import type { ViewStyle } from "react-native";

/**
 * Fold a plane's translateZ into supported RN transforms. The section scene's
 * perspective and rotation origins coincide at the centre of the stage. Each plane
 * keeps its own projected depth, as CSS preserve-3d does, rather than flattening all
 * three into one rotated parent. See the Library's panelTransform for the same identity.
 */
export function dataPlaneStyle(stageWidth: number, stageHeight: number, depth: number, expansion: number, tilt: number): ViewStyle {
  "worklet";
  const width = 270, height = 176, d = 900;
  const dx = depth * 14 * (1 + expansion);
  const dy = -depth * (14 + 10 * expansion);
  const z = -depth * (30 + 15 * expansion);
  const rx = 16 - 8 * tilt, ry = -20 + 12 * tilt, rz = 3 - 3 * tilt;
  const ax = rx * Math.PI / 180, ay = ry * Math.PI / 180;
  // Rz leaves the depth vector unchanged; Ry then Rx rotate it into screen space.
  const vx = Math.sin(ay) * z;
  const vy = -Math.sin(ax) * Math.cos(ay) * z;
  const vz = Math.cos(ax) * Math.cos(ay) * z;
  const left = (stageWidth - width) / 2 + dx;
  const top = (stageHeight - height) / 2 + dy;
  return {
    position: "absolute", left, top, width, height, transformOrigin: [0, 0, 0],
    opacity: depth === 2 ? .45 + .15 * expansion : depth === 1 ? .7 + .1 * expansion : 1,
    transform: [
      { translateX: stageWidth / 2 - left }, { translateY: stageHeight / 2 - top },
      { scale: d / (d - vz) }, { perspective: d - vz },
      { translateX: vx }, { translateY: vy },
      { rotateX: `${rx}deg` }, { rotateY: `${ry}deg` }, { rotateZ: `${rz}deg` },
      { translateX: left - stageWidth / 2 }, { translateY: top - stageHeight / 2 },
    ],
  };
}
