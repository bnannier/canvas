import { useId } from "react";
import { Image, type TextStyle, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Icon, Text, View, useTheme } from "@nannier/canvas";
import { resolveFontFace } from "../../../src/style/fonts";
import { resolvePhoto } from "../core/photos";

const REVENUE = [34, 52, 41, 66, 58, 74, 63, 88, 71, 95, 82, 100];
const OPACITY = [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.8, 0.9, 0.95, 1];
const photo = (name: string) => {
  const source = resolvePhoto(`/${name}.jpg`);
  return (typeof source === "string" ? { uri: source } : source) as never;
};

/** Decorative panels from the Library's illustration. Their drawing is independent of
 * control variants: the hand-off's collage is artwork, with no focusable controls. */
export function useHeroPanels() {
  const { tokens: t, fonts, dark } = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const font = (faceRole: "sans" | "display" | "mono", size: number, weight: "400" | "500" = "500"): TextStyle => {
    const face = resolveFontFace(fonts[faceRole], weight, size);
    return { fontSize: size, fontWeight: face?.dropWeight ? undefined : weight, fontFamily: face?.fontFamily, color: t.foreground };
  };
  const glass = dark ? "rgba(18,18,26,.62)" : "rgba(255,255,255,.62)";
  const edge = t.input;
  const shadow = dark ? "inset 0 1px 0 rgba(255,255,255,.1), 0 30px 80px -16px rgba(0,0,0,.8)" : "0 30px 80px -16px rgba(17,17,24,.25), 0 0 0 1px rgba(17,17,24,.03)";
  const shadowMd = dark ? "inset 0 1px 0 rgba(255,255,255,.1), 0 12px 32px -10px rgba(0,0,0,.7)" : "0 12px 32px -10px rgba(17,17,24,.16), 0 0 0 1px rgba(17,17,24,.03)";
  const surface: ViewStyle = { borderWidth: 1, borderColor: edge, backgroundColor: glass, boxShadow: shadow };
  const row: ViewStyle = { flexDirection: "row", alignItems: "center" };
  const secondary = t["muted-foreground"];
  const subtle = dark ? "#7f7f93" : "#6c6c82";
  const goodWash = dark ? "rgba(61,220,151,.14)" : "rgba(11,122,83,.1)";
  return {
    revenue: <View style={{ ...surface, padding: 24, borderRadius: 20, backgroundColor: t.card }}>
      <Svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs><LinearGradient id={`${id}card`} x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0%" stopColor="#fff" stopOpacity={0.06} /><Stop offset="100%" stopColor="#fff" stopOpacity={0.01} /></LinearGradient></Defs>
        <Rect width="100%" height="100%" rx={20} fill={`url(#${id}card)`} />
      </Svg>
      <View style={{ ...row, justifyContent: "space-between" }}>
        <Text style={{ ...font("mono", 11), lineHeight: 11, letterSpacing: 0.88, color: subtle, textTransform: "uppercase" }}>Monthly revenue</Text>
        <Text style={{ ...font("sans", 12), height: 22, lineHeight: 22, paddingHorizontal: 8, borderRadius: 11, backgroundColor: goodWash, color: t.success }}>+18.2%</Text>
      </View>
      <Text style={{ ...font("display", 44), marginTop: 12, lineHeight: 44, letterSpacing: -1.32, fontVariant: ["tabular-nums"] }}>$128,400</Text>
      <View style={{ ...row, alignItems: "flex-end", height: 96, marginTop: 24, gap: 6 }}>
        {REVENUE.map((value, i) => <View key={i} style={{ flex: 1, height: `${value}%`, borderRadius: 4, backgroundColor: t.primary, opacity: OPACITY[i], ...(i === 11 ? { boxShadow: `0 0 24px ${t.glow ?? t.ring}` } : null) }}>
          {i === 11 ? <Svg width="100%" height="100%"><Defs><LinearGradient id={`${id}bar`} x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0%" stopColor={t["chart-2"]} /><Stop offset="100%" stopColor={t.primary} /></LinearGradient></Defs><Rect width="100%" height="100%" rx={4} fill={`url(#${id}bar)`} /></Svg> : null}
        </View>)}
      </View>
    </View>,
    segmented: <View style={{ ...surface, ...row, padding: 4, borderRadius: 12, boxShadow: shadowMd }}>
      {["Day", "Week", "Month"].map((label, i) => <View key={label} style={{ flex: 1, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: i === 1 ? t.secondary : "transparent", ...(i === 1 ? { boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,.1), 0 1px 2px rgba(0,0,0,.5)" : "0 1px 2px rgba(17,17,24,.05)" } : null) }}><Text style={{ ...font("sans", 13), lineHeight: 13, color: i === 1 ? t.foreground : subtle }}>{label}</Text></View>)}
    </View>,
    online: <View style={{ ...surface, ...row, gap: 10, paddingVertical: 8, paddingLeft: 8, paddingRight: 14, borderRadius: 999, boxShadow: shadowMd }}>
      <View style={row}>{["ada-lovelace", "grace-hopper", "kira-tanaka"].map((name, i) => <Image key={name} source={photo(name)} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: t.card, marginLeft: i ? -10 : 0 }} />)}</View>
      <Text style={{ ...font("sans", 12), lineHeight: 12, color: secondary }}>+12 online</Text>
    </View>,
    glass: <View style={{ ...surface, ...row, gap: 16, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16 }}>
      <View><Text style={{ ...font("sans", 14), lineHeight: 16.8 }}>Glass surface</Text><Text style={{ ...font("sans", 12, "400"), lineHeight: 15.6, color: subtle }}>Liquid on iOS 26, frost elsewhere</Text></View>
      <View style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: t.primary, boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" }}><View style={{ position: "absolute", top: 2, left: 20, width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.35)" }} /></View>
    </View>,
    toast: <View style={{ ...surface, ...row, gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: goodWash, alignItems: "center", justifyContent: "center" }}><Icon check size={14} color={t.success} decorative /></View>
      <Text style={{ ...font("sans", 13), lineHeight: 16.9, flex: 1 }}>Saved to workspace</Text>
      <Text style={{ ...font("sans", 13), lineHeight: 13, color: t["primary-text"] }}>Undo</Text>
    </View>,
    ship: <View style={{ ...row, height: 48, paddingHorizontal: 22, borderRadius: 12, gap: 10, backgroundColor: t.primary, boxShadow: `inset 0 1px 0 rgba(255,255,255,.3), 0 24px 50px -10px ${t.glow ?? t.ring}` }}>
      <Text style={{ ...font("sans", 15), lineHeight: 15, color: t["primary-foreground"] }}>Ship it</Text><Text style={{ ...font("sans", 15), lineHeight: 15, color: t["primary-foreground"] }}>→</Text>
    </View>,
  };
}
