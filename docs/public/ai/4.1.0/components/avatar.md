# Avatar

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4142cc0e5e2e3b6d409e4f7eb0338822b95078cff8102a18cf5c33a42834366a

Source: `src/atoms/avatar/avatar.md`
Human reference: https://canvas.nannier.com/components/avatar

## Public imports

```tsx
import { Avatar, AvatarGroup, AvatarMenu } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A photo when the account has one, falling back to one or two initials on an identity disc: the name resolves to one of ten hues (or `hue` picks one), and the disc is that hue's soft wash under initials in the same hue, so one person keeps one colour on every platform and stays distinct in a stack or list. The initials sit at weight 600, 38% of the disc, and their ink is held to 4.5:1 on the wash in both schemes.

Like a photo, the disc is identity content: it keeps its colours under glass, where only the neutral tile of an avatar with no name or initials takes the control material. `AvatarMenu` builds the signed-in account control on the same circle: one capsule trigger carrying the avatar, the name, and the email, opening the account menu under that same identity.

Argus identity sizes are available as `annotation` (16), `compact` (30), `account`
(32), `row` (36), `person` (38), `profile` (44), `detail` (52), `hero` (58),
`featured` (60), and `spotlight` (74), in that precedence order. These retain their
reference initials metrics, including the existing 9px annotation glyph.

`hue` selects a stage identity independently of its name. `whiteInk` preserves
white reference initials; `bold` uses the 700 weight. `sheen`, `mediumSheen`, and
`strongSheen` add the 2, 2.5 and 3px conic ring (strongest wins). `inverse` is the
translucent white identity disc, `orchid` the account gradient, and `glow` its
selected account ring. These reference discs keep the identity gradient. On the four
stock sizes, `glow` is a 2px gap in the page colour inside the accent's soft glow, and
`ring` stays the separator ring a stack draws between discs.

## Usage

```tsx
<Avatar name="AO" />
```

## Variants

### Brand mark

```tsx
<Avatar logo whiteInk initials="A" />
```

`logo` retains the original 30px Argus mark, nine-pixel corners, action-to-ring
gradient, 14px extra-bold initial, and selection-colored drop shadow.


### Photo

```tsx
<Avatar src="/rachel-chen.jpg" name="RC" />
```

### Identity colours

Each name resolves to one of ten hues through a stable hash, so the same person gets the same disc in every session and on every platform, and a list of people spreads across the set. The hue follows `name` when one is set, else the initials, so pass the full name: two people who share initials then usually get different discs.

```tsx
<Row snug wrap>
  <Avatar name="Ada Ito" />
  <Avatar name="Rachel Tanaka" />
  <Avatar name="Liang Kim" />
  <Avatar name="Kira Okafor" />
  <Avatar name="Marcus Singh" />
  <Avatar name="Noor Novak" />
  <Avatar name="Sofia Bao" />
  <Avatar name="Theo Lovelace" />
  <Avatar name="Omar Moreau" />
  <Avatar name="Priya Haddad" />
</Row>
```

### Sizes

Four steps: `tiny` (20px), `small` (28px), the default 40px row avatar, and `large` (56px). The initials take 38% of the disc (11, 15 and 21px), and 10px on `tiny`, the kit's smallest type. `rounded` squares the disc with corners at 28% of its size. `small` is the disc `AvatarMenu` builds its capsule around, so a standalone small avatar and the one inside a pill are the same circle. Precedence when several are passed: `tiny` beats `small` beats `large`.

```tsx
<Row relaxed alignCenter>
  <Avatar tiny name="NP" />
  <Avatar small name="AL" />
  <Avatar name="MA" />
  <Avatar large name="RC" />
</Row>
```

### Rounded

```tsx
<Avatar rounded name="LB" />
```

### Online

`online` marks presence: the success dot in a ring of the card at the disc's lower trailing edge. The dot is decorative, so say the presence in the label where it matters.

```tsx
<Avatar online name="Rachel Chen" accessibilityLabel="Rachel Chen, online" />
```

### Ring outline

```tsx
<Avatar ring name="AO" />
```

### Stacked

```tsx
<AvatarGroup max={3}>
  <Avatar name="Rachel Chen" />
  <Avatar name="Liang Bao" />
  <Avatar name="Marcus Allen" />
  <Avatar name="Kira Tran" />
