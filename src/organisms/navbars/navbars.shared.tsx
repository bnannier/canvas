import { type ComponentType, type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, ScrollView, RippleClip, cornerRadii, useTheme, useControllableState, useContainerBreakpoint, GlassPane, GlassSurface, paneStyle, paneRipple, withInnerFill, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { selectionTint } from "../../style/selection-tint.js";
import { useHover } from "../../style/hover.js";
import { useHorizontalScrollFocus } from "../../style/use-scroll-focus.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Avatar as WebAvatar } from "../../atoms/avatar/avatar.js";
import { Icon } from "../../atoms/icon/icon.js";
import { Dropdown as WebDropdown, type DropdownProps, type DropdownItem } from "../../atoms/dropdown/dropdown.js";
import { type Surface, type Density } from "./navbars.styles.js";

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
// Both clusters take a caller-supplied element beside their built-in parts, so a
// console topbar composes out of the same bar: `brandContent` leads the left
// cluster (a logo mark ahead of, or instead of, the `brand` wordmark) and
// `actions` leads the right one (a search button, icon buttons, a notification
// dropdown, an account menu, ahead of `actionLabel` and `avatar`). Both sit as
// direct children of the existing group rows, so they take those rows' own gap
// and no skin field is involved. `links` is optional: a bar with no middle nav
// renders neither the links row nor its collapsed menu button.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The surface axis sets
// how the bar sits on the page: the default rests flush with a bottom hairline,
// `bordered` boxes it on all four sides with a rounded outline, and `floating`
// lifts it as a rounded, shadowed card detached from the page edge. Each
// platform skin renders that axis in its own native idiom (iOS keeps a slim
// hairline-separated bar; Android keeps a flat borderless top app bar). `bare`
// paints no surface and no hairline at all, so the bar sits clear on whatever is
// behind it: the scroll-edge appearance of iOS's navigation bar and Material 3's
// top app bar, which an app passes while nothing has scrolled under the bar and
// drops once content does, so the bar's own material returns to keep it legible.
//
// The density axis (`compact`) tightens the bar: on the web it is the hand-off's docs
// pill (44px, a 5px inset, 2px between every item), natively a shorter bar with the
// gutter and the gaps pulled in.
//
// Narrow widths: by default the bar measures its own width and, at and below `sm`,
// folds the links into a menu button. `scrolls` trades that fold for the hand-off
// pill's own answer: the bar keeps every link and its content row pans sideways inside
// the bar (a horizontal scroller with no indicator), at every width. `onMenu` still
// replaces the links; a bar with `scrolls` and `onMenu` scrolls its brand and actions.

// The platform-varying surface. Everything color/shape-bearing the bar needs
// lives here, built from the active tokens (so each follows light/dark/glass).
export interface NavbarSkin {
  /** iOS/web dim a pressed link; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a pressed link; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Where the keyboard focus ring sits on the link Pressable: INSET_FOCUS_RING draws it
   * just inside a link that a clipping bar would otherwise cut; omitted, it sits around
   * the link. The ring itself is the kit Pressable's (the palette's `ring`). No-op
   * natively.
   */
  focusRing?: ViewStyle;

  /** The bar row: height, padding, gap, and flex layout, per density. */
  bar: (t: ColorTokens, density: Density) => ViewStyle;
  /** The token-driven background fill (follows the scheme/glass surface). */
  surface: (t: ColorTokens) => ViewStyle;
  /** The surface-axis treatment (hairline / outline / floating card). */
  surfaceContainer: (t: ColorTokens, surface: Surface) => ViewStyle;

  /** The left cluster row (brand + links). */
  leftGroup: (t: ColorTokens, density: Density) => ViewStyle;
  /** The brand lockup row (`brandContent` beside the `brand` wordmark). */
  brandGroup: (t: ColorTokens, density: Density) => ViewStyle;
  /** The brand wordmark type. */
  brand: (t: ColorTokens, density: Density) => TextStyle;
  /** The links row. */
  linksRow: (t: ColorTokens, density: Density) => ViewStyle;
  /** A nav link tile (padding + active fill). */
  linkTile: (t: ColorTokens, active: boolean) => ViewStyle;
  /** A nav link label (weight + active/inactive color). */
  linkLabel: (t: ColorTokens, active: boolean) => TextStyle;
  /**
   * A resting link's instant hover look (its tile fill and label ink), declared on the
   * web only (`webHover`); null where there is none.
   */
  linkHover: ((t: ColorTokens) => { tile: ViewStyle; label: TextStyle }) | null;
  /**
   * How the active tile's fill renders as glass. `tint` keeps the skin's hue at a
   * translucent ceiling with the ordinary foreground ink (web's accent tile,
   * Android's 12% primary pill); `brand` paints the brand fill as glass whose
   * under-fill is densified until the primary-foreground ink reads at 4.5:1 (iOS's
   * primary capsule).
   */
  linkSelection: "tint" | "brand";

  /** The right cluster row (action + avatar). */
  rightGroup: (t: ColorTokens, density: Density) => ViewStyle;
}

export interface NavbarProps {
  /** Brand or product name shown at the left, in a semibold face. */
  brand?: string;
  /**
   * A brand ELEMENT for the left cluster (a logo mark, a workspace switcher).
   * It LEADS the cluster, so passing it beside `brand` renders the mark first and
   * keeps the wordmark beside it; passing it alone makes the mark the whole brand.
   * It takes the left cluster's own gap, so it needs no wrapper.
   */
  brandContent?: ReactNode;
  /**
   * Ordered navigation link labels rendered in the middle row. Omit it (or pass an
   * empty array) for a bar with no middle nav: neither the links row nor the
   * narrow menu button that stands in for it renders.
   */
  links?: string[];
  /**
   * Destinations for `links`, by index (parallel to it). A link with an href renders as
   * a real anchor on the web (an `<a href>`, so middle-click, modifier-click and
   * open-in-new-tab work); natively it is ignored. A plain click still selects the link
   * and calls `onSelect` with the press event, so an app that routes on the client
   * calls `event.preventDefault()` there; a modifier or middle click is left to the
   * browser and selects nothing. Omit it (or an entry) for a link without a destination.
   */
  hrefs?: string[];
  /** Index of the active link (CONTROLLED; its label reads in the foreground color). Omit for uncontrolled use. */
  active?: number;
  /** Initial active link for uncontrolled use (a bare navbar moves the active link on press). */
  defaultActive?: number;
  /**
   * Free-form trailing controls for the right cluster: a ghost search button, icon
   * buttons, a notification dropdown, an account menu. They LEAD the cluster, ahead
   * of the built-in `actionLabel` button and `avatar`, and take the cluster's own
   * gap, so they need no wrapper. Keep them few and compact: the bar is a fixed
   * height and the slot is rendered as given at every width.
   */
  actions?: ReactNode;
  /** Optional primary action; renders a <Button primary small> on the right. */
  actionLabel?: string;
  /** Called when the action button is pressed. */
  onAction?: () => void;
  /** Optional account initials/name; renders an <Avatar small> on the right. */
  avatar?: string;
  /**
   * Called when a nav link is pressed, with its index, and the press event when it came
   * from the link itself (not from the narrow menu).
   */
  onSelect?: (index: number, event?: GestureResponderEvent) => void;
  /**
   * The app's own navigation menu. When set, the bar leads with a menu button at
   * every width and calls this on press, so the app can open navigation of its own
   * (a Drawer of grouped sections). It replaces the `links` row and its narrow menu:
   * pass one or the other.
   */
  onMenu?: () => void;
  // Surface (pick one; default is the flush bottom-hairline bar).
  bordered?: boolean;
  floating?: boolean;
  /**
   * No surface and no hairline: the bar sits clear on what is behind it. Pass it while
   * nothing has scrolled under the bar (the scroll edge) and drop it once content does.
   */
  bare?: boolean;
  // Density (pick one; default is the comfortable bar).
  /** The tight bar: 44px with a 5px inset and 2px between items on the web (the docs pill). */
  compact?: boolean;
  /**
   * Keep every link at every width: the bar's content row scrolls sideways inside the
   * bar (no scroll indicator) instead of folding the links into the narrow menu button.
   * Pair it with `floating` and `compact` for the hand-off's docs pill.
   */
  scrolls?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Surface precedence when more than one is passed: first match wins, so a framed bar
// (bordered, floating) keeps its frame over a `bare` request.
export function surfaceOf(p: NavbarProps): Surface | "bare" {
  if (p.bordered) return "bordered";
  if (p.floating) return "floating";
  if (p.bare) return "bare";
  return "default";
}

// Density precedence: `compact` is the axis's one member; omit it for the default bar.
export function densityOf(p: NavbarProps): Density {
  if (p.compact) return "compact";
  return "default";
}

// A modifier or middle click on an anchor is the browser's (a new tab or window), so
// the bar neither selects the link nor reports it. Natively the event carries none of
// these keys, so every press is a plain one.
function browserOwnsClick(event: GestureResponderEvent): boolean {
  const native = event.nativeEvent as unknown as { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; button?: number };
  return !!(native.metaKey || native.ctrlKey || native.shiftKey || (native.button != null && native.button !== 0));
}

// The platform-styled parts the bar composes: the Dropdown behind the narrow
// menu button, the action Button and the account Avatar. Passed by each platform's
// thin wrapper (the literal `.ios`/`.android` imports there are required for the WEB
// docs 3-up, where a barrel import would resolve the web atom in every column);
// each defaults to the web atom.
export interface NavbarParts {
  Dropdown?: ComponentType<DropdownProps>;
  Button?: typeof WebButton;
  Avatar?: typeof WebAvatar;
}

// One nav link: its tile, the glass puck under the active one, and the web hover. A
// component of its own so every link reads its own hover.
interface NavLinkProps {
  skin: NavbarSkin;
  label: string;
  href?: string;
  active: boolean;
  onPress: (event: GestureResponderEvent) => void;
}

function NavLink({ skin, label, href, active, onPress }: NavLinkProps) {
  const { tokens, dark } = useTheme();
  const material = useMaterialTheme({ layer: "control" });
  const glass = material.surface === "glass";
  const hoverLook = skin.linkHover;
  // Only a resting link washes: the active one already wears the look.
  const { hovered, target: hoverTarget } = useHover(hoverLook != null && !active);
  const hover = hovered && hoverLook ? hoverLook(tokens) : null;
  const tile = skin.linkTile(tokens, active);
  // Under glass the ACTIVE tile is a CONTROL-layer pane: the GlassPane paints the
  // material behind its label in the tile's own shape (the Pressable keeps its tap,
  // ripple and dim), the tile drops its own fill (the pane's material carries it), and
  // the skin's `linkSelection` picks the fill: a brand-tinted puck (iOS's primary
  // capsule, whose label keeps the skin's primary-foreground ink) or the skin's hue at
  // selectionTint's translucent ceiling with the label in the ordinary foreground.
  // Inactive tiles keep the skin's own fill (iOS's neutral capsules; web's and M3's are
  // bare), and a hovered one its hover wash as an inner fill. Solid mode keeps the
  // skin's active fill and renders no pane at all.
  const puck = glass && active;
  // A real anchor on the web (react-native-web renders a Pressable carrying `href` as an
  // `<a>`); native ignores it. RN's prop types do not know the web-forwarded prop, hence
  // the spread object.
  const anchor = href != null ? { href } : null;
  return (
    // The bounded Android ripple on a link tile is masked to a rectangle and cannot clip
    // itself; this RippleClip parent rounds it to the tile's own corners (Android only;
    // a transparent layout passthrough on iOS/web). It is also the hover target, which
    // never moves. Link tiles hug their labels, so there is no outer layout to move.
    <RippleClip shape={cornerRadii(tile)} {...hoverTarget}>
      <Pressable
        {...(anchor ?? undefined)}
        onPress={onPress}
        // The active tile's puck is a child of this Pressable: where it renders, the
        // ripple draws in the foreground, over it (`paneRipple`).
        android_ripple={paneRipple(puck, skin.ripple ? skin.ripple(tokens) : undefined)}
        accessibilityRole="link"
        accessibilityState={{ selected: active }}
        aria-current={active ? "page" : undefined}
        style={({ pressed }) => [
          puck ? paneStyle(material, tile) : tile,
          hover ? withInnerFill(material, hover.tile) : null,
          skin.focusRing,
          skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
        ]}
      >
        {puck ? (
          <GlassPane
            layer="control"
            shape={tile}
            brand={skin.linkSelection === "brand" ? tokens.primary : undefined}
            tint={skin.linkSelection === "tint" ? selectionTint(tile, dark) : undefined}
          />
        ) : null}
        <Text style={[skin.linkLabel(tokens, active), hover ? hover.label : null, puck && skin.linkSelection === "tint" ? { color: tokens.foreground } : null]}>{label}</Text>
      </Pressable>
    </RippleClip>
  );
}

/** Build a Navbar component from a platform skin (plus the platform-correct parts it composes; each defaults to the web base when omitted). */
export function createNavbar(skin: NavbarSkin, parts: NavbarParts = {}) {
  const Dropdown = parts.Dropdown ?? WebDropdown;
  const Button = parts.Button ?? WebButton;
  const Avatar = parts.Avatar ?? WebAvatar;
  return function Navbar(props: NavbarProps) {
    const { brand, brandContent, links: linkProp = [], hrefs, actions, actionLabel, onAction, avatar, onSelect, onMenu, scrolls, testID, style } = props;
    // An app menu (`onMenu`) stands in for the links row and its narrow menu at every width.
    const links = onMenu ? [] : linkProp;
    const { tokens } = useTheme();
    const surface = surfaceOf(props);
    const density = densityOf(props);
    // Controlled when `active` is provided, self-managed otherwise, so a bare
    // navbar moves the active link to the pressed one instead of ignoring taps.
    const [active, setActive] = useControllableState<number>(props.active, props.defaultActive ?? 0);
    // Narrow collapse (automatic, no prop): the bar measures its OWN width and
    // at/below sm swaps the links row for a menu button opening the platform
    // Dropdown. The kit owns the whole trigger + menu, and `onSelect`/`active` keep
    // their contract. `scrolls` opts out: the links stay and the content row pans.
    const { value: narrow, onLayout: onBarLayout } = useContainerBreakpoint(
      { base: false, sm: true },
      { seedViewport: true },
    );
    const collapsed = narrow && !scrolls;
    const scrollFocus = useHorizontalScrollFocus();
    // The collapse stands in for the LINKS row, so a bar with no links has nothing
    // to collapse: it renders neither the row nor the menu button, rather than a
    // hamburger opening an empty popover. A trailing `actions` slot is unaffected
    // either way; it is not nav, so it never folds into the menu.
    const hasLinks = links.length > 0;
    const menuItems: DropdownItem[] = links.map((link, index) => ({
      label: link,
      // The active link carries the conventional menu checkmark.
      icon: index === active ? "check" : undefined,
    }));

    // The bar joins the functional glass layer: GlassSurface paints the native
    // Liquid Glass (iOS) or frost (web/Android) in glass mode, and the solid skin
    // background in default mode. The glass fill is stripped by GlassSurface, so
    // the skin keeps supplying the solid background only. A bare bar is the row
    // alone, with no surface in either mode.
    const bare = surface === "bare";
    const barStyle = skin.bar(tokens, density);
    // A scrolling bar hands its gutter and gap to the scroller's content row, so the
    // row pans under the bar's whole inner width, as the hand-off pill's does.
    const shell: ViewStyle = scrolls ? { ...barStyle, paddingHorizontal: 0, gap: undefined } : barStyle;
    const container: StyleProp<ViewStyle> = bare ? [shell, style] : [
      shell,
      skin.surface(tokens),
      skin.surfaceContainer(tokens, surface),
      style,
    ];
    const Host = bare ? View : GlassSurface;

    const select = (index: number, event?: GestureResponderEvent) => {
      setActive(index);
      onSelect?.(index, event);
    };

    const left = (
      <View style={skin.leftGroup(tokens, density)}>
        {/* Collapsed, the menu button leads the bar ahead of the brand, as Material 3's
            top app bar puts its navigation icon and the web's collapsed nav does. */}
        {onMenu ? (
          <Button ghost small accessibilityLabel="Navigation menu" iconLeft={<Icon menu size={20} decorative />} onPress={onMenu} />
        ) : null}
        {hasLinks && collapsed ? (
          <Dropdown
            triggerLabel="Navigation menu"
            items={menuItems}
            onSelect={(_item, index) => select(index)}
          >
            <Icon menu size={20} />
          </Dropdown>
        ) : null}
        {brandContent != null || brand ? (
          <View style={skin.brandGroup(tokens, density)}>
            {brandContent}
            {brand ? <Text style={skin.brand(tokens, density)}>{brand}</Text> : null}
          </View>
        ) : null}
        {!hasLinks || collapsed ? null : (
          <View style={skin.linksRow(tokens, density)}>
            {links.map((link, index) => {
              const href = hrefs?.[index];
              return (
                <NavLink
                  key={`${link}-${index}`}
                  skin={skin}
                  label={link}
                  href={href}
                  active={index === active}
                  onPress={(event) => {
                    if (href != null && browserOwnsClick(event)) return;
                    select(index, event);
                  }}
                />
              );
            })}
          </View>
        )}
      </View>
    );
    const right = (
      <View style={skin.rightGroup(tokens, density)}>
        {actions}
        {actionLabel ? (
          <Button primary small onPress={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {avatar ? <Avatar small name={avatar} /> : null}
      </View>
    );

    return (
      <Host testID={testID} style={container} onLayout={onBarLayout}>
        {scrolls ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            alwaysBounceHorizontal={false}
            scrollEnabled={scrollFocus.scrollEnabled}
            onLayout={scrollFocus.onLayout}
            onContentSizeChange={scrollFocus.onContentSizeChange}
            style={SCROLLER}
            contentContainerStyle={[SCROLL_ROW, { paddingHorizontal: barStyle.paddingHorizontal, gap: barStyle.gap }]}
          >
            {left}
            {right}
          </ScrollView>
        ) : (
          <>
            {left}
            {right}
          </>
        )}
      </Host>
    );
  };
}

// The scroller fills the bar's height and whatever width the bar has; its content row
// is at least as wide as the scroller, so the clusters keep their space-between ends
// while the row fits and pan once it does not.
const SCROLLER: ViewStyle = { flexGrow: 1, flexShrink: 1, minWidth: 0, alignSelf: "stretch" };
const SCROLL_ROW: ViewStyle = { flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" };
