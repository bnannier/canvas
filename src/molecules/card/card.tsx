import { type ReactNode } from "react";
import { View, Pressable, Text, useTheme, surfaceRipple, pressDim, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import * as s from "./card.styles.js";
import { type Elevation, type Density } from "./card.styles.js";

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
// - Interaction: `interactive` (with onPress) gives a pressed affordance, for a
//   card that behaves like a control.
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
  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
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

export function Card(props: CardProps) {
  const { children, title, description, body, footer, padded, onPress, style } = props;
  const { tokens } = useTheme();
  const elev = elevationOf(props);
  const dens = densityOf(props);

  const container: StyleProp<ViewStyle> = [
    s.cardBase,
    s.cardSurface(tokens),
    s.elevation(elev),
    // Density pads + gaps on its own and wins over `padded`; otherwise `padded`
    // applies the standard inset, and a bare card stays unpadded for composition.
    dens !== "default" ? s.density[dens] : padded ? s.padded : null,
    style,
  ];

  // Children win: when composed, render exactly what the caller passed.
  // Otherwise build a representative structure from the simple string props.
  let inner: ReactNode;
  if (children != null) {
    inner = children;
  } else {
    const hasHeader = title != null || description != null;
    inner = (
      <>
        {hasHeader ? (
          <CardHeader>
            {title != null ? <CardTitle>{title}</CardTitle> : null}
            {description != null ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
        ) : null}
        {hasHeader && body != null ? <CardSeparator /> : null}
        {body != null ? (
          <CardContent>
            <Text style={s.bodyText(tokens)}>{body}</Text>
          </CardContent>
        ) : null}
        {footer != null ? (
          <>
            <CardSeparator />
            <CardFooter>
              <Text style={s.footerText(tokens)}>{footer}</Text>
            </CardFooter>
          </>
        ) : null}
      </>
    );
  }

  // A pressable card swaps View for Pressable, adding the pressed affordance.
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        android_ripple={surfaceRipple(tokens)}
        style={({ pressed }) => [container, pressDim(pressed)]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={container}>{inner}</View>;
}

export interface CardSectionProps {
  children?: ReactNode;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<ViewStyle>;
}

export interface CardTextProps {
  children?: ReactNode;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<TextStyle>;
}

// Header: the labeled top of the card, holding the title and description.
export function CardHeader({ children, style }: CardSectionProps) {
  return <View style={[s.header, style]}>{children}</View>;
}

// Title: the card's heading. Semibold, tight tracking, card foreground.
export function CardTitle({ children, style }: CardTextProps) {
  const { tokens } = useTheme();
  return <Text style={[s.title(tokens), style]}>{children}</Text>;
}

// Description: the muted supporting line beneath the title.
export function CardDescription({ children, style }: CardTextProps) {
  const { tokens } = useTheme();
  return <Text style={[s.description(tokens), style]}>{children}</Text>;
}

// Content: the card body region. Carries the standard surface padding.
export function CardContent({ children, style }: CardSectionProps) {
  return <View style={[s.content, style]}>{children}</View>;
}

// Footer: the bottom region for actions or a summary line.
export function CardFooter({ children, style }: CardSectionProps) {
  return <View style={[s.footer, style]}>{children}</View>;
}

// Separator: the hairline that anchors a header above a body. A card composing
// a header and body keeps this divider between them.
export function CardSeparator({ style }: { style?: StyleProp<ViewStyle> }) {
  const { tokens } = useTheme();
  return <View style={[s.separator(tokens), style]} />;
}