</AvatarGroup>
```

### Topbar

A lone avatar as the account trigger: the Dropdown makes the disc its press target, so tapping it opens the account menu, no email or chevron needed.

```tsx
<Dropdown items={[{ label: "Your profile" }, { label: "Sign out" }]}>
  <Avatar small name="MA" />
</Dropdown>
```

### Argus account menu

`account` preserves the original Argus 32px orchid disc, glow, name and role
metrics, and compact menu. `triggerLabel` names the one press target;
`menuLabel` independently names its menu. Bounds use `menuWidth` and `maxHeight`.

```tsx
<AvatarMenu account name="Bobby" email="Principal Engineer" initials="B" triggerLabel="Viewing as Principal Engineer. Switch role" menuLabel="View as role" menuWidth={300} maxHeight={420} items={[{ label: "Principal Engineer", selected: true }, { label: "Architect" }]} />
```

### Account menu

Built on Dropdown, so in glass mode the menu is Dropdown's dense-layer glass card
under the capsule, which keeps its place, its press and its accessible name
throughout.

The whole account control in one component. `AvatarMenu` renders a single capsule trigger (the avatar in the viewer's violet glow ring, the name over the muted email, a chevron) and the account menu itself, with `name` and `email` repeated as the menu's own identity header. One press target covers the capsule, so nothing beside it has to be wired up. The capsule is the hand-off's identity pill on every platform: a hairline edge round the popover fill at rest, the accent fill under the pointer and while its menu is open; the menu is each platform's own Dropdown.

```tsx
<AvatarMenu
  name="Rachel Chen"
  email="rachel.chen@example.com"
  src="/rachel-chen.jpg"
  items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings" },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]}
/>
```

### Menu specimen

`inline` draws the menu open and in flow under the capsule rather than floating over the page, for a page that shows the menu itself. Rows still fire `onSelect`; nothing dismisses it.

```tsx
<AvatarMenu
  inline
  name="Rachel Chen"
  email="rachel.chen@example.com"
  menuWidth={240}
  items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings" },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]}
/>
```

### Compact menu

`compact` drops the name block for a bar with no room for it, leaving the 28px avatar alone. The identity still travels with the menu, so the name and email head the rows the moment it opens. A topbar parks the pill at the trailing edge, so the menu hangs from that edge by default; `alignStart` moves it to the leading edge for a pill that sits at the start of a bar.

```tsx
<AvatarMenu
  compact
  name="Marcus Allen"
  email="admin@example.com"
  src="/marcus-allen.jpg"
  items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings" },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]}
