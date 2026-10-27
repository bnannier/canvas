import type { ReactNode } from "react";
import { View, Text } from "../../style/primitives.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { GlassPane, paneStyle } from "../../style/glass-surface/glass-pane.js";
import { statusColors } from "../../style/status.js";
import { shape } from "../../style/tokens.js";
import type { LayoutStyle } from "../../style/sizing.js";
import type { TextStyle, ViewStyle } from "react-native";

// The count a control carries when Button passes it a `count`, the hand-off's (cv-kit.js
// `K.btn`): an 18 px solid destructive pill with a 600 11 px count. It reads the theme's
// roles directly, so Button does not carry the status table Badge's family needs.
const COUNT_BOX: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: shape.web.pill, minWidth: 18, height: 18, paddingHorizontal: 5 };
const COUNT_LABEL: TextStyle = { fontSize: 11, lineHeight: 18, fontWeight: "600" };

/** Button's count: the solid destructive pill, brand-tinted glass under glass. */
export function CountBadge({ children }: { children?: ReactNode }) {
  const theme = useMaterialTheme({ static: true, layer: "control" });
  const { tokens } = theme;
  const fill = tokens.destructive;
  return <View style={paneStyle(theme, [COUNT_BOX, { backgroundColor: fill }])}>
    <GlassPane static layer="control" shape={COUNT_BOX} brand={fill} />
    <Text style={[COUNT_LABEL, { color: tokens["destructive-foreground"] }]}>{children}</Text>
  </View>;
}

// Badge's own notification family, the hand-off's (cv-kit-code.js `O('badge')`): a 20 px
// destructive pill with a 600 11 px count, soft (the destructive wash under its solved ink)
// or solid (the destructive fill under its foreground), set off from the page by a 2 px
// ring of the background, and `halo` adds a 5 px ring of the destructive wash around that.
const BADGE_BOX: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: shape.web.pill, minWidth: 20, height: 20, paddingHorizontal: 6 };
const BADGE_LABEL: TextStyle = { fontSize: 11, lineHeight: 14, fontWeight: "600" };

/** Badge's notification family: the soft or solid destructive count. */
export function NotificationBadge({ children, solid, halo, style, testID }: {
  children?: ReactNode;
  /** The solid destructive count; the soft one without it. */
  solid?: boolean;
  /** A ring of the destructive wash around the count, for a count that asks for action. */
  halo?: boolean;
  style?: LayoutStyle;
  testID?: string;
}) {
  const theme = useMaterialTheme({ static: true, layer: "control" });
  const { tokens } = theme;
  const error = statusColors(tokens, "error");
  const fill = solid ? tokens.destructive : error.wash;
  const ink = solid ? tokens["destructive-foreground"] : error.ink;
  const ring: ViewStyle = { boxShadow: `0px 0px 0px 2px ${tokens.background}${halo ? `, 0px 0px 0px 5px ${error.wash}` : ""}` };
  return <View style={[paneStyle(theme, [BADGE_BOX, { backgroundColor: fill }]), ring, style]} testID={testID}>
    <GlassPane static layer="control" shape={BADGE_BOX} brand={solid ? fill : undefined} tint={solid ? undefined : fill} />
    <Text style={[BADGE_LABEL, { color: ink }]}>{children}</Text>
  </View>;
}
