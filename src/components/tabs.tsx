import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";

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
// Because the engine has no `border-b-2` utility, the active underline is drawn
// as an explicit 2px sliver View under the trigger rather than as a bottom
// border in markup (mirroring how ButtonGroup hand-rolls its hairline divider).

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
  className?: string;
}

type Variant = "underline" | "pills" | "vertical";

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
  return (
    <View className="flex-row items-center self-start rounded-md border border-transparent bg-secondary px-1.5 py-0.5">
      <Text className={cn("text-xs font-medium", muted ? "text-muted-foreground" : "text-secondary-foreground")}>
        {children}
      </Text>
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
  if (variant === "vertical") {
    // Vertical rail: a full-width, left-aligned row; the active item is filled
    // with an accent background rather than carrying an underline rule.
    const container = cn(
      "w-full flex-row items-center gap-1.5 rounded-md px-3 py-2 active:opacity-90",
      selected ? "bg-accent" : "bg-transparent",
      disabled && "opacity-50",
    );
    const labelCls = cn(
      "text-sm font-medium",
      selected ? "text-accent-foreground" : "text-muted-foreground",
    );
    return (
      <Pressable
        className={container}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected, disabled: !!disabled }}
      >
        <Text className={labelCls}>{label}</Text>
        {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
      </Pressable>
    );
  }

  if (variant === "pills") {
    const container = cn(
      "flex-row items-center justify-center gap-1.5 rounded-md px-3 py-1.5 active:opacity-90",
      block && "flex-1",
      selected ? "bg-background shadow-sm" : "bg-transparent",
      disabled && "opacity-50",
    );
    const labelCls = cn(
      "text-sm font-medium",
      selected ? "text-foreground" : "text-muted-foreground",
    );
    return (
      <Pressable
        className={container}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected, disabled: !!disabled }}
      >
        <Text className={labelCls}>{label}</Text>
        {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
      </Pressable>
    );
  }

  // Underline: the active trigger gets foreground text and a 2px primary rule
  // drawn as an explicit sliver pinned to the trigger's bottom edge.
  const container = cn(
    "flex-row items-center justify-center gap-1.5 px-4 py-2.5 active:opacity-90",
    block && "flex-1",
    disabled && "opacity-50",
  );
  const labelCls = cn(
    "text-sm font-medium",
    selected ? "text-foreground" : "text-muted-foreground",
  );
  return (
    <Pressable
      className={container}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled: !!disabled }}
    >
      <Text className={labelCls}>{label}</Text>
      {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
      <View
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
          selected ? "bg-primary" : "bg-transparent",
        )}
      />
    </Pressable>
  );
}

export function Tabs(props: TabsProps) {
  const { tabs = DEFAULT_TABS, active = 0, onChange, disabled, className } = props;
  const variant = variantOf(props);

  if (variant === "vertical") {
    // A left-aligned column rail of stacked triggers; width hugs its content
    // unless `block` stretches it to fill the available column.
    return (
      <View className={cn("flex-col items-stretch gap-1", props.block ? "w-full" : "w-[180px]", className)}>
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
      <View className={cn("flex-row items-center gap-1 self-start rounded-lg bg-muted p-1", block(props), className)}>
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
    <View className={cn("flex-row items-center border-b border-border", block(props), className)}>
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

// In block mode the row stretches to the full available width so equal-flex
// triggers fill it; otherwise the row hugs its triggers at the leading edge.
function block(p: TabsProps): string {
  return p.block ? "w-full" : "self-start";
}
