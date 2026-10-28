import { Linking, type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, GlassPane, paneStyle } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useHover } from "../../style/hover.js";
import { useSeededMinTargetSlop } from "../../style/touch-target-seed.js";
import { platformMinTarget } from "../../style/touch-target.js";
import { Icon } from "../../atoms/icon/icon.js";
import type { CardProps } from "./card.shared.js";
import { webSkin as s } from "./card.reference.styles.js";

export type ReferenceMode = "detail" | "tile" | "stacked" | "inline";
export function referenceModeOf(p: CardProps): ReferenceMode | null {
  if (p.referenceDetail) return "detail";
  if (p.referenceTile) return "tile";
  if (p.referenceStacked) return "stacked";
  if (p.referenceInline) return "inline";
  return null;
}

/** The hand-off's linked-reference looks (see card.reference.styles.ts). */
export function ReferenceCard({ mode, hoverEnabled, referenceKey, referenceSource, title, description, href, onPress, accessibilityLabel, testID, style }: CardProps & { mode: ReferenceMode; hoverEnabled: boolean }) {
  const theme = useMaterialTheme({ static: true });
  const { tokens } = theme;
  const interactive = !!(href || onPress);
  const { hovered, target: hoverTarget } = useHover(hoverEnabled && interactive);
  const target = useSeededMinTargetSlop(platformMinTarget(), { height: mode === "inline" ? 36 : 48 });
  const shape = s.referenceBox(mode, tokens);
  const surface = [shape, hovered ? { backgroundColor: tokens.hover } : null];
  const inline = mode === "inline";
  const key = referenceKey ? <Text style={[s.key(tokens, MONO_FONT), inline ? s.inlineFixed : null]} numberOfLines={1}>{referenceKey}</Text> : null;
  const summary = title ? <Text style={[s.summary(tokens), inline ? s.inlineSummary : null]} numberOfLines={inline ? 1 : mode === "tile" ? 3 : 2}>{title}</Text> : null;
  const status = description ? <Text style={[s.status(tokens), inline ? s.inlineFixed : null]} numberOfLines={inline ? 1 : 2}>{description}</Text> : null;
  let content;
  if (inline) content = <><Icon decorative squareArrowOutUpRight size={13} color={tokens["subtle-foreground"] ?? tokens["muted-foreground"]} />{key}{summary}{status ? <><Text style={[s.status(tokens), s.inlineFixed]}>·</Text>{status}</> : null}</>;
  else if (mode === "tile") content = <>{key}{summary}</>;
  else if (mode === "detail") content = <><View style={s.detailHead}>{referenceSource ? <View style={s.sourceChip(tokens)}><Text style={s.source(tokens)} numberOfLines={1}>{referenceSource}</Text></View> : null}{key}</View>{summary}{status}</>;
  else content = <>{key}{summary}{status}</>;
  const inner = <><GlassPane layer="content" shape={shape} />{content}</>;
  if (!interactive) return <View testID={testID} style={[paneStyle(theme, surface), style]}>{inner}</View>;
  const press = (event: GestureResponderEvent) => { if (href) { event.preventDefault(); void Linking.openURL(href); } else onPress?.(); };
  return <Pressable {...hoverTarget} {...target} {...(href ? { href } : null)} accessibilityRole={href ? "link" : "button"} accessibilityLabel={accessibilityLabel ?? title ?? referenceKey} onPress={press} testID={testID} style={[paneStyle(theme, surface), style]}>{inner}</Pressable>;
}
