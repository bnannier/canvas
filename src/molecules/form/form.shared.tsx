import { Children, createContext, isValidElement, useContext, useEffect, useId, useRef, type ComponentType, type ElementRef, type ReactNode } from "react";
import { type Role } from "react-native";
import { View, Text, useTheme, useContainerWidth, widths, type ColorTokens, type TextStyle, type ViewStyle, type LayoutStyle, type MeasureProps, useFillStyle } from "../../style/index.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import * as s from "./form.styles.js";

// Shared Form shell. Form is a COMPOSITION surface: the caller stitches the field
// atoms (Input, Select, Checkbox, a FormSection, any node) as children and keeps
// ownership of their state through each atom's own controlled/uncontrolled props.
// Form contributes only what the group needs as a whole:
//   - the vertical rhythm between rows (and the optional two-column flow that
//     collapses to one column on phones, desktop-first),
//   - the actions row: a primary submit + a ghost cancel composed from the kit
//     Button, rendered when a label is given,
//   - form semantics for assistive tech, and Enter-to-submit on the web.
// It deliberately owns NO field state and collects no values: `onSubmit` is a
// plain callback, and the caller reads its own state (this keeps every atom
// decoupled from Form and its API identical inside or outside one).
//
// Neither iOS nor Android draws a form of its own (PLATFORM-REFERENCES.md): SwiftUI's
// Form is a grouped inset list and Material 3 has no form component, so every platform
// takes the hand-off's web form (form.styles.ts), and the composed fields and Buttons
// bring the platform's shapes.

// The submit/cancel Button the Form composes, typed as the atom component so the
// public atom API is preserved across every build path. Each platform's thin
// wrapper passes its platform-correct Button (the iOS wrapper passes `.ios`,
// etc.) so the WEB docs 3-up preview shows the right control per row; on a real
// device Metro resolves the right extension regardless.
export type ButtonComponent = ComponentType<ButtonProps>;

const FORM: Role = "form";

// Read a numeric style value, 0 when absent.
const asNum = (v: unknown): number => (typeof v === "number" ? v : 0);

// The per-OS-varying style pieces the Form's own surface contributes. Everything
// else (the layouts, the responsive collapse, the composed Button) is shared.
export interface FormSkin {
  /** A section's heading type (size / line-height / weight / tracking). */
  sectionTitle: (t: ColorTokens) => TextStyle;
  /** The muted supporting line under a section heading. */
  sectionDescription: (t: ColorTokens) => TextStyle;
  /** The right-aligned actions row, with its rule above. */
  actions: (t: ColorTokens) => ViewStyle;
  /** The form's stacked rhythm (gap between rows). */
  stack: ViewStyle;
  /** A section: its internal rhythm (header block to rows, row to row) and its closing rule. */
  section: (t: ColorTokens) => ViewStyle;
  /** The `aside` section: its heading rail beside its rows, stacking below `stackAt`. */
  aside: {
    /** The section box: the rail and rows side by side or stacked, its insets and closing rule. */
    section: (t: ColorTokens, place: { side: boolean; first: boolean }) => ViewStyle;
    /** The heading rail's box. */
    rail: (side: boolean) => ViewStyle;
    /** The rows' column. */
    rows: (side: boolean) => ViewStyle;
    title: (t: ColorTokens) => TextStyle;
    description: (t: ColorTokens) => TextStyle;
    /** The section width (px) at and below which the rail stacks over the rows. */
    stackAt: number;
  };
  /** What the actions row changes after a closing aside section (the section's rule closes the form). */
  actionsAfterAside: ViewStyle;
  /** What the actions row changes when it carries `hints`. */
  actionsWithHints: ViewStyle;
  /** The whole form's opacity while `disabled`. */
  disabledOpacity: number;
}

