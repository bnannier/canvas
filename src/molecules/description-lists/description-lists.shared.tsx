import { type ComponentType, type ReactNode, useState } from "react";
import { consumeEscapeKey } from "../../style/escape-layer.js";
import { View, Text, TextInput, StyleSheet, devWarn, useTheme, useContainerBreakpoint, containerProbe, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle, type LayoutStyle, useFillStyle, GlassSurface } from "../../style/index.js";
import { AnatomyPart, AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";
import { Avatar as WebAvatar, AvatarGroup as WebAvatarGroup } from "../../atoms/avatar/avatar.js";
import { Badge as WebBadge } from "../../atoms/badge/badge.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { type AvatarProps, type AvatarGroupProps } from "../../atoms/avatar/avatar.shared.js";
import { type BadgeProps } from "../../atoms/badge/badge.shared.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import * as s from "./description-lists.styles.js";
import { type Layout } from "./description-lists.styles.js";

// Shared DescriptionList shell. The structure (term/value rows in stacked,
// two-column, or inline layouts, an optional card surface with a header band),
// the boolean-prop axes and their precedence, the data-shape types, and the
// semantic value affordances (badge / status / mono / update) all live here once;
// a platform file supplies only its skin (card shape, density, type tracking,
// elevation) and calls createDescriptionList.
//
// DescriptionList: term/value pairs for detail panels, settings, and profile
// views. Each item is a { term, value } pair. The term is the small muted
// label; the value is the full-weight data it describes, so the data always
// outranks its label.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf / Card's surfaceOf).
//
// - Layout (pick one; precedence inline > twoColumn > stacked):
//   `inline` lays the term on the left and the value on the right of a single
//   row, and a value that does not fit beside its term wraps under it;
//   `twoColumn` puts the term in a fixed 160px label column with the value
//   beside it (the read-only detail look); the default `stacked` puts a small
//   uppercase muted label above a full-weight value.
// - Rows (pick one; precedence ruled > divided): `divided` draws a hairline
//   (border-b border-border) under every row but the last, for the two-column
//   detail look; `ruled` draws the v4 hand-off's accessibility-card rows, a 1 px
//   top rule on every row including the first, 9 above and below the text, the
//   term hugging its content with a 120 floor and 14 to the value.
// - Density: `compact` tightens the ruled rows to the v4 hand-off's semantics-card rows,
//   8 above and below the text, 12 to the value, the term a fixed 110 column and the
//   value at the top of its row; the plain and divided rows have no compact step.
// - Value ink: `muted` sets a text value as a note beside its term (the small type in
//   the muted ink, the way a key's effect sits beside its cap) where the default value
//   is the full-weight foreground data. A node value renders as given either way, and
//   a skin whose value is already the secondary ink (iOS) leaves it as it is.
// - Surface: `card` wraps the whole list in a card surface (border, radius,
//   padding) so it reads as a self-contained panel. `title`/`subtitle` add a
//   bordered header band to the card.
//
// Per-item value affordances (all optional, render the value richly):
// `badge` renders the value as a secondary metadata Badge; `status` renders it
// as a success status Badge with a leading dot (live state); `mono` sets a
// monospace face for tokens/IDs; `avatars` renders the value as an overlapping
// AvatarGroup (with `overflow` collapsing the remainder into its "+N" chip);
// `copyValue` appends a ghost "Copy" button that hands the string to the
// list-level `onCopy` (the kit ships no clipboard dependency; the consumer
// performs the write); `update` appends a trailing "Update" link
// button that opens a working in-place editor (the inline-edit affordance):
// the value swaps for a draft TextInput with trailing Save / Cancel links.
// Enter or Save commits the draft (the row shows the new value and `onUpdate`
// fires with the item index and next value); Escape or Cancel dismisses it.
// One row edits at a time. The edited values follow the kit's controlled +
// uncontrolled contract at list granularity: `items` IS the controlled prop.
// A consumer that ignores onUpdate gets the uncontrolled behavior (the list
// keeps the committed value itself); a consumer that answers onUpdate by
// passing new items wins over the internal copy (see the `edits` state).
//
// Layout, rows, and surface are orthogonal axes and combine freely.
//
// DescriptionList keeps one structure and one set of semantic colors on every
// platform, but the per-OS row TYPE ROLES differ. Web/Android keep the Catalyst
// idiom (a small muted term beside a full-weight foreground value); iOS follows
// the iOS 27 kit Lists value row, where the term is the PRIMARY 17/22 label and
// the value is the SECONDARY gray 17/22 detail (the label/value emphasis is
// inverted and the type is larger), inside a flat inset-grouped card at the inset
// grouped list corner, with the continuous corner curve. The skin carries the card shape/elevation,
// row density and metrics, and the full term/value/header type per OS.
//
// The list has no pressable rows of its own; the only interactive affordance is
// the composed Button link, which brings its own per-OS press feedback and touch
// target (skin.minTarget: iOS 44pt / M3 48dp) from its own skin. The composed
// Badge and Button are threaded per-OS (the field.ios.tsx pattern) so the docs
// web 3-up shows the native atom inside each platform row, not the web atom.

/** One avatar in an `avatars` value row: a photo (`src`) or initials (`name`). */
export interface DescriptionListAvatar {
  src?: string;
  name?: string;
}

export interface DescriptionListItem {
  /**
   * The label. A string (or number) takes the layout's term type; any other node
   * renders as given (an icon beside a word, a Kbd), as DataTable takes node cells.
   */
  term: ReactNode;
  /**
   * The data. A string (or number) takes the value type and the per-item forms below
   * (`badge`, `status`, `mono`, `copyValue`, `update`); any other node renders as given
   * in the value cell (a row of Badges, a link), which those forms do not restyle.
   */
  value: ReactNode;
  // Render the value as a secondary metadata badge (e.g. a role).
  badge?: boolean;
  // Render the value as a success status badge with a leading dot (live state).
  status?: boolean;
  // Monospace value face, for tokens, scopes, identifiers.
  mono?: boolean;
  /**
   * Append a ghost "Copy" button after the value. Pressing it invokes the
   * list's `onCopy` callback with this string (the kit ships no clipboard
   * dependency; the consumer performs the write).
   */
  copyValue?: string;
  /** Render the value as an overlapping avatar stack (composed AvatarGroup). */
  avatars?: DescriptionListAvatar[];
  /** Extra members beyond `avatars`, collapsed into the stack's "+N" chip. */
  overflow?: number;
  // Append a trailing "Update" link affordance, marking the row editable.
  update?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionListItem[];
  // Card header band (only shown when `card`): a title and optional subtitle.
  title?: string;
  subtitle?: string;
  // Layout (pick one; precedence inline > twoColumn > stacked).
  inline?: boolean;
  twoColumn?: boolean;
  stacked?: boolean;
  // Rows (pick one; precedence ruled > divided): a hairline divider beneath every row
  // but the last.
  divided?: boolean;
  /**
   * Rows: a 1 px top rule on every row, the first included, with the row padded 9 above
   * and below and the term hugging its content (a 120 floor, 14 to the value), the v4
   * hand-off's accessibility-card rows. Wins over `divided`.
   */
  ruled?: boolean;
  /**
   * Density: tightens the ruled rows to the v4 hand-off's semantics-card rows
   * (Component.dc.html line 263): 8 above and below the text, 12 to the value, the term a
   * fixed 110 column and the value at the top of its row. Only the ruled rows have a
   * compact step; a plain or divided list is unchanged by it.
   */
  compact?: boolean;
  /**
   * The values as notes beside their terms: a text value in the small type and the muted
   * ink (400 13/19) instead of the full-weight foreground data, for a list that explains
   * each term (a key and its effect). A node value renders as given, and a platform skin
   * whose value detail is already the secondary ink keeps its type.
   */
  muted?: boolean;
  // Surface: wrap the list in a card surface.
  card?: boolean;
  /** Fires when a row's inline editor commits (Enter or Save): the item index and the new value. */
  onUpdate?: (index: number, value: string) => void;
  /** Fires with a row's `copyValue` when its "Copy" button is pressed. */
  onCopy?: (value: string) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// The composed-atom component types, so each platform can pass its own resolved
// atoms (web base by default) without widening to `any`.
export type AvatarComponent = ComponentType<AvatarProps>;
export type AvatarGroupComponent = ComponentType<AvatarGroupProps>;
export type BadgeComponent = ComponentType<BadgeProps>;
export type ButtonComponent = ComponentType<ButtonProps>;

// The per-OS-varying style pieces. Everything else (structure, semantic colors,
// hairline rules, layout axes) is shared. Web draws the Catalyst term-value card;
// iOS follows the iOS 27 kit Lists value rows; Android uses Material 3.
export interface DescriptionListSkin {
  /** Card surface corner radius (the web card corner, the iOS 26 inset grouped list, the M3 card). */
  cardRadius: number;
  /** Card corner curve: iOS continuous (superellipse); circular elsewhere (no-op off iOS). */
  cardCurve: "circular" | "continuous";
  /** Card surface elevation: a soft shadow on web, flat on the iOS grouped list + Material 3. */
  cardShadow: (tokens: ColorTokens) => ViewStyle;
  /** Vertical gap between rows (and the rows-under-header group). */
  rowGap: number;
  /** Card inner padding: all sides for a header-less card, horizontal inset for the header band + rows. */
  cardPadding: number;
  /** Horizontal-row (inline / two-column) cross-axis alignment. */
  rowAlign: "baseline" | "center";
  /** Horizontal-row minimum height (iOS 52pt Lists row); omit for content height. */
  rowMinHeight?: number;
  /** Divided-row bottom padding beneath the hairline rule. */
  dividedPadBottom: number;
  /** Ruled-row metrics: the padding above and below the text, the term column's floor, and the term-to-value gap. */
  ruled: { rowPadY: number; termMinWidth: number; gap: number };
  /** Compact ruled-row metrics: the padding above and below the text, the term's fixed column, the term-to-value gap, and the row's cross-axis alignment. */
  ruledCompact: { rowPadY: number; termWidth: number; gap: number; align: "flex-start" | "center" };
  /** Horizontal-row term type (size / line-height / weight / color / tracking). */
  termType: (t: ColorTokens) => TextStyle;
  /** Horizontal-row value type (size / line-height / weight / color / tracking). */
  valueType: (t: ColorTokens) => TextStyle;
  /** The `muted` value type: the note beside its term. Omitted, the value keeps `valueType` (a skin whose value is already the secondary ink). */
  mutedValueType?: (t: ColorTokens) => TextStyle;
  /** Stacked-layout term tracking (the small uppercase muted label). */
  stackedTermTracking: TextStyle;
  /** Stacked-layout value type (full-weight foreground; per-OS tracking). */
  stackedValueType: (t: ColorTokens) => TextStyle;
  /** Card header title type (size / line-height / weight / color / tracking). */
  headerTitleType: (t: ColorTokens) => TextStyle;
  /**
   * The v4 hand-off's inset card (the web and Android skins): the card pads its whole
   * content, header included (`cardPadding` across, `cardPadY` down), the header's rule
   * runs inside that inset, and every row carries `rowPadY` above and below its text.
   * Omitted, the header band runs edge to edge with its own inset (the iOS grouped list).
   */
  inset?: { cardPadY: number; rowPadY: number; headerPadBottom: number };
  /** Header subtitle type; omitted, the shared 12/16 muted line. */
  headerSubtitleType?: (t: ColorTokens) => TextStyle;
  /** Stacked-layout term type; omitted, the shared 12/16 uppercase muted label with `stackedTermTracking`. */
  stackedTermType?: (t: ColorTokens) => TextStyle;
}

// Layout precedence when more than one is passed: first match wins.
// `stacked` is the lowest-precedence opt-in and the default when no layout
// boolean is set, so reading it here makes the public prop a real, intentional
// choice rather than relying on it only as the unconditional fallback.
export function layoutOf(p: DescriptionListProps): Layout {
  if (p.inline) return "inline";
  if (p.twoColumn) return "twoColumn";
  if (p.stacked) return "stacked";
  return "stacked";
}

// Rows precedence when both are passed: `ruled` wins over `divided`; neither is the
// plain row.
export type Rows = "ruled" | "divided";
export function rowsOf(p: Pick<DescriptionListProps, "ruled" | "divided">): Rows | null {
  if (p.ruled) return "ruled";
  if (p.divided) return "divided";
  return null;
}

// Density: `compact` is the one step; none is the regular row.
export type Density = "compact";
export function densityOf(p: Pick<DescriptionListProps, "compact">): Density | null {
  if (p.compact) return "compact";
  return null;
}

export type ValueInk = "muted" | "default";

/** The value ink axis: `muted` sets a text value as a note beside its term; otherwise the full-weight data. */
export function valueInkOf(p: Pick<DescriptionListProps, "muted">): ValueInk {
  if (p.muted) return "muted";
  return "default";
}

// A text value's form, first match wins: the status pill, the metadata badge, the
// monospace face, then plain text. Avatars and a copy button are content, not forms,
// and take the value before any of these.
export function valueFormOf(item: Pick<DescriptionListItem, "status" | "badge" | "mono">): "status" | "badge" | "mono" | "plain" {
  if (item.status) return "status";
  if (item.badge) return "badge";
  if (item.mono) return "mono";
  return "plain";
}

// Whether a term or value is text the list types itself (a string or a number), as
// opposed to a node the caller rendered.
const isText = (node: ReactNode): node is string | number => typeof node === "string" || typeof node === "number";

// The plain-text name of a term, for the accessible names of a row's Copy, Update,
// Save and Cancel buttons; a node term falls back to the row's position.
const termName = (term: ReactNode, index: number): string => (isText(term) ? String(term) : `row ${index + 1}`);

// A pass-through box over a GlassSurface (which has no ref), measured as a docs AnatomyProvider part.
const MEASURE_BOX = StyleSheet.create({ box: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" } }).box;

/**
 * Build a DescriptionList component from a platform skin and the platform-correct
 * composed atoms.
 *
 * The composed atoms (Badge / Button) are passed in by each platform's thin
 * `.ios`/`.android` file, so a value row's status/metadata Badge and the trailing
 * Update link match the list's platform on every build path. This matters for the
 * WEB docs 3-up preview: a bare barrel import always resolves the WEB atoms in a
 * browser bundler, which would paint web-styled atoms inside the iOS/Android rows;
 * each platform file passes its own `.ios`/`.android` atoms so the row reads
 * native. On a real device Metro resolves the right atoms by extension regardless,
 * so the defaults (the web base) are correct there too. The iOS/Android Button
 * skins also carry the native minimum touch target (skin.minTarget: HIG 44pt /
 * M3 48dp), so threading them lifts the Update affordance to a compliant target.
 */
export function createDescriptionList(
  skin: DescriptionListSkin,
  Badge: BadgeComponent = WebBadge,
  Button: ButtonComponent = WebButton,
  Avatar: AvatarComponent = WebAvatar,
  AvatarGroup: AvatarGroupComponent = WebAvatarGroup,
) {
  // Render a value cell: an avatar stack, a copyable value, a badge family, a
  // monospace token, or plain text (precedence in that order). The value type
  // (foreground full-weight on web/Android, secondary gray 17pt on iOS; stacked
  // keeps a full-weight foreground value) is resolved by the caller, as is the
  // shown string (the item value, or the row's committed inline edit).
  function Value({ item, value, name, align, valueStyle, onCopy }: { item: DescriptionListItem; value: ReactNode; name: string; align?: boolean; valueStyle: TextStyle; onCopy?: (value: string) => void }) {
    if (item.avatars && item.avatars.length > 0) {
      // The overlap, separator ring, and "+N" overflow chip are AvatarGroup's own
      // anatomy; `total` folds the `overflow` remainder into that chip. The group
      // is named so a screen reader hears the members, not disconnected initials.
      const names = item.avatars.map((a) => a.name).filter(Boolean) as string[];
      const more = typeof item.overflow === "number" && item.overflow > 0 ? ` and ${item.overflow} more` : "";
      const groupName = names.length > 0 ? `${names.join(", ")}${more}` : `${item.avatars.length} members${more}`;
      return (
        <AvatarGroup small snug total={item.avatars.length + Math.max(0, item.overflow ?? 0)} accessibilityLabel={groupName}>
          {item.avatars.map((a, i) => (
            <Avatar key={i} small src={a.src} name={a.name}>
              {a.name}
            </Avatar>
          ))}
        </AvatarGroup>
      );
    }
    if (item.copyValue != null) {
      const copyValue = item.copyValue;
      return (
        <View style={s.copyRow}>
          {value == null || value === "" || isText(value) ? (
            <Text style={[valueStyle, item.mono ? s.valueMono : null, s.copyValueText]} numberOfLines={1}>
              {value === "" || value == null ? copyValue : value}
            </Text>
          ) : (
            <View style={s.nodeValue}>{value}</View>
          )}
          <Button ghost small accessibilityLabel={`Copy ${name}`} onPress={() => onCopy?.(copyValue)}>
            Copy
          </Button>
        </View>
      );
    }
    // A node value is the caller's own rendering, as given, in a box that lets it
    // yield to the cell (a wrapping Row wraps at the cell's width, see s.nodeValue).
    if (!isText(value)) return <View style={s.nodeValue}>{value}</View>;
    const form = valueFormOf(item);
    if (form === "status") return <Badge status success>{value}</Badge>;
    if (form === "badge") return <Badge secondary>{value}</Badge>;
    if (form === "mono") {
      return <Text style={[valueStyle, s.valueMono, s.valueWrap]}>{value}</Text>;
    }
    return <Text style={[valueStyle, align ? s.valueAlignRight : null, s.valueWrap]}>{value}</Text>;
  }

  return function DescriptionList(props: DescriptionListProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: List, Term, Detail, Action. Term and Detail are the first row's,
    // Action the first row's Update link, taken before the tree's AnatomyScope so the kit
    // Badge, Button and Avatar inside and the caller's node values register nothing.
    const listPart = useAnatomyPart("List");
    const termPart = useAnatomyPart("Term");
    const detailPart = useAnatomyPart("Detail");
    const actionPart = useAnatomyPart("Action");
    const { items, title, subtitle, muted, card, onUpdate, onCopy, testID, style } = props;
    const { tokens } = useTheme();
    // FILL: the list spans the parent it is given.
    const fill = useFillStyle("DescriptionList");
    const layout = layoutOf(props);
    const rowsLook = rowsOf(props);
    const divided = rowsLook === "divided";
    const ruled = rowsLook === "ruled";
    // The compact step acts on the ruled rows alone (the semantics card's rows).
    const compact = ruled && densityOf(props) === "compact";
    // The two-column term label narrows when the LIST is phone-narrow (160 -> 120) so
    // the value column keeps room to breathe: a two-column list in a 320px desktop
    // panel narrows too, and one on a wide tablet does not. The list fills its parent,
    // so it measures itself, through an out-of-flow probe (its root may be a
    // GlassSurface), seeded from the window until that first layout lands.
    const { value: narrowTermColumn, onLayout: measureList } = useContainerBreakpoint({ base: false, sm: true }, { seedViewport: true });
    const hasHeader = card && !!title;

    // Inline-edit state. `editing` is the single row currently in edit mode and
    // `draft` its in-progress text. `edits` holds each row's committed value for
    // the uncontrolled path, remembering the item.value it replaced: while the
    // consumer keeps passing that same base the edit shows, and the moment they
    // pass a different value (the controlled response to onUpdate) the prop wins
    // and the stale edit goes inert. This is the kit's controlled + uncontrolled
    // contract at list granularity: `items` is the controlled prop, and
    // onUpdate (like useControllableState's callback) fires in both modes.
    const [editing, setEditing] = useState<number | null>(null);
    const [draft, setDraft] = useState("");
    const [edits, setEdits] = useState<Record<number, { base: ReactNode; value: string }>>({});
    devWarn(
      items.some((item) => item.update && !isText(item.value)),
      "[canvas] <DescriptionList>: `update` needs a text value; a node value shows no Update link.",
    );

    const inset = skin.inset;
    const container: StyleProp<ViewStyle> = [
      card ? s.cardSurface(tokens, skin) : null,
      // The inset card pads everything, header included; otherwise no global padding
      // when a header band supplies its own px-6 per section.
      card && inset ? { paddingHorizontal: skin.cardPadding, paddingVertical: inset.cardPadY } : null,
      card && !inset && !hasHeader ? { padding: skin.cardPadding } : null,
      !hasHeader ? { gap: skin.rowGap } : null,
      fill,
      style,
    ];

    const stacked = layout === "stacked";
    // Stacked keeps a full-weight foreground value; the horizontal rows carry the
    // per-OS value type (secondary gray on iOS, full-weight foreground otherwise), or
    // the skin's muted note type when the list is `muted` and the skin draws one.
    const horizontalValueType = valueInkOf({ muted }) === "muted" && skin.mutedValueType ? skin.mutedValueType : skin.valueType;
    const valueStyle = stacked ? skin.stackedValueType(tokens) : horizontalValueType(tokens);

    // The two-column term's label column, text or node; a ruled list's term hugs its
    // content over a floor instead (the hand-off's `minmax(120px,auto)`), and a compact
    // ruled list's is the hand-off's fixed 110 column.
    const termColumn = layout === "twoColumn" ? (ruled ? (compact ? s.termRuledCompact(skin) : s.termRuled(skin)) : [s.termColumn, narrowTermColumn ? s.termColumnNarrow : null]) : null;

    const firstAction = items.findIndex((item) => item.update && isText(item.value));
    const rows = items.map((item, index) => {
      const last = index === items.length - 1;
      // A divided list draws a hairline under each row except the last, and pads
      // the row vertically so the rule sits clear of the text. A ruled list draws its
      // rule over every row, the first included, with its own padding and gap in place
      // of the inset card's row padding and the layout's gap.
      const row: StyleProp<ViewStyle> = [
        s.rowLayout(layout, skin),
        inset && !ruled ? { paddingVertical: inset.rowPadY } : null,
        divided ? s.rowDividedPad(skin) : null,
        divided && !last ? s.rowDivider(tokens) : null,
        ruled ? s.rowRuled(tokens, skin, layout, compact) : null,
      ];
      // The shown value: the consumer's item.value, unless this row committed an
      // inline edit over that exact base (the uncontrolled path, see `edits`).
      const edit = edits[index];
      const shown = edit && edit.base === item.value ? edit.value : item.value;
      const isEditing = editing === index;
      const name = termName(item.term, index);
      // The inline editor edits text, so only a text value offers it.
      const editable = !!item.update && isText(shown);
      const commit = () => {
        setEdits((prev) => ({ ...prev, [index]: { base: item.value, value: draft } }));
        setEditing(null);
        onUpdate?.(index, draft);
      };
      const cancel = () => setEditing(null);
      return (
        <View key={isText(item.term) ? `${item.term}-${index}` : index} style={row}>
          {isText(item.term) ? (
            <Text ref={index === 0 ? termPart?.ref : undefined} onLayout={index === 0 ? termPart?.onLayout : undefined} style={[stacked ? (skin.stackedTermType ? skin.stackedTermType(tokens) : [s.termStacked(tokens), skin.stackedTermTracking]) : skin.termType(tokens), termColumn]}>{item.term}</Text>
          ) : (
            // A node term holds the term's place: the two-column label column keeps its
            // width so the values still line up.
            <View ref={index === 0 ? termPart?.ref : undefined} onLayout={index === 0 ? termPart?.onLayout : undefined} style={termColumn}>{item.term}</View>
          )}
          <View style={layout === "twoColumn" ? s.twoColumnValueCell : layout === "inline" ? (isEditing ? s.editCellGrow : s.inlineValueCell) : null}>
            {isEditing ? (
              // The in-place editor: the draft in the row's own value type over a
              // ring-colored underline, with Save / Cancel links trailing. Enter
              // commits, Escape (web) cancels; native relies on the links.
              <View style={s.editRow}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  autoFocus
                  selectTextOnFocus
                  returnKeyType="done"
                  onSubmitEditing={commit}
                  onKeyPress={(e) => {
                    if (e.nativeEvent.key === "Escape") {
                      consumeEscapeKey(e);
                      cancel();
                    }
                  }}
                  accessibilityLabel={`${name} value`}
                  aria-label={`${name} value`}
                  style={[valueStyle, s.editInput(tokens)]}
                />
                <Button link small onPress={commit} accessibilityLabel={`Save ${name}`}>
                  Save
                </Button>
                <Button link small onPress={cancel} accessibilityLabel={`Cancel updating ${name}`}>
                  Cancel
                </Button>
              </View>
            ) : (
              <>
                <AnatomyPart part={index === 0 ? detailPart : undefined}>
                  <Value item={item} value={shown} name={name} align={layout === "inline"} valueStyle={valueStyle} onCopy={onCopy} />
                </AnatomyPart>
                {editable ? (
                  <AnatomyPart part={index === firstAction ? actionPart : undefined}>
                    <Button
                      link
                      small
                      onPress={() => { setDraft(String(shown)); setEditing(index); }}
                      accessibilityLabel={`Update ${name}`}
                    >
                      Update
                    </Button>
                  </AnatomyPart>
                ) : null}
              </>
            )}
          </View>
        </View>
      );
    });

    // A card list is a CONTENT-layer pane under glass (GlassSurface is the plain View
    // in solid mode); a bare list paints no surface of its own in either mode.
    const Root = card ? GlassSurface : View;
    return (
      <AnatomyScope>
      <Root testID={testID} style={container} {...(card ? { layer: "content" as const } : { ref: listPart?.ref, onLayout: listPart?.onLayout })}>
        {/* The List part's box on a card: GlassSurface has no ref, so a pass-through fill measures it. */}
        {card && listPart ? <View ref={listPart.ref} onLayout={listPart.onLayout} style={MEASURE_BOX} /> : null}
        {layout === "twoColumn" ? <View style={containerProbe} onLayout={measureList} /> : null}
        {hasHeader ? (
          <View style={inset ? s.insetHeaderBand(tokens, inset.headerPadBottom) : s.headerBand(tokens, skin)}>
            <Text style={skin.headerTitleType(tokens)}>{title}</Text>
            {subtitle ? <Text style={skin.headerSubtitleType ? skin.headerSubtitleType(tokens) : s.headerSubtitle(tokens)}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {hasHeader ? <View style={inset ? { gap: skin.rowGap } : s.rowsWrap(skin)}>{rows}</View> : rows}
      </Root>
      </AnatomyScope>
    );
  };
}
