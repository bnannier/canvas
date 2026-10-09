import { type ComponentType, type ReactNode } from "react";
import { View, Text, useTheme, useContainerWidth, widths, type StyleProp, type ViewStyle, type LayoutStyle } from "../../style/index.js";
import { Card as WebCard } from "../card/card.js";
import { type CardProps } from "../card/card.shared.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Switch as WebSwitch } from "../../atoms/switch/switch.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import { type SwitchProps } from "../../atoms/switch/switch.shared.js";
import { type ActionPanelSkin, type Tone, type Layout, titleColor } from "./action-panels.styles.js";

// Shared ActionPanel shell. The structure (a settings card with a copy block and
// a single action), the boolean-prop axes with first-match precedence, the
// layout selection, and the tone-color logic live here once; a platform file
// supplies only its skin (type + spacing) and the platform-correct Card / Button
// / Switch atoms, then calls createActionPanel.
//
// An action panel is a settings card: a headline and a line of consequence copy
// on one side, and a single action (a Button) that acts on it. It surfaces one
// decision at a time, the safe-default version always pairing the action with the
// copy that explains the stakes.
//
// ActionPanel is a "Light" platform treatment: ONE structure, with only small
// per-OS touches on the type tracking and the layout rhythm (those live in the
// skin). The action is the platform-skinned Button / Switch atom, which brings
// its own per-OS shape and press feedback, so this molecule does NOT re-skin it.
//
// Boolean-prop API, grouped by axis, first-match precedence within an axis
// (mirrors Button's intentOf):
//
// - Tone: `destructive` paints the headline red and renders a destructive
//   (red) Button; omit for the neutral tone, where the action is a primary
//   Button. This is the "danger zone" switch.
// - Layout (pick one): `inline` floats the action to the right of the copy, the
//   two reading as one side-by-side row (a row narrower than the `md` measure,
//   measured on the row itself, stacks the action under the copy); omit for the
//   default, where the action sits on its own line below the copy.
// - Affordance: `toggle` makes the action an on/off Switch (its state is
//   `checked`) instead of a Button; the panel is a setting row, the Switch's own
//   row with the title as its label and the description as its muted line. Omit
//   for the default Button action.
//
// The axes are orthogonal: `<ActionPanel destructive inline />` is a red
// action sitting to the right of its danger copy, and `<ActionPanel toggle
// checked title="..." description="..." />` is a settings row whose switch is on.
//
// The panel also HOSTS content: `children` embed inside it, between the copy and
// the action, so a settings panel can carry its own field rows without the caller
// rebuilding the card around it. Where they land follows the layout: stacked, they
// join the panel's gap column between the copy and the action; inline (and in
// toggle mode) the action is pinned beside the copy, so they sit full width below
// that row. Both paths use the skin's stacked gap, so the embedded block keeps the
// panel's own vertical rhythm and each element of a multi-element block is spaced
// by it too.

