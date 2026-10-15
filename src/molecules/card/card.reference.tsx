import { Linking, type GestureResponderEvent } from "react-native";
import { View, Pressable, GlassPane, paneStyle } from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useHover } from "../../style/hover.js";
import { useSeededMinTargetSlop } from "../../style/touch-target-seed.js";
import { platformMinTarget } from "../../style/touch-target.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Typography } from "../../atoms/typography/typography.js";
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

/** The existing Card family's linked-reference anatomy. */
export function ReferenceCard({ mode, hoverEnabled, referenceKey, referenceSource, title, description, href, onPress, accessibilityLabel, testID, style }: CardProps & { mode: ReferenceMode; hoverEnabled: boolean }) {
  const theme = useMaterialTheme({ static: true });
  const { tokens } = theme;
  const interactive = !!(href || onPress);
  const { hovered, target: hoverTarget } = useHover(hoverEnabled && interactive);
  const target = useSeededMinTargetSlop(platformMinTarget(), { height: mode === "inline" || mode === "stacked" ? 24.95 : 48 });
  const framed = mode === "detail" || mode === "tile";
  const shape = s.referenceBox(mode);
  const surface = [shape, { backgroundColor: hovered ? tokens.hover : framed ? tokens.secondary : "transparent" }];
  const reference = <Badge start reference large={mode === "detail"}>{referenceKey}</Badge>;
  const summary = <Typography small semibold bodyLeading foreground numberOfLines={mode === "stacked" ? 2 : 1} style={mode === "inline" ? { flexShrink: 1 } : undefined}>{title}</Typography>;
  const status = <Typography micro semibold labelLeading muted numberOfLines={1} style={mode === "inline" ? { flexShrink: 0 } : { flexShrink: 1 }}>· {description}</Typography>;
  const glyph = <Icon decorative externalLink size={11} heavyStroke muted />;
  let content;
  if (mode === "detail") content = <>{reference}<View style={s.detailCopy}><Typography body bold captionLeading foreground>{title}</Typography><Typography tiny semibold captionLeading muted>{description}</Typography></View>{referenceSource ? <View style={s.source}><Typography tiny bold bodyLeading primary>{referenceSource}</Typography><Icon decorative externalLink size={12} heavyStroke primary /></View> : null}</>;
  else if (mode === "tile") content = <><View style={s.tileHeader}><Typography tag extraBold bodyLeading referenceTracking primary>{referenceKey}</Typography><Icon decorative externalLink size={10} heavyStroke muted /></View><Typography small semibold captionLeading foreground>{title}</Typography></>;
  else if (mode === "stacked") content = <><View style={s.stackedHeader}>{reference}{status}{glyph}</View>{summary}</>;
  else content = <>{reference}{summary}{status}{glyph}</>;
  const inner = <>{framed ? <GlassPane layer="content" shape={shape} /> : null}{content}</>;
  if (!interactive) return <View testID={testID} style={[framed ? paneStyle(theme, surface) : surface, style]}>{inner}</View>;
  const press = (event: GestureResponderEvent) => { if (href) { event.preventDefault(); void Linking.openURL(href); } else onPress?.(); };
  return <Pressable {...hoverTarget} {...target} {...(href ? { href } : null)} accessibilityRole={href ? "link" : "button"} accessibilityLabel={accessibilityLabel ?? title ?? referenceKey} onPress={press} testID={testID} style={[framed ? paneStyle(theme, surface) : surface, style]}>{inner}</Pressable>;
}
