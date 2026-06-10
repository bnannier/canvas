import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./tabs.styles.js";
import { type Variant } from "./tabs.styles.js";

// Tabs: a horizontal row of pressable triggers above panel content, with the
// active trigger emphasized so the current view is unmistakable.
//
// Three looks, picked by boolean prop (first match wins):
//   - underline (default): each trigger is muted text; the active one gets the
//     foreground color and a 2px primary rule beneath it. The whole row sits on
//     a hairline bottom border, so inactive triggers read as flat labels.
//   - `pills`: the row is a muted track; the active trigger is an elevated
//     background pill (bg-background) while the rest sit flat and muted.
//   - `vertical`: the triggers stack into a left-aligned column rail; the active
//     one is filled with an accent background (bg-accent) while the rest sit
//     flat and muted. Use it as a settings-style side rail.
//
// Orthogonal layout modifier:
//   - `block`: triggers share the row equally (each flex-1) and the labels
//     center, so the group spans the full available width. Omit for triggers
//     that hug their labels at the leading edge.
//
// Each tab may carry an optional count badge (the `{ label, badge }` item
// shape), rendered as a small secondary pill after the label.
//
// The active underline is drawn as an explicit 2px sliver View under the trigger
// rather than as a bottom border in markup (mirroring how ButtonGroup hand-rolls
// its hairline divider).

/** A tab is either a bare label or a label paired with a count badge. */
export type TabItem = string | { label: string; badge?: string };

export interface TabsProps {
  /** Triggers, left to right. Strings, or `{ label, badge }` for a count. */
  tabs?: TabItem[];
  /** Index of the active trigger. */
  active?: number;
  /** Called with the pressed trigger's index. */
  onChange?: (index: number) => void;

  // Look (pick one; default is the underline look). Precedence when more than
  // one is passed: pills, then vertical, then underline.
  pills?: boolean;
  vertical?: boolean;
  underline?: boolean;

  // Layout: equal full-width triggers vs. leading-aligned hugging triggers.
  block?: boolean;

  disabled?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Variant precedence when more than one is passed: first match wins.
function variantOf(p: TabsProps): Variant {
  if (p.pills) return "pills";
  if (p.vertical) return "vertical";
  if (p.underline) return "underline";
  return "underline";
}

const DEFAULT_TABS: TabItem[] = ["General", "Security", "Notifications", "Billing"];

function labelOf(item: TabItem): string {
  return typeof item === "string" ? item : item.label;
}

function badgeOf(item: TabItem): string | undefined {
  return typeof item === "string" ? undefined : item.badge;
}

// A small secondary count pill shown after a trigger label.
function CountBadge({ children, muted }: { children: string; muted: boolean }) {
  const { tokens } = useTheme();
  return (
    <View style={s.countBadgeBox(tokens)}>
      <Text style={[s.countBadgeLabelType, s.countBadgeLabelColor(tokens, muted)]}>{children}</Text>
    </View>
  );
}

interface TriggerProps {
  label: string;
  badge?: string;
  selected: boolean;
  variant: Variant;
  block?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

function Trigger({ label, badge, selected, variant, block, disabled, onPress }: TriggerProps) {
  const { tokens } = useTheme();

  if (variant === "vertical") {
    // Vertical rail: a full-width, left-aligned row; the active item is filled
    // with an accent background rather than carrying an underline rule.
    const container: StyleProp<ViewStyle> = [
      s.verticalTriggerBase,
      s.verticalTriggerFill(tokens, selected),
      disabled ? s.disabledDim : null,
    ];
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected, disabled: !!disabled }}
        style={({ pressed }) => [container, pressed ? { opacity: 0.9 } : null]}
      >
        <Text style={[s.triggerLabel, s.triggerLabelColor(tokens, "vertical", selected)]}>{label}</Text>
        {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
      </Pressable>
    );
  }

  if (variant === "pills") {
    const container: StyleProp<ViewStyle> = [
      s.pillsTriggerBase,
      block ? s.flex1 : null,
      s.pillsTriggerFill(tokens, selected),
      disabled ? s.disabledDim : null,
    ];
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected, disabled: !!disabled }}
        style={({ pressed }) => [container, pressed ? { opacity: 0.9 } : null]}
      >
        <Text style={[s.triggerLabel, s.triggerLabelColor(tokens, "pills", selected)]}>{label}</Text>
        {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
      </Pressable>
    );
  }

  // Underline: the active trigger gets foreground text and a 2px primary rule
  // drawn as an explicit sliver pinned to the trigger's bottom edge.
  const container: StyleProp<ViewStyle> = [
    s.underlineTriggerBase,
    block ? s.flex1 : null,
    disabled ? s.disabledDim : null,
  ];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled: !!disabled }}
      style={({ pressed }) => [container, pressed ? { opacity: 0.9 } : null]}
    >
      <Text style={[s.triggerLabel, s.triggerLabelColor(tokens, "underline", selected)]}>{label}</Text>
      {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
      <View style={s.underlineSliver(tokens, selected)} />
    </Pressable>
  );
}

export function Tabs(props: TabsProps) {
  const { tabs = DEFAULT_TABS, active = 0, onChange, disabled, style } = props;
  const variant = variantOf(props);
  const { tokens } = useTheme();

  if (variant === "vertical") {
    // A left-aligned column rail of stacked triggers; width hugs its content
    // unless `block` stretches it to fill the available column.
    return (
      <View style={[s.verticalRail(!!props.block), style]}>
        {tabs.map((item, i) => (
          <Trigger
            key={`${labelOf(item)}-${i}`}
            label={labelOf(item)}
            badge={badgeOf(item)}
            selected={i === active}
            variant="vertical"
            block={props.block}
            disabled={disabled}
            onPress={() => onChange?.(i)}
          />
        ))}
      </View>
    );
  }

  if (variant === "pills") {
    return (
      <View style={[s.pillsRow(tokens), s.blockWidth(!!props.block), style]}>
        {tabs.map((item, i) => (
          <Trigger
            key={`${labelOf(item)}-${i}`}
            label={labelOf(item)}
            badge={badgeOf(item)}
            selected={i === active}
            variant="pills"
            block={props.block}
            disabled={disabled}
            onPress={() => onChange?.(i)}
          />
        ))}
      </View>
    );
  }

  // Underline: the row sits on a hairline bottom border.
  return (
    <View style={[s.underlineRow(tokens), s.blockWidth(!!props.block), style]}>
      {tabs.map((item, i) => (
        <Trigger
          key={`${labelOf(item)}-${i}`}
          label={labelOf(item)}
          badge={badgeOf(item)}
          selected={i === active}
          variant="underline"
          block={props.block}
          disabled={disabled}
          onPress={() => onChange?.(i)}
        />
      ))}
    </View>
  );
}
