import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";
import { Button } from "./button.js";
import { Avatar } from "./avatar.js";

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
  className?: string;
}

type Surface = "default" | "bordered" | "floating";

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: NavbarProps): Surface {
  if (p.bordered) return "bordered";
  if (p.floating) return "floating";
  return "default";
}

// The default bar sits flush and is separated by a bottom hairline; bordered
// boxes it in a rounded outline; floating lifts it as a rounded, shadowed card.
const SURFACE_CONTAINER: Record<Surface, string> = {
  default: "border-b border-border",
  bordered: "rounded-lg border border-border",
  floating: "rounded-lg border border-border shadow-md",
};

export function Navbar(props: NavbarProps) {
  const { brand, links, active = 0, actionLabel, onAction, avatar, onSelect, className } = props;
  const surface = surfaceOf(props);

  const container = cn(
    "flex-row items-center justify-between h-14 bg-background px-4",
    SURFACE_CONTAINER[surface],
    className,
  );

  return (
    <View className={container}>
      <View className="flex-row items-center gap-4">
        <Text className="text-base font-semibold text-foreground">{brand}</Text>
        <View className="flex-row items-center gap-1">
          {links.map((link, index) => {
            const isActive = index === active;
            const label = cn(
              "text-sm",
              isActive ? "font-medium text-foreground" : "font-medium text-muted-foreground",
            );
            return (
              <Pressable
                key={`${link}-${index}`}
                className={cn(
                  "rounded-md px-3 py-1.5 active:opacity-90",
                  isActive && "bg-accent",
                )}
                onPress={onSelect ? () => onSelect(index) : undefined}
                accessibilityRole="link"
              >
                <Text className={label}>{link}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View className="flex-row items-center gap-2">
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
