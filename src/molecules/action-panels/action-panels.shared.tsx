import { type ComponentType, type ReactNode } from "react";
import { View, Text, useFillStyle, GlassPane, paneStyle, isGlass, type ViewStyle, type LayoutStyle } from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { MaterialBehind } from "../../style/glass-surface/material-behind.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Switch as WebSwitch } from "../../atoms/switch/switch.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import { type SwitchProps } from "../../atoms/switch/switch.shared.js";
import { type ActionPanelSkin, type Tone, type Layout, titleColor, panelColor, panelTint, footerColor } from "./action-panels.styles.js";

// Shared ActionPanel shell. The structure (a settings card with a copy block and
// a single action), the boolean-prop axes with first-match precedence, the
// layout selection, and the tone-color logic live here once; a platform file
// supplies only its skin (type + spacing) and the platform-correct Button / Switch
// atoms, then calls createActionPanel.
//
// An action panel is a settings card: a headline and a line of consequence copy
// on one side, and a single action (a Button) that acts on it. It surfaces one
// decision at a time, the safe-default version always pairing the action with the
// copy that explains the stakes.
//
// ActionPanel is a "Light" platform treatment: ONE structure, the hand-off's panel on
// every platform (the skin holds its measures). The action is the platform-skinned Button / Switch atom, which brings
// its own per-OS shape and press feedback, so this molecule does NOT re-skin it.
//
// Boolean-prop API, grouped by axis, first-match precedence within an axis
// (mirrors Button's intentOf):
//
// - Tone: `destructive` paints the headline red and renders a destructive
//   (red) Button on a danger wash; omit for the neutral tone, where the action is
//   an outline Button. This is the "danger zone" switch.
// - Layout (pick one): `inline` floats the action to the right of the copy, the
//   two reading as one side-by-side row that wraps the action under the copy when
//   the panel is narrow; omit for the default, where the action sits on its own line
//   below the copy.
// - Affordance: `toggle` makes the action an on/off Switch (its state is
//   `checked`) instead of a Button; the panel reads as a setting row, always
//   laid out inline with the Switch pinned to the right. Omit for the default
//   Button action.
//
// The axes are orthogonal: `<ActionPanel destructive inline />` is a red
// action sitting to the right of its danger copy, and `<ActionPanel toggle
// checked title="..." description="..." />` is a settings row whose switch is on.
//
// The panel also HOSTS content: `children` embed inside it under the copy, so a settings
// panel can carry its own field rows without the caller rebuilding the panel around it
// (the hand-off's code-driven form). They sit in the panel's column in a 12 px rhythm,
// and the Button then closes the panel on the right over a hairline, as the action that
// commits them; a toggle stays pinned beside the copy.

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
  /** The Switch on/off state when `toggle` is set (CONTROLLED). Omit for uncontrolled use. */
  checked?: boolean;
  /** Initial Switch state for uncontrolled use (the toggle flips itself on press). */
  defaultChecked?: boolean;
  /** Fired with the next checked value when the toggle Switch is flipped. */
  onToggle?: (next: boolean) => void;
  /**
   * Content embedded in the panel under the copy (a block of field rows in a settings
   * panel, say). The Button then closes the panel on the right, under a hairline, as
   * the action that commits it; a toggle stays pinned beside the copy.
   */
  children?: ReactNode;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// The atoms the molecule composes are typed by their public props, so each
// platform passes the Button/Switch it already resolves for that platform.
export type ButtonComponent = ComponentType<ButtonProps>;
export type SwitchComponent = ComponentType<SwitchProps>;

// Tone precedence when more than one flag is passed: first match wins.
export function toneOf(p: ActionPanelProps): Tone {
  if (p.destructive) return "destructive";
  return "neutral";
}

// Layout precedence when more than one flag is passed: first match wins.
export function layoutOf(p: ActionPanelProps): Layout {
  if (p.inline) return "inline";
  return "stacked";
}

// --- shared layout fragments (identical across platforms) -------------------

