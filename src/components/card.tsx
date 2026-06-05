import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";

// Card: a surface container. The base surface gives you the border, radius, and
// shadow; you bring the content. Structure is composed from the subcomponents
// (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), with a
// hairline CardSeparator anchoring a header above a body.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axes:
//
// - Surface: `glass` (translucent popover tint) vs. the solid card default.
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
  // Surface (pick one; default is the solid card fill).
  glass?: boolean;
  // Elevation (pick one; default is a soft shadow-sm).
  raised?: boolean;
  flat?: boolean;
  // Interaction and padding (orthogonal booleans).
  interactive?: boolean;
  padded?: boolean;
  // Density (pick one; default is the standard inset). Scales the card's own
  // content padding and the gap between flat children.
  compact?: boolean;
  comfortable?: boolean;
  className?: string;
}

type Surface = "solid" | "glass";
type Elevation = "raised" | "flat" | "default";
type Density = "compact" | "comfortable" | "default";

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: CardProps): Surface {
  if (p.glass) return "glass";
  return "solid";
}

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
const CARD_SURFACE: Record<Surface, string> = {
  // Solid: the card token surface with its matching foreground and border.
  solid: "border-border bg-card",
  // Glass: a translucent popover tint that reads against busy backdrops.
  glass: "border-border/60 bg-popover/80",
};
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
  const { children, title, description, body, footer, interactive, padded, className } = props;
  const surface = surfaceOf(props);
  const elevation = elevationOf(props);
  const density = densityOf(props);

  const container = cn(
    CARD_BASE,
    CARD_SURFACE[surface],
    CARD_ELEVATION[elevation],
    interactive && "active:opacity-90",
    // Density pads + gaps on its own and wins over `padded`; otherwise `padded`
    // applies the standard inset, and a bare card stays unpadded for composition.
    density !== "default" ? CARD_DENSITY[density] : padded && "p-6",
    className,
  );

  // Children win: when composed, render exactly what the caller passed.
  if (children != null) {
    return <Box className={container}>{children}</Box>;
  }

  // Otherwise build a representative structure from the simple string props.
  const hasHeader = title != null || description != null;
  return (
    <Box className={container}>
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
    </Box>
  );
}

export interface CardSectionProps {
  children?: ReactNode;
  className?: string;
}

// Header: the labeled top of the card, holding the title and description.
export function CardHeader({ children, className }: CardSectionProps) {
  return <Box className={cn("gap-1.5 px-5 pb-4 pt-5", className)}>{children}</Box>;
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
  return <Box className={cn("px-5 py-5", className)}>{children}</Box>;
}

// Footer: the bottom region for actions or a summary line.
export function CardFooter({ children, className }: CardSectionProps) {
  return <Box className={cn("flex-row items-center gap-2 px-5 pb-5 pt-4", className)}>{children}</Box>;
}

// Separator: the hairline that anchors a header above a body. A card composing
// a header and body keeps this divider between them.
export function CardSeparator({ className }: { className?: string }) {
  return <Box className={cn("h-px w-full bg-border", className)} />;
}
