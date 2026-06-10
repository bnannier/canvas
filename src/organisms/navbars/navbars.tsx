import { type ReactNode } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import * as s from "./navbars.styles.js";
import { type Surface } from "./navbars.styles.js";

// The navbar is the primary app-level topbar: a brand on the left, a row of
// navigation links in the middle with one active, and actions on the right
// (a primary action button and/or an account avatar). It is a fixed-height
// horizontal bar, laid out desktop-first.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The surface axis sets
// how the bar sits on the page: the default rests flush with a bottom hairline,
// `bordered` boxes it on all four sides with a rounded outline, and `floating`
// lifts it as a rounded, shadowed card detached from the page edge.

export interface NavbarProps {
  /** Brand or product name shown at the left, in a semibold face. */
  brand: string;
  /** Ordered navigation link labels rendered in the middle row. */
  links: string[];
  /** Index of the active link (its label reads in the foreground color). */
  active?: number;
  /** Optional primary action; renders a <Button primary small> on the right. */
  actionLabel?: string;
  /** Called when the action button is pressed. */
  onAction?: () => void;
  /** Optional account initials/name; renders an <Avatar small> on the right. */
  avatar?: string;
  /** Called when a nav link is pressed, with its index. */
  onSelect?: (index: number) => void;
  // Surface (pick one; default is the flush bottom-hairline bar).
  bordered?: boolean;
  floating?: boolean;
  children?: ReactNode;
  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
}

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: NavbarProps): Surface {
  if (p.bordered) return "bordered";
  if (p.floating) return "floating";
  return "default";
}

export function Navbar(props: NavbarProps) {
  const { brand, links, active = 0, actionLabel, onAction, avatar, onSelect, style } = props;
  const { tokens } = useTheme();
  const surface = surfaceOf(props);

  const container: StyleProp<ViewStyle> = [
    s.barBase,
    s.barSurface(tokens),
    s.surfaceContainer(tokens, surface),
    style,
  ];

  return (
    <View style={container}>
      <View style={s.leftGroup}>
        <Text style={s.brand(tokens)}>{brand}</Text>
        <View style={s.linksRow}>
          {links.map((link, index) => {
            const isActive = index === active;
            return (
              <Pressable
                key={`${link}-${index}`}
                style={({ pressed }) => [
                  s.linkBase,
                  isActive ? s.linkActive(tokens) : null,
                  pressed ? { opacity: 0.9 } : null,
                ]}
                onPress={onSelect ? () => onSelect(index) : undefined}
                accessibilityRole="link"
              >
                <Text style={[s.linkLabelBase, s.linkLabelColor(tokens, isActive)]}>{link}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={s.rightGroup}>
        {actionLabel ? (
          <Button primary small onPress={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {avatar ? <Avatar small name={avatar} /> : null}
      </View>
    </View>
  );
}
