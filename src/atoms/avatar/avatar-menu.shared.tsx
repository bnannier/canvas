import { alpha, oklchHex } from "../../style/color.js";
import type { ReactElement } from "react";
import { View, Text, useControllableState, withInnerFill, platformDisabledDim, type ColorTokens, type ViewStyle, type TextStyle, type LayoutStyle } from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useHover } from "../../style/hover.js";
import { GlassPane, paneStyle } from "../../style/glass-surface/glass-pane.js";
import type { DropdownItem, DropdownProps } from "../dropdown/dropdown.shared.js";
import { Icon } from "../icon/icon.js";
import { createAvatar, type AvatarSkin } from "./avatar.shared.js";

// Shared AvatarMenu shell. AvatarMenu is the account IDENTITY PILL: one capsule
// trigger holding the avatar, the person's name over their email, and a trailing
// chevron, wired to the kit's own Dropdown for the menu itself. It exists so no app
// (or docs topbar) hand-composes an account menu out of an Avatar, a hand-rolled name
// column, and a chevron: the anatomy, the pill's look, the identity paint and the
// accessible name live here once.
//
// The capsule is passed to Dropdown as its CUSTOM TRIGGER, so Dropdown's own
// Pressable owns the press, the open/close toggle, the outside-tap dismissal, and
// the button role. There is deliberately no second Pressable inside the capsule
// (that would nest one interactive element in another; see
// test/no-console-violations.test.tsx). AvatarMenu owns the open state so the pill
// can paint its open fill, and passes open/onOpenChange down to keep Dropdown in step.
//
// The generic pill follows SUB('AvatarMenu') in cv-kit-code.js: an edged popover
// surface with a 32px disc (28px compact), two identity lines and a static chevron.
// On the web this in-page control stays solid under glass; native owns its control pane.
// The original account composition keeps its separate metrics and glow.

/**
 * The identity-pill entries an AvatarMenu skin adds to the Avatar skin family.
 * The shared shell owns anatomy and state; the skin carries the renderer's metrics.
 * The menu surface itself uses the injected platform Dropdown.
 */
export interface AvatarMenuSkin extends AvatarSkin {
  /** Capsule metrics: height, gap, start/end padding. */
  menuPill: ViewStyle;
  /** Avatar-only compact trigger metrics. */
  menuPillCompact: ViewStyle;
  /** Capsule fill, at rest and while hovered or open, from the theme tokens. */
  menuPillFill: (t: ColorTokens, active: boolean) => ViewStyle;
  /** The capsule's resting edge (width and colour). */
  menuPillEdge: (t: ColorTokens) => ViewStyle;
  /** Optional disc decoration; the generic renderer leaves it empty. */
  menuDiscGlow: (t: ColorTokens, glass: boolean) => ViewStyle;
  /** Whether the pill takes its fill under a hovering pointer: the web's, since native
   *  pointer hover waits on the owner (declared through webHover). */
  menuHover: boolean;
  /** The name line's type (size / line-height / weight / tracking). */
  menuPillName: TextStyle;
  /** The secondary (email) line's type. */
  menuPillSecondary: TextStyle;
  /** Trailing chevron glyph size, in px. */
  menuChevronSize: number;
  /** Disabled foreground opacity, matching the platform's trigger convention. */
  menuDisabledOpacity: number;
}

export interface AvatarMenuProps {
  /** Original Argus account control with a 32px orchid disc and compact role menu. */
  account?: boolean;
  /** Explicit name for the trigger. */
  triggerLabel?: string;
  /** Menu heading and accessible name, independent of the account's identity lines. */
  menuLabel?: string;
  menuWidth?: number;
  maxHeight?: number;
  /** The account holder's full name: the pill's first line, the avatar's initials
   *  fallback and colour identity, and the menu header's title. */
  name?: string;
  /** The secondary line under the name in the pill, and the menu header's
   *  description (typically the account's email address). */
  email?: string;
  /** The account photo. Falls back to the initials exactly like `Avatar`. */
  src?: string;
  /** Ready-made initials for the avatar, used verbatim when there is no photo. */
  initials?: string;
  /** The menu rows, top to bottom. Same rows as `Dropdown` (icon, shortcut,
   *  destructive, disabled, separatorBefore). */
  items: DropdownItem[];
  /** Avatar and chevron only, no name block: the topbar form of the pill. */
  compact?: boolean;
  // Menu alignment (pick at most one). The pill's menu hangs from the TRAILING
  // edge by default, which is where an account pill lives in a topbar and the
  // only edge a right-parked trigger can open from without running off the
  // surface. (Plain `Dropdown` defaults the other way, to its leading edge.)
  // Precedence when both are passed: `alignEnd` > `alignStart`, so the explicit
  // spelling of the default wins.
  /** Hang the menu from the pill's LEADING edge instead of its trailing one. */
  alignStart?: boolean;
  /** The default, spelled out: the menu's trailing edge meets the pill's. */
  alignEnd?: boolean;
  /** Dimmed, non-opening pill: the menu never opens and the press is inert. */
  disabled?: boolean;
  /**
   * Draw the menu open and in flow under the pill instead of floating it over the page,
   * a specimen of the account menu (Dropdown's `inline`): the pill reads as open and its
   * press is inert, a row still fires `onSelect`, and `open` / `onOpenChange` have no
   * effect.
   */
  inline?: boolean;
  /** Controlled open state. Omit for uncontrolled (the pill opens/closes it). */
  open?: boolean;
  /** Fired when the open state changes (pill press, row select, dismissal). */
  onOpenChange?: (open: boolean) => void;
  /** Fired with the selected row and its index when a menu row is pressed. */
  onSelect?: (item: DropdownItem, index: number) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (placement within a parent), never a restyle hook. */
  style?: LayoutStyle;
}

