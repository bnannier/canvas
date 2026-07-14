import { type ComponentType, type ReactNode, createContext, useCallback, useContext, useId, useMemo, useState } from "react";
import { type DimensionValue } from "react-native";
import { View, Text, useTheme, useResponsive, type ColorTokens, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Checkbox as WebCheckbox } from "../../atoms/checkbox/checkbox.js";
import { Input as WebInput } from "../../atoms/input/input.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import { type CheckboxProps } from "../../atoms/checkbox/checkbox.shared.js";
import { type InputProps } from "../../atoms/input/input.shared.js";
import * as s from "./form.styles.js";

// Shared Form shell. The structure (the stacked / two-column / sidebar / sectioned
// layouts, their desktop-first responsive collapse, the data-shape types, and the
// layout precedence) lives here once; a platform file supplies only its skin (the
// label/helper TYPE, the vertical rhythm, the divider spacing) and calls createForm.
//
// Form is a "Light" platform treatment. Neither iOS nor Android ships a native form
// control (PLATFORM-REFERENCES.md): SwiftUI Form renders as a grouped inset list,
// and Material 3 composes forms from text fields, selection controls, and buttons.
// So the per-OS touches are conventions only (SF type/rhythm on iOS, M3 type
// tracking on Android), and the WEB look is kept verbatim.
//
// Form COMPOSES the already-skinned Button, Checkbox, and Input atoms. It does NOT
// re-skin them: those atoms carry their own per-OS fidelity (shape, press feedback,
// focus). To make the WEB docs 3-up preview show the platform-correct atom in each
// row, the platform-correct atoms are passed in by each thin wrapper (the iOS
// wrapper passes the `.ios` atoms, etc.), exactly as alert-dialog passes its Input.
// On a real device Metro resolves the right atom by extension regardless, so the
// web-base default is correct there too.

// The atoms the Form composes, typed as their atom components so the public atom
// APIs are preserved across every build path.
export type ButtonComponent = ComponentType<ButtonProps>;
export type CheckboxComponent = ComponentType<CheckboxProps>;
export type InputComponent = ComponentType<InputProps>;

/** A single labeled field in a form. */
export interface FormField {
  /** Visible label above (or beside) the input. */
  label: string;
  /**
   * Key this field's typed value is collected under in the record passed to
   * `onSubmit`. Defaults to the visible `label` when omitted.
   */
  name?: string;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Pre-filled value the field starts with (the user can then edit it). */
  value?: string;
  /** Optional helper text rendered below the input. */
  helper?: string;
}

/** A checkbox row in a form section's checkbox group. */
export interface FormCheckbox {
  /** Visible label beside the box. */
  label: string;
  /**
   * Key this checkbox's state is collected under in the record passed to
   * `onSubmit`. Defaults to the visible `label` when omitted.
   */
  name?: string;
  /** Whether the box starts ticked. */
  checked?: boolean;
}

/**
 * A titled section of a sectioned (sidebar) form: a heading + description in the
 * left column spanning a group of fields, or a checkbox group, on the right.
 */
export interface FormSection {
  /** Section heading (left column). */
  title: string;
  /** Muted supporting line under the heading. */
  description?: string;
  /** Input fields stacked in the right column. */
  fields?: FormField[];
  /** Checkbox group in the right column (mutually exclusive with fields). */
  checkboxes?: FormCheckbox[];
}

