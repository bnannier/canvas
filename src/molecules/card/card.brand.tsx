import { useId, useState, type ReactNode } from "react";
import { StyleSheet, type LayoutChangeEvent, type ViewStyle, type StyleProp } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import { View, Text, Pressable, useTheme, useReducedMotion, pressDim, shadow, mixOklab, alpha } from "../../style/index.js";
import { liftStyle, useHover } from "../../style/hover.js";
import { HOVER } from "../../style/motion.js";
import { identityHue } from "../../style/identity-hue.js";
import { MONO_FONT } from "../../style/mono.js";
import { colorsFor, type ColorTokens } from "../../style/tokens.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { Badge } from "../../atoms/badge/badge.js";
import type { CardProps } from "./card.shared.js";
import * as c from "./card.styles.js";
import type { CardSkin } from "./card.styles.js";
import { webSkin as s } from "./card.brand.styles.js";

// The hand-off's card modes (cv-kit-code.js `O('card')`): `featured` washes the card fill
// with the accent's soft tint from its top-left corner and rims it in the accent's ring,
// `promo` sweeps from the accent to the brand's cyan mixed into the card fill, and
// `artwork` paints two radial blooms (accent and cyan) over the quiet surface. `stacked`
// sets a second card behind the first, 8 px down and in. Their text is the card's own
// anatomy in its own inks, so every mode reads in both schemes.

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

/** CSS-angle endpoints for a linear gradient across a measured box. */
export function cardGradientPoints(angle: number, width: number, height: number) {
  const w = width > 0 ? width : 1, h = height > 0 ? height : 1;
  const a = angle * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
  const length = Math.abs(w * dx) + Math.abs(h * Math.cos(a));
  return { x1: w / 2 - dx * length / 2, y1: h / 2 - dy * length / 2, x2: w / 2 + dx * length / 2, y2: h / 2 + dy * length / 2 };
}

type GradientStop = { color: string; at: number; opacity?: number };
/** A radial bloom in the box's own fractions: centre, the radius its stops are laid along. */
type Bloom = { color: string; cx: number; cy: number; r: number; fade: number };

function useBox() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => { const { width, height } = e.nativeEvent.layout; setSize((old) => old.width === width && old.height === height ? old : { width, height }); };
  return { size, onLayout };
}

