import { type ReactNode } from "react";
import { type DimensionValue } from "react-native";
import { View, Text, useTheme, useResponsive, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.js";
import { Input } from "../../atoms/input/input.js";
import * as s from "./form.styles.js";

/** A single labeled field in a form. */
export interface FormField {
  /** Visible label above (or beside) the input. */
  label: string;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Pre-filled value shown in the input (controlled). */
  value?: string;
  /** Optional helper text rendered below the input. */
  helper?: string;
}

/** A checkbox row in a form section's checkbox group. */
export interface FormCheckbox {
  /** Visible label beside the box. */
  label: string;
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
  /** The labeled fields to render, in order. */
  fields: FormField[];
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
  /** Escape hatch for layout/positioning composition (mainly width, e.g. maxWidth). */
  style?: ViewStyle;
  onSubmit?: () => void;
  onCancel?: () => void;
}

type Layout = "stacked" | "twoColumn" | "sidebar";

// Layout precedence when more than one is passed: first match wins.
function layoutOf(p: FormProps): Layout {
  if (p.stacked) return "stacked";
  if (p.twoColumn) return "twoColumn";
  if (p.sidebar) return "sidebar";
  return "stacked";
}

function Helper({ text }: { text?: string }) {
  const { tokens } = useTheme();
  if (!text) return null;
  return <Text style={s.helper(tokens)}>{text}</Text>;
}

// A label sitting above its input (stacked and two-column layouts).
function StackedField({ field }: { field: FormField }) {
  const { tokens } = useTheme();
  return (
    <View>
      <Text style={[s.label(tokens), s.labelSpacing]}>{field.label}</Text>
      <Input placeholder={field.placeholder} value={field.value} />
      <Helper text={field.helper} />
    </View>
  );
}

// One titled section of a sectioned sidebar form: heading + description on the
// left, a group of inputs or a checkbox group on the right. Desktop-first:
// side-by-side on wide viewports, collapsing to stacked on small screens. The
// hairline divider sits on every section except the last.
function Section({ section, last }: { section: FormSection; last: boolean }) {
  const { tokens } = useTheme();
  const row = useResponsive<ViewStyle>({
    base: { flexDirection: "row", gap: 32 },
    sm: { flexDirection: "column", gap: 12 },
  });
  const leftWidth = useResponsive<DimensionValue>({ base: 200, sm: "100%" });
  const rightFull = useResponsive<ViewStyle>({ base: {}, sm: { width: "100%" } });
  return (
    <View style={[{ alignItems: "flex-start" }, row, last ? null : s.sectionDivider(tokens)]}>
      <View style={{ width: leftWidth }}>
        <Text style={[s.label(tokens), s.headingWeight]}>{section.title}</Text>
        {section.description ? <Text style={s.sectionDescription(tokens)}>{section.description}</Text> : null}
      </View>
      <View style={[s.flex1, { gap: 12 }, rightFull]}>
        {section.checkboxes
          ? section.checkboxes.map((c, i) => (
              <Checkbox key={i} checked={c.checked}>
                {c.label}
              </Checkbox>
            ))
          : (section.fields ?? []).map((field, i) => (
              <View key={i}>
                <Text style={[s.label(tokens), s.labelSpacing]}>{field.label}</Text>
                <Input placeholder={field.placeholder} value={field.value} />
                <Helper text={field.helper} />
              </View>
            ))}
      </View>
    </View>
  );
}

// A label/helper column on the left with the input on the right. Desktop-first:
// side-by-side on wide viewports, collapsing to stacked on small screens.
function SidebarField({ field }: { field: FormField }) {
  const { tokens } = useTheme();
  const row = useResponsive<ViewStyle>({
    base: { flexDirection: "row", gap: 32 },
    sm: { flexDirection: "column", gap: 6 },
  });
  const leftWidth = useResponsive<DimensionValue>({ base: "33.3333%", sm: "100%" });
  const rightFull = useResponsive<ViewStyle>({ base: {}, sm: { width: "100%" } });
  return (
    <View style={[{ alignItems: "flex-start" }, row]}>
      <View style={{ width: leftWidth }}>
        <Text style={[s.label(tokens), s.headingWeight]}>{field.label}</Text>
        <Helper text={field.helper} />
      </View>
      <View style={[s.flex1, rightFull]}>
        <Input placeholder={field.placeholder} value={field.value} />
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
    <View style={s.actions}>
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

export function Form(props: FormProps) {
  const { fields, submitLabel = "Submit", cancelLabel, style, onSubmit, onCancel } = props;
  const layout = layoutOf(props);

  if (layout === "twoColumn") {
    return (
      <View style={[s.stackGap4, style]}>
        <TwoColumnBody fields={fields} />
        <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={onSubmit} onCancel={onCancel} />
      </View>
    );
  }

  if (layout === "sidebar") {
    // Sectioned sidebar: section headings span a group of fields / a checkbox
    // group. Falls back to the per-field sidebar when no sections are given.
    const sections = props.sections;
    if (sections && sections.length > 0) {
      return (
        <View style={[s.stackGap6, style]}>
          {sections.map((section, i) => (
            <Section key={i} section={section} last={i === sections.length - 1} />
          ))}
          <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={onSubmit} onCancel={onCancel} />
        </View>
      );
    }
    return (
      <View style={[s.stackGap6, style]}>
        {fields.map((field, i) => (
          <SidebarField key={i} field={field} />
        ))}
        <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={onSubmit} onCancel={onCancel} />
      </View>
    );
  }

  // stacked (default): one field per row, full width, label above input.
  return (
    <View style={[s.stackGap4, style]}>
      {fields.map((field, i) => (
        <StackedField key={i} field={field} />
      ))}
      <Actions submitLabel={submitLabel} cancelLabel={cancelLabel} onSubmit={onSubmit} onCancel={onCancel} />
    </View>
  );
}
