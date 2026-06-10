import { type DimensionValue } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./stepper.styles.js";
import { type State } from "./stepper.styles.js";

// Stepper: an ordered list of steps showing progress through a flow. Each step
// is a numbered circle (or a check once completed) with a label, and the steps
// are joined by connector lines. The step at `current` is emphasized; steps
// before it read as completed (filled primary, check glyph), and steps after it
// read as upcoming (muted). Connectors leading into a completed step fill
// primary; the rest track the border token.
//
// Boolean-prop API: layout is a single axis with `progress` and `vertical`
// opting out of the default horizontal layout (first-match precedence,
// mirroring Divider). `progress` beats `vertical` beats the horizontal default.

export interface Step {
  label: string;
  description?: string;
}

export interface StepperProps {
  /** Ordered steps to render. Each is a label with an optional one-line note. */
  steps: Step[];
  /** Index of the active step. Earlier steps read completed, later ones muted. */
  current: number;
  // Layout (pick one; default is horizontal).
  vertical?: boolean;
  /** Render a labeled percentage progress bar instead of discrete steps. */
  progress?: boolean;
  /** Progress mode only: filled fraction, 0-100 (clamped). Defaults to 0. */
  value?: number;
  /** Progress mode only: caption shown left of the percentage. */
  label?: string;
  /** When set, each step circle is pressable, reporting the step index. */
  onStepPress?: (index: number) => void;
  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
}

type Layout = "horizontal" | "vertical" | "progress";

// First match wins when more than one layout flag is passed.
function layoutOf(p: StepperProps): Layout {
  if (p.progress) return "progress";
  if (p.vertical) return "vertical";
  return "horizontal";
}

// Each step's visual state derives from its index relative to `current`.
function stateOf(index: number, current: number): State {
  if (index < current) return "completed";
  if (index === current) return "current";
  return "upcoming";
}

function Circle({ index, state, onPress }: { index: number; state: State; onPress?: () => void }) {
  const { tokens } = useTheme();
  const glyph = (
    <Text style={[s.glyphBase, s.glyphState(tokens, state)]}>
      {state === "completed" ? "✓" : String(index + 1)}
    </Text>
  );
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [s.circleBase, s.circleState(tokens, state), pressed ? { opacity: 0.9 } : null]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {glyph}
      </Pressable>
    );
  }
  return <View style={[s.circleBase, s.circleState(tokens, state)]}>{glyph}</View>;
}

export function Stepper(props: StepperProps) {
  const { steps, current, value, label, onStepPress, style } = props;
  const { tokens } = useTheme();
  const layout = layoutOf(props);

  if (layout === "progress") {
    const pct = Math.max(0, Math.min(100, Math.round(value ?? 0)));
    return (
      <View style={[s.fullWidth, style]}>
        <View style={s.progressHeader}>
          <Text style={s.progressCaption(tokens)}>{label ?? "Setup progress"}</Text>
          <Text style={s.progressPercent(tokens)}>{pct}%</Text>
        </View>
        <View style={s.progressTrack(tokens)}>
          <View style={[s.progressFill(tokens), { width: `${pct}%` as DimensionValue }]} />
        </View>
      </View>
    );
  }

  if (layout === "vertical") {
    return (
      <View style={[s.fullWidth, style]}>
        {steps.map((step, i) => {
          const state = stateOf(i, current);
          const isLast = i === steps.length - 1;
          return (
            <View key={i} style={s.verticalRow}>
              <View style={s.verticalRail}>
                <Circle index={i} state={state} onPress={onStepPress ? () => onStepPress(i) : undefined} />
                {!isLast ? (
                  <View style={[s.verticalConnector, s.connectorBg(tokens, state === "completed")]} />
                ) : null}
              </View>
              <View style={[s.flex1, !isLast ? s.verticalContentSpacing : null]}>
                <Text style={[s.labelBase, s.labelState(tokens, state)]}>{step.label}</Text>
                {step.description != null ? (
                  <Text style={s.verticalDescription(tokens)}>{step.description}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Horizontal: a row of circle + label columns, joined by flex-filling rules.
  return (
    <View style={[s.horizontalRow, style]}>
      {steps.map((step, i) => {
        const state = stateOf(i, current);
        const isLast = i === steps.length - 1;
        return (
          <View key={i} style={[s.horizontalRow, !isLast ? s.flex1 : null]}>
            <View style={s.horizontalColumn}>
              <Circle index={i} state={state} onPress={onStepPress ? () => onStepPress(i) : undefined} />
              <Text style={[s.labelBaseXs, s.labelState(tokens, state)]}>{step.label}</Text>
            </View>
            {!isLast ? (
              // The connector after a step is "filled" once that step is
              // completed (i.e. the next step has been reached).
              <View style={[s.horizontalConnector, s.connectorBg(tokens, i < current)]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