// The action wrapper: pinned (shrink-0) beside the copy, or left-aligned (items-start) on
// its own line in the stacked layout.
const actionPinned: ViewStyle = { flexShrink: 0 };
const actionStacked: ViewStyle = { alignItems: "flex-start" };

/**
 * Build an ActionPanel component from a platform skin.
 *
 * `Button` and `Switch` are the platform-correct atoms, passed in by each platform's
 * thin `.tsx`/`.ios`/`.android` file, so the action matches the panel's platform on
 * every build path. This matters for the WEB docs 3-up preview: a bare barrel import
 * always resolves the WEB atom in a browser bundler, which would paint a web-styled
 * Button/Switch inside the iOS/Android rows. Both default to the web base when omitted.
 *
 * The panel itself is the hand-off's own surface (not a Card: it has no shade and the
 * danger zone washes it), a content-layer pane under glass, tinted with the danger wash.
 */
export function createActionPanel(
  skin: ActionPanelSkin,
  Button: ButtonComponent = WebButton,
  Switch: SwitchComponent = WebSwitch,
) {
  return function ActionPanel(props: ActionPanelProps) {
    const { title, description, actionLabel, onAction, toggle, checked, defaultChecked, onToggle, children, testID, style } = props;
    const theme = useMaterialTheme({ static: true });
    const { tokens } = theme;
    const glass = isGlass(theme);
    const fill = useFillStyle("ActionPanel");
    const tone = toneOf(props);
    // The toggle affordance always reads as an inline settings row.
    const layout = toggle ? "inline" : layoutOf(props);
    const hosts = children != null;

    // The copy block: title above its consequence line. In the inline row it grows to push
    // the action to the right, from a basis below which the action wraps under it.
    const copy = (
      <View style={[{ gap: skin.copyGap }, layout === "inline" ? { flexGrow: 1, flexShrink: 1, flexBasis: skin.inlineCopyBasis, minWidth: 0 } : null]}>
        {title != null ? (
          <Text style={[skin.titleType, { color: titleColor(tokens, tone) }]}>{title}</Text>
        ) : null}
        {description != null ? (
          <Text style={[skin.descriptionType, { color: tokens["muted-foreground"] }]}>{description}</Text>
        ) : null}
      </View>
    );

    // The Button action: an outline Button (a destructive one in the danger zone) beside or
    // under the copy; with embedded content, the Button that commits it, primary.
    const button = (commits: boolean) =>
      actionLabel != null ? (
        <Button destructive={tone === "destructive"} outline={!commits && tone !== "destructive"} primary={commits && tone !== "destructive"} onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null;

    // The pinned action: the toggle Switch, or (without embedded content) the Button.
    const pinned = toggle ? (
      <View style={actionPinned}>
        <Switch
          checked={checked}
          defaultChecked={defaultChecked}
          onValueChange={onToggle}
          accessibilityLabel={title ?? actionLabel}
        />
      </View>
    ) : !hosts && actionLabel != null ? (
      <View style={layout === "inline" ? actionPinned : actionStacked}>{button(false)}</View>
    ) : null;

    const head =
      layout === "inline" ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: skin.inlineAlign, gap: skin.inlineGap }}>
          {copy}
          {pinned}
        </View>
      ) : (
        <>
          {copy}
          {pinned}
        </>
      );

    // Embedded content joins the panel's column under the copy, in its own rhythm; the
    // Button then closes the panel on the right, over a hairline.
    const footer = hosts && !toggle && actionLabel != null ? <View style={[skin.footer, footerColor(tokens)]}>{button(true)}</View> : null;

    const box = [skin.container, panelColor(tokens, tone)];
    const stateBorder = tone === "destructive";
    return (
      <View testID={testID} style={[paneStyle(theme, box, stateBorder), fill, style]}>
        <GlassPane layer="content" shape={box} stateBorder={stateBorder} tint={panelTint(tokens, tone)} />
        <MaterialBehind rendered={glass}>
          {head}
          {hosts ? <View style={{ gap: skin.contentGap }}>{children}</View> : null}
          {footer}
        </MaterialBehind>
      </View>
    );
  };
}