export interface FormSectionProps {
  /** Section heading naming this group of controls. */
  title?: string;
  /** Muted supporting line under the heading. */
  description?: ReactNode;
  /**
   * Sets the heading in a rail beside the section's rows (a settings page's layout): the
   * rail at the `xs` width step, 48 from the rows, with a 20 px display title over a
   * 14 px description, the rows 18 apart, and 28 above and below the rows closed by a
   * rule. In a section 512 px wide or narrower (the `lg` step, measured on the section
   * itself) the rail stacks over the rows. Omit for the stacked default.
   */
  aside?: boolean;
  /** The section's stitched controls. */
  children?: ReactNode;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

export interface FormProps extends MeasureProps {
  /**
   * The form rows, stitched by the caller: Input, Select, Checkbox, a
   * FormSection, any node. Each control keeps its own state (controlled or
   * uncontrolled); Form never intercepts it.
   */
  children?: ReactNode;
  /**
   * Two-column: rows flow into a grid of exactly two equal columns, 16 apart, where a
   * FormSection takes the whole line; in a form 512 px wide or narrower (the `lg` width
   * step, measured on the form itself) the rows stack in one full-width column instead.
   * Omit for the stacked default.
   */
  twoColumn?: boolean;
  /**
   * Leading content of the actions row, before the buttons (keyboard hints such as
   * "↵ to save"). The row then spreads the hints and the buttons to its two ends.
   */
  hints?: ReactNode;
  /** Label for the primary submit button. Passing it (or `cancelLabel`) renders the actions row. */
  submitLabel?: string;
  /** Renders a ghost cancel button before the submit button. */
  cancelLabel?: string;
  /**
   * Fired when the submit button is pressed, and on the web when Enter is
   * pressed inside one of the form's single-line text fields. Form owns no field
   * state, so the caller reads its own values (no payload).
   */
  onSubmit?: () => void;
  /** Fired when the cancel button is pressed. */
  onCancel?: () => void;
  /** Disables the actions row and Enter-to-submit, and dims the form. */
  disabled?: boolean;
  /**
   * The form's name for assistive tech, a brief statement of its purpose ("Sign in",
   * "Invite a teammate"). Form is a form landmark on the web, and ARIA asks every
   * form landmark for a name: it is how a landmark list tells two forms on one page
   * apart. Omit it and the form stays unnamed, as before.
   */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

/**
 * Build a FormSection component from a platform skin: a titled, described group
 * of stitched controls inside a Form (the composition successor to a fieldset
 * legend).
 */
// Whether a row is the form's first: an aside section takes no inset above the first row.
const FirstRow = createContext(false);

export function createFormSection(skin: FormSkin) {
  function FormSection({ title, description, aside, children, testID, style }: FormSectionProps) {
    const { tokens } = useTheme();
    const first = useContext(FirstRow);
    // The aside rail stands beside the rows in a section wider than the stacking step; the
    // unmeasured frame is the desktop (side by side) variant.
    const { width, onLayout } = useContainerWidth();
    const side = width <= 0 || width > skin.aside.stackAt;
    // Programmatic grouping: a screen reader hears the title as the group's name
    // and the controls as members of it. Both the RN accessibilityLabel and the
    // aria-label alias are set because RNW forwards neither on its own.
    const nameProps =
      title != null
        ? ({ role: "group" as const, accessibilityLabel: title, "aria-label": title } as const)
        : {};
    if (aside) {
      return (
        <View testID={testID} {...nameProps} onLayout={onLayout} style={[skin.aside.section(tokens, { side, first }), style]}>
          {title != null || description != null ? (
            <View style={skin.aside.rail(side)}>
              {title != null ? <Text style={skin.aside.title(tokens)}>{title}</Text> : null}
              {description != null ? <Text style={skin.aside.description(tokens)}>{description}</Text> : null}
            </View>
          ) : null}
          <View style={skin.aside.rows(side)}>
            <FirstRow.Provider value={false}>{children}</FirstRow.Provider>
          </View>
        </View>
      );
    }
    return (
      <View testID={testID} {...nameProps} style={[skin.section(tokens), style]}>
        {title != null || description != null ? (
          <View>
            {title != null ? <Text style={skin.sectionTitle(tokens)}>{title}</Text> : null}
            {description != null ? <Text style={skin.sectionDescription(tokens)}>{description}</Text> : null}
          </View>
        ) : null}
        {children}
      </View>
    );
  }
  // Marks a section for the two-column flow, which gives it the whole row.
  (FormSection as SectionMarked).formSection = true;
  return FormSection;
}

type SectionMarked = { formSection?: boolean };
const isSection = (child: ReactNode): boolean =>
  isValidElement(child) && typeof child.type === "function" && (child.type as SectionMarked).formSection === true;
const isAsideSection = (child: ReactNode): boolean => isSection(child) && isValidElement<FormSectionProps>(child) && !!child.props.aside;

/** Build a Form component from a platform skin (plus the platform-correct Button its actions row composes; defaults to the web base when omitted). */
export function createForm(skin: FormSkin, Button: ButtonComponent = WebButton) {
  return function Form(props: FormProps) {
    const { children, twoColumn, hints, submitLabel, cancelLabel, onSubmit, onCancel, disabled, accessibilityLabel, testID, style } = props;
    // The landmark's name, set as both the RN prop and its aria alias (FormSection's
    // dual-alias precedent). An unnamed form renders exactly the markup it did before.
    const nameProps = accessibilityLabel != null ? { accessibilityLabel, "aria-label": accessibilityLabel } : null;
    const { tokens } = useTheme();

    // The two-column flow: exactly two columns in wide CONTAINERS, one full-width column in
    // narrow ones (desktop-first). The form measures its own row wrapper rather than the
    // window (the DataTable precedent): a form inside a narrow desktop column stacks too,
    // instead of crushing two-up. The threshold is the `lg` step of the width scale (512),
    // not a viewport breakpoint: a two-up split narrower than that cannot give each column
    // a usable field, while a form in an `xl` (576) Container stays two-up. The unmeasured
    // frame is the desktop (two-up) variant.
    // FILL: the form spans the parent it is given; its measure is a Container step.
    const fill = useFillStyle("Form", props);
    const { width: rowsWidth, onLayout: onRowsLayout } = useContainerWidth();
    const twoUp = rowsWidth <= 0 || rowsWidth > widths.lg;

    // Each row sits in a cell. Two-up, a field takes the start or the end column in turn and
    // a FormSection takes the whole line, after which the next field starts a line again
    // (the grid's `1 / -1` placement); stacked, every cell is the column's full width. The
    // cells keep one element type and position in either flow, so crossing the threshold
    // restyles them without remounting a field.
    let column = 0;
    const kids = Children.toArray(children);
    // The first row learns it is first (an aside section then takes no inset above it).
    const marked = (child: ReactNode, i: number) => (i === 0 ? <FirstRow.Provider key="first" value>{child}</FirstRow.Provider> : child);
    const rows = twoColumn ? (
      <View onLayout={onRowsLayout} style={twoUp ? s.twoUpRows : s.stackedRows}>
        {kids.map((child, i) => {
          let cell: ViewStyle = s.stackedCell;
          if (twoUp && isSection(child)) {
            cell = s.fullRowCell;
            column = 0;
          } else if (twoUp) {
            cell = column === 0 ? s.startCell : s.endCell;
            column = 1 - column;
          }
          return (
            <View key={i} style={cell}>
              {marked(child, i)}
            </View>
          );
        })}
      </View>
    ) : (
      kids.map(marked)
    );

    const buttons =
      cancelLabel != null || submitLabel != null ? (
        <>
          {cancelLabel != null ? (
            <Button ghost disabled={disabled} onPress={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
          {submitLabel != null ? (
            <Button primary disabled={disabled} onPress={onSubmit}>
              {submitLabel}
            </Button>
          ) : null}
        </>
      ) : null;
    // After a closing aside section its rule closes the rows, so the actions row draws none.
    const afterAside = kids.length > 0 && isAsideSection(kids[kids.length - 1]);
    const actions =
      buttons != null || hints != null ? (
        <View style={[skin.actions(tokens), afterAside ? skin.actionsAfterAside : null, hints != null ? skin.actionsWithHints : null]}>
          {hints != null ? (
            <>
              <View>{hints}</View>
              {buttons != null ? <View style={{ flexDirection: "row", gap: asNum(skin.actions(tokens).gap) }}>{buttons}</View> : null}
            </>
          ) : (
            buttons
          )}
        </View>
      ) : null;

    // Enter-to-submit on the web. RNW's TextInput STOPS the propagation of its
    // keydown events (verified empirically: neither a container onKeyDown nor a
    // document bubble listener ever hears them), so the only place the key can be
    // caught is the document CAPTURE phase, which runs document -> target before
    // that stop. The listener is scoped to THIS form by matching the target's
    // nearest <form> ancestor against the form's own id VALUE (a role="form" View
    // renders as a real <form> on the web; node-identity checks like contains()
    // fail under happy-dom's proxied HTMLFormElement, while attribute comparison
    // holds everywhere), and to single-line text fields by the DOM `input` tag: a
    // multiline field keeps Enter for newlines (`textarea`) and a button keeps
    // Enter for its own activation. Natively there is no `document`, so both
    // effects are no-ops there and each field's return key drives its own
    // onSubmitEditing. Like useEscapeLayer, this is additive web-only EVENT
    // handling, not a web-only rendering branch, so it stays inside the kit's
    // cross-platform rules.
    const formId = useId();
    const rootRef = useRef<ElementRef<typeof View> | null>(null);
    const submitRef = useRef(onSubmit);
    submitRef.current = onSubmit;
    const disabledRef = useRef(!!disabled);
    disabledRef.current = !!disabled;
    const enterActive = onSubmit != null;

    // Defuse the browser's IMPLICIT form submission: a real <form> with a lone
    // text field navigates on Enter unless the submit default is prevented (the
    // kit's submit button is a role="button" View, not a native submit control).
    useEffect(() => {
      if (typeof document === "undefined") return;
      const root = rootRef.current as unknown as HTMLElement | null;
      if (!root || typeof root.addEventListener !== "function") return;
      const prevent = (event: Event) => event.preventDefault();
      root.addEventListener("submit", prevent);
      return () => root.removeEventListener("submit", prevent);
    }, []);

    useEffect(() => {
      if (!enterActive || typeof document === "undefined") return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter" || disabledRef.current || event.defaultPrevented
          || event.isComposing || event.keyCode === 229) return;
        const target = event.target as HTMLElement | null;
        if (!target || target.tagName !== "INPUT") return;
        const scope = (target as { closest?: (selector: string) => HTMLElement | null }).closest?.("form");
        if (!scope || scope.getAttribute("id") !== formId) return;
        // Capture runs before TextInput's onKeyPress. An expanded combobox with
        // an active suggestion owns Enter for selection; its handler prevents
        // the input's submit/blur default once it has selected that option.
        if (target.getAttribute("role") === "combobox"
          && target.getAttribute("aria-expanded") === "true"
          && target.getAttribute("aria-activedescendant")) return;
        event.preventDefault();
        // A held selection key can repeat after the combobox closes. It must
        // not become a form submission until the user presses Enter again.
        if (event.repeat) return;
        submitRef.current?.();
      };
      document.addEventListener("keydown", onKeyDown, true);
      return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [enterActive, formId]);

    return (
      <View ref={rootRef} nativeID={formId} testID={testID} role={FORM} {...nameProps} style={[skin.stack, disabled ? { opacity: skin.disabledOpacity } : null, fill, style]}>
        {rows}
        {actions}
      </View>
    );
  };
}
