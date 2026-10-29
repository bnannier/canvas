import type { ReactNode } from "react";
import { Image, View, useTheme, type ColorTokens } from "@nannier/canvas";
import { resolvePhoto } from "../../core/photos";
import { StageGlow, type GlowBox } from "./stage";

// The Overlays section's stage scenes (`Canvas v4.0.0 Overlays.dc.html`, the `c-dialog`,
// `c-drawer`, `c-alert-dialog`, `c-action-sheet`, `c-popover`, `c-wizard` and `c-command`
// stages): the faux app page an overlay opens over, drawn in `--sf3` bars and tiles, and the
// blurred accent orbs behind it. Like the Navigation stage's glow and placeholder page they are
// explanatory scenery no kit component draws (the brand-illustration exception, decision
// OD-1): built from tokens, laid out at the hand-off's geometry, and untouchable.

/** The placeholder fill: the hand-off's `--sf3`. */
const block = (tokens: ColorTokens) => tokens.secondary;

/** A placeholder bar or tile: `width` along the row, `height` tall, at `radius`, in `--sf3`. */
function Bar({ width, height, radius, grow }: { width?: `${number}%`; height: number; radius: number; grow?: boolean }) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        height,
        borderRadius: radius,
        backgroundColor: block(tokens),
        ...(grow ? { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0 } : { width: width ?? "100%" }),
      }}
    />
  );
}

/** A row of `count` equal tiles `gap` apart, each `height` tall at `radius`. */
function Tiles({ count, height, radius, gap }: { count: number; height: number; radius: number; gap: number }) {
  return (
    <View style={{ flexDirection: "row", gap }}>
      {Array.from({ length: count }, (_, key) => <Bar key={key} grow height={height} radius={radius} />)}
    </View>
  );
}

/** The scene's layer: spread over the stage, painting only, never taking a touch. */
function Layer({ inset = 0, padding, opacity = 1, children }: { inset?: number; padding?: number | [number, number, number, number]; opacity?: number; children: ReactNode }) {
  const pad = Array.isArray(padding)
    ? { paddingTop: padding[0], paddingRight: padding[1], paddingBottom: padding[2], paddingLeft: padding[3] }
    : { padding: padding ?? 0 };
  return (
    <View aria-hidden style={{ position: "absolute", top: inset, right: inset, bottom: inset, left: inset, opacity, pointerEvents: "none", ...pad }}>
      {children}
    </View>
  );
}

/** A side rail of bars beside a body of tiles (`grid-template-columns: <rail>px 1fr`). */
function RailPage({ rail, gap, bars, barHeight, barGap, body }: { rail: number; gap: number; bars: readonly `${number}%`[]; barHeight: number; barGap: number; body: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap }}>
      <View style={{ width: rail, gap: barGap }}>
        {bars.map((width, key) => <Bar key={key} width={width} height={barHeight} radius={barHeight / 2} />)}
      </View>
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0 }}>{body}</View>
    </View>
  );
}

const glows = (boxes: readonly GlowBox[]) => boxes.map((box, key) => <StageGlow key={key} box={box} />);

/** The dialog's stage: a 160 px rail of four bars beside two tiles and a block, under an accent orb. */
export function DialogScene() {
  return (
    <>
      <Layer padding={24} opacity={0.9}>
        <RailPage
          rail={160}
          gap={20}
          bars={["70%", "50%", "80%", "60%"]}
          barHeight={10}
          barGap={10}
          body={(
            <View style={{ gap: 14 }}>
              <Tiles count={2} height={90} radius={14} gap={14} />
              <Bar height={180} radius={14} />
            </View>
          )}
        />
      </Layer>
      {glows([{ left: "25%", top: "10%", width: "50%", height: "60%", opacity: 0.6 }])}
    </>
  );
}

/** A page of a heading bar, a row of tiles and a block (the drawer's and the alert dialog's). */
function TilePage({ heading, tiles, tileHeight, blockHeight }: { heading: `${number}%`; tiles: number; tileHeight: number; blockHeight: number }) {
  return (
    <View style={{ gap: 14 }}>
      <Bar width={heading} height={12} radius={6} />
      <Tiles count={tiles} height={tileHeight} radius={14} gap={12} />
      <Bar height={blockHeight} radius={14} />
    </View>
  );
}

/** The drawer's stage: three tiles and a block under a cyan orb. */
export function DrawerScene() {
  return (
    <>
      <Layer padding={24} opacity={0.9}>
        <TilePage heading="30%" tiles={3} tileHeight={80} blockHeight={200} />
      </Layer>
      {glows([{ left: "30%", top: "20%", width: "50%", height: "60%", opacity: 0.5, color: "chart-2" }])}
    </>
  );
}

/** The alert dialog's stage: two tiles and a block under the destructive orb. */
export function AlertDialogScene() {
  return (
    <>
      <Layer padding={24}>
        <TilePage heading="34%" tiles={2} tileHeight={90} blockHeight={180} />
      </Layer>
      {glows([{ left: "20%", top: "15%", width: "60%", height: "60%", opacity: 0.35, color: "destructive" }])}
    </>
  );
}

/** The action sheet's stage: a photo over two bars. */
export function ActionSheetScene() {
  return (
    <Layer padding={[48, 20, 20, 20]}>
      <View style={{ gap: 12 }}>
        <View style={{ height: 160, borderRadius: 16, overflow: "hidden" }}>
          <Image source={resolvePhoto("/grace-hopper.jpg") as never} cover width="100%" height="100%" />
        </View>
        <Bar width="60%" height={12} radius={6} />
        <Bar width="40%" height={12} radius={6} />
      </View>
    </Layer>
  );
}

/** The popover's stage: an accent orb off the top right corner. */
export function PopoverScene() {
  return <>{glows([{ left: "50%", top: "-10%", width: "60%", height: "60%", opacity: 0.35 }])}</>;
}

/** The wizard's stage: an accent orb at the top left and a mint one at the bottom right. */
export function WizardScene() {
  return (
    <>
      {glows([
        { left: "5%", top: "-25%", width: "45%", height: "90%", opacity: 0.5 },
        { left: "55%", top: "45%", width: "45%", height: "90%", opacity: 0.35, color: "chart-3" },
      ])}
    </>
  );
}

/** The command palette's stage: accent and cyan orbs, then a faint page of a rail and tiles. */
export function CommandScene() {
  return (
    <>
      {glows([
        { left: "10%", top: "-20%", width: "40%", height: "80%", opacity: 0.55 },
        { left: "50%", top: "40%", width: "45%", height: "90%", opacity: 0.45, color: "chart-2" },
      ])}
      <Layer inset={24} opacity={0.5}>
        <RailPage
          rail={200}
          gap={24}
          bars={["60%", "80%", "50%", "70%"]}
          barHeight={12}
          barGap={12}
          body={(
            <View style={{ gap: 16 }}>
              <Tiles count={3} height={120} radius={16} gap={16} />
              <Bar height={200} radius={16} />
            </View>
          )}
        />
      </Layer>
    </>
  );
}