const hidden = { pointerEvents: "none", "aria-hidden": true, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" } as const;

/** A box painted with a linear gradient behind its children. */
function ArtPanel({ angle, stops, style, children }: { angle: number; stops: GradientStop[]; style: StyleProp<ViewStyle>; children?: ReactNode }) {
  const { size, onLayout } = useBox();
  const id = `card-art-${useId().replace(/:/g, "")}`;
  const points = cardGradientPoints(angle, size.width, size.height);
  return <View style={style} onLayout={onLayout}>
    <View style={StyleSheet.absoluteFill} {...hidden}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${size.width || 1} ${size.height || 1}`} preserveAspectRatio="none">
        <Defs><LinearGradient id={id} gradientUnits="userSpaceOnUse" {...points}>{stops.map((stop) => <Stop key={stop.at} offset={stop.at} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />)}</LinearGradient></Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
    {children}
  </View>;
}

/** A box painted with radial blooms over its own fill, behind its children. */
function BloomPanel({ blooms, style, children }: { blooms: Bloom[]; style: StyleProp<ViewStyle>; children?: ReactNode }) {
  const { size, onLayout } = useBox();
  const id = `card-bloom-${useId().replace(/:/g, "")}`;
  const w = size.width || 1, h = size.height || 1;
  return <View style={style} onLayout={onLayout}>
    <View style={StyleSheet.absoluteFill} {...hidden}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <Defs>{blooms.map((b, i) => {
          // A CSS `circle at x y` reaches its farthest corner; the bloom fades out at `fade` of that.
          const radius = Math.hypot(Math.max(b.cx, 1 - b.cx) * w, Math.max(b.cy, 1 - b.cy) * h) * b.r;
          return <RadialGradient key={i} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" cx={b.cx * w} cy={b.cy * h} r={radius} fx={b.cx * w} fy={b.cy * h}>
            <Stop offset={0} stopColor={b.color} stopOpacity={1} />
            <Stop offset={b.fade} stopColor={b.color} stopOpacity={0} />
          </RadialGradient>;
        })}</Defs>
        {blooms.map((_, i) => <Rect key={i} width="100%" height="100%" fill={`url(#${id}-${i})`} />)}
      </Svg>
    </View>
    {children}
  </View>;
}

// The hand-off's `--ion-ring`: the accent at 35% on the dark page and 28% on the light one.
const RING_ALPHA = { dark: 0.35, light: 0.28 } as const;

/** The hand-off's two blooms: the accent high and left, the cyan low and right (swapped on promo). */
function blooms(tokens: ColorTokens, cyan: string, promo: boolean): Bloom[] {
  const [first, second] = promo ? [cyan, tokens.primary] : [tokens.primary, cyan];
  return [{ color: first, cx: 0.3, cy: 0.3, r: 1, fade: 0.55 }, { color: second, cx: 0.75, cy: 0.7, r: 1, fade: 0.5 }];
}

/** The featured, promotional and artwork modes of Card, at a skin's corner and title face. */
export function createBrandCard(skin: Pick<CardSkin, "radius" | "titleFont">) {
  return function BrandCard(props: CardProps & { mode: BrandCardMode; hoverEnabled: boolean }) {
    const { tokens, scheme, palette } = useTheme();
    const base = colorsFor(palette, scheme);
    const { hovered, target } = useHover(props.hoverEnabled && props.onPress != null);
    const reduced = useReducedMotion();
    const active = props.hoverEnabled && (props.testOnly_hovered ?? hovered);
    const promo = props.mode === "promo";
    const cyan = tokens["promo-middle"] ?? base["promo-middle"]!;
    const corner: ViewStyle = { borderRadius: skin.radius };
    const compact = !!props.compact;

    if (props.artwork) {
      const art = <BloomPanel blooms={blooms(tokens, cyan, promo)} style={[props.children != null ? s[artworkInsetOf(props)] : s.artwork, corner, { backgroundColor: tokens.muted, borderColor: tokens.border }, props.onPress ? null : props.style]}>{props.children}</BloomPanel>;
      return props.onPress ? <Pressable {...target} onPress={props.onPress} accessibilityRole="button" accessibilityLabel={props.accessibilityLabel} style={[s.artwork, corner, props.style]} testID={props.testID}>{art}</Pressable> : art;
    }

    // The surface: the featured accent wash over the card fill, or the promotional sweep.
    const fill: GradientStop[] = promo
      ? [{ color: mixOklab(tokens.card, tokens.primary, 0.4), at: 0 }, { color: mixOklab(tokens.card, cyan, 0.3), at: 1 }]
      : [{ color: tokens["primary-soft"] ?? alpha(tokens.primary, 0.16), at: 0 }, { color: tokens["primary-soft"] ?? alpha(tokens.primary, 0.16), at: 0.6, opacity: 0 }];
    const rim = promo ? tokens.border : alpha(tokens.primary, RING_ALPHA[scheme]);
    const elevation = props.flat ? shadow("none") : shadow(props.raised || active ? "lg" : "sm", tokens);
    const surface: StyleProp<ViewStyle> = [s.surface(compact), corner, { backgroundColor: tokens.card, borderColor: rim }, elevation, props.hoverEnabled ? liftStyle(active, HOVER.card, reduced, !props.raised && !props.flat) : null];

    const identity = props.initials ? <Avatar initials={props.initials} name={props.title} hue={props.hue ?? identityHue(props.title ?? "")} /> : null;
    const top = props.eyebrow || props.badge ? <View style={s.topRow}>
      {props.eyebrow ? <Text style={[c.eyebrow(tokens), { fontFamily: MONO_FONT }, promo ? { color: tokens.foreground } : null]}>{props.eyebrow}</Text> : <View />}
      {props.badge ? <Badge secondary mono small>{props.badge}</Badge> : null}
    </View> : null;
    const head = props.title || props.description ? <View style={[s.head, props.description ? s.headTop : null]}>
      {identity}
      <View style={s.headCopy}>
        {props.title ? <Text style={[c.title(tokens, skin.titleFont), compact ? s.compactTitle : null]}>{props.title}</Text> : null}
        {props.description ? <Text style={c.description(tokens)}>{props.description}</Text> : null}
      </View>
    </View> : identity;
    const meta = props.caption || props.metadata ? <View style={s.meta}>
      {props.caption ? <Text style={c.footerText(tokens)}>{props.caption}</Text> : null}
      {props.metadata ? <Text style={[c.footerText(tokens), { fontFamily: MONO_FONT }]}>{props.metadata}</Text> : null}
    </View> : null;
    const content = <ArtPanel angle={promo ? 135 : 160} stops={fill} style={surface}>
      {top}
      {head}
      {props.body ? <Text style={c.bodyText(tokens)}>{props.body}</Text> : null}
      {props.children}
      {meta}
      {props.actions ? <View style={s.actions}>{props.actions}</View> : null}
    </ArtPanel>;
    // `stacked` sets a second card behind the first, 8 px down and in.
    const stack = props.stacked ? <View style={[s.stack, corner, { backgroundColor: tokens.popover, borderColor: tokens.border }]} {...hidden} /> : null;
    if (!props.onPress) return <View style={[s.frame, props.style]} testID={props.testID}>{stack}{content}</View>;
    return <Pressable {...target} accessibilityRole={props.interactiveContents ? "none" : "button"} accessibilityLabel={props.accessibilityLabel} onPress={props.onPress} testID={props.testID} style={({ pressed }) => [s.frame, props.style, props.steadyPress ? null : pressDim(pressed)]}>{stack}{content}</Pressable>;
  };
}