/>
```

### Menu alignment

The menu hangs from the pill's trailing edge by default, the edge a topbar parks the account control against and the only one a right-parked trigger can open from without running off the surface. `alignStart` swings it to the leading edge for a pill that sits at the start of a bar, and `alignEnd` spells the default out. Both are logical, so a right-to-left locale mirrors them. Press each pill to see which edge its menu meets.

```tsx
<Row between>
  <AvatarMenu
    compact
    alignStart
    name="Liang Bao"
    email="liang.bao@example.com"
    src="/liang-bao.jpg"
    items={[
      { label: "Profile", icon: "user" },
      { label: "Settings", icon: "settings" },
      { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
    ]}
  />
  <AvatarMenu
    compact
    alignEnd
    name="Kira Tanaka"
    email="kira.tanaka@example.com"
    src="/kira-tanaka.jpg"
    items={[
      { label: "Profile", icon: "user" },
      { label: "Settings", icon: "settings" },
      { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
    ]}
  />
</Row>
```

### Disabled menu

`disabled` takes the whole pill out of service: it dims to the platform's disabled treatment, the press is a no-op, the menu never opens, and the button announces itself disabled before anyone reaches for it. Reach for it while the session is still resolving, not to park a menu whose rows simply have nothing to offer.

```tsx
<AvatarMenu
  disabled
  name="Ada Lovelace"
  email="ada.lovelace@example.com"
  src="/ada-lovelace.jpg"
  items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings" },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]}
/>
```

## Do & Don't

### Single

**Do** — One or two initials, about a third of the disc.

```tsx
<Avatar name="AO" />
```

**Don't** — Cramming in a full set of initials shrinks the type and crowds the circle.

```tsx
<View style={{ flexShrink: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: tokens.muted, width: 40, height: 40, borderRadius: 9999 }}>
  <Text style={{ fontWeight: "500", color: tokens["muted-foreground"], fontSize: 12 }}>ABCD</Text>
</View>
```

### Stacked

**Do** — Cap the stack with `max` and let AvatarGroup summarize the rest as a +N count.

```tsx
<AvatarGroup small max={4} total={16}>
  <Avatar name="Ada Okafor" />
  <Avatar name="Rachel Chen" />
  <Avatar name="Liang Bao" />
  <Avatar name="Kira Tran" />
</AvatarGroup>
```

**Don't** — An unbounded stack (no `max`) runs off the row and stops being scannable.

```tsx
<AvatarGroup small>
  <Avatar name="AO" />
  <Avatar name="RC" />
  <Avatar name="LB" />
  <Avatar name="KT" />
  <Avatar name="JD" />
  <Avatar name="MA" />
  <Avatar name="AL" />
  <Avatar name="SK" />
</AvatarGroup>
```

### Topbar account menu

**Do**: Press the avatar: `AvatarMenu compact` makes it a real trigger in a bar with no room for a name, and the account is named in the menu header the moment the menu opens.

```tsx
<AvatarMenu compact name="Marcus Allen" email="admin@example.com" src="/marcus-allen.jpg" items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings", shortcut: "⌘," },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]} />
```

**Don't** — A bare avatar with no Dropdown around it is decorative, not a trigger, and opens nothing.

```tsx
<Avatar small src="/marcus-allen.jpg" name="MA" />
```

### Identity

**Do** — Name primary; email muted and secondary.

```tsx
<MediaObject center src="/rachel-chen.jpg" title="Rachel Chen" description="rachel.chen@example.com" />
```

**Don't** — Equal weight on the name and email flattens the hierarchy.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Rachel Chen</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>rachel.chen@example.com</Text>
  </View>
</View>
```

### Menu header

**Do** — Keep one consistent circular avatar shape across contexts.

```tsx
<MediaObject compact center src="/ada-lovelace.jpg" title="Ada Lovelace" description="admin@example.com" />
```

**Don't** — Squaring the avatar here clashes with the circular avatars everywhere else.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <Avatar rounded src="/ada-lovelace.jpg" name="AL" />
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Ada Lovelace</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>admin@example.com</Text>
  </View>
</View>
```

### Account identity

**Do**: Press the pill: `name` and `email` go through AvatarMenu, which owns both lines, the shared press target, and the identity header on the menu it opens.

```tsx
<AvatarMenu name="Rachel Chen" email="rachel.chen@example.com" src="/rachel-chen.jpg" items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings", shortcut: "⌘," },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]} />
```

**Don't**: Hand-composing the identity beside the trigger drifts from the pill's type and spacing, and the menu that opens names no account at all.

```tsx
<Dropdown items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings" },
    { label: "Sign out", icon: "logOut", separatorBefore: true }
  ]}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <Avatar small src="/rachel-chen.jpg" name="RC" />
    <View>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Rachel Chen</Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>rachel.chen@example.com</Text>
    </View>
    <Icon chevronDown muted size={12} />
  </View>
</Dropdown>
```

### Sign out

**Do**: Open the menu: keep the destructive sign out last and behind a separator, a reach away from the rows people press every day.

```tsx
<AvatarMenu name="Kira Tanaka" email="kira.tanaka@example.com" src="/kira-tanaka.jpg" items={[
    { label: "Profile", icon: "user" },
    { label: "Billing", icon: "creditCard" },
    { label: "Settings", icon: "settings", shortcut: "⌘," },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]} />
