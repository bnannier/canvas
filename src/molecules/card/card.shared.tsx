import { type ReactNode } from "react";
import { View, Pressable, Text, useTheme, surfaceRipple, pressDim, RippleClip, cornerRadii, splitElevation, alpha, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import * as s from "./card.styles.js";
import { type CardSkin, type Elevation, type Density } from "./card.styles.js";

// Shared Card shell. The structure (a surface giving you border, radius, and
// shadow, composed from the subcomponents below), the boolean-prop axes, the
// children-vs-string content logic, and the semantic colors all live here once; a
// platform file supplies only its skin (radius, elevation, the card's own density
// padding) and calls createCard.
//
// Card is a "Light" platform treatment: one structure and one set of (semantic)
// colors, with per-OS touches limited to the corner radius (+ the iOS continuous
// corner curve), the surface's border-vs-elevation treatment (Android's M3
// elevated default hides the outline), the card's own content density, the
// resting elevation, and the press feedback (Android android_ripple, iOS/web
// pressed opacity). The composition subcomponents are static and shared.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axes:
//
// - Elevation (pick one): `raised` > `flat` > default. `flat` drops the shadow;
//   `raised` lifts it. (The exact resting/raised shadow is per-OS via the skin.)
// - Interaction: pass `onPress` to make the whole card pressable; it gains the
//   pressed affordance (Android ripple, iOS/web pressed dim) and the button role.
// - Padding: a card with raw children pads its surface by DEFAULT (the common
//   case, so a bare `<Card>content</Card>` reads right without ceremony). `flush`
//   removes the inset for edge-to-edge content (a table, a nav bar) or when you
//   compose CardHeader/CardContent, which carry their own padding. `padded` is
//   the explicit form of the default. The data-driven string-prop path renders
//   self-padding sections, so a childless card stays bare on its own.
// - Density (pick one): `compact` > `comfortable`. Sets the card's own content
//   padding and the gap between flat children, tight (compact) or roomy
//   (comfortable). A density prop pads the surface on its own, so it needs no
//   `padded`, and it wins over `padded` when both are set.
//
// For the docs playground, which maps plain state to props (no JSX children),
// Card also accepts simple string props (title, description, body, footer):
// when no children are passed it renders the header/body/footer structure from
// those strings, so a representative card can be produced from flat state.

export type { CardSkin } from "./card.styles.js";

export interface CardProps {
  children?: ReactNode;
  // Simple content props for the children-less / data-driven case.
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
  // Elevation (pick one; default is a soft resting shadow).
  raised?: boolean;
  flat?: boolean;
  // Padding (orthogonal booleans). A card with raw children is padded by default;
  // `flush` removes the inset for edge-to-edge content or when you compose the
  // self-padding CardHeader/CardContent. `padded` is the explicit form of the
  // default (kept for clarity and back-compat).
  padded?: boolean;
  flush?: boolean;
  /** When set, the whole card becomes pressable (a card that behaves as a control). */
  onPress?: () => void;
  /**
   * Active/selected surface: a primary border and a soft primary tint. For
   * selectable cards (a card-style radio or checkbox option that is chosen).
   */
  selected?: boolean;
  /** Grow to fill the main axis of a parent Row/Column (flexGrow: 1). */
  grow?: boolean;
  // Density (pick one; default is the standard inset). Scales the card's own
  // content padding and the gap between flat children.
  compact?: boolean;
  comfortable?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
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

export function createCard(skin: CardSkin) {
  return function Card(props: CardProps) {
    const { children, title, description, body, footer, padded, flush, onPress, selected, grow, testID, style } = props;
    const { tokens } = useTheme();
    const elev = elevationOf(props);
    const dens = densityOf(props);

    // Shape: per-OS radius; iOS adds Apple's continuous (superellipse) corner curve
    // (an iOS-only RN style prop, omitted entirely on the other skins).
    const shape: ViewStyle = { borderRadius: skin.radius, ...(skin.curve ? { borderCurve: skin.curve } : null) };
    // The card's visual box WITHOUT the elevation shadow and WITHOUT outer layout: shape, the
    // per-variant surface colors, density padding, and the selected tint.
    const surface: StyleProp<ViewStyle> = [
      s.cardBase,
      shape,
      // Surface colors per elevation variant: web/iOS always show the Light-
      // treatment hairline; Android paints it transparent on the non-outlined
      // (M3 elevated) variants and shows it only on `flat` (M3 outlined).
      skin.surface(tokens, elev),
      // Density pads + gaps on its own and wins over everything. Otherwise a card
      // with raw children pads by default (the common case); `flush` opts out
      // (edge-to-edge content, or composing self-padding CardHeader/CardContent),
      // and the data-driven string path (no children) stays bare since its own
      // sections carry the padding. `padded` is the explicit form of the default.
      dens !== "default" ? skin.density[dens] : flush ? null : padded || children != null ? skin.padded : null,
      // Selected: recolor the border to primary and wash the surface with a soft
      // primary tint (the border width is unchanged, so content never shifts; on
      // Android's elevated default the resting hairline is transparent, so this
      // paints it in).
      selected ? { borderColor: tokens.primary, backgroundColor: alpha(tokens.primary, 0.05) } : null,
    ];
    // Outer layout composition, carried on the outermost node (the plain View, or the
    // RippleClip wrapper on a pressable card).
    const outer: StyleProp<ViewStyle> = [grow ? { flexGrow: 1 } : null, style];

    // Children win: when composed, render exactly what the caller passed.
    // Otherwise build a representative structure from the simple string props.
    let inner: ReactNode;
    if (children != null) {
      inner = children;
    } else {
      // Empty strings count as "no content" in this data-driven path, so a
      // cleared field never renders an empty header, body, footer, or a stray
      // separator. Guard on truthiness rather than null for these display strings.
      const hasHeader = Boolean(title) || Boolean(description);
      inner = (
        <>
          {hasHeader ? (
            <CardHeader>
              {title ? <CardTitle>{title}</CardTitle> : null}
              {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>
          ) : null}
          {hasHeader && body ? <CardSeparator /> : null}
          {body ? (
            <CardContent>
              <Text style={s.bodyText(tokens)}>{body}</Text>
            </CardContent>
          ) : null}
          {footer ? (
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

    // A pressable card swaps View for Pressable, adding the pressed affordance:
    // Android gets the surface ripple, iOS/web get the pressed opacity dim.
    if (onPress) {
      // The bounded ripple is clipped to the rounded card by the RippleClip parent (Android only).
      // A same-node overflow:"hidden" cannot clip it (see src/style/ripple-clip). Because that
      // parent-clip WOULD cut the child's own Android elevation shadow, the Android `elevation`
      // moves onto the wrapper (whose own shadow is drawn around its outline, unclipped) while the
      // iOS `shadow*` stays on the inner node — so iOS is unchanged.
      const { parent: elevParent, child: elevChild } = splitElevation(skin.elevation(elev));
      return (
        <RippleClip shape={cornerRadii(shape)} style={[elevParent, outer]}>
          <Pressable
            accessibilityRole="button"
            onPress={onPress}
            testID={testID}
            android_ripple={surfaceRipple(tokens)}
            style={({ pressed }) => [surface, elevChild, pressDim(pressed)]}
          >
            {inner}
          </Pressable>
        </RippleClip>
      );
    }
    return <View testID={testID} style={[surface, skin.elevation(elev), outer]}>{inner}</View>;
  };
}

export interface CardSectionProps {
  children?: ReactNode;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

export interface CardTextProps {
  children?: ReactNode;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
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