export interface ActionPanelProps {
  /** The headline: what the action acts on. */
  title?: string;
  /** The consequence copy beneath the title: what happens when the action fires. */
  description?: string;
  /** The action button label. */
  actionLabel?: string;
  /** Fired when the action button is pressed. */
  onAction?: () => void;
  // Tone (omit for the neutral, primary-action default): a red title and a destructive
  // Button. A toggle's Switch label carries no tone.
  destructive?: boolean;
  // Layout (pick one; default stacks the action below the copy). Inline stacks too
  // when the row is narrower than the `md` measure.
  inline?: boolean;
  // Affordance: render the action as an on/off Switch instead of a Button. The
  // panel is the Switch's own setting row in this mode: the title is its label and
  // the description its muted line, and the whole row toggles.
  toggle?: boolean;
  /** The Switch on/off state when `toggle` is set (CONTROLLED). Omit for uncontrolled use. */
  checked?: boolean;
  /** Initial Switch state for uncontrolled use (the toggle flips itself on press). */
  defaultChecked?: boolean;
  /** Fired with the next checked value when the toggle Switch is flipped. */
  onToggle?: (next: boolean) => void;
  /**
   * Content embedded in the panel between the copy and the action (a block of
   * field rows in a settings panel, say). Stacked, it joins the panel's gap
   * column between the copy and the action; inline and in toggle mode the action
   * is pinned beside the copy, so it renders full width below that row.
   */
  children?: ReactNode;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// The atoms the molecule composes are typed by their public props, so each
// platform passes the Card/Button/Switch it already resolves for that platform.
export type CardComponent = ComponentType<CardProps>;
export type ButtonComponent = ComponentType<ButtonProps>;
export type SwitchComponent = ComponentType<SwitchProps>;

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

// --- shared layout fragments (identical across platforms) -------------------

// The copy block: title stacked above its consequence line. In the inline layout
// it grows to push the action to the right (flex-1); stacked, it stays natural.
const copyGrow: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The action wrapper: pinned (shrink-0) in the inline/toggle layouts, or
// left-aligned (items-start) on its own line in the stacked layout.
const actionPinned: ViewStyle = { flexShrink: 0 };
const actionStacked: ViewStyle = { alignItems: "flex-start" };

/**
 * Build an ActionPanel component from a platform skin.
 *
 * `Card`, `Button`, and `Switch` are the platform-correct atoms, passed in by
 * each platform's thin `.tsx`/`.ios`/`.android` file, so the panel surface and
 * the action match the panel's platform on every build path. This matters for
 * the WEB docs 3-up preview: a bare barrel import always resolves the WEB atom in
 * a browser bundler, which would paint a web-styled Card/Button/Switch inside the
 * iOS/Android rows; each row must show that platform's surface and action. On a
 * real device Metro resolves the right atom by extension regardless, so the
 * default (the web base) is correct there too. All three default to the web base
 * when omitted.
 */
export function createActionPanel(
  skin: ActionPanelSkin,
  Button: ButtonComponent = WebButton,
  Switch: SwitchComponent = WebSwitch,
  Card: CardComponent = WebCard,
) {
  return function ActionPanel(props: ActionPanelProps) {
    const { title, description, actionLabel, onAction, toggle, checked, defaultChecked, onToggle, children, testID, style } = props;
    const { tokens } = useTheme();
    const tone = toneOf(props);
    // The inline row measures its own width (the container tier, never the window):
    // a panel can be narrow on a phone or in a desktop side column alike. Until it has
    // measured, the window stands in, so a phone's first frame already stacks.
    const { width: rowWidth, onLayout: onRowLayout } = useContainerWidth();

    // The toggle affordance is a setting row, and the Switch owns its label anatomy:
    // the title is its label, the description its muted line, and the whole row is
    // the tap target (a switch beside sibling copy split that target and drifted from
    // the Switch's own type). A title-less panel names the switch by its action label.
    // The Switch's label carries no tone, so `destructive` changes nothing here.
    if (toggle) {
      const setting = (
        <Switch
          checked={checked}
          defaultChecked={defaultChecked}
          onValueChange={onToggle}
          description={description}
          accessibilityLabel={title == null ? actionLabel : undefined}
        >
          {title}
        </Switch>
      );
      return (
        <Card padded testID={testID} style={style}>
          {children != null ? (
            <View style={{ gap: skin.stackedGap }}>
              {setting}
              {children}
            </View>
          ) : (
            setting
          )}
        </Card>
      );
    }

    const layout = layoutOf(props);
    // An inline row narrower than the `md` measure (a phone's card, a side column)
    // stacks its action under the copy; at `md` and wider the copy keeps a readable
    // column beside the action.
    const narrow = layout === "inline" && rowWidth > 0 && rowWidth <= widths.md;
    const sideBySide = layout === "inline" && !narrow;

    // The copy block: title above its consequence line. Beside the action it grows
    // to push the action to the right; stacked, it sits above the action.
    const copy = (
      <View style={[{ gap: skin.copyGap }, sideBySide ? copyGrow : null]}>
        {title != null ? (
          <Text style={[skin.titleType, { color: titleColor(tokens, tone) }]}>{title}</Text>
        ) : null}
        {description != null ? (
          <Text style={[skin.descriptionType, { color: tokens["muted-foreground"] }]}>{description}</Text>
        ) : null}
      </View>
    );

    // The action: a destructive (red) Button in the danger zone or a primary Button
    // otherwise, small to sit comfortably inside the panel.
    const action =
      actionLabel != null ? (
        <View style={sideBySide ? actionPinned : actionStacked}>
          <Button small destructive={tone === "destructive"} primary={tone !== "destructive"} onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null;

    // The body. Stacked, the whole panel IS one gap column, so embedded children
    // simply take their place in it between the copy and the action. Inline, the
    // action is pinned beside the copy, so the row stays intact and the children
    // hang below it, full width, in a gap column of the same stacked rhythm; a row
    // too narrow for both stacks the action under its copy and keeps the children
    // below. Absent children the inline body is the bare row it has always been:
    // the Card keeps receiving exactly one child either way, so the panel, not the
    // Card's own flat-children gap, owns the spacing.
    if (layout === "inline") {
      const row = (
        <View
          onLayout={onRowLayout}
          style={sideBySide ? { flexDirection: "row", alignItems: skin.inlineAlign, gap: skin.inlineGap } : { gap: skin.stackedGap }}
        >
          {copy}
          {action}
        </View>
      );
      return (
        <Card padded testID={testID} style={style}>
          {children != null ? (
            <View style={{ gap: skin.stackedGap }}>
              {row}
              {children}
            </View>
          ) : (
            row
          )}
        </Card>
      );
    }

    return (
      <Card padded testID={testID} style={style}>
        <View style={{ gap: skin.stackedGap }}>
          {copy}
          {children}
          {action}
        </View>
      </Card>
    );
  };
}