// The capsule is always a pill: a 9999 radius reads as a capsule at every skin
// content height, so the shape is platform-neutral and owned here.
const PILL_RADIUS = 9999;
const ACCOUNT_PILL: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 2, paddingStart: 2, paddingEnd: 4 };
const ACCOUNT_NAME: TextStyle = { fontSize: 12, lineHeight: 13.8, fontWeight: "700" };
const ACCOUNT_SECONDARY: TextStyle = { fontSize: 10.5, lineHeight: 12.08, fontWeight: "600" };

// The name-over-email column between the avatar and the chevron. Start-aligned and
// allowed to shrink so a long email never pushes the chevron out of the capsule.
const IDENTITY_COLUMN: ViewStyle = { alignItems: "flex-start", flexShrink: 1, gap: 2 };

// The TRIGGER BUTTON's accessible name, handed to Dropdown as `triggerLabel` so a
// screen reader hears WHOSE account the button opens instead of just "button". The
// name and email are the data a sighted user reads off the pill, so they are folded
// into the name, comma-separated; with neither (a photo only, or a compact pill with
// no identity at all) it falls back to a plain description of what the control does.
function accountLabel(name?: string, email?: string): string {
  if (name && email) return `${name}, ${email}`;
  return name ?? email ?? "Account menu";
}

// Menu edge: trailing by default, so `alignStart` is the only way to the leading
// edge, and an explicit `alignEnd` outranks it.
export function alignEndOf(p: Pick<AvatarMenuProps, "alignStart" | "alignEnd">): boolean {
  return p.alignEnd || !p.alignStart;
}

// cv-kit-code.js K.hueOf: an unsigned name hash over the renderer's eight hues.
function menuIdentityHue(name?: string): number {
  let hash = 0;
  for (const ch of String(name ?? "")) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return [285, 205, 165, 20, 75, 250, 330, 125][hash % 8]!;
}