export interface FormProps {
  /**
   * The labeled fields to render, in order. Optional: a sectioned sidebar form
   * supplies its inputs per section (see `sections`) and omits `fields`.
   */
  fields?: FormField[];
  /** Label for the primary submit button (defaults to "Submit"). */
  submitLabel?: string;
  /** When set, renders an outline cancel button before the submit button. */
  cancelLabel?: string;
  // Layout (pick one; first match wins). Default is the stacked layout.
  /** Stacked: each label sits directly above its full-width input. */
  stacked?: boolean;
  /** Two-column: fields flow into a two-up grid that collapses on phones. */
  twoColumn?: boolean;
  /** Sidebar: label and helper sit in a left column, input on the right. */
  sidebar?: boolean;
  /**
   * Sectioned sidebar layout: each section's heading + description sit in the
   * left column and span a group of fields (or a checkbox group) on the right,
   * separated by hairline dividers. Takes effect with the sidebar layout and
   * replaces the per-field rows. The actions row renders after the last section.
   */
  sections?: FormSection[];
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: ViewStyle;
  /**
   * Called when the submit button is pressed, with the collected field values
   * keyed by each field/checkbox `name` (falling back to its `label`). Text
   * fields yield their current string; checkboxes yield their boolean state.
   */
  onSubmit?: (values: Record<string, string | boolean>) => void;
  onCancel?: () => void;
}

// Form owns the entered values so its composed inputs are editable (a controlled
// Input with no change handler is frozen on react-native-web) and so `onSubmit`
// can hand them back. The field/checkbox rows read and write through this context
// rather than threading value + handler props down every layout branch.
interface FormValueApi {
  get: (key: string) => string | boolean | undefined;
  setText: (key: string, value: string) => void;
  setBool: (key: string, value: boolean) => void;
}
const FormValues = createContext<FormValueApi | null>(null);

// The stable key a field/checkbox is stored under: its explicit `name`, else its
// visible label.
function fieldKey(f: { name?: string; label: string }): string {
  return f.name ?? f.label;
}

// Initial values record, walked once from the props: text fields seed from their
// `value`, checkboxes from their `checked`.
function seedValues(props: FormProps): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of props.fields ?? []) out[fieldKey(f)] = f.value ?? "";
  for (const sec of props.sections ?? []) {
    for (const f of sec.fields ?? []) out[fieldKey(f)] = f.value ?? "";
    for (const c of sec.checkboxes ?? []) out[fieldKey(c)] = c.checked ?? false;
  }
  return out;
}

// The per-OS-varying style pieces the Form's own surface contributes. Everything
// else (the layouts, the responsive collapse, the composed atoms) is shared.
export interface FormSkin {
  /** Field/heading label type (size / line-height / weight / tracking). */
  label: (t: ColorTokens) => TextStyle;
  /** Helper text below a field (type + muted color + top inset). */
  helper: (t: ColorTokens) => TextStyle;
  /** Section description under a sidebar heading. */
  sectionDescription: (t: ColorTokens) => TextStyle;
  /** The hairline under every section except the last. */
  sectionDivider: (t: ColorTokens) => ViewStyle;
  /** Field-label inset above its input. */
  labelSpacing: TextStyle;
  /** Section/sidebar heading weight bump. */
  headingWeight: TextStyle;
  /** The right-aligned actions row. */
  actions: ViewStyle;
  /** Outer stack gap for the stacked / two-column layouts. */
  stackGap4: ViewStyle;
  /** Outer stack gap for the sidebar / sectioned layouts. */
  stackGap6: ViewStyle;
  /** Min-height + vertical centering for each checkbox row in a section so its
   *  effective tap target reaches the platform minimum (>=44pt iOS / >=48dp
   *  Android). Empty on web so the established web layout is unchanged. */
  checkboxRow: ViewStyle;
}

type Layout = "stacked" | "twoColumn" | "sidebar";

// Layout precedence when more than one is passed: first match wins.
function layoutOf(p: FormProps): Layout {
  if (p.stacked) return "stacked";
  if (p.twoColumn) return "twoColumn";
  if (p.sidebar) return "sidebar";
  return "stacked";
}

/**
 * Build a Form component from a platform skin.
 *
 * `Button` / `Checkbox` / `Input` are the platform-correct atoms the Form
 * composes. Each platform's thin `.tsx`/`.ios`/`.android` file passes the atoms it
 * already resolves for that platform, so every composed control matches the form's
 * platform on every build path (notably the WEB docs 3-up preview). Defaults to the
 * web-base atoms when omitted, which is also correct on a real device (Metro
 * resolves the right extension there regardless).
 */
