import Svg, { G, Path, ClipPath, Defs } from "react-native-svg";
import { MARK_PATHS, MARK_OFFSET_X, MARK_VIEWBOX, buildSectors } from "./canvas-mark-geometry";

// The Canvas mark: a rainbow "C", six hues blended as ONE continuous conic sweep around
// an open counter with a wedge gap on the right. The silhouette, the conic stops and the
// sector fan that approximates the conic all live in ./canvas-mark-geometry, which the
// favicon generator shares so the tab icon and the app logo cannot drift apart.
const SECTORS = buildSectors();

export function CanvasMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}>
      <Defs>
        <ClipPath id="canvas-mark">
          {MARK_PATHS.map((d, i) => <Path key={i} d={d} />)}
        </ClipPath>
      </Defs>
      <G transform={`translate(${MARK_OFFSET_X}, 0)`} clipPath="url(#canvas-mark)">
        {SECTORS.map((s, i) => <Path key={i} d={s.d} fill={s.color} />)}
      </G>
    </Svg>
  );
}