```

**Don't**: Sign out buried mid-list, in the same tone as its neighbours, is one slip away on the path to Settings.

```tsx
<AvatarMenu name="Kira Tanaka" email="kira.tanaka@example.com" src="/kira-tanaka.jpg" items={[
    { label: "Profile", icon: "user" },
    { label: "Sign out", icon: "logOut" },
    { label: "Billing", icon: "creditCard" },
    { label: "Settings", icon: "settings", shortcut: "⌘," }
  ]} />
```

### Compact trigger

**Do**: Press the pill: where the row has space, the full form says who is signed in before anything is opened.

```tsx
<AvatarMenu name="Noor Park" email="noor.park@example.com" src="/noor-park.jpg" items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings", shortcut: "⌘," },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]} />
```

**Don't**: `compact` on a roomy page that names the account nowhere else hides who is signed in behind a press, to save room the row never needed.

```tsx
<AvatarMenu compact name="Noor Park" email="noor.park@example.com" src="/noor-park.jpg" items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings", shortcut: "⌘," },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]} />
```

### Unavailable account

**Do**: `disabled` on the pill itself: the whole trigger dims, the press is inert, and the button announces itself disabled instead of inviting a press that goes nowhere.

```tsx
<AvatarMenu disabled name="Ada Lovelace" email="ada.lovelace@example.com" src="/ada-lovelace.jpg" items={[
    { label: "Profile", icon: "user" },
    { label: "Settings", icon: "settings", shortcut: "⌘," },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true }
  ]} />
```

**Don't**: Disabling every row instead leaves the pill live: it still opens, onto a menu where nothing can be pressed.

```tsx
<AvatarMenu name="Ada Lovelace" email="ada.lovelace@example.com" src="/ada-lovelace.jpg" items={[
    { label: "Profile", icon: "user", disabled: true },
    { label: "Settings", icon: "settings", shortcut: "⌘,", disabled: true },
    { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true, disabled: true }
  ]} />
