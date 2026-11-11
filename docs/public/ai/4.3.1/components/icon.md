# Icon

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/atoms/icon/icon.md`
Human reference: https://canvas.nannier.com/components/icon

## Public imports

```tsx
import { ICON_CATEGORIES, ICON_NAMES, Icon } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Lucide-style outline. 1.75 stroke width, rounded caps. The stroke defaults to the theme foreground token and tracks light and dark automatically; pick other hues with the semantic color booleans (`primary`, `destructive`, `success`, `warning`, `muted`, `subtle`; that order is the precedence). `muted` is the third ink (`subtle-foreground`) and `subtle` the second (`muted-foreground`), the names Typography gives the same two inks. Inside a control that owns a label ink (a Button's `iconLeft` and `iconRight` slots) a glyph with no tone takes that ink instead, the way the hand-off's icons inherit `currentColor`: the primary's contrast ink on a primary button, the muted ink on a quiet one. The precedence is the explicit tone, then the host's ink, then the foreground, so a toned glyph keeps its tone anywhere.

## Usage

```tsx
<Icon shield />
```

## Variants

### Primary

```tsx
<Icon shield primary />
```

### Destructive

```tsx
<Icon shield destructive />
```

### Success

```tsx
<Icon circleCheck success />
```

### Warning

```tsx
<Icon alertTriangle warning />
```

### Muted

```tsx
<Icon shield muted />
```

### Subtle

The second ink, a glyph that reads quieter than the foreground but louder than `muted`.

```tsx
<Icon shield subtle />
```

### Cell

`cell` centres the glyph in a square cell that fills its parent at a 10 px corner, the
tile of a glyph gallery laid out by a `Grid`. On the web a hovered cell takes the
accent's soft wash and its glyph the accent ink.

```tsx
<Grid minTileWidth={40} compact>
  <Icon cell subtle search size={20} accessibilityLabel="search" />
  <Icon cell subtle bell size={20} accessibilityLabel="bell" />
  <Icon cell subtle settings size={20} accessibilityLabel="settings" />
  <Icon cell subtle user size={20} accessibilityLabel="user" />
</Grid>
```

### Disclosure indicator

`disclosure` turns the glyph 180 degrees over the original Argus 180ms ease when
`expanded` changes. Reduce Motion snaps to the target. The existing glyph, color
and stroke props keep their usual meaning.

```tsx
<Icon disclosure expanded decorative chevronDown muted heavyStroke size={14} />
```

### Gallery

`ICON_NAMES` lists every glyph in gallery order, each with its prop `key`, its
typed `label` and its `category`, for an icon picker or a catalog like this one.
`ICON_CATEGORIES` lists the categories in menu order, typed `IconCategory`. This
gallery filters by both: search a name, or pick a category.

```tsx
<IconGallery />
```


## Do & Don't

### Stroke coherence

**Do** — One outline style at 1.75 stroke across the whole set.

```tsx
<Row alignCenter relaxed>
  <Icon home size={28} />
  <Icon search size={28} />
  <Icon bell size={28} />
</Row>
```

**Don't** — Mixed stroke weights and a stray filled glyph make a set look incoherent.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
  <Icon home muted size={20} />
  <Icon search destructive size={34} />
  <Icon bell primary size={28} />
</View>
```

### foreground

**Do** — Leave the stroke at its default: it paints the theme foreground and follows light and dark on its own, no color prop needed.

```tsx
<Icon mail size={28} />
```

**Don't** — Hard-coding a hex stroke pins the icon to one theme; it stays black on a dark surface and disappears.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.foreground, padding: 12 }}>
  <Icon mail size={28} />
</View>
```

### primary

**Do** — Reserve text-primary for the one active or selected icon; keep the rest muted.

```tsx
<Row alignCenter relaxed>
  <Icon home muted size={22} />
  <Icon star primary size={22} />
  <Icon settings muted size={22} />
</Row>
```

**Don't** — Painting a whole toolbar primary spends the accent on everything, so nothing reads as emphasized.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
  <Icon home primary size={22} />
  <Icon search primary size={22} />
  <Icon settings primary size={22} />
</View>
```

### destructive

**Do** — Keep text-destructive for genuinely destructive actions like delete, so red always means consequence.

```tsx
<Icon trash destructive size={28} />
```

**Don't** — A red download icon implies danger on a perfectly safe action and trains users to ignore the warning color.

```tsx
<Icon download destructive size={28} />
```

### muted

**Do** — Use the muted tone for secondary, inline hint icons where its color matches the helper text.

```tsx
<Row alignCenter snug>
  <Icon info muted size={16} />
  <Typography small muted>Optional, used only for recovery</Typography>
</Row>
```

**Don't** — A muted icon inside a solid primary button reads as disabled and clashes with the high-contrast label.

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 6, backgroundColor: tokens.primary, paddingHorizontal: 16, paddingVertical: 8 }}>
  <Icon plus muted size={16} />
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["primary-foreground"] }}>New project</Text>
</Pressable>
```

## Supported props

### IconProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disclosure | boolean \| undefined | no | false | Rotate the glyph as an Argus disclosure indicator. |
| expanded | boolean \| undefined | no | false | Open state of a disclosure indicator. |
| heavyStroke | boolean \| undefined | no | false | Strong action/link stroke from the Argus reference. |
| boldStroke | boolean \| undefined | no | false | Standard emphasized metadata stroke. |
| mediumStroke | boolean \| undefined | no | false | The medium toolbar stroke. |
| regularStroke | boolean \| undefined | no | false | The fine navigation stroke. |
| primary | boolean \| undefined | no | false | Color axis: pass one (default foreground). First match wins. |
| primaryForeground | boolean \| undefined | no | false | Contrast color for a glyph on a primary surface (e.g. a primary button). |
| destructive | boolean \| undefined | no | false |  |
| success | boolean \| undefined | no | false | Positive/green status (matches Alert's success tone, scheme-aware). |
| warning | boolean \| undefined | no | false | Caution/amber status (the warning token, scheme-aware; matches Alert/Toast warning). |
| muted | boolean \| undefined | no | false | The third ink (`subtle-foreground`, the hand-off's `--tx3`): a glyph that recedes. |
| subtle | boolean \| undefined | no | false | The second ink (`muted-foreground`, the hand-off's `--tx2`), as Typography's `subtle`. |
| cell | boolean \| undefined | no | false | The glyph centred in a square cell that fills its parent (a Grid tile of a glyph gallery) at a 10 px corner. On the web a hovered cell takes the accent's soft wash and its glyph the accent ink. |
| size | number \| undefined | no |  | Single-glyph size in px (default 24). |
| accessibilityLabel | string \| undefined | no |  | Accessible name for a MEANINGFUL standalone icon (one that conveys information not repeated in adjacent text, e.g. an icon-only button's glyph). Marks the glyph `role="img"` with this label on web and native. |
| decorative | boolean \| undefined | no | false | Mark a DECORATIVE/ornamental glyph (one paired with a text label, a separator chevron, an empty-state illustration) so assistive tech skips it. Hides it via aria-hidden on web and importantForAccessibility on native. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| accessibility | boolean \| undefined | no |  | `accessibility` |
| activity | boolean \| undefined | no |  | `activity` |
| alarmClock | boolean \| undefined | no |  | `alarm-clock` |
| alertTriangle | boolean \| undefined | no |  | `triangle-alert` |
| alignLeft | boolean \| undefined | no |  | `text-align-start` |
| anchor | boolean \| undefined | no |  | `anchor` |
| apple | boolean \| undefined | no |  | `apple` |
| appWindow | boolean \| undefined | no |  | `app-window` |
| archive | boolean \| undefined | no |  | `archive` |
| arrowDown | boolean \| undefined | no |  | `arrow-down` |
| arrowDownLeft | boolean \| undefined | no |  | `arrow-down-left` |
| arrowDownRight | boolean \| undefined | no |  | `arrow-down-right` |
| arrowLeft | boolean \| undefined | no |  | `arrow-left` |
| arrowRight | boolean \| undefined | no |  | `arrow-right` |
| arrowUp | boolean \| undefined | no |  | `arrow-up` |
| arrowUpLeft | boolean \| undefined | no |  | `arrow-up-left` |
| arrowUpRight | boolean \| undefined | no |  | `arrow-up-right` |
| asterisk | boolean \| undefined | no |  | `asterisk` |
| atSign | boolean \| undefined | no |  | `at-sign` |
| award | boolean \| undefined | no |  | `award` |
| baby | boolean \| undefined | no |  | `baby` |
| badge | boolean \| undefined | no |  | `badge` |
| badgeCheck | boolean \| undefined | no |  | `badge-check` |
| banknote | boolean \| undefined | no |  | `banknote` |
| barChart2 | boolean \| undefined | no |  | `chart-no-axes-column` |
| battery | boolean \| undefined | no |  | `battery` |
| batteryCharging | boolean \| undefined | no |  | `battery-charging` |
| batteryFull | boolean \| undefined | no |  | `battery-full` |
| batteryLow | boolean \| undefined | no |  | `battery-low` |
| bell | boolean \| undefined | no |  | `bell` |
| bellOff | boolean \| undefined | no |  | `bell-off` |
| bellRing | boolean \| undefined | no |  | `bell-ring` |
| bike | boolean \| undefined | no |  | `bike` |
| binary | boolean \| undefined | no |  | `binary` |
| bird | boolean \| undefined | no |  | `bird` |
| blend | boolean \| undefined | no |  | `blend` |
| bluetooth | boolean \| undefined | no |  | `bluetooth` |
| book | boolean \| undefined | no |  | `book` |
| bookmark | boolean \| undefined | no |  | `bookmark` |
| bookOpen | boolean \| undefined | no |  | `book-open` |
| bookOpenText | boolean \| undefined | no |  | `book-open-text` |
| bot | boolean \| undefined | no |  | `bot` |
| box | boolean \| undefined | no |  | `box` |
| braces | boolean \| undefined | no |  | `braces` |
| brackets | boolean \| undefined | no |  | `brackets` |
| briefcase | boolean \| undefined | no |  | `briefcase` |
| brush | boolean \| undefined | no |  | `brush` |
| bug | boolean \| undefined | no |  | `bug` |
| building | boolean \| undefined | no |  | `building` |
| building2 | boolean \| undefined | no |  | `building-2` |
| calculator | boolean \| undefined | no |  | `calculator` |
| calendar | boolean \| undefined | no |  | `calendar` |
| calendarCheck | boolean \| undefined | no |  | `calendar-check` |
| calendarClock | boolean \| undefined | no |  | `calendar-clock` |
| calendarDays | boolean \| undefined | no |  | `calendar-days` |
| camera | boolean \| undefined | no |  | `camera` |
| car | boolean \| undefined | no |  | `car` |
| carrot | boolean \| undefined | no |  | `carrot` |
| cast | boolean \| undefined | no |  | `cast` |
| cat | boolean \| undefined | no |  | `cat` |
| chartArea | boolean \| undefined | no |  | `chart-area` |
| chartBar | boolean \| undefined | no |  | `chart-bar` |
| chartColumn | boolean \| undefined | no |  | `chart-column` |
| chartLine | boolean \| undefined | no |  | `chart-line` |
| chartPie | boolean \| undefined | no |  | `chart-pie` |
| check | boolean \| undefined | no |  | `check` |
| checkSquare | boolean \| undefined | no |  | `square-check` |
| chevronDown | boolean \| undefined | no |  | `chevron-down` |
| chevronLeft | boolean \| undefined | no |  | `chevron-left` |
| chevronRight | boolean \| undefined | no |  | `chevron-right` |
| chevronsLeft | boolean \| undefined | no |  | `chevrons-left` |
| chevronsLeftRight | boolean \| undefined | no |  | `chevrons-left-right` |
| chevronsRight | boolean \| undefined | no |  | `chevrons-right` |
| chevronsUpDown | boolean \| undefined | no |  | `chevrons-up-down` |
| chevronUp | boolean \| undefined | no |  | `chevron-up` |
| circle | boolean \| undefined | no |  | `circle` |
| circleAlert | boolean \| undefined | no |  | `circle-alert` |
| circleCheck | boolean \| undefined | no |  | `circle-check` |
| circleCheckBig | boolean \| undefined | no |  | `circle-check-big` |
| circleDashed | boolean \| undefined | no |  | `circle-dashed` |
| circleDot | boolean \| undefined | no |  | `circle-dot` |
| circleMinus | boolean \| undefined | no |  | `circle-minus` |
| circlePlay | boolean \| undefined | no |  | `circle-play` |
| circlePlus | boolean \| undefined | no |  | `circle-plus` |
| circleQuestionMark | boolean \| undefined | no |  | `circle-question-mark` |
| circleUser | boolean \| undefined | no |  | `circle-user` |
| circleX | boolean \| undefined | no |  | `circle-x` |
| clapperboard | boolean \| undefined | no |  | `clapperboard` |
| clipboard | boolean \| undefined | no |  | `clipboard` |
| clipboardCheck | boolean \| undefined | no |  | `clipboard-check` |
| clipboardCopy | boolean \| undefined | no |  | `clipboard-copy` |
| clipboardList | boolean \| undefined | no |  | `clipboard-list` |
| clock | boolean \| undefined | no |  | `clock` |
| clock3 | boolean \| undefined | no |  | `clock-3` |
| cloud | boolean \| undefined | no |  | `cloud` |
| cloudDownload | boolean \| undefined | no |  | `cloud-download` |
| cloudLightning | boolean \| undefined | no |  | `cloud-lightning` |
| cloudRain | boolean \| undefined | no |  | `cloud-rain` |
| cloudSnow | boolean \| undefined | no |  | `cloud-snow` |
| cloudSun | boolean \| undefined | no |  | `cloud-sun` |
| cloudUpload | boolean \| undefined | no |  | `cloud-upload` |
| code | boolean \| undefined | no |  | `code` |
| codeXml | boolean \| undefined | no |  | `code-xml` |
| coffee | boolean \| undefined | no |  | `coffee` |
| cog | boolean \| undefined | no |  | `cog` |
| coins | boolean \| undefined | no |  | `coins` |
| columns2 | boolean \| undefined | no |  | `columns-2` |
| command | boolean \| undefined | no |  | `command` |
| compass | boolean \| undefined | no |  | `compass` |
| contact | boolean \| undefined | no |  | `contact` |
| copy | boolean \| undefined | no |  | `copy` |
| cornerDownRight | boolean \| undefined | no |  | `corner-down-right` |
| cpu | boolean \| undefined | no |  | `cpu` |
| creditCard | boolean \| undefined | no |  | `credit-card` |
| cross | boolean \| undefined | no |  | `cross` |
| crosshair | boolean \| undefined | no |  | `crosshair` |
| crown | boolean \| undefined | no |  | `crown` |
| database | boolean \| undefined | no |  | `database` |
| diamond | boolean \| undefined | no |  | `diamond` |
| disc | boolean \| undefined | no |  | `disc` |
| divide | boolean \| undefined | no |  | `divide` |
| dog | boolean \| undefined | no |  | `dog` |
| dollarSign | boolean \| undefined | no |  | `dollar-sign` |
| download | boolean \| undefined | no |  | `download` |
| drill | boolean \| undefined | no |  | `drill` |
| droplet | boolean \| undefined | no |  | `droplet` |
| droplets | boolean \| undefined | no |  | `droplets` |
| earth | boolean \| undefined | no |  | `earth` |
| ellipsisVertical | boolean \| undefined | no |  | `ellipsis-vertical` |
| equal | boolean \| undefined | no |  | `equal` |
| eraser | boolean \| undefined | no |  | `eraser` |
| euro | boolean \| undefined | no |  | `euro` |
| expand | boolean \| undefined | no |  | `expand` |
| externalLink | boolean \| undefined | no |  | `external-link` |
| eye | boolean \| undefined | no |  | `eye` |
| eyeOff | boolean \| undefined | no |  | `eye-off` |
| factory | boolean \| undefined | no |  | `factory` |
| fastForward | boolean \| undefined | no |  | `fast-forward` |
| feather | boolean \| undefined | no |  | `feather` |
| file | boolean \| undefined | no |  | `file` |
| fileCheck | boolean \| undefined | no |  | `file-check` |
| fileCode | boolean \| undefined | no |  | `file-code` |
| fileImage | boolean \| undefined | no |  | `file-image` |
| fileInput | boolean \| undefined | no |  | `file-input` |
| fileOutput | boolean \| undefined | no |  | `file-output` |
| filePen | boolean \| undefined | no |  | `file-pen` |
| filePlus | boolean \| undefined | no |  | `file-plus` |
| files | boolean \| undefined | no |  | `files` |
| fileSearch | boolean \| undefined | no |  | `file-search` |
| fileText | boolean \| undefined | no |  | `file-text` |
| fileX | boolean \| undefined | no |  | `file-x` |
| film | boolean \| undefined | no |  | `film` |
| filter | boolean \| undefined | no |  | `funnel` |
| fish | boolean \| undefined | no |  | `fish` |
| flag | boolean \| undefined | no |  | `flag` |
| flagTriangleRight | boolean \| undefined | no |  | `flag-triangle-right` |
| flame | boolean \| undefined | no |  | `flame` |
| flashlight | boolean \| undefined | no |  | `flashlight` |
| flower | boolean \| undefined | no |  | `flower` |
| folder | boolean \| undefined | no |  | `folder` |
| folderCheck | boolean \| undefined | no |  | `folder-check` |
| folderOpen | boolean \| undefined | no |  | `folder-open` |
| folderPlus | boolean \| undefined | no |  | `folder-plus` |
| footprints | boolean \| undefined | no |  | `footprints` |
| forward | boolean \| undefined | no |  | `forward` |
| frown | boolean \| undefined | no |  | `frown` |
| fuel | boolean \| undefined | no |  | `fuel` |
| gauge | boolean \| undefined | no |  | `gauge` |
| gem | boolean \| undefined | no |  | `gem` |
| gift | boolean \| undefined | no |  | `gift` |
| gitBranch | boolean \| undefined | no |  | `git-branch` |
| gitCommitHorizontal | boolean \| undefined | no |  | `git-commit-horizontal` |
| gitCompare | boolean \| undefined | no |  | `git-compare` |
| gitMerge | boolean \| undefined | no |  | `git-merge` |
| gitPullRequest | boolean \| undefined | no |  | `git-pull-request` |
| globe | boolean \| undefined | no |  | `globe` |
| graduationCap | boolean \| undefined | no |  | `graduation-cap` |
| grip | boolean \| undefined | no |  | `grip` |
| gripHorizontal | boolean \| undefined | no |  | `grip-horizontal` |
| gripVertical | boolean \| undefined | no |  | `grip-vertical` |
| group | boolean \| undefined | no |  | `group` |
| hammer | boolean \| undefined | no |  | `hammer` |
| hand | boolean \| undefined | no |  | `hand` |
| handGrab | boolean \| undefined | no |  | `hand-grab` |
| handshake | boolean \| undefined | no |  | `handshake` |
| hardDrive | boolean \| undefined | no |  | `hard-drive` |
| hash | boolean \| undefined | no |  | `hash` |
| headphones | boolean \| undefined | no |  | `headphones` |
| heart | boolean \| undefined | no |  | `heart` |
| heartHandshake | boolean \| undefined | no |  | `heart-handshake` |
| heartPulse | boolean \| undefined | no |  | `heart-pulse` |
| hexagon | boolean \| undefined | no |  | `hexagon` |
| history | boolean \| undefined | no |  | `history` |
| home | boolean \| undefined | no |  | `house` |
| hourglass | boolean \| undefined | no |  | `hourglass` |
| idCard | boolean \| undefined | no |  | `id-card` |
| image | boolean \| undefined | no |  | `image` |
| images | boolean \| undefined | no |  | `images` |
| inbox | boolean \| undefined | no |  | `inbox` |
| info | boolean \| undefined | no |  | `info` |
| keyboard | boolean \| undefined | no |  | `keyboard` |
| keyRound | boolean \| undefined | no |  | `key-round` |
| landmark | boolean \| undefined | no |  | `landmark` |
| laptop | boolean \| undefined | no |  | `laptop` |
| layers | boolean \| undefined | no |  | `layers` |
| layout | boolean \| undefined | no |  | `panels-top-left` |
| layoutDashboard | boolean \| undefined | no |  | `layout-dashboard` |
| layoutGrid | boolean \| undefined | no |  | `layout-grid` |
| layoutList | boolean \| undefined | no |  | `layout-list` |
| leaf | boolean \| undefined | no |  | `leaf` |
| library | boolean \| undefined | no |  | `library` |
| lifeBuoy | boolean \| undefined | no |  | `life-buoy` |
| lightbulb | boolean \| undefined | no |  | `lightbulb` |
| link | boolean \| undefined | no |  | `link` |
| link2 | boolean \| undefined | no |  | `link-2` |
| list | boolean \| undefined | no |  | `list` |
| listChecks | boolean \| undefined | no |  | `list-checks` |
| listOrdered | boolean \| undefined | no |  | `list-ordered` |
| listTree | boolean \| undefined | no |  | `list-tree` |
| loader | boolean \| undefined | no |  | `loader` |
| loaderCircle | boolean \| undefined | no |  | `loader-circle` |
| locate | boolean \| undefined | no |  | `locate` |
| lock | boolean \| undefined | no |  | `lock` |
| lockOpen | boolean \| undefined | no |  | `lock-open` |
| logIn | boolean \| undefined | no |  | `log-in` |
| logOut | boolean \| undefined | no |  | `log-out` |
| mail | boolean \| undefined | no |  | `mail` |
| mailOpen | boolean \| undefined | no |  | `mail-open` |
| mailPlus | boolean \| undefined | no |  | `mail-plus` |
| map | boolean \| undefined | no |  | `map` |
| mapPin | boolean \| undefined | no |  | `map-pin` |
| maximize | boolean \| undefined | no |  | `maximize` |
| maximize2 | boolean \| undefined | no |  | `maximize-2` |
| medal | boolean \| undefined | no |  | `medal` |
| megaphone | boolean \| undefined | no |  | `megaphone` |
| meh | boolean \| undefined | no |  | `meh` |
| memoryStick | boolean \| undefined | no |  | `memory-stick` |
| menu | boolean \| undefined | no |  | `menu` |
| messageCircle | boolean \| undefined | no |  | `message-circle` |
| messageSquare | boolean \| undefined | no |  | `message-square` |
| messageSquareText | boolean \| undefined | no |  | `message-square-text` |
| messageSquareWarning | boolean \| undefined | no |  | `message-square-warning` |
| messagesSquare | boolean \| undefined | no |  | `messages-square` |
| mic | boolean \| undefined | no |  | `mic` |
| micOff | boolean \| undefined | no |  | `mic-off` |
| milestone | boolean \| undefined | no |  | `milestone` |
| minimize | boolean \| undefined | no |  | `minimize` |
| minimize2 | boolean \| undefined | no |  | `minimize-2` |
| minus | boolean \| undefined | no |  | `minus` |
| monitor | boolean \| undefined | no |  | `monitor` |
| moon | boolean \| undefined | no |  | `moon` |
| moreHorizontal | boolean \| undefined | no |  | `ellipsis` |
| mouse | boolean \| undefined | no |  | `mouse` |
| mousePointerClick | boolean \| undefined | no |  | `mouse-pointer-click` |
| move | boolean \| undefined | no |  | `move` |
| move3d | boolean \| undefined | no |  | `move-3d` |
| moveHorizontal | boolean \| undefined | no |  | `move-horizontal` |
| moveVertical | boolean \| undefined | no |  | `move-vertical` |
| music | boolean \| undefined | no |  | `music` |
| navigation | boolean \| undefined | no |  | `navigation` |
| newspaper | boolean \| undefined | no |  | `newspaper` |
| notebook | boolean \| undefined | no |  | `notebook` |
| octagon | boolean \| undefined | no |  | `octagon` |
| paintbrush | boolean \| undefined | no |  | `paintbrush` |
| palette | boolean \| undefined | no |  | `palette` |
| panelRight | boolean \| undefined | no |  | `panel-right` |
| paperclip | boolean \| undefined | no |  | `paperclip` |
| pause | boolean \| undefined | no |  | `pause` |
| pen | boolean \| undefined | no |  | `pen` |
| pencil | boolean \| undefined | no |  | `pencil` |
| pencilRuler | boolean \| undefined | no |  | `pencil-ruler` |
| pentagon | boolean \| undefined | no |  | `pentagon` |
| penTool | boolean \| undefined | no |  | `pen-tool` |
| percent | boolean \| undefined | no |  | `percent` |
| phone | boolean \| undefined | no |  | `phone` |
| phoneCall | boolean \| undefined | no |  | `phone-call` |
| phoneOff | boolean \| undefined | no |  | `phone-off` |
| piggyBank | boolean \| undefined | no |  | `piggy-bank` |
| pill | boolean \| undefined | no |  | `pill` |
| pipette | boolean \| undefined | no |  | `pipette` |
| plane | boolean \| undefined | no |  | `plane` |
| play | boolean \| undefined | no |  | `play` |
| plug | boolean \| undefined | no |  | `plug` |
| plugZap | boolean \| undefined | no |  | `plug-zap` |
| plus | boolean \| undefined | no |  | `plus` |
| podcast | boolean \| undefined | no |  | `podcast` |
| pointer | boolean \| undefined | no |  | `pointer` |
| power | boolean \| undefined | no |  | `power` |
| printer | boolean \| undefined | no |  | `printer` |
| qrCode | boolean \| undefined | no |  | `qr-code` |
| radio | boolean \| undefined | no |  | `radio` |
| rainbow | boolean \| undefined | no |  | `rainbow` |
| receipt | boolean \| undefined | no |  | `receipt` |
| redo | boolean \| undefined | no |  | `redo` |
| redo2 | boolean \| undefined | no |  | `redo-2` |
| refreshCcw | boolean \| undefined | no |  | `refresh-ccw` |
| refreshCw | boolean \| undefined | no |  | `refresh-cw` |
| repeat | boolean \| undefined | no |  | `repeat` |
| reply | boolean \| undefined | no |  | `reply` |
| rewind | boolean \| undefined | no |  | `rewind` |
| rocket | boolean \| undefined | no |  | `rocket` |
| rotateCcw | boolean \| undefined | no |  | `rotate-ccw` |
| rotateCw | boolean \| undefined | no |  | `rotate-cw` |
| route | boolean \| undefined | no |  | `route` |
| rss | boolean \| undefined | no |  | `rss` |
| ruler | boolean \| undefined | no |  | `ruler` |
| save | boolean \| undefined | no |  | `save` |
| scale | boolean \| undefined | no |  | `scale` |
| scan | boolean \| undefined | no |  | `scan` |
| scanLine | boolean \| undefined | no |  | `scan-line` |
| scissors | boolean \| undefined | no |  | `scissors` |
| scrollText | boolean \| undefined | no |  | `scroll-text` |
| search | boolean \| undefined | no |  | `search` |
| send | boolean \| undefined | no |  | `send` |
| server | boolean \| undefined | no |  | `server` |
| settings | boolean \| undefined | no |  | `settings` |
| settings2 | boolean \| undefined | no |  | `settings-2` |
| share | boolean \| undefined | no |  | `share` |
| share2 | boolean \| undefined | no |  | `share-2` |
| shield | boolean \| undefined | no |  | `shield` |
| shieldAlert | boolean \| undefined | no |  | `shield-alert` |
| shieldCheck | boolean \| undefined | no |  | `shield-check` |
| ship | boolean \| undefined | no |  | `ship` |
| shoppingBag | boolean \| undefined | no |  | `shopping-bag` |
| shoppingCart | boolean \| undefined | no |  | `shopping-cart` |
| shrink | boolean \| undefined | no |  | `shrink` |
| sigma | boolean \| undefined | no |  | `sigma` |
| skipBack | boolean \| undefined | no |  | `skip-back` |
| skipForward | boolean \| undefined | no |  | `skip-forward` |
| slidersHorizontal | boolean \| undefined | no |  | `sliders-horizontal` |
| slidersVertical | boolean \| undefined | no |  | `sliders-vertical` |
| smartphone | boolean \| undefined | no |  | `smartphone` |
| smile | boolean \| undefined | no |  | `smile` |
| snowflake | boolean \| undefined | no |  | `snowflake` |
| sparkles | boolean \| undefined | no |  | `sparkles` |
| speaker | boolean \| undefined | no |  | `speaker` |
| sprout | boolean \| undefined | no |  | `sprout` |
| square | boolean \| undefined | no |  | `square` |
| squareArrowOutUpRight | boolean \| undefined | no |  | `square-arrow-out-up-right` |
| squarePen | boolean \| undefined | no |  | `square-pen` |
| squarePlay | boolean \| undefined | no |  | `square-play` |
| squarePlus | boolean \| undefined | no |  | `square-plus` |
| squareTerminal | boolean \| undefined | no |  | `square-terminal` |
| squareX | boolean \| undefined | no |  | `square-x` |
| star | boolean \| undefined | no |  | `star` |
| starHalf | boolean \| undefined | no |  | `star-half` |
| stethoscope | boolean \| undefined | no |  | `stethoscope` |
| stickyNote | boolean \| undefined | no |  | `sticky-note` |
| store | boolean \| undefined | no |  | `store` |
| sun | boolean \| undefined | no |  | `sun` |
| sunrise | boolean \| undefined | no |  | `sunrise` |
| sunset | boolean \| undefined | no |  | `sunset` |
| syringe | boolean \| undefined | no |  | `syringe` |
| table | boolean \| undefined | no |  | `table` |
| tablet | boolean \| undefined | no |  | `tablet` |
| tag | boolean \| undefined | no |  | `tag` |
| tags | boolean \| undefined | no |  | `tags` |
| target | boolean \| undefined | no |  | `target` |
| terminal | boolean \| undefined | no |  | `terminal` |
| textAlignCenter | boolean \| undefined | no |  | `text-align-center` |
| textAlignJustify | boolean \| undefined | no |  | `text-align-justify` |
| textCursorInput | boolean \| undefined | no |  | `text-cursor-input` |
| thermometer | boolean \| undefined | no |  | `thermometer` |
| thumbsDown | boolean \| undefined | no |  | `thumbs-down` |
| thumbsUp | boolean \| undefined | no |  | `thumbs-up` |
| ticket | boolean \| undefined | no |  | `ticket` |
| timer | boolean \| undefined | no |  | `timer` |
| toggleLeft | boolean \| undefined | no |  | `toggle-left` |
| toggleRight | boolean \| undefined | no |  | `toggle-right` |
| trainFront | boolean \| undefined | no |  | `train-front` |
| trash | boolean \| undefined | no |  | `trash` |
| trash2 | boolean \| undefined | no |  | `trash-2` |
| treePine | boolean \| undefined | no |  | `tree-pine` |
| trees | boolean \| undefined | no |  | `trees` |
| trendingDown | boolean \| undefined | no |  | `trending-down` |
| trendingUp | boolean \| undefined | no |  | `trending-up` |
| triangle | boolean \| undefined | no |  | `triangle` |
| trophy | boolean \| undefined | no |  | `trophy` |
| truck | boolean \| undefined | no |  | `truck` |
| type | boolean \| undefined | no |  | `type` |
| umbrella | boolean \| undefined | no |  | `umbrella` |
| undo | boolean \| undefined | no |  | `undo` |
| undo2 | boolean \| undefined | no |  | `undo-2` |
| unlink | boolean \| undefined | no |  | `unlink` |
| upload | boolean \| undefined | no |  | `upload` |
| usb | boolean \| undefined | no |  | `usb` |
| user | boolean \| undefined | no |  | `user` |
| userCheck | boolean \| undefined | no |  | `user-check` |
| userCog | boolean \| undefined | no |  | `user-cog` |
| userPlus | boolean \| undefined | no |  | `user-plus` |
| userRound | boolean \| undefined | no |  | `user-round` |
| users | boolean \| undefined | no |  | `users` |
| usersRound | boolean \| undefined | no |  | `users-round` |
| userX | boolean \| undefined | no |  | `user-x` |
| utensils | boolean \| undefined | no |  | `utensils` |
| variable | boolean \| undefined | no |  | `variable` |
| video | boolean \| undefined | no |  | `video` |
| volume | boolean \| undefined | no |  | `volume` |
| volume1 | boolean \| undefined | no |  | `volume-1` |
| volume2 | boolean \| undefined | no |  | `volume-2` |
| volumeX | boolean \| undefined | no |  | `volume-x` |
| wallet | boolean \| undefined | no |  | `wallet` |
| wand | boolean \| undefined | no |  | `wand` |
| wandSparkles | boolean \| undefined | no |  | `wand-sparkles` |
| warehouse | boolean \| undefined | no |  | `warehouse` |
| watch | boolean \| undefined | no |  | `watch` |
| wifi | boolean \| undefined | no |  | `wifi` |
| wifiOff | boolean \| undefined | no |  | `wifi-off` |
| wind | boolean \| undefined | no |  | `wind` |
| wrench | boolean \| undefined | no |  | `wrench` |
| x | boolean \| undefined | no |  | `x` |
| zap | boolean \| undefined | no |  | `zap` |
| zoomIn | boolean \| undefined | no |  | `zoom-in` |
| zoomOut | boolean \| undefined | no |  | `zoom-out` |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
