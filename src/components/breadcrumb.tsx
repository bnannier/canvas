import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";
import { Icon } from "./icon.js";

// A breadcrumb is a horizontal trail of links separated by a divider glyph, with
// the last item current (non-link, emphasized). Ancestors are muted links; the
// page you are on is plain foreground text at the end of the trail.
//
// Boolean-prop API, one axis: the separator style. Pick one of `chevron`
// (default), `slash`, or `dot`; first match wins (mirrors Button's intentOf). The
// engine has no SVG utility, so the chevron is a reading-direction glyph (the
// single-guillemet "›") rather than an icon, keeping every separator a Text glyph
// pointing in the reading direction.

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
  className?: string;
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
// the SVG chevron the engine cannot render).
const SEPARATOR_GLYPH: Record<Separator, string> = {
  chevron: "›",
  slash: "/",
  dot: "·",
};

// The nav row: wrapping horizontal trail, small muted type as the baseline.
const NAV = "flex-row flex-wrap items-center gap-1.5";
// A muted ancestor link; presses dim it for press feedback (RN has no hover).
const LINK = "text-sm text-muted-foreground active:opacity-70";
// The current page: emphasized foreground text, not a link.
const CURRENT = "text-sm font-medium text-foreground";
// The divider glyph: quieter than the labels so it reads as a path divider.
const SEPARATOR = "text-sm text-muted-foreground/60";

export interface BreadcrumbItemProps {
  children?: ReactNode;
  /** Render as the current page: emphasized foreground text, non-interactive. */
  current?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  className?: string;
}

// A single crumb. Current crumbs are plain emphasized text; ancestors are muted,
// pressable links.
export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { children, current, onPress, className } = props;
  if (children == null) return null;
  if (current) {
    return <Text className={cn(CURRENT, className)} accessibilityRole="text">{children}</Text>;
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="link">
      <Text className={cn(LINK, className)}>{children}</Text>
    </Pressable>
  );
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { items, homeIcon, onItemPress, className } = props;
  const trail = items ?? [];
  const separator = separatorOf(props);
  const glyph = SEPARATOR_GLYPH[separator];

  return (
    <View className={cn(NAV, className)} accessibilityRole="header">
      {homeIcon ? (
        <View className="flex-row items-center gap-1.5">
          <Pressable
            onPress={() => onItemPress?.("Home", 0)}
            accessibilityRole="link"
            accessibilityLabel="Home"
            className="active:opacity-70"
          >
            <Icon home muted size={14} />
          </Pressable>
          {trail.length === 0 ? null : (
            <Text className={SEPARATOR} accessibilityElementsHidden>
              {glyph}
            </Text>
          )}
        </View>
      ) : null}
      {trail.map((item, index) => {
        const last = index === trail.length - 1;
        return (
          <View key={`${index}-${item}`} className="flex-row items-center gap-1.5">
            <BreadcrumbItem
              current={last}
              onPress={last ? undefined : () => onItemPress?.(item, index)}
            >
              {item}
            </BreadcrumbItem>
            {last ? null : (
              <Text className={SEPARATOR} accessibilityElementsHidden>
                {glyph}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