export function createForm(
  skin: FormSkin,
  Button: ButtonComponent = WebButton,
  Checkbox: CheckboxComponent = WebCheckbox,
  Input: InputComponent = WebInput,
) {
  function Helper({ text, id }: { text?: string; id?: string }) {
    const { tokens } = useTheme();
    if (!text) return null;
    return <Text nativeID={id} style={skin.helper(tokens)}>{text}</Text>;
  }

  // A label sitting above its input (stacked and two-column layouts). The label is
  // delegated to the Input, which places it per platform (above on iOS/web, the M3
  // floating label on Android) and owns its accessible-name wiring; the helper text
  // stays here and is linked as the field's description (aria-describedby), so a
  // screen reader announces the field with its name and hint.
  function StackedField({ field }: { field: FormField }) {
    const base = useId();
    const helperId = field.helper ? `${base}-helper` : undefined;
    const values = useContext(FormValues);
    const key = fieldKey(field);
    const value = (values?.get(key) as string | undefined) ?? field.value ?? "";
    return (
      <View>
        <Input
          label={field.label}
          placeholder={field.placeholder}
          value={value}
          onChangeText={(t) => values?.setText(key, t)}
          block
          aria-describedby={helperId}
        />
        <Helper text={field.helper} id={helperId} />
      </View>
    );
  }

  // One titled section of a sectioned sidebar form: heading + description on the
  // left, a group of inputs or a checkbox group on the right. Desktop-first:
  // side-by-side on wide viewports, collapsing to stacked on small screens. The
  // hairline divider sits on every section except the last.
  function Section({ section, last }: { section: FormSection; last: boolean }) {
    const { tokens } = useTheme();
    const values = useContext(FormValues);
    const row = useResponsive<ViewStyle>({
      base: { flexDirection: "row", gap: 32 },
      sm: { flexDirection: "column", gap: 12 },
    });
    const leftWidth = useResponsive<DimensionValue>({ base: 200, sm: "100%" });
    const rightFull = useResponsive<ViewStyle>({ base: {}, sm: { width: "100%" } });
    return (
      <View style={[{ alignItems: "flex-start" }, row, last ? null : skin.sectionDivider(tokens)]}>
        <View style={{ width: leftWidth }}>
          <Text style={[skin.label(tokens), skin.headingWeight]}>{section.title}</Text>
          {section.description ? <Text style={skin.sectionDescription(tokens)}>{section.description}</Text> : null}
        </View>
        <View style={[s.flex1, { gap: 12 }, rightFull]}>
          {section.checkboxes
            ? section.checkboxes.map((c, i) => {
                const key = fieldKey(c);
                return (
                  <Checkbox
                    key={i}
                    checked={Boolean(values?.get(key) ?? c.checked)}
                    onChange={(next) => values?.setBool(key, next)}
                    style={skin.checkboxRow}
                  >
                    {c.label}
                  </Checkbox>
                );
              })
            : (section.fields ?? []).map((field, i) => (
                <StackedField key={i} field={field} />
              ))}
        </View>
      </View>
    );
  }

  // A label/helper column on the left with the input on the right. Desktop-first:
  // side-by-side on wide viewports, collapsing to stacked on small screens.
  function SidebarField({ field }: { field: FormField }) {
    const { tokens } = useTheme();
    const base = useId();
    const labelId = `${base}-label`;
    const helperId = field.helper ? `${base}-helper` : undefined;
    const values = useContext(FormValues);
    const key = fieldKey(field);
    const value = (values?.get(key) as string | undefined) ?? field.value ?? "";
    const row = useResponsive<ViewStyle>({
      base: { flexDirection: "row", gap: 32 },
      sm: { flexDirection: "column", gap: 6 },
    });
    const leftWidth = useResponsive<DimensionValue>({ base: "33.3333%", sm: "100%" });
    const rightFull = useResponsive<ViewStyle>({ base: {}, sm: { width: "100%" } });
    return (
      <View style={[{ alignItems: "flex-start" }, row]}>
        <View style={{ width: leftWidth }}>
          <Text nativeID={labelId} style={[skin.label(tokens), skin.headingWeight]}>{field.label}</Text>
          <Helper text={field.helper} id={helperId} />
        </View>
        <View style={[s.flex1, rightFull]}>
          <Input
            placeholder={field.placeholder}
            value={value}
            onChangeText={(t) => values?.setText(key, t)}
            block
            accessibilityLabel={field.label}
            aria-labelledby={labelId}
            aria-describedby={helperId}
          />
        </View>
      </View>
    );
  }

  // The two-column body: fields flow into a wrapping row that collapses to a
  // single column on small screens; each item is flex-1 (flex-auto when stacked).
  function TwoColumnBody({ fields }: { fields: FormField[] }) {
    const direction = useResponsive<"row" | "column">({ base: "row", sm: "column" });
    const itemBasis = useResponsive<ViewStyle>({ base: s.flex1, sm: s.flexAuto });
    return (
      <View style={{ flexDirection: direction, flexWrap: "wrap", gap: 16 }}>
        {fields.map((field, i) => (
          <View key={i} style={[itemBasis, { minWidth: 200 }]}>
            <StackedField field={field} />
          </View>
        ))}
      </View>
    );
  }

  function Actions({
    submitLabel,
    cancelLabel,
    onSubmit,
    onCancel,
  }: {
    submitLabel: string;
    cancelLabel?: string;
    onSubmit?: () => void;
    onCancel?: () => void;
  }): ReactNode {
    return (
      <View style={skin.actions}>
        {cancelLabel ? (
          <Button outline onPress={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button primary onPress={onSubmit}>
          {submitLabel}
        </Button>
      </View>
    );
  }

  return function Form(props: FormProps) {
    const { fields, submitLabel = "Submit", cancelLabel, testID, style, onSubmit, onCancel } = props;
    const layout = layoutOf(props);

    const [values, setValues] = useState<Record<string, string | boolean>>(() => seedValues(props));
    const api = useMemo<FormValueApi>(
      () => ({
        get: (k) => values[k],
        setText: (k, v) => setValues((prev) => ({ ...prev, [k]: v })),
        setBool: (k, v) => setValues((prev) => ({ ...prev, [k]: v })),
      }),
      [values],
    );
    const submit = useCallback(() => onSubmit?.(values), [onSubmit, values]);

    let body: ReactNode;
    if (layout === "twoColumn") {
      body = (
        <View testID={testID} style={[skin.stackGap4, style]}>
          <TwoColumnBody fields={fields ?? []} />
          <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={submit} onCancel={onCancel} />
        </View>
      );
    } else if (layout === "sidebar") {
      // Sectioned sidebar: section headings span a group of fields / a checkbox
      // group. Falls back to the per-field sidebar when no sections are given.
      const sections = props.sections;
      body =
        sections && sections.length > 0 ? (
          <View testID={testID} style={[skin.stackGap6, style]}>
            {sections.map((section, i) => (
              <Section key={i} section={section} last={i === sections.length - 1} />
            ))}
            <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={submit} onCancel={onCancel} />
          </View>
        ) : (
          <View testID={testID} style={[skin.stackGap6, style]}>
            {(fields ?? []).map((field, i) => (
              <SidebarField key={i} field={field} />
            ))}
            <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={submit} onCancel={onCancel} />
          </View>
        );
    } else {
      // stacked (default): one field per row, full width, label above input.
      body = (
        <View testID={testID} style={[skin.stackGap4, style]}>
          {(fields ?? []).map((field, i) => (
            <StackedField key={i} field={field} />
          ))}
          <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={submit} onCancel={onCancel} />
        </View>
      );
    }

    return <FormValues.Provider value={api}>{body}</FormValues.Provider>;
  };
}
