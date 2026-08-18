import { View, Text, useTheme, useControllableState, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Dropdown, type DropdownItem } from "../dropdown/dropdown.js";
import { Icon } from "../icon/icon.js";
import { createAvatar, type AvatarSkin } from "./avatar.shared.js";

// Shared AvatarMenu shell. AvatarMenu is the account IDENTITY PILL: one capsule
// trigger holding the avatar, the person's name over their email, and a trailing
// chevron that rotates while the menu is open, wired to the kit's own Dropdown for
// the menu itself. It exists so no app (or docs topbar) hand-composes an account
// menu out of an Avatar, a hand-rolled name column, and a chevron: the anatomy,
// the per-OS pill metrics, the open fill, and the accessible name live here once.
//
// The capsule is passed to Dropdown as its CUSTOM TRIGGER, so Dropdown's own
// Pressable owns the press, the open/close toggle, the outside-tap dismissal, and
// the button role. There is deliberately no second Pressable inside the capsule
// (that would nest one interactive element in another; see
// test/no-console-violations.test.tsx). AvatarMenu owns the open state so the pill
// can paint its open fill and rotate the chevron, and passes open/onOpenChange
// down to keep Dropdown in step.
//
// AvatarMenu is a "Light" platform treatment on the same AvatarSkin family as
// Avatar and AvatarGroup: one structure and one behavior, with the capsule's
// height, padding, fill, border, and label type supplied per OS by the skin
// (a 32px `secondary` capsule on web, a 36pt hairline-outlined capsule on iOS, a
// 40dp tonal Material 3 pill on Android). The menu surface is the platform's own
// Dropdown skin, so the popover matches the OS with no work here.

/**
 * The identity-pill entries an AvatarMenu skin adds to the Avatar skin family.
 * Everything platform-neutral (the capsule's flex row, the 9999 capsule radius,
 * the identity column, the chevron rotation, and the 11/14 secondary line's size)
 * lives in this file; a skin owns only the numbers that shift per OS.
 */
export interface AvatarMenuSkin extends AvatarSkin {
  /** Capsule metrics: height, gap, start/end padding, radius, hairline width. */
  menuPill: ViewStyle;
  /** Capsule fill and border color, closed and open, from the theme tokens. */
  menuPillFill: (t: ColorTokens, open: boolean) => ViewStyle;
  /** The name line's type (size / line-height / weight / tracking). */
  menuPillName: TextStyle;
  /** The secondary (email) line's type: 11/14 everywhere, tracking per OS. */
  menuPillSecondary: TextStyle;
  /** Trailing chevron glyph size, in px. */
  menuChevronSize: number;
}

export interface AvatarMenuProps {
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
  /** Align the menu's TRAILING edge with the pill's trailing edge (a right-hand
   *  topbar account menu). Omit for the default leading-edge alignment. */
  alignEnd?: boolean;
  /** Dimmed, non-opening pill: the menu never opens and the press is inert. */
  disabled?: boolean;
  /** Controlled open state. Omit for uncontrolled (the pill opens/closes it). */
  open?: boolean;
  /** Fired when the open state changes (pill press, row select, dismissal). */
  onOpenChange?: (open: boolean) => void;
  /** Fired with the selected row and its index when a menu row is pressed. */
  onSelect?: (item: DropdownItem, index: number) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (placement within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// The capsule is always a pill: a 9999 radius reads as a capsule at every skin
// height (32 / 36 / 40), so the shape is platform-neutral and owned here.
const PILL_RADIUS = 9999;

// The name-over-email column between the avatar and the chevron. Start-aligned and
// allowed to shrink so a long email never pushes the chevron out of the capsule.
const IDENTITY_COLUMN: ViewStyle = { alignItems: "flex-start", flexShrink: 1 };

// The whole capsule's accessible name, so a screen reader hears WHOSE account the
// button opens instead of just "button". The name and email are the data a sighted
// user reads off the pill, so they are folded into the name; with neither (a photo
// only, or a compact pill with no identity at all) it falls back to a plain
// description of what the control does.
function accountLabel(name?: string, email?: string): string {
  if (name && email) return `${name}, ${email}`;
  return name ?? email ?? "Account menu";
}

/** Build an AvatarMenu from the same platform skin family as Avatar and AvatarGroup. */
export function createAvatarMenu(skin: AvatarMenuSkin) {
  // The pill's avatar comes from the same skin, built once per platform module. It
  // is never pressable (Dropdown's trigger owns the press), so it takes the plain
  // solid path and never needs iOS's interactive glass fallback surface.
  const Avatar = createAvatar(skin);

  return function AvatarMenu(props: AvatarMenuProps) {
    const { name, email, src, initials, items, compact, alignEnd, disabled, onSelect, testID, style } = props;
    const { tokens } = useTheme();
    // Uncontrolled by default (a bare <AvatarMenu /> opens and closes on its own);
    // a controlled `open` prop takes over when supplied. The raw prop goes into the
    // hook so an absent `open` stays uncontrolled.
    const [open, setOpen] = useControllableState<boolean>(props.open, false, props.onOpenChange);
    // A disabled pill can never read as open, whatever the open state says, so the
    // fill, the chevron, and the announced state all stay collapsed.
    const expanded = open && !disabled;
    const label = accountLabel(name, email);

    return (
      <Dropdown
        items={items}
        open={expanded}
        onOpenChange={setOpen}
        onSelect={onSelect}
        // The account's name goes on the trigger BUTTON, not on the capsule inside
        // it: a button named from its contents reads the pill's two text lines back
        // to back with no punctuation and picks up the Avatar's own label too.
        triggerLabel={label}
        // The identity header above the rows: the same name and email the pill shows.
        title={name}
        description={email}
        alignEnd={alignEnd}
        disabled={disabled}
        testID={testID}
        style={style}
      >
        {/* The capsule. Dropdown wraps it in the button-roled Pressable that owns the
            press, aria-haspopup="menu", the dual expanded/disabled state, and the
            platform's disabled dim, so the capsule adds the one thing Dropdown
            cannot know: the ACCESSIBLE NAME of the account. A labelled child names
            its button, so a screen reader hears the person instead of "button". The
            capsule is NOT a Pressable and carries no button role of its own:
            nesting one inside Dropdown's would make a doubly-focusable, invalid
            control (test/no-console-violations.test.tsx locks that). */}
        <View style={[skin.menuPill, { borderRadius: PILL_RADIUS }, skin.menuPillFill(tokens, expanded)]}>
          <Avatar small src={src} name={name} initials={initials} />
          {compact ? null : (
            <View style={IDENTITY_COLUMN}>
              {name ? (
                <Text numberOfLines={1} style={[skin.menuPillName, { color: tokens.foreground }]}>
                  {name}
                </Text>
              ) : null}
              {email ? (
                <Text numberOfLines={1} style={[skin.menuPillSecondary, { color: tokens["muted-foreground"] }]}>
                  {email}
                </Text>
              ) : null}
            </View>
          )}
          {/* The chevron points down when closed and flips up while the menu is open;
              it repeats the button's own state, so it stays decorative. */}
          <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
            <Icon chevronDown size={skin.menuChevronSize} muted decorative />
          </View>
        </View>
      </Dropdown>
    );
  };
}
