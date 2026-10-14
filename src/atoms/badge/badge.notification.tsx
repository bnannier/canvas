import type { ReactNode } from "react";
import { View, Text } from "../../style/primitives.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { GlassPane, paneStyle } from "../../style/glass-surface/glass-pane.js";
import { actionFill, actionInk } from "../../style/action.js";
import { shape } from "../../style/tokens.js";
import type { LayoutStyle } from "../../style/sizing.js";
import type { TextStyle, ViewStyle } from "react-native";

const BOX: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: shape.web.pill, minWidth: 16, height: 16, paddingHorizontal: 4 };
const LABEL: TextStyle = { fontSize: 9.5, lineHeight: 9.5, fontWeight: "800" };

/** Badge's notification anatomy, shared privately with Button without its other families. */
export function NotificationBadge({ children, style, testID }: { children?: ReactNode; style?: LayoutStyle; testID?: string }) {
  const theme = useMaterialTheme({ static: true, layer: "control" });
  const fill = actionFill(theme.tokens);
  return <View style={[paneStyle(theme, [BOX, { backgroundColor: fill }]), style]} testID={testID}>
    <GlassPane static layer="control" shape={BOX} tint={fill} />
    <Text style={[LABEL, { color: actionInk(theme.tokens) }]}>{children}</Text>
  </View>;
}
