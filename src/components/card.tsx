import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";

// Card: a surface container. The base surface gives you the border, radius, and
// shadow; you bring the content. Structure is composed from the subcomponents
// (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), with a
// hairline CardSeparator anchoring a header above a body.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axes:
//
// - Elevation (pick one): `raised` > `flat` > default (shadow-sm). `flat`
//   drops the shadow; `raised` lifts it to shadow-md.
// - Interaction: `interactive` adds a pressed-affordance (active:opacity-90),
//   for a card that behaves like a control.
// - Padding: `padded` pads the surface itself (good for a single block of
//   content); omit when you compose CardHeader/CardContent, which carry their
//   own padding.
// - Density (pick one): `compact` > `comfortable`. Sets the card's own content
//   padding and the gap between flat children, tight (compact) or roomy
//   (comfortable). A density prop pads the surface on its own, so it needs no
//   `padded`, and it wins over `padded` when both are set.
//
// For the docs playground, which maps plain state to props (no JSX children),
// Card also accepts simple string props (title, description, body, footer):
// when no children are passed it renders the header/body/footer structure from
// those strings, so a representative card can be produced from flat state.

export interface CardProps {
  children?: ReactNode;
  // Simple content props for the children-less / data-driven case.
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
  // Elevation (pick one; default is a soft shadow-sm).
  raised?: boolean;
  flat?: boolean;
  // Interaction and padding (orthogonal booleans).
  interactive?: boolean;
  padded?: boolean;
  /** When set, the whole card becomes pressable (a card that behaves as a control). */
  onPress?: () => void;
  // Density (pick one; default is the standard inset). Scales the card's own
  // content padding and the gap between flat children.
  compact?: boolean;
  comfortable?: boolean;
  className?: string;
}

type Elevation = "raised" | "flat" | "default";
type Density = "compact" | "comfortable" | "default";

// Elevation precedence when more than one is passed: first match wins.
function elevationOf(p: CardProps): Elevation {
  if (p.raised) return "raised";
  if (p.flat) return "flat";
  return "default";
}

// Density precedence when more than one is passed: first match wins.
function densityOf(p: CardProps): Density {
  if (p.compact) return "compact";
  if (p.comfortable) return "comfortable";
  return "default";
}

const CARD_BASE = "rounded-lg border";
// The card surface fill: bg-card with its matching border. The engine renders
// bg-card translucent when the ThemeProvider's surface is "glass", so a card
// reads as glass at the theming level, with no per-card prop.
const CARD_SURFACE = "border-border bg-card";
const CARD_ELEVATION: Record<Elevation, string> = {
  raised: "shadow-md",
  flat: "shadow-none",
  default: "shadow-sm",
};
// Density sets the card's own content padding and the gap between flat children.
// It pads the surface on its own (no `padded` needed) and wins over `padded`.
const CARD_DENSITY: Record<Density, string> = {
  compact: "p-4 gap-3",
  comfortable: "p-8 gap-6",
  default: "",
};

export function Card(props: CardProps) {
  const { children, title, description, body, footer, interactive, padded, onPress, className } = props;
  const elevation = elevationOf(props);
  const density = densityOf(props);

  const container = cn(
    CARD_BASE,
    CARD_SURFACE,
    CARD_ELEVATION[elevation],
    (interactive || onPress) && "active:opacity-90",
    // Density pads + gaps on its own and wins over `padded`; otherwise `padded`
    // applies the standard inset, and a bare card stays unpadded for composition.
    density !== "default" ? CARD_DENSITY[density] : padded && "p-6",
    className,
  );

  // A pressable card swaps View for Pressable; otherwise it is a plain surface.
  const Wrapper = onPress ? Pressable : View;
  const wrapperProps = onPress ? { onPress, accessibilityRole: "button" as const } : {};

  // Children win: when composed, render exactly what the caller passed.
  if (children != null) {
    return <Wrapper className={container} {...wrapperProps}>{children}</Wrapper>;
  }

  // Otherwise build a representative structure from the simple string props.
  const hasHeader = title != null || description != null;
  return (
    <Wrapper className={container} {...wrapperProps}>
      {hasHeader ? (
        <CardHeader>
          {title != null ? <CardTitle>{title}</CardTitle> : null}
          {description != null ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      ) : null}
      {hasHeader && body != null ? <CardSeparator /> : null}
      {body != null ? (
        <CardContent>
          <Text className="text-sm text-card-foreground">{body}</Text>
        </CardContent>
      ) : null}
      {footer != null ? (
        <>
          <CardSeparator />
          <CardFooter>
            <Text className="text-sm text-muted-foreground">{footer}</Text>
          </CardFooter>
        </>
      ) : null}
    </Wrapper>
  );
}

export interface CardSectionProps {
  children?: ReactNode;
  className?: string;
}

// Header: the labeled top of the card, holding the title and description.
export function CardHeader({ children, className }: CardSectionProps) {
  return <View className={cn("gap-1.5 px-5 pb-4 pt-5", className)}>{children}</View>;
}

// Title: the card's heading. Semibold, tight tracking, card foreground.
export function CardTitle({ children, className }: CardSectionProps) {
  return (
    <Text className={cn("text-xl font-semibold tracking-tight text-card-foreground", className)}>
      {children}
    </Text>
  );
}

// Description: the muted supporting line beneath the title.
export function CardDescription({ children, className }: CardSectionProps) {
  return <Text className={cn("text-sm text-muted-foreground", className)}>{children}</Text>;
}

// Content: the card body region. Carries the standard surface padding.
export function CardContent({ children, className }: CardSectionProps) {
  return <View className={cn("px-5 py-5", className)}>{children}</View>;
}

// Footer: the bottom region for actions or a summary line.
export function CardFooter({ children, className }: CardSectionProps) {
  return <View className={cn("flex-row items-center gap-2 px-5 pb-5 pt-4", className)}>{children}</View>;
}

// Separator: the hairline that anchors a header above a body. A card composing
// a header and body keeps this divider between them.
export function CardSeparator({ className }: { className?: string }) {
  return <View className={cn("h-px w-full bg-border", className)} />;
}
