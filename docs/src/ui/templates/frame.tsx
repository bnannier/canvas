import type { ReactNode } from "react";
import { PLATFORM_LABELS } from "../../core/platforms-shown";
import { StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Icon, Row, Typography, View, useTheme } from "@nannier/canvas";
import type { TemplatePlatform } from "../../core/data/types";

// The Templates page's stage and device frames (`Canvas v4.0.0 Templates.dc.html`, the
// stage under the header and its `data-frame`): docs-only scaffolding around a template's
// screen, the same standing as the landing hero's device frames (../../shell/device-frames).
// The kit has no browser window or handset to draw, and per CLAUDE.md "Dogfood the kit"
// the docs never add one to the kit for a frame; everything inside the screen is kit.
//
// The geometry is the hand-off's FRAMES table: a 1180 x 800 browser window, a 390 x 844
// iPhone and a 400 x 860 Pixel, each capped at the stage's width.

export const FRAMES: Record<TemplatePlatform, { width: number; height: number; radius: number; bezel: number }> = {
  web: { width: 1180, height: 800, radius: 16, bezel: 1 },
  ios: { width: 390, height: 844, radius: 56, bezel: 10 },
  android: { width: 400, height: 860, radius: 40, bezel: 8 },
};

/** The handsets' chassis: graphite in both schemes, as real hardware is. */
const CHASSIS = "#0b0b10";
/** The browser's window controls: close, minimise, zoom. */
const LIGHTS = ["#ff5f57", "#febc2e", "#28c840"] as const;

/**
 * The stage: the hand-off's rounded well (24 px corners, the hairline, the sunken surface)
 * with the accent's soft glow spreading from above its start, the frame centred in it.
 */
export function TemplateStage({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.stage, { borderColor: tokens.border, backgroundColor: tokens["surface-sunken"] }]}>
      <Svg style={styles.glow} width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
        <Defs>
          <RadialGradient id="template-stage-glow" cx="0.3" cy="0" rx="1" ry="1" fx="0.3" fy="0" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor={tokens["primary-soft"] ?? tokens.accent} stopOpacity={1} />
            <Stop offset="0.6" stopColor={tokens["primary-soft"] ?? tokens.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#template-stage-glow)" />
      </Svg>
      {children}
    </View>
  );
}

/**
 * The device around a screen: the browser window's title bar, or a handset's bezel, status
 * bar and gesture area. `children` is the screen between them, which fills what they leave.
 */
export function TemplateFrame({ platform, path, children, onLayout }: {
  platform: TemplatePlatform;
  /** The browser address bar's path after `app.riskora.com/`. */
  path: string;
  children: ReactNode;
  onLayout?: (width: number) => void;
}) {
  const { tokens } = useTheme();
  const frame = FRAMES[platform];
  const web = platform === "web";
  return (
    <View
      accessibilityLabel={PLATFORM_LABELS[platform]?.device}
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.width) : undefined}
      style={[
        styles.frame,
        {
          // Full width up to the device's own: a fixed width would size the stage (and the
          // page column holding it) to the window's 1180 px on a phone.
          maxWidth: frame.width,
          height: frame.height,
          borderRadius: frame.radius,
          borderWidth: frame.bezel,
          borderColor: web ? tokens.input : CHASSIS,
          backgroundColor: tokens.background,
          boxShadow: `0px 30px 80px -16px ${tokens["shade-lg"] ?? "rgba(0, 0, 0, 0.5)"}`,
        },
      ]}
    >
      {web ? <BrowserBar path={path} /> : platform === "ios" ? <IosStatusBar /> : <AndroidStatusBar />}
      <View style={styles.screen}>{children}</View>
      {platform === "ios" ? (
        <View style={styles.iosHome}>
          <View style={[styles.iosHomeBar, { backgroundColor: tokens.foreground }]} />
        </View>
      ) : platform === "android" ? (
        <View style={[styles.androidHome, { backgroundColor: tokens.card }]}>
          <View style={[styles.androidHomeBar, { backgroundColor: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }]} />
        </View>
      ) : null}
    </View>
  );
}

/** The browser's title bar: the window controls and the address pill with its lock. */
function BrowserBar({ path }: { path: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.browserBar, { backgroundColor: tokens.card, borderColor: tokens.border }]}>
      <Row tight alignCenter>
        {LIGHTS.map((color) => <View key={color} style={[styles.light, { backgroundColor: color }]} />)}
      </Row>
      <View style={[styles.address, { backgroundColor: tokens.muted }]}>
        <Row tight alignCenter>
          <Icon lock size={11} muted decorative />
          <Typography caption mono muted numberOfLines={1}>{`app.riskora.com/${path}`}</Typography>
        </Row>
      </View>
      <View style={styles.browserEnd} />
    </View>
  );
}

/** The iPhone's status bar: the time, the Dynamic Island and the signal glyphs. */
function IosStatusBar() {
  return (
    <View style={styles.iosStatus}>
      <Typography body semibold>9:41</Typography>
      <View style={styles.island} />
      <Row tight alignCenter>
        <Icon wifi size={15} decorative />
        <Icon batteryFull size={15} decorative />
      </Row>
    </View>
  );
}

/** The Pixel's status bar: the time, the punch-hole camera and the signal glyphs. */
function AndroidStatusBar() {
  return (
    <View style={styles.androidStatus}>
      <Typography small medium>9:41</Typography>
      <View style={styles.punch} />
      <Row tight alignCenter>
        <Icon wifi size={14} decorative />
        <Icon battery size={14} decorative />
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  stage: { position: "relative", overflow: "hidden", alignItems: "center", paddingVertical: 28, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1 },
  frame: { position: "relative", width: "100%", overflow: "hidden", flexDirection: "column" },
  screen: { flex: 1, minHeight: 0, flexDirection: "row" },
  browserBar: { height: 42, flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderBottomWidth: 1 },
  light: { width: 11, height: 11, borderRadius: 6 },
  address: { flex: 1, maxWidth: 420, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", marginHorizontal: "auto", paddingHorizontal: 8 },
  browserEnd: { width: 46 },
  iosStatus: { height: 50, flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 6, paddingLeft: 36, paddingRight: 30 },
  island: { position: "absolute", left: "50%", top: 10, width: 120, height: 32, marginLeft: -60, borderRadius: 20, backgroundColor: "#000" },
  iosHome: { height: 26, flexShrink: 0, alignItems: "center", justifyContent: "center" },
  iosHomeBar: { width: 134, height: 5, borderRadius: 3 },
  androidStatus: { height: 36, flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  punch: { position: "absolute", left: "50%", top: 12, width: 12, height: 12, marginLeft: -6, borderRadius: 6, backgroundColor: "#000" },
  androidHome: { height: 20, flexShrink: 0, alignItems: "center", justifyContent: "center" },
  androidHomeBar: { width: 100, height: 4, borderRadius: 2 },
});