/** Build an AvatarMenu from the same platform skin family as Avatar and AvatarGroup. */
export function createAvatarMenu(skin: AvatarMenuSkin, Dropdown: (props: DropdownProps) => ReactElement, AccountDropdown: (props: DropdownProps) => ReactElement = Dropdown) {
  // The pill's avatar comes from the same skin, built once per platform module. It
  // is never pressable (Dropdown's trigger owns the press), and like the pill it
  // paints no material: its identity stays static content.
  const Avatar = createAvatar({
    ...skin,
    diameter: { default: 32 },
    labelType: { ...skin.labelType, default: { fontSize: 12, lineHeight: 12, fontWeight: "600" } },
    initialsPaint: (hue) => ({ wash: alpha(oklchHex(0.72, 0.14, hue), 0.22), ink: oklchHex(0.82, 0.12, hue) }),
  });

  return function AvatarMenu(props: AvatarMenuProps) {
    const { name, email, src, initials, items, compact, disabled, onSelect, testID, style } = props;
    const theme = useMaterialTheme({ layer: "control" });
    const { tokens } = theme;
    // Uncontrolled by default (a bare <AvatarMenu /> opens and closes on its own);
    // a controlled `open` prop takes over when supplied. The raw prop goes into the
    // hook so an absent `open` stays uncontrolled.
    const [open, setOpen] = useControllableState<boolean>(props.open, false, props.onOpenChange);
    // A disabled pill can never read as open, whatever the open state says, so the
    // fill, the chevron, and the announced state all stay collapsed.
    const expanded = (open || !!props.inline) && !disabled;
    const label = props.triggerLabel ?? accountLabel(name, email);
    const menuAlignEnd = alignEndOf(props);
    // The pill fills under the pointer and while its menu is open; under glass the fill
    // is an ink tint over whatever the pill sits on, never an opaque patch.
    const { hovered, target } = useHover(skin.menuHover && !disabled);
    const active = props.account ? hovered && !disabled : expanded || (hovered && !disabled);
    const pillFill = props.account ? { backgroundColor: active ? tokens.hover : "transparent" } : active ? withInnerFill(theme, skin.menuPillFill(tokens, true), "firm") : skin.menuPillFill(tokens, false);
    // The pill is a control surface: the skin's edge and fill at rest, the active fill
    // under the pointer and while open. Under glass it is a control-layer pane whose
    // resting edge the material's rim replaces (paneStyle), with the active fill an ink
    // tint over the pane.
    const pillShape: ViewStyle = { ...skin.menuPill, ...(compact ? skin.menuPillCompact : null), ...skin.menuPillEdge(tokens), borderRadius: PILL_RADIUS, ...(theme.surface === "glass" && !active ? null : pillFill) };
    const disabledInk = theme.surface === "glass" && disabled ? { opacity: props.account ? platformDisabledDim() : skin.menuDisabledOpacity } : null;
    const Menu = props.account ? AccountDropdown : Dropdown;

    return (
      <Menu
        compact={props.account}
        steadyPress={props.account}
        menuWidth={props.menuWidth}
        maxHeight={props.maxHeight}
        accessibilityLabel={props.menuLabel}
        items={items}
        open={expanded}
        onOpenChange={setOpen}
        onSelect={onSelect}
        // The account's name goes on the trigger BUTTON, not on the capsule inside
        // it: a button named from its contents reads the pill's two text lines back
        // to back with no punctuation and picks up the Avatar's own label too.
        triggerLabel={label}
        // The identity header above the rows: the same name and email the pill shows.
        label={props.account ? props.menuLabel : undefined}
        title={props.account ? undefined : props.menuLabel ?? name}
        description={props.account ? undefined : email}
        alignEnd={menuAlignEnd}
        disabled={disabled}
        inline={props.inline}
        testID={testID}
        style={style}
      >
        {/* The capsule is pure presentation: it is labelled by nothing and focusable
            by nothing. Dropdown wraps it in the button-roled Pressable that owns the
            press, aria-haspopup="menu", the dual expanded/disabled state, and the
            solid-mode disabled dim, and that same Pressable carries the account's
            ACCESSIBLE NAME, set from the `triggerLabel` passed above (Dropdown puts
            it on the button as accessibilityLabel plus its aria-label alias).
            Naming the button EXPLICITLY is the point: a button left to be named
            from its CONTENTS runs the capsule's text nodes together unpunctuated
            ("Rachel Chenrachel.chen@example.com"), re-reads the label the Avatar
            already carries for the photo, and under `compact` shrinks to whatever
            that Avatar label happens to be, since the capsule then holds no text at
            all. One explicit label on the one focusable node is one punctuated name
            in every configuration. It also keeps the capsule free of a role of its
            own: it is NOT a Pressable, since nesting one inside Dropdown's would
            make a doubly-focusable, invalid control
            (test/no-console-violations.test.tsx locks that). */}
        <View style={props.account ? [ACCOUNT_PILL, { borderRadius: PILL_RADIUS }, pillFill] : paneStyle(theme, pillShape)} {...target}>
          {props.account ? null : <GlassPane layer="control" shape={pillShape} />}
          {/* The generic renderer's unringed 32px disc, 28px when compact. The
              original account composition keeps its separate identity treatment. */}
          <View style={props.account ? undefined : skin.menuDiscGlow(tokens, theme.surface === "glass")}>
            {props.account ? <Avatar whiteInk orchid account glow src={src} name={name} initials={initials} /> : <Avatar small={compact} hue={menuIdentityHue(name)} src={src} name={name} initials={initials} />}
          </View>
          {compact ? null : (
            <View style={[props.account ? null : IDENTITY_COLUMN, disabledInk]}>
              {name ? (
                <Text numberOfLines={props.account ? undefined : 1} style={[props.account ? ACCOUNT_NAME : skin.menuPillName, { color: tokens.foreground }]}>
                  {name}
                </Text>
              ) : null}
              {email ? (
                <Text numberOfLines={props.account ? undefined : 1} style={[props.account ? ACCOUNT_SECONDARY : skin.menuPillSecondary, { color: props.account ? tokens["muted-foreground"] : tokens["subtle-foreground"] ?? tokens["muted-foreground"] }]}>
                  {email}
                </Text>
              ) : null}
            </View>
          )}
          {/* A static chevron, as the renderer draws: the button's own state names
              whether the menu is open, so it stays decorative. */}
          {compact && !props.account ? null : <View style={disabledInk}>
            <Icon chevronDown heavyStroke={props.account} size={skin.menuChevronSize} muted decorative />
          </View>}
        </View>
      </Menu>
    );
  };
}
