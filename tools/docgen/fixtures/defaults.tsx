// Fixture for the default and axis reading in extract-props.test.ts: a props interface
// with `//` axis headers (one above a documented member) and an inherited shared
// interface, and a shell that destructures it with literal, computed and conflicting
// initializers.

export interface MeasureProps {
  // Measure (pick one).
  sm?: boolean;
  lg?: boolean;
}

export interface WidgetProps extends MeasureProps {
  /** The label. */
  label?: string;
  // Tone (pick one; default neutral).
  success?: boolean;
  danger?: boolean;
  // Layout. The widget hugs its content.
  /** Fill the parent. */
  block?: boolean;
  wrap?: boolean;
  size?: "small" | "large";
  count?: number;
  offset?: number;
  open?: boolean;
  placement?: string;
  title?: string;
}

const compute = () => "x";

export function Widget(props: WidgetProps) {
  const { label = "Widget", size = "large", count = 3, offset = -2, open = true, wrap = !props.block, placement = "top", title = compute() } = props;
  return [label, size, count, offset, open, wrap, placement, title];
}

export function WidgetAgain({ placement = "bottom" }: WidgetProps) {
  return placement;
}
