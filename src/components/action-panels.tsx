import { cn } from "../cn.js";
import { View, Text } from "../engine/index.js";
import { Card } from "./card.js";
import { Button } from "./button.js";
import { Switch } from "./switch.js";

// An action panel is a settings card: a headline and a line of consequence copy
// on one side, and a single action (a Button) that acts on it. It surfaces one
// decision at a time, the safe-default version always pairing the action with the
// copy that explains the stakes.
//
// Boolean-prop API, grouped by axis, first-match precedence within an axis
// (mirrors Button's intentOf):
//
// - Tone: `destructive` paints the headline red and renders a destructive
//   (red) Button; omit for the neutral tone, where the action is a primary
//   Button. This is the "danger zone" switch.
// - Layout (pick one): `inline` floats the action to the right of the copy, the
//   two reading as one side-by-side row; omit for the default, where the action
//   sits on its own line below the copy.
// - Affordance: `toggle` makes the action an on/off Switch (its state is
//   `checked`) instead of a Button; the panel reads as a setting row, always
//   laid out inline with the Switch pinned to the right. Omit for the default
//   Button action.
//
// The axes are orthogonal: `<ActionPanel destructive inline />` is a red
// action sitting to the right of its danger copy, and `<ActionPanel toggle
// checked title="..." description="..." />` is a settings row whose switch is on.

export interface ActionPanelProps {
  /** The headline: what the action acts on. */
  title?: string;
  /** The consequence copy beneath the title: what happens when the action fires. */
  description?: string;
  /** The action button label. */
  actionLabel?: string;
  /** Fired when the action button is pressed. */
  onAction?: () => void;
  // Tone (omit for the neutral, primary-action default).
  destructive?: boolean;
  // Layout (pick one; default stacks the action below the copy).
  inline?: boolean;
  // Affordance: render the action as an on/off Switch instead of a Button. The
  // panel always lays out inline in this mode.
  toggle?: boolean;
  /** The Switch on/off state when `toggle` is set. */
  checked?: boolean;
  /** Fired with the next checked value when the toggle Switch is flipped. */
  onToggle?: (next: boolean) => void;
  className?: string;
}

type Tone = "destructive" | "neutral";
type Layout = "inline" | "stacked";

// Tone precedence when more than one flag is passed: first match wins.
function toneOf(p: ActionPanelProps): Tone {
  if (p.destructive) return "destructive";
  return "neutral";
}

// Layout precedence when more than one flag is passed: first match wins.
function layoutOf(p: ActionPanelProps): Layout {
  if (p.inline) return "inline";
  return "stacked";
}

// The title color per tone: red for the danger zone, card foreground otherwise.
const TITLE_TONE: Record<Tone, string> = {
  destructive: "text-red-700 dark:text-red-400",
  neutral: "text-card-foreground",
};

// Title and description share Canvas's settings-row type scale.
const TITLE = "text-sm font-semibold";
const DESCRIPTION = "text-sm text-muted-foreground";

export function ActionPanel(props: ActionPanelProps) {
  const { title, description, actionLabel, onAction, toggle, checked, onToggle, className } = props;
  const tone = toneOf(props);
  // The toggle affordance always reads as an inline settings row.
  const layout = toggle ? "inline" : layoutOf(props);

  // The copy block: title above its consequence line. In the inline layout it
  // grows to push the action to the right; stacked, it sits above the action.
  const copy = (
    <View className={cn("gap-1", layout === "inline" && "flex-1")}>
      {title != null ? (
        <Text className={cn(TITLE, TITLE_TONE[tone])}>{title}</Text>
      ) : null}
      {description != null ? <Text className={DESCRIPTION}>{description}</Text> : null}
    </View>
  );

  // The action. In toggle mode it is an on/off Switch pinned to the right;
  // otherwise a destructive (red) Button in the danger zone or a primary Button
  // otherwise, small to sit comfortably inside the panel.
  const action = toggle ? (
    <View className="shrink-0">
      <Switch checked={checked} onValueChange={onToggle} />
    </View>
  ) : actionLabel != null ? (
    <View className={layout === "inline" ? "shrink-0" : "items-start"}>
      <Button small destructive={tone === "destructive"} primary={tone !== "destructive"} onPress={onAction}>
        {actionLabel}
      </Button>
    </View>
  ) : null;

  return (
    <Card padded className={cn("max-w-[560px]", className)}>
      {layout === "inline" ? (
        <View className="flex-row items-start gap-6">
          {copy}
          {action}
        </View>
      ) : (
        <View className="gap-4">
          {copy}
          {action}
        </View>
      )}
    </Card>
  );
}
