import { useId, useState, type ReactNode } from "react";
import { StyleSheet, type LayoutChangeEvent, type ViewStyle, type StyleProp } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { View, Pressable, useTheme, useReducedMotion, pressDim } from "../../style/index.js";
import { liftStyle, useHover } from "../../style/hover.js";
import { HOVER } from "../../style/motion.js";
import { identityDisc, identityHue } from "../../style/identity-hue.js";
import { lightColors, mintColors, darkColors } from "../../style/tokens.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Typography } from "../../atoms/typography/typography.js";
import type { CardProps } from "./card.shared.js";
import { webSkin as s } from "./card.brand.styles.js";

export type BrandCardMode = "featured" | "promo";
export function brandCardModeOf(p: CardProps): BrandCardMode | null {
  if (p.featured) return "featured";
  if (p.promo) return "promo";
  return null;
}

export function artworkInsetOf(p: CardProps) {
  if (p.controls) return "controls";
  if (p.illustration) return "illustration";
  return "frame";
}

/** CSS-angle endpoints, in the same measured box as the original Argus artwork. */
export function cardGradientPoints(angle: number, width: number, height: number) {
  const w = width > 0 ? width : 1, h = height > 0 ? height : 1;
  const a = angle * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
  const length = Math.abs(w * dx) + Math.abs(h * Math.cos(a));
  return { x1: w / 2 - dx * length / 2, y1: h / 2 - dy * length / 2, x2: w / 2 + dx * length / 2, y2: h / 2 + dy * length / 2 };
}

function ArtPanel({ angle, stops, style, children }: { angle: number; stops: { color: string; at: number }[]; style: StyleProp<ViewStyle>; children?: ReactNode }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const id = `card-art-${useId().replace(/:/g, "")}`;
  const onLayout = (e: LayoutChangeEvent) => { const { width, height } = e.nativeEvent.layout; setSize((old) => old.width === width && old.height === height ? old : { width, height }); };
  const points = cardGradientPoints(angle, size.width, size.height);
  return <View style={style} onLayout={onLayout}>
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} preserveAspectRatio="none">
        <Defs><LinearGradient id={id} gradientUnits="userSpaceOnUse" {...points}>{stops.map((stop) => <Stop key={stop.at} offset={stop.at} stopColor={stop.color} />)}</LinearGradient></Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
    {children}
  </View>;
}

/** Authored brand artwork remains opaque identity content in every material mode. */
export function BrandCard(props: CardProps & { mode: BrandCardMode; hoverEnabled: boolean }) {
  const { tokens, scheme, palette } = useTheme();
  const base = scheme === "dark" ? darkColors : palette === "mint" ? mintColors : lightColors;
  const { hovered, target } = useHover(props.hoverEnabled && props.onPress != null);
  const reduced = useReducedMotion();
  const active = props.hoverEnabled && (props.testOnly_hovered ?? hovered);
  const stacked = !!props.stacked;
  const featureStops = [{ color: tokens["featured-start"] ?? base["featured-start"]!, at: 0 }, { color: tokens["featured-middle"] ?? base["featured-middle"]!, at: 0.52 }, { color: tokens["featured-end"] ?? base["featured-end"]!, at: 1 }];
  const promoStops = [{ color: tokens["promo-start"] ?? base["promo-start"]!, at: 0 }, { color: tokens["promo-middle"] ?? base["promo-middle"]!, at: 0.6 }, { color: tokens["promo-end"] ?? base["promo-end"]!, at: 1 }];
  if (props.artwork) {
    const art = <ArtPanel angle={props.mode === "promo" ? 135 : 115} stops={props.mode === "promo" ? promoStops : featureStops} style={[props.children != null ? s[artworkInsetOf(props)] : s.artwork, props.onPress ? null : props.style]}>{props.children}</ArtPanel>;
    return props.onPress ? <Pressable {...target} onPress={props.onPress} accessibilityRole="button" accessibilityLabel={props.accessibilityLabel} style={[s.artwork, props.style]} testID={props.testID}>{art}</Pressable> : art;
  }
  if (props.mode === "promo") return <ArtPanel angle={135} stops={promoStops} style={{ ...s.promo, boxShadow: `0 26px 50px -24px ${tokens.ring}` }}>
    <View style={s.promoOrb} />
    <Typography h4 bold captionLeading tightTracking inverse style={s.promoTitle}>{props.title}</Typography>
    <Typography small medium bodyLeading inverseHint style={{ marginTop: 8 }}>{props.body}</Typography>
    {props.actions ? <View style={{ marginTop: 14 }}>{props.actions}</View> : null}
  </ArtPanel>;
  const identity = identityDisc(props.hue ?? identityHue(props.title ?? ""));
  const heading = <>{props.eyebrow ? <Typography eyebrow extraBold bodyLeading uppercase expandedTracking inverseMuted>{props.eyebrow}</Typography> : null}<View style={s.nameRow}><Typography h1 bold bodyLeading tightTracking inverse>{props.title}</Typography>{props.description ? <Typography label bold bodyLeading inverseSoft>{props.description}</Typography> : null}{props.badge ? <Badge start small inverse uppercase>{props.badge}</Badge> : null}</View><Typography body medium bodyLeading inverseHint>{props.body}</Typography>{props.caption ? <Typography tiny medium bodyLeading inverseFaint>{props.caption}</Typography> : null}</>;
  const metadata = <Typography tiny semibold bodyLeading inverseMuted>{props.metadata}</Typography>;
  const content = <View style={[s.frame, { boxShadow: `0 14px 0 -7px ${tokens["featured-stack"] ?? base["featured-stack"]}, 0 34px 54px -24px rgba(50,35,120,0.65)` }, props.hoverEnabled ? liftStyle(active, HOVER.card, reduced) : null]}>
    <ArtPanel angle={115} stops={featureStops} style={s.featured(stacked)}>
      <ArtPanel angle={135} stops={[{ color: identity.from, at: 0 }, { color: identity.to, at: 1 }]} style={s.media(stacked)}>
        <View style={s.mediaOrb} />
        <Avatar whiteInk inverse initials={props.initials} name={props.title} featured={stacked} spotlight={!stacked} />
      </ArtPanel>
      {stacked ? <View style={s.stackedCopy}>{heading}<View style={s.stackedFooter}>{metadata}{props.actions}</View></View> : <View style={s.body}><View style={s.copy}>{heading}</View><View style={s.trailing}>{metadata}{props.actions}</View></View>}
    </ArtPanel>
  </View>;
  if (!props.onPress) return <View style={[s.frame, props.style]} testID={props.testID}>{content}</View>;
  return <Pressable {...target} accessibilityRole={props.interactiveContents ? "none" : "button"} accessibilityLabel={props.accessibilityLabel} onPress={props.onPress} testID={props.testID} style={({ pressed }) => [s.frame, props.style, props.steadyPress ? null : pressDim(pressed)]}>{content}</Pressable>;
}
