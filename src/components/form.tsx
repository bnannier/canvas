import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Button } from "./button.js";
import { Checkbox } from "./checkbox.js";
import { Input } from "./input.js";

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
  /** Extra utilities, mainly for width (e.g. "max-w-[560px]"). */
  className?: string;
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

const LABEL = "text-sm font-medium text-foreground";
const HELPER = "mt-1.5 text-xs text-muted-foreground";

function Helper({ text }: { text?: string }) {
  if (!text) return null;
  return <Text className={HELPER}>{text}</Text>;
}

// A label sitting above its input (stacked and two-column layouts).
function StackedField({ field }: { field: FormField }) {
  return (
    <Box>
      <Text className={cn(LABEL, "mb-1.5")}>{field.label}</Text>
      <Input placeholder={field.placeholder} value={field.value} />
      <Helper text={field.helper} />
    </Box>
  );
}

// One titled section of a sectioned sidebar form: heading + description on the
// left, a group of inputs or a checkbox group on the right. Desktop-first:
// side-by-side on wide viewports, collapsing to stacked on small screens. The
// hairline divider sits on every section except the last.
function Section({ section, last }: { section: FormSection; last: boolean }) {
  return (
    <Box
      className={cn(
        "flex-row items-start gap-8 sm:flex-col sm:gap-3",
        last ? "" : "border-b border-border pb-6",
      )}
    >
      <Box className="w-[200px] sm:w-full">
        <Text className={cn(LABEL, "font-semibold")}>{section.title}</Text>
        {section.description ? (
          <Text className="mt-1 text-xs text-muted-foreground">{section.description}</Text>
        ) : null}
      </Box>
      <Box className="flex-1 gap-3 sm:w-full">
        {section.checkboxes
          ? section.checkboxes.map((c, i) => (
              <Checkbox key={i} checked={c.checked}>
                {c.label}
              </Checkbox>
            ))
          : (section.fields ?? []).map((field, i) => (
              <Box key={i}>
                <Text className={cn(LABEL, "mb-1.5")}>{field.label}</Text>
                <Input placeholder={field.placeholder} value={field.value} />
                <Helper text={field.helper} />
              </Box>
            ))}
      </Box>
    </Box>
  );
}

// A label/helper column on the left with the input on the right. Desktop-first:
// side-by-side on wide viewports, collapsing to stacked on small screens.
function SidebarField({ field }: { field: FormField }) {
  return (
    <Box className="flex-row items-start gap-8 sm:flex-col sm:gap-1.5">
      <Box className="w-1/3 sm:w-full">
        <Text className={cn(LABEL, "font-semibold")}>{field.label}</Text>
        <Helper text={field.helper} />
      </Box>
      <Box className="flex-1 sm:w-full">
        <Input placeholder={field.placeholder} value={field.value} />
      </Box>
    </Box>
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
    <Box className="mt-2 flex-row justify-end gap-2">
      {cancelLabel ? (
        <Button outline onPress={onCancel}>
          {cancelLabel}
        </Button>
      ) : null}
      <Button primary onPress={onSubmit}>
        {submitLabel}
      </Button>
    </Box>
  );
}

export function Form(props: FormProps) {
  const {
    fields,
    submitLabel = "Submit",
    cancelLabel,
    className,
    onSubmit,
    onCancel,
  } = props;
  const layout = layoutOf(props);

  if (layout === "twoColumn") {
    return (
      <Box className={cn("gap-4", className)}>
        <Box className="flex-row flex-wrap gap-4 sm:flex-col">
          {fields.map((field, i) => (
            <Box key={i} className="flex-1 sm:flex-auto min-w-[200px]">
              <StackedField field={field} />
            </Box>
          ))}
        </Box>
        <Actions
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </Box>
    );
  }

  if (layout === "sidebar") {
    // Sectioned sidebar: section headings span a group of fields / a checkbox
    // group. Falls back to the per-field sidebar when no sections are given.
    const sections = props.sections;
    if (sections && sections.length > 0) {
      return (
        <Box className={cn("gap-6", className)}>
          {sections.map((section, i) => (
            <Section key={i} section={section} last={i === sections.length - 1} />
          ))}
          <Actions
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </Box>
      );
    }
    return (
      <Box className={cn("gap-6", className)}>
        {fields.map((field, i) => (
          <SidebarField key={i} field={field} />
        ))}
        <Actions
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </Box>
    );
  }

  // stacked (default): one field per row, full width, label above input.
  return (
    <Box className={cn("gap-4", className)}>
      {fields.map((field, i) => (
        <StackedField key={i} field={field} />
      ))}
      <Actions
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </Box>
  );
}
