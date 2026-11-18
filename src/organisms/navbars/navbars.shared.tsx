import { useRef, useState, type ComponentProps, type ComponentType, type ReactNode, type RefObject } from "react";
import { StyleSheet, type GestureResponderEvent, type View as ViewInstance } from "react-native";
import { View, Pressable, Text, ScrollView, RippleClip, cornerRadii, useTheme, useControllableState, useContainerBreakpoint, GlassPane, GlassSurface, paneStyle, paneRipple, withInnerFill, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { NavigationGlassProvider } from "../../style/glass-surface/navigation-glass.js";
import { GradientFill } from "../../style/gradient-fill.js";
import { browserOwnsClick } from "../../style/link-press.js";
import { selectionTint } from "../../style/selection-tint.js";
import { useHover } from "../../style/hover.js";
import { LayoutAxisProvider, ROW_AXIS, useFillStyle } from "../../style/sizing.js";
import { AnatomyScope, useAnatomyPart, type AnatomyTarget } from "../../style/anatomy.js";
import { useHorizontalScrollFocus } from "../../style/use-scroll-focus.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Avatar as WebAvatar } from "../../atoms/avatar/avatar.js";
import { Icon } from "../../atoms/icon/icon.js";
import { Divider } from "../../atoms/divider/divider.js";
import { Dropdown as WebDropdown, type DropdownProps, type DropdownItem } from "../../atoms/dropdown/dropdown.js";
import { type Surface, type Density, type MobileNavbarSkin } from "./navbars.styles.js";

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
// Narrow widths: the bar measures its own width and, at and below `sm`, folds the
// links into a menu button. The mobile web skin also folds links on tablets and
// frames the brand and trailing menu separately. `scrolls` trades that fold for the hand-off
// pill's own answer: the bar keeps every link and its content row pans sideways inside
// the bar (a horizontal scroller with no indicator), at every width. `onMenu` still
// replaces the links; a bar with `scrolls` and `onMenu` scrolls its brand and actions.

// The platform-varying surface. Everything color/shape-bearing the bar needs
// lives here, built from the active tokens (so each follows light/dark/glass).
export interface NavbarSkin {
  /** Phone and tablet app chrome, supplied by the web skin. */
  mobile?: MobileNavbarSkin;
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
   * Where the brand leads (an app's home, `/`). With it, or with `onBrandPress`, the brand
   * lockup is one link: a real anchor on the web (an `<a href>`, so middle-click and
   * modifier-click open it in a new tab), named by `brand`, with the kit's focus ring.
   */
  brandHref?: string;
  /** Called when the brand is pressed; on the web a modifier-click on a `brandHref` stays the browser's. */
  onBrandPress?: (event: GestureResponderEvent) => void;
  /** Show a leading Back button for a nested screen and call this when it is pressed. */
  onBack?: () => void;
  /** Accessible name of the Back button. Defaults to `Back`. */
  backLabel?: string;
  /**
   * Draw a short vertical separator between the brand and the links (the kit
   * `<Divider vertical inset strong />`), as the hand-off's floating docs pill does. It
   * shows only while both the brand and the links row are on the bar, so a collapsed
   * bar or one without links never ends its brand on a stray rule.
   */
  brandDivider?: boolean;
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
   * Called when a nav link is selected, with its index and the press event when available.
   */
  onSelect?: (index: number, event?: GestureResponderEvent) => void;
  /**
   * The app's own navigation menu. It replaces the `links` row and its narrow menu.
   * The button trails the brand on mobile web and leads it on desktop and native.
   */
  onMenu?: () => void;
  /** Accessible name of the navigation menu button. Defaults to `Navigation menu`. */
  menuLabel?: string;
  // Surface (pick one; default is the flush bottom-hairline bar).
  bordered?: boolean;
  floating?: boolean;
  /**
   * No surface and no hairline: the bar sits clear on what is behind it. Pass it while
   * nothing has scrolled under the bar (the scroll edge) and drop it once content does.
   * On mobile web, dropping `bare` fades scrolling content behind an unbacked page title.
   */
  bare?: boolean;
  // Density (pick one; default is the comfortable bar).
  /** Tight spacing for desktop web and native. Mobile web uses the touch-height bar unless `scrolls` is set. */
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

type NavbarHostProps = Pick<ComponentProps<typeof View>, "children" | "onLayout" | "style" | "testID">;

function FloatingSurface(props: NavbarHostProps) {
  return <GlassSurface {...props} floating />;
}

function WebNavbarHost({ framed, style, children, ...host }: NavbarHostProps & { framed?: boolean }) {
  const material = useMaterialTheme({ floating: true, layer: "functional" });
  return (
    <View {...host} style={framed ? paneStyle(material, style) : style}>
      {framed ? <GlassPane floating layer="functional" shape={style} /> : null}
      {children}
    </View>
  );
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
  useMobileLayout?: () => boolean;
}

interface MobileNavButtonProps {
  anchor?: RefObject<ViewInstance | null>;
  shape: ViewStyle;
  label: string;
  glyph: "menu" | "back";
  expanded?: boolean;
  onPress: () => void;
}

const mobilePressed: ViewStyle = { transform: [{ scale: 0.97 }] };

function MobileNavButton({ anchor, shape, label, glyph, expanded, onPress }: MobileNavButtonProps) {
  const material = useMaterialTheme({ floating: true, layer: "functional" });
  const bubble = material.surface === "glass" ? { ...shape, boxShadow: undefined } : shape;
  const style = paneStyle(material, bubble);
  return (
    <Pressable ref={anchor} style={({ pressed }) => [style, pressed ? mobilePressed : null]}
      accessibilityRole="button" accessibilityLabel={label} aria-label={label}
      accessibilityState={expanded == null ? undefined : { expanded }} aria-expanded={expanded}
      {...(expanded == null ? null : { "aria-haspopup": "menu" })} onPress={onPress}>
      <NavigationGlassProvider>
        <GlassPane floating layer="functional" shape={shape} />
      </NavigationGlassProvider>
      <Icon menu={glyph === "menu"} chevronLeft={glyph === "back"} size={20} decorative />
    </Pressable>
  );
}

interface MobileLinksMenuProps {
  Dropdown: ComponentType<DropdownProps>;
  shape: ViewStyle;
  label: string;
  items: DropdownItem[];
  onSelect: (index: number, event?: GestureResponderEvent) => void;
}

function MobileLinksMenu({ Dropdown, shape, label, items, onSelect }: MobileLinksMenuProps) {
  const anchor = useRef<ViewInstance>(null);
  const [open, setOpen] = useState(false);
  return (
    <View>
      <MobileNavButton anchor={anchor} shape={shape} label={label} glyph="menu"
        expanded={open} onPress={() => setOpen((previous) => !previous)} />
      <Dropdown anchorRef={anchor} alignEnd open={open} onOpenChange={setOpen}
        items={items} onSelect={(_item, index, event) => onSelect(index, event)} />
    </View>
  );
}

const useDesktopLayout = () => false;

// One nav link: its tile, the glass puck under the active one, and the web hover. A
// component of its own so every link reads its own hover.
interface NavLinkProps {
  skin: NavbarSkin;
  label: string;
  href?: string;
  active: boolean;
  onPress: (event: GestureResponderEvent) => void;
  /** The anatomy part this link carries (the active one's tile). */
  part?: AnatomyTarget;
}

function NavLink({ skin, label, href, active, onPress, part }: NavLinkProps) {
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
        ref={part?.ref}
        onLayout={part?.onLayout}
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
  const useMobileLayout = parts.useMobileLayout ?? useDesktopLayout;
  return function Navbar(props: NavbarProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Bar, Brand, Links, Active link, Actions, taken before the tree's
    // AnatomyScope so the bar's Buttons, Avatar and the caller's content register nothing.
    const barPart = useAnatomyPart("Bar");
    const brandPart = useAnatomyPart("Brand");
    const linksPart = useAnatomyPart("Links");
    const activeLinkPart = useAnatomyPart("Active link");
    const actionsPart = useAnatomyPart("Actions");
    // A bar relies on its parent column to stretch it; a docs AnatomyProvider centres its
    // specimen, so inside one the bar fills its stage (else it hugs, measures narrow and
    // folds its links into the menu button).
    const stageFill = useFillStyle("Navbar");
    const {
      brand, brandContent, brandHref, onBrandPress, brandDivider, onBack, backLabel = "Back",
      links: linkProp = [], hrefs, actions, actionLabel, onAction, avatar, onSelect,
      onMenu, menuLabel = "Navigation menu", scrolls, testID, style,
    } = props;
    // An app menu (`onMenu`) stands in for the links row and its narrow menu at every width.
    const links = onMenu ? [] : linkProp;
    const { tokens } = useTheme();
    const surface = surfaceOf(props);
    const density = densityOf(props);
    const atMobileWidth = useMobileLayout();
    const mobile = atMobileWidth && !scrolls ? skin.mobile : undefined;
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
    const collapsed = (narrow || mobile != null) && !scrolls;
    const scrollFocus = useHorizontalScrollFocus();
    // The collapse stands in for the LINKS row, so a bar with no links has nothing
    // to collapse: it renders neither the row nor the menu button, rather than a
    // hamburger opening an empty popover. A trailing `actions` slot is unaffected
    // either way; it is not nav, so it never folds into the menu.
    const hasLinks = links.length > 0;
    const menuItems: DropdownItem[] = links.map((link, index) => ({
      label: link,
      href: hrefs?.[index],
      // The active link carries the conventional menu checkmark.
      icon: index === active ? "check" : undefined,
    }));

    // The bar joins the functional glass layer: GlassSurface paints the native
    // Liquid Glass (iOS) or frost (web/Android) in glass mode, and the solid skin
    // background in default mode. The glass fill is stripped by GlassSurface, so
    // the skin keeps supplying the solid background only. A bare bar is the row
    // alone, with no surface in either mode.
    const bare = surface === "bare" || (mobile != null && surface === "default");
    const barStyle = { ...skin.bar(tokens, density), ...mobile?.bar };
    // A scrolling bar hands its gutter and gap to the scroller's content row, so the
    // row pans under the bar's whole inner width, as the hand-off pill's does.
    const shell: ViewStyle = scrolls ? { ...barStyle, paddingHorizontal: 0, gap: undefined } : barStyle;
    const stage = barPart ? stageFill : null;
    const container: StyleProp<ViewStyle> = bare ? [shell, stage, style] : [
      shell,
      skin.surface(tokens),
      skin.surfaceContainer(tokens, surface),
      stage,
      style,
    ];
    // Keep the same web host through mobile and scroll-edge changes. Its desktop pane
    // changes independently of the caller's slot state and focus.
    const Host = skin.mobile != null ? WebNavbarHost : bare ? View : FloatingSurface;
    const frame = Host === WebNavbarHost ? { framed: !bare && mobile == null } : null;

    const select = (index: number, event?: GestureResponderEvent) => {
      setActive(index);
      onSelect?.(index, event);
    };

    const circle = mobile?.circle(tokens);
    const menu = onMenu ? (
      circle ? <MobileNavButton shape={circle} label={menuLabel} glyph="menu" onPress={onMenu} /> : (
        <Button ghost small accessibilityLabel={menuLabel} iconLeft={<Icon menu size={20} decorative />} onPress={onMenu} />
      )
    ) : hasLinks && collapsed ? (
      circle ? <MobileLinksMenu Dropdown={Dropdown} shape={circle} label={menuLabel} items={menuItems} onSelect={select} /> : (
        <Dropdown triggerLabel={menuLabel} items={menuItems} onSelect={(_item, index, event) => select(index, event)}>
          <Icon menu size={20} decorative />
        </Dropdown>
      )
    ) : null;
    const back = onBack ? (
      circle ? <MobileNavButton shape={circle} label={backLabel} glyph="back" onPress={onBack} /> : (
        <Button ghost small icon accessibilityLabel={backLabel} iconLeft={<Icon chevronLeft size={20} decorative />} onPress={onBack} />
      )
    ) : null;

    const hasBrand = brandContent != null || !!brand;
    const capsule = mobile != null && (brandContent != null || !onBack);
    const scrollEdge = surface === "default" && brand && !capsule ? mobile?.scrollEdge : undefined;
    const brandGroup = skin.brandGroup(tokens, density);
    const brandMaterial = useMaterialTheme({ floating: true, layer: "functional" });
    const brandPill = capsule ? mobile.brandPill(tokens) : null;
    const brandHost = brandPill ? [mobile?.brandHost, paneStyle(brandMaterial,
      brandMaterial.surface === "glass" ? { ...brandPill, boxShadow: undefined } : brandPill,
    )] : [brandGroup, mobile?.brandHost];
    const brandChildren = (
      <>
        {brandPill ? (
          <NavigationGlassProvider>
            <GlassPane floating layer="functional" shape={brandPill} />
          </NavigationGlassProvider>
        ) : null}
        {brandContent}
        {brand ? (
          <Text numberOfLines={mobile ? 1 : undefined} style={[skin.brand(tokens, density), mobile ? mobileTitle : null]}>
            {brand}
          </Text>
        ) : null}
      </>
    );

    const left = (
      <View style={[skin.leftGroup(tokens, density), mobile?.leftGroup]}>
        {back}
        {!mobile ? menu : null}
        {hasBrand ? (
          brandHref != null || onBrandPress ? (
            <Pressable
              {...(brandHref != null ? ({ href: brandHref } as object) : undefined)}
              ref={brandPart?.ref}
              onLayout={brandPart?.onLayout}
              onPress={(event) => {
                if (brandHref != null && browserOwnsClick(event)) return;
                onBrandPress?.(event);
              }}
              accessibilityRole="link"
              accessibilityLabel={brand ?? "Home"}
              style={({ pressed }) => [brandHost, skin.focusRing, mobile && pressed ? mobilePressed : null]}
            >
              {brandChildren}
            </Pressable>
          ) : (
            <View ref={brandPart?.ref} onLayout={brandPart?.onLayout} style={brandHost}>
              {brandChildren}
            </View>
          )
        ) : null}
        {brandDivider && hasBrand && hasLinks && !collapsed ? (
          <Divider vertical inset strong />
        ) : null}
        {!hasLinks || collapsed ? null : (
          <View ref={linksPart?.ref} onLayout={linksPart?.onLayout} style={skin.linksRow(tokens, density)}>
            {links.map((link, index) => {
              const href = hrefs?.[index];
              return (
                <NavLink
                  key={`${link}-${index}`}
                  skin={skin}
                  label={link}
                  href={href}
                  active={index === active}
                  part={index === active ? activeLinkPart : undefined}
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
      <View ref={actionsPart?.ref} onLayout={actionsPart?.onLayout} style={skin.rightGroup(tokens, density)}>
        {actions}
        {actionLabel ? (
          <Button primary small onPress={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {avatar ? <Avatar small name={avatar} /> : null}
        {mobile ? menu : null}
      </View>
    );
    // These skin-owned rows publish their own axis: an outer Column's HUG
    // alignment must not pin the collapsed menu above its brand. A consumer's
    // nested Column still publishes its own axis inside either slot.
    const clusters = (
      <LayoutAxisProvider value={ROW_AXIS}>{left}{right}</LayoutAxisProvider>
    );

    return (
      <AnatomyScope>
        <Host {...frame} testID={testID} style={container} onLayout={onBarLayout}>
          {scrollEdge ? (
            <View testID="navbar-scroll-edge" style={scrollEdge.style}>
              <GradientFill angle={180} stops={[
                { color: tokens.background, at: scrollEdge.opaqueUntil },
                { color: tokens.background, at: 1, opacity: 0 },
              ]} />
            </View>
          ) : null}
          {/* The Bar part's node inside a docs provider: a pass-through fill of the bar. */}
          {barPart ? <View ref={barPart.ref} onLayout={barPart.onLayout} style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]} /> : null}
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
              {clusters}
            </ScrollView>
          ) : (
            clusters
          )}
        </Host>
      </AnatomyScope>
    );
  };
}

// The scroller fills the bar's height and whatever width the bar has; its content row
// is at least as wide as the scroller, so the clusters keep their space-between ends
// while the row fits and pan once it does not.
const SCROLLER: ViewStyle = { flexGrow: 1, flexShrink: 1, minWidth: 0, alignSelf: "stretch" };
const SCROLL_ROW: ViewStyle = { flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" };
const mobileTitle: TextStyle = { flexShrink: 1, minWidth: 0 };