```

## Supported props

### AvatarMenuProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| account | boolean \| undefined | no | false | Original Argus account control with a 32px orchid disc and compact role menu. |
| triggerLabel | string \| undefined | no |  | Explicit name for the trigger. |
| menuLabel | string \| undefined | no |  | Menu heading and accessible name, independent of the account's identity lines. |
| menuWidth | number \| undefined | no |  |  |
| maxHeight | number \| undefined | no |  |  |
| name | string \| undefined | no |  | The account holder's full name: the pill's first line, the avatar's initials fallback and colour identity, and the menu header's title. |
| email | string \| undefined | no |  | The secondary line under the name in the pill, and the menu header's description (typically the account's email address). |
| src | string \| undefined | no |  | The account photo. Falls back to the initials exactly like `Avatar`. |
| initials | string \| undefined | no |  | Ready-made initials for the avatar, used verbatim when there is no photo. |
| items | DropdownItem[] | yes |  | The menu rows, top to bottom. Same rows as `Dropdown` (icon, shortcut, destructive, disabled, separatorBefore). |
| compact | boolean \| undefined | no | false | Avatar and chevron only, no name block: the topbar form of the pill. |
| alignStart | boolean \| undefined | no | false | Hang the menu from the pill's LEADING edge instead of its trailing one. |
| alignEnd | boolean \| undefined | no | false | The default, spelled out: the menu's trailing edge meets the pill's. |
| disabled | boolean \| undefined | no | false | Dimmed, non-opening pill: the menu never opens and the press is inert. |
| inline | boolean \| undefined | no | false | Draw the menu open and in flow under the pill instead of floating it over the page, a specimen of the account menu (Dropdown's `inline`): the pill reads as open and its press is inert, a row still fires `onSelect`, and `open` / `onOpenChange` have no effect. |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (the pill opens/closes it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes (pill press, row select, dismissal). |
| onSelect | ((item: DropdownItem, index: number) => void) \| undefined | no |  | Fired with the selected row and its index when a menu row is pressed. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Outer layout composition only (placement within a parent), never a restyle hook. |

### AvatarProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| logo | boolean \| undefined | no | false | Original 30px rounded brand mark with its action-to-selection gradient. |
| annotation | boolean \| undefined | no | false | Reference identity geometry, smallest first in precedence. |
| compact | boolean \| undefined | no | false |  |
| account | boolean \| undefined | no | false |  |
| row | boolean \| undefined | no | false |  |
| person | boolean \| undefined | no | false |  |
| profile | boolean \| undefined | no | false |  |
| detail | boolean \| undefined | no | false |  |
| hero | boolean \| undefined | no | false |  |
| featured | boolean \| undefined | no | false |  |
| spotlight | boolean \| undefined | no | false |  |
| hue | number \| undefined | no |  | Stage identity hue, independent of the display name. |
| whiteInk | boolean \| undefined | no | false |  |
| bold | boolean \| undefined | no | false |  |
| inverse | boolean \| undefined | no | false |  |
| orchid | boolean \| undefined | no | false |  |
| glow | boolean \| undefined | no | false |  |
| sheen | boolean \| undefined | no | false |  |
| mediumSheen | boolean \| undefined | no | false |  |
| strongSheen | boolean \| undefined | no | false |  |
| src | string \| number \| undefined | no |  | The photo. A remote/URI string, or a bundled image module from `require(...)` / `import`. When set (and it loads), the image fills the circle and the initials fallback is hidden; if the image fails to load, it falls back to the initials. |
| uri | string \| number \| undefined | no |  | Alias for `src`, for callers that think in terms of a native image uri. |
| name | string \| undefined | no |  | Full name. Drives the initials fallback AND the accessible label/alt text. |
| initials | string \| undefined | no |  | Ready-made initials, used verbatim as the glyph (overrides `name`/`children`). |
| children | ReactNode | no |  | Same as `name`; the rendered initials when no photo is supplied. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the avatar (the photo's alt text and, when pressable, the button's label). Falls back to `name`, then string `children`. Set it for a photo-only or pressable avatar that has no `name`. |
| tiny | boolean \| undefined | no | false | Size (pick one; default is the 40px row avatar, `tiny` the 20px disc, `small` 28, `large` 56). Precedence: `tiny` > `small` > `large`. |
| small | boolean \| undefined | no | false | Size (pick one; default is the 40px row avatar, `tiny` the 20px disc, `small` 28, `large` 56). Precedence: `tiny` > `small` > `large`. |
| large | boolean \| undefined | no | false | Size (pick one; default is the 40px row avatar, `tiny` the 20px disc, `small` 28, `large` 56). Precedence: `tiny` > `small` > `large`. |
| circle | boolean \| undefined | no | false | Shape (pick one; default is a circle). |
| rounded | boolean \| undefined | no | false | Shape (pick one; default is a circle). |
| ring | boolean \| undefined | no | false | Separator outline, for avatars that overlap in a stack. |
| online | boolean \| undefined | no | false | A presence dot: the `success` disc in a 2px ring of the card, at the bottom right, one pixel past the disc's edge. It is decoration (hidden from assistive tech), so name the presence in the label where it matters. |
| onPress | (() => void) \| undefined | no |  | When set, the avatar becomes pressable (e.g. a topbar account trigger). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For layout composition only; overlap/stacking is owned by AvatarGroup, not this prop. |

### AvatarGroupProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | Avatar elements to stack. |
| max | number \| undefined | no |  | Cap the visible avatars; the remainder collapses into a "+N" chip. |
| total | number \| undefined | no |  | Override the total behind the "+N" chip (e.g. a server-known member count). |
| tiny | boolean \| undefined | no | false | Size (pick one; forwarded to every child so the whole stack is uniform). Precedence: `tiny` > `small` > `large`. |
| small | boolean \| undefined | no | false | Size (pick one; forwarded to every child so the whole stack is uniform). Precedence: `tiny` > `small` > `large`. |
| large | boolean \| undefined | no | false | Size (pick one; forwarded to every child so the whole stack is uniform). Precedence: `tiny` > `small` > `large`. |
| tight | boolean \| undefined | no | false | Overlap tightness (pick one; default `tight`). Precedence loose > snug > tight. |
| snug | boolean \| undefined | no | false | Overlap tightness (pick one; default `tight`). Precedence loose > snug > tight. |
| loose | boolean \| undefined | no | false | Overlap tightness (pick one; default `tight`). Precedence loose > snug > tight. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the whole group (e.g. "8 members"). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
