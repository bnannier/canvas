import { type ComponentType, type ReactNode } from "react";
import { type DimensionValue } from "react-native";
import { View, Text, useTheme, useResponsive, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Input as WebInput } from "../../atoms/input/input.js";
import { Checkbox as WebCheckbox } from "../../atoms/checkbox/checkbox.js";
import * as s from "./fieldset.styles.js";
import { type Surface, type FieldsetSkin } from "./fieldset.styles.js";
import { type InputProps } from "../../atoms/input/input.shared.js";
import { type CheckboxProps } from "../../atoms/checkbox/checkbox.shared.js";

// Shared Fieldset shell. The structure (a legend names the group, an optional
// description explains it, and a field group stacks the controls so the set reads
// as one labeled unit), the boolean-prop axes, the data-shape types, and the
// platform-neutral logic (surface precedence, responsive two-column collapse,
// per-item error fallback) live here once; a platform file supplies only its skin
// (surface shape/padding/elevation, type tracking, group spacing) and calls
// createFieldset.
//
// For the docs playground (data-only, no JSX children) it also accepts a flat
// `items` array that renders stacked label + <Input> rows, or a `checkboxes` array
// that renders a checkbox group.
//
// Fieldset is a "Light" platform treatment: one structure with per-OS touches only
// (corner radius, density/spacing, type tracking, surface elevation) — so the skin
// carries only those, not the layout logic or the controls.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match precedence
// within an axis (mirrors Card's surfaceOf). Axes:
//
// - Surface: `bordered` (a bordered, padded card-like section) vs. the plain
//   default (a borderless group).
// - Columns: `twoColumn` lays the field group out in two columns (it collapses to
//   one column on small screens); omit for the single-column stack.
// - State: `disabled` dims the whole group and disables every control inside.
// - `error` flags a validation problem on the field group (shown via a default
//   inline message when `items` are rendered and no per-item error is set).

export interface FieldsetItem {
  /** The field's persistent label, shown above the control. */
  label: string;
  /** Optional example/format hint shown inside the control. */
  placeholder?: string;
  /** Optional value rendered into the control. */
  value?: string;
  /** Optional muted help line beneath the control. */
  help?: string;
  /** Optional inline error beneath the control (takes precedence over help). */
  error?: string;
}

export interface FieldsetProps {
  children?: ReactNode;
  /** The group's name, rendered as the legend heading. */
  legend?: string;
  /** A muted supporting line beneath the legend. */
  description?: string;
  /** Data-only field rows: each renders a label + <Input>. */
  items?: FieldsetItem[];
  /** Data-only checkbox rows: each renders a <Checkbox> with the label. */
  checkboxes?: { label: string; checked?: boolean }[];
  // Surface (pick one; default is the plain, borderless group).
  bordered?: boolean;
  // Columns (orthogonal): two-column field grid, collapses to one when narrow.
  twoColumn?: boolean;
  // State (orthogonal booleans).
  disabled?: boolean;
  /** Flags a validation problem on the group. */
  error?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Fieldset composes the already-skinned Input and Checkbox atoms. Each platform's
// thin `.tsx`/`.ios`/`.android` file passes the atom it resolves for that platform,
// so the embedded controls match the fieldset's platform on every build path. This
// matters for the WEB docs 3-up preview: a bare barrel import always resolves the
// WEB atoms in a browser bundler, which would paint web-styled controls inside the
// iOS/Android rows. On a real device Metro resolves the right atom by extension
// regardless, so the defaults (the web bases) are correct there too.
export type InputComponent = ComponentType<InputProps>;
export type CheckboxComponent = ComponentType<CheckboxProps>;

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: FieldsetProps): Surface {
  if (p.bordered) return "bordered";
  return "plain";
}

/**
 * Build a Fieldset component from a platform skin (plus the platform-correct Input
 * and Checkbox atoms it composes; both default to the web base when omitted).
 */
export function createFieldset(
  skin: FieldsetSkin,
  Input: InputComponent = WebInput,
  Checkbox: CheckboxComponent = WebCheckbox,
) {
  // One labeled field: label + control + optional help/error.
  function Field({
    item,
    disabled,
    error,
  }: {
    item: FieldsetItem;
    disabled?: boolean;
    error?: boolean;
  }) {
    const { tokens } = useTheme();
    const msg = item.error ?? (error ? "Enter a valid value" : "");
    return (
      <View style={s.fieldWrap}>
        {item.label ? <Text style={skin.fieldLabel(tokens)}>{item.label}</Text> : null}
        <Input value={item.value} placeholder={item.placeholder} disabled={disabled} error={!!msg} block />
        {msg ? (
          <Text style={skin.fieldError(tokens)}>{msg}</Text>
        ) : item.help ? (
          <Text style={skin.fieldHelp(tokens)}>{item.help}</Text>
        ) : null}
      </View>
    );
  }

  // The two-column field group: rows flow into a wrapping row that collapses to a
  // single column on small screens (flex-row flex-wrap sm:flex-col), and each item
  // takes ~47% width and grows, going full width when stacked (w-[47%] grow sm:w-full).
  function TwoColumnGroup({
    rows,
    disabled,
    error,
  }: {
    rows: FieldsetItem[];
    disabled?: boolean;
    error?: boolean;
  }) {
    const direction = useResponsive<"row" | "column">({ base: "row", sm: "column" });
    const itemWidth = useResponsive<DimensionValue>({ base: "47%", sm: "100%" });
    return (
      <View style={{ flexDirection: direction, flexWrap: "wrap", gap: skin.twoColumnGap }}>
        {rows.map((item, i) => (
          <View key={i} style={[{ width: itemWidth }, s.itemGrow]}>
            <Field item={item} disabled={disabled} error={error} />
          </View>
        ))}
      </View>
    );
  }

  return function Fieldset(props: FieldsetProps) {
    const { children, legend, description, items, checkboxes, twoColumn, disabled, error, style } = props;
    const { tokens } = useTheme();
    const surface = surfaceOf(props);

    const container: StyleProp<ViewStyle> = [
      s.containerBase,
      skin.surface(tokens, surface),
      disabled ? s.disabledDim : null,
      style,
    ];

    const header =
      legend != null || description != null ? (
        <View style={skin.header}>
          {legend != null ? <Text style={skin.legend(tokens)}>{legend}</Text> : null}
          {description != null ? <Text style={skin.description(tokens)}>{description}</Text> : null}
        </View>
      ) : null;

    // Children win: when composed, render exactly what the caller passed.
    if (children != null) {
      return (
        <View style={container}>
          {header}
          {children}
        </View>
      );
    }

    // Checkbox group: a stacked set of labeled checkboxes.
    if (checkboxes != null) {
      return (
        <View style={container}>
          {header}
          <View style={{ gap: skin.checkboxGap }}>
            {checkboxes.map((c, i) => (
              <Checkbox key={i} checked={c.checked} disabled={disabled}>
                {c.label}
              </Checkbox>
            ))}
          </View>
        </View>
      );
    }

    // Field group: stacked rows, or a two-column wrap that collapses when narrow.
    const rows = items ?? [];

    return (
      <View style={container}>
        {header}
        {twoColumn ? (
          <TwoColumnGroup rows={rows} disabled={disabled} error={error} />
        ) : (
          <View style={{ flexDirection: "column", gap: skin.groupGap }}>
            {rows.map((item, i) => (
              <View key={i} style={s.fieldWrap}>
                <Field item={item} disabled={disabled} error={error} />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
}
