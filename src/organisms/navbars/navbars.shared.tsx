import { View, Pressable, Text, useTheme, useControllableState, GlassSurface, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { type Surface } from "./navbars.styles.js";

// Shared Navbar shell. The structure (the left brand + links cluster, the right
// action + avatar cluster), the surface-axis precedence, the active-link
// selection, the accessibility, and the press handlers live here once; a
// platform file supplies only its skin (the native bar height/padding, the
// surface treatment, the brand type, the link tile/label, and the press
// feedback) and calls createNavbar.
//
// The navbar is the primary app-level topbar: a brand on the left, a row of
// navigation links in the middle with one active, and actions on the right (a
// primary action button and/or an account avatar). It is a fixed-height
// horizontal bar, laid out desktop-first.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The surface axis sets
// how the bar sits on the page: the default rests flush with a bottom hairline,
// `bordered` boxes it on all four sides with a rounded outline, and `floating`
// lifts it as a rounded, shadowed card detached from the page edge. Each
// platform skin renders that axis in its own native idiom (iOS keeps a slim
// hairline-separated bar; Android keeps a flat borderless top app bar).

// The platform-varying surface. Everything color/shape-bearing the bar needs
// lives here, built from the active tokens (so each follows light/dark/glass).
export interface NavbarSkin {
  /** iOS/web dim a pressed link; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a pressed link; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Web-only focus-outline reset for the link Pressable. iOS sets this so the
   * react-native-web keyboard-focus blue ring (which a real iOS toolbar bar-button
   * item never shows) is suppressed, leaving the press dim as the only feedback.
   * Undefined on web/Android, which keep their own focus treatment. No-op
   * natively, where `outlineStyle`/`outlineWidth` are not real CSS. Mirrors
   * pagination/input/textarea's focus reset.
   */
  focusOutlineReset?: ViewStyle;

  /** The bar row: height, padding, and flex layout. */
  bar: (t: ColorTokens) => ViewStyle;
  /** The token-driven background fill (follows the scheme/glass surface). */
  surface: (t: ColorTokens) => ViewStyle;
  /** The surface-axis treatment (hairline / outline / floating card). */
  surfaceContainer: (t: ColorTokens, surface: Surface) => ViewStyle;

  /** The left cluster row (brand + links). */
  leftGroup: (t: ColorTokens) => ViewStyle;
  /** The brand wordmark type. */
  brand: (t: ColorTokens) => TextStyle;
  /** The links row. */
  linksRow: (t: ColorTokens) => ViewStyle;
  /** A nav link tile (padding + active fill). */
  linkTile: (t: ColorTokens, active: boolean) => ViewStyle;
  /** A nav link label (weight + active/inactive color). */
  linkLabel: (t: ColorTokens, active: boolean) => TextStyle;

  /** The right cluster row (action + avatar). */
  rightGroup: (t: ColorTokens) => ViewStyle;
}

export interface NavbarProps {
  /** Brand or product name shown at the left, in a semibold face. */
  brand: string;
  /** Ordered navigation link labels rendered in the middle row. */
  links: string[];
  /** Index of the active link (CONTROLLED; its label reads in the foreground color). Omit for uncontrolled use. */
  active?: number;
  /** Initial active link for uncontrolled use (a bare navbar moves the active link on press). */
  defaultActive?: number;
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
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: NavbarProps): Surface {
  if (p.bordered) return "bordered";
  if (p.floating) return "floating";
  return "default";
}

/** Build a Navbar component from a platform skin. */
export function createNavbar(skin: NavbarSkin) {
  return function Navbar(props: NavbarProps) {
    const { brand, links, actionLabel, onAction, avatar, onSelect, testID, style } = props;
    const { tokens } = useTheme();
    const surface = surfaceOf(props);
    // Controlled when `active` is provided, self-managed otherwise, so a bare
    // navbar moves the active link to the pressed one instead of ignoring taps.
    const [active, setActive] = useControllableState<number>(props.active, props.defaultActive ?? 0);

    // The bar joins the functional glass layer: GlassSurface paints the native
    // Liquid Glass (iOS) or frost (web/Android) in glass mode, and the solid skin
    // background in default mode. The glass fill is stripped by GlassSurface, so
    // the skin keeps supplying the solid background only.
    const container: StyleProp<ViewStyle> = [
      skin.bar(tokens),
      skin.surface(tokens),
      skin.surfaceContainer(tokens, surface),
      style,
    ];

    return (
      <GlassSurface testID={testID} style={container}>
        <View style={skin.leftGroup(tokens)}>
          <Text style={skin.brand(tokens)}>{brand}</Text>
          <View style={skin.linksRow(tokens)}>
            {links.map((link, index) => {
              const isActive = index === active;
              return (
                <Pressable
                  key={`${link}-${index}`}
                  onPress={() => {
                    setActive(index);
                    onSelect?.(index);
                  }}
                  android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
                  accessibilityRole="link"
                  accessibilityState={{ selected: isActive }}
                  aria-current={isActive ? "page" : undefined}
                  style={({ pressed }) => [
                    skin.linkTile(tokens, isActive),
                    skin.focusOutlineReset,
                    skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
                  ]}
                >
                  <Text style={skin.linkLabel(tokens, isActive)}>{link}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={skin.rightGroup(tokens)}>
          {actionLabel ? (
            <Button primary small onPress={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          {avatar ? <Avatar small name={avatar} /> : null}
        </View>
      </GlassSurface>
    );
  };
}
