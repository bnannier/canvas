import { useId, useState, type ReactNode } from "react";
import type { LayoutChangeEvent } from "react-native";
import Svg, { Defs, LinearGradient, Polygon, Stop } from "react-native-svg";
import { GlassBlurScope, View, useFormFactor, useTheme, type GlassBlurPlaneHandle } from "@nannier/canvas";
// Kit internals, as the docs' other scaffolding takes them (the testing routes, the
// platform-skin registry): the frosted shell paints through the kit's own glass host.
import { GlassSurface } from "../../../src/style/glass-surface/glass-surface.js";
import { PAGE_LOOK, lookFor, wedgeColor, wedgeGeometry, type PageLookPalette, type ShellTier } from "./page-look";

// Dark Factory's frosted shell, as the docs' frame: one panel filling the window with no
// margin, around the docs' own sidebar, top bar and scroller. Docs-only scaffolding
// (design-language item 7); the values are PAGE_LOOK's (./page-look.ts).
//
// The frame fills the window, the owner's 2026-10-23 choice (Dark Factory insets its shell
// from the window by a per-tier padding, caps it at 1340 wide and rounds its top corners;
// the docs dropped all three). It is fixed to the window, the owner's 2026-10-13 choice:
// once a page scrolls, the page moves inside it and the frame stays (Dark Factory's whole
// shell scrolls away), which keeps the docs' navigation in reach. Its material runs a
// hairline past the frame on every side (PAGE_LOOK.shell.bleed) inside a clip to the frame,
// so the frost's rim never draws along the window's edges and the page cannot scroll by it.
//
// Its surface is the kit's GlassSurface on the content layer, the stable static material
// the kit's contract gives a panel that content sits on, painting Dark Factory's shell fill
// on every platform: on the web that fill over a 24 px blur and a 1 px hairline, which is
// the card's shell, and on iOS the same fill over the native frost (Liquid Glass takes a
// fill only as a faint tint, which left the frame far sheerer than the card's milky shell).
// On Android an in-page surface has no safe plane of its own, so the page backdrop is made
// the plane (the kit's GlassBlurPlane, mounted with the backdrop by ./navbar.tsx and
// ./native-header.tsx) and only the frame's material is offered it (GlassBlurScope): the
// material is a layer of its own under the content, which stays outside the scope, so the
// page's own glass keeps the behaviour it has without a plane.
// In solid mode it is an opaque panel in the page's `background`, covering the page look.
// The wedges (Dark Factory's ShellDecor) are laid over the surface, under the content.
//
// The frame does not clip its content. On the web a clip around a subtree holding the other
// frosted surfaces (the sidebar, the top bar, the cards) made Chromium drop whole tiles of
// the page at 1440 by 900 on a 2x screen (the 2026-10-14 runs in the evidence log).
export function PageFrame({ plane, children }: { plane: GlassBlurPlaneHandle; children: ReactNode }) {
  const { scheme, palette, tokens } = useTheme();
  const tier = useFormFactor();
  const look = PAGE_LOOK.palettes[lookFor(scheme, palette)];
  const { bleed } = PAGE_LOOK.shell;
  return (
    <View style={{ flex: 1 }}>
      {/* The material alone is clipped to the frame, a plain rectangle around one surface:
          its rim falls outside the clip, and nothing runs past the window to scroll it. */}
      <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflow: "hidden" }}>
        <GlassBlurScope plane={plane}>
          <GlassSurface
            layer="content"
            tint={look.shell}
            style={{ position: "absolute", top: -bleed, right: -bleed, bottom: -bleed, left: -bleed, backgroundColor: tokens.background }}
          />
        </GlassBlurScope>
      </View>
      <ShellWedges look={look} tier={tier} />
      {children}
    </View>
  );
}

// What the SVG is handed, rounded so the server's render and the browser's agree to the
// digit (see page-backdrop.tsx).
const at = (value: number) => Math.round(value * 100) / 100;

// The faint gradient triangles in the shell's corners, laid out against the roster's shell
// height for the tier (PAGE_LOOK.shell.wedgeCanvasHeight), so the ones at rest in view are
// the top-right ones, as in Dark Factory's at rest. Static and untouchable.
function ShellWedges({ look, tier }: { look: PageLookPalette; tier: ShellTier }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  };
  const W = size?.width ?? PAGE_LOOK.seed.width;
  // The drawing is the frame's own size: react-native-svg on Android paints an SVG into a
  // bitmap that size, and a roster-tall one ran to 174 MB and crashed the app. The wedges
  // are still laid out against the roster's height, so the ones below the frame fall
  // outside the drawing.
  const visible = size?.height ?? PAGE_LOOK.seed.height;
  const H = PAGE_LOOK.shell.wedgeCanvasHeight[tier];
  return (
    <View onLayout={onLayout} style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* No viewBox: the drawing is in px, laid out on the roster-tall canvas and cut to the
          frame. A viewBox would scale that canvas down into the frame's height. */}
      <Svg width={W} height={visible}>
        <Defs>
          {PAGE_LOOK.wedges.map((wedge, i) => {
            const { line } = wedgeGeometry(wedge, W, H);
            const color = wedgeColor(wedge.color, look);
            const stops = wedge.fadeIn ? [[0, 0], [wedge.fade, 0], [1, 1]] : [[0, 1], [wedge.fade, 0], [1, 0]];
            return (
              <LinearGradient key={i} id={`${id}-w${i}`} gradientUnits="userSpaceOnUse" x1={at(line.x1)} y1={at(line.y1)} x2={at(line.x2)} y2={at(line.y2)}>
                {stops.map(([offset, alpha]) => <Stop key={offset} offset={offset} stopColor={color} stopOpacity={alpha} />)}
              </LinearGradient>
            );
          })}
        </Defs>
        {PAGE_LOOK.wedges.map((wedge, i) => (
          <Polygon key={i} points={wedgeGeometry(wedge, W, H).points.split(" ").map((p) => p.split(",").map((v) => at(Number(v))).join(",")).join(" ")} fill={`url(#${id}-w${i})`} opacity={wedge.opacity} />
        ))}
      </Svg>
    </View>
  );
}
