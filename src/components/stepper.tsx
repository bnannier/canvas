import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";

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
  className?: string;
}

type Layout = "horizontal" | "vertical" | "progress";
type State = "completed" | "current" | "upcoming";

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

// The numbered/check circle. Completed fills primary; current is outlined in
// primary; upcoming sits on the muted token behind a border-toned ring.
const CIRCLE_BASE =
  "h-8 w-8 shrink-0 flex-row items-center justify-center rounded-full border-2";
const CIRCLE_STATE: Record<State, string> = {
  completed: "border-primary bg-primary",
  current: "border-primary bg-transparent",
  upcoming: "border-border bg-muted",
};

// The glyph inside the circle (check for completed, number otherwise).
const GLYPH_BASE = "text-sm font-medium";
const GLYPH_STATE: Record<State, string> = {
  completed: "text-primary-foreground",
  current: "text-primary",
  upcoming: "text-muted-foreground",
};

// The step label. Upcoming steps drop to the muted foreground.
const LABEL_BASE = "text-sm font-medium";
const LABEL_STATE: Record<State, string> = {
  completed: "text-foreground",
  current: "text-foreground",
  upcoming: "text-muted-foreground",
};

// A connector fills primary once the step it leads out of is completed.
function connectorBg(done: boolean): string {
  return done ? "bg-primary" : "bg-border";
}

function Circle({ index, state }: { index: number; state: State }) {
  return (
    <Box className={cn(CIRCLE_BASE, CIRCLE_STATE[state])}>
      <Text className={cn(GLYPH_BASE, GLYPH_STATE[state])}>
        {state === "completed" ? "✓" : String(index + 1)}
      </Text>
    </Box>
  );
}

export function Stepper(props: StepperProps) {
  const { steps, current, value, label, className } = props;
  const layout = layoutOf(props);

  if (layout === "progress") {
    const pct = Math.max(0, Math.min(100, Math.round(value ?? 0)));
    return (
      <Box className={cn("w-full", className)}>
        <Box className="mb-1.5 flex-row items-center justify-between">
          <Text className="text-xs font-medium text-foreground">
            {label ?? "Setup progress"}
          </Text>
          <Text className="text-xs text-muted-foreground">{pct}%</Text>
        </Box>
        <Box className="h-1.5 overflow-hidden rounded-full bg-muted">
          <Box
            className="h-full rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
        </Box>
      </Box>
    );
  }

  if (layout === "vertical") {
    return (
      <Box className={cn("w-full", className)}>
        {steps.map((step, i) => {
          const state = stateOf(i, current);
          const isLast = i === steps.length - 1;
          return (
            <Box key={i} className="flex-row gap-3">
              <Box className="items-center">
                <Circle index={i} state={state} />
                {!isLast ? (
                  <Box
                    className={cn(
                      "my-1 w-px flex-1",
                      connectorBg(state === "completed"),
                    )}
                  />
                ) : null}
              </Box>
              <Box className={cn("flex-1", !isLast && "pb-6")}>
                <Text className={cn(LABEL_BASE, LABEL_STATE[state])}>
                  {step.label}
                </Text>
                {step.description != null ? (
                  <Text className="text-xs text-muted-foreground">
                    {step.description}
                  </Text>
                ) : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Horizontal: a row of circle + label columns, joined by flex-filling rules.
  return (
    <Box className={cn("flex-row items-start", className)}>
      {steps.map((step, i) => {
        const state = stateOf(i, current);
        const isLast = i === steps.length - 1;
        return (
          <Box key={i} className={cn("flex-row items-start", !isLast && "flex-1")}>
            <Box className="items-center gap-1.5">
              <Circle index={i} state={state} />
              <Text className={cn("text-xs font-medium", LABEL_STATE[state])}>
                {step.label}
              </Text>
            </Box>
            {!isLast ? (
              <Box
                className={cn(
                  "mx-2 mt-4 h-px flex-1",
                  // The connector after a step is "filled" once that step is
                  // completed (i.e. the next step has been reached).
                  connectorBg(i < current),
                )}
              />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
