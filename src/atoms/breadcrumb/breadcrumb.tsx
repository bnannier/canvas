import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";
import * as s from "./breadcrumb.styles.js";

// A breadcrumb is a horizontal trail of links separated by a divider glyph, with
// the last item current (non-link, emphasized). Ancestors are muted links; the
// page you are on is plain foreground text at the end of the trail.
//
// Boolean-prop API, one axis: the separator style. Pick one of `chevron`
// (default), `slash`, or `dot`; first match wins (mirrors Button's intentOf). The
// foundation has no SVG utility here, so the chevron is a reading-direction glyph
// (the single-guillemet "›") rather than an icon, keeping every separator a Text
// glyph pointing in the reading direction.

export interface BreadcrumbProps {
  /**
   * The trail, ancestor-first. The last entry renders as the current page (plain
   * emphasized text); the rest render as muted links.
   */
  items?: string[];
  // Separator style (pick one; default is the chevron glyph).
  chevron?: boolean;
  slash?: boolean;
  dot?: boolean;
  /**
   * Leading affordance: prepend a muted home-icon crumb (aria-labelled "Home")
   * before the trail, followed by the separator. Off by default.
   */
  homeIcon?: boolean;
  /** Fired with the crumb label and its index when a link (non-last) is pressed. */
  onItemPress?: (item: string, index: number) => void;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<ViewStyle>;
}

type Separator = "chevron" | "slash" | "dot";

// Separator precedence when more than one flag is passed: first match wins.
function separatorOf(p: BreadcrumbProps): Separator {
  if (p.chevron) return "chevron";
  if (p.slash) return "slash";
  if (p.dot) return "dot";
  return "chevron";
}

// The divider glyph per style. A centered middot for `dot`, a forward slash for
// `slash`, and a reading-direction single guillemet for `chevron` (stands in for
// the SVG chevron not rendered here).
const SEPARATOR_GLYPH: Record<Separator, string> = {
  chevron: "›",
  slash: "/",
  dot: "·",
};

export interface BreadcrumbItemProps {
  children?: ReactNode;
  /** Render as the current page: emphasized foreground text, non-interactive. */
  current?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<TextStyle>;
}

// A single crumb. Current crumbs are plain emphasized text; ancestors are muted,
// pressable links.
export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { children, current, onPress, style } = props;
  const { tokens } = useTheme();
  if (children == null) return null;
  if (current) {
    return <Text style={[s.current(tokens), style]} accessibilityRole="text">{children}</Text>;
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="link">
      {({ pressed }) => (
        <Text style={[s.link(tokens), pressed ? { opacity: 0.7 } : null, style]}>{children}</Text>
      )}
    </Pressable>
  );
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { items, homeIcon, onItemPress, style } = props;
  const { tokens } = useTheme();
  const trail = items ?? [];
  const separator = separatorOf(props);
  const glyph = SEPARATOR_GLYPH[separator];

  return (
    <View style={[s.nav, style]} accessibilityRole="header">
      {homeIcon ? (
        <View style={s.crumb}>
          <Pressable
            onPress={() => onItemPress?.("Home", 0)}
            accessibilityRole="link"
            accessibilityLabel="Home"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
          >
            <Icon home muted size={14} />
          </Pressable>
          {trail.length === 0 ? null : (
            <Text style={s.separator(tokens)} accessibilityElementsHidden>
              {glyph}
            </Text>
          )}
        </View>
      ) : null}
      {trail.map((item, index) => {
        const last = index === trail.length - 1;
        return (
          <View key={`${index}-${item}`} style={s.crumb}>
            <BreadcrumbItem
              current={last}
              onPress={last ? undefined : () => onItemPress?.(item, index)}
            >
              {item}
            </BreadcrumbItem>
            {last ? null : (
              <Text style={s.separator(tokens)} accessibilityElementsHidden>
                {glyph}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
