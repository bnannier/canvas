import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useMemo,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import { View, Text, useTheme, LabelContent, labelA11y, requiredName, type LayoutStyle, type MeasureProps, type ViewStyle, useFillStyle } from "../../style/index.js";
import { Icon } from "../../atoms/icon/icon.js";
import { AnatomyPart, AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";
import { DelegatedPartsContext } from "../../atoms/input/delegated-parts.js";
import { type FieldSkin } from "./field.styles.js";

// Shared Field shell. A form row: a label, the control, and one message line under it.
//
// Field exists for the part no control owns on its own — the message. Every field family already
// owns its label (that is the "components own their label anatomy" rule, and it is what lets
// Android float the label inside the box), but nothing in the kit renders the helper or the error
// text, so callers were hand-stacking a Text under an Input and drifting on type and color.
//
// The load-bearing behavior is LABEL DELEGATION. When the single child is a control that owns its
// own label anatomy, Field hands the label DOWN rather than drawing one beside it, so each platform
// still places it per its own contract: a static title above on web and iOS, the Material 3
// in-container floating label on Android. A label rendered next to such a control could never
// float, which is exactly the Android divergence this avoids. Any other child (a Switch, a group)
// keeps the static label above, because those do not own a label slot of that kind.

export interface FieldProps extends MeasureProps {
  /**
   * Row label. When the lone child is a field-family control (Input, Textarea, Select,
   * Autocomplete, PhoneInput) that carries no `label` of its own, the label is delegated into
   * that control so each platform places it per its own contract. Validation and descriptions
   * reach that single control even when it owns its label or Field has no label.
   */
  label?: string;
  /** Muted hint under the control. Replaced by `error` when that is set. */
  helper?: string;
  /**
   * Error text. Setting it puts the row in the error state: the message turns destructive and
   * replaces `helper` in place, so the row never changes height and nothing below it jumps.
   */
  error?: string;
  /**
   * Marks the label with a destructive asterisk (decorative, never in an accessible name). A
   * delegated control takes `required` and announces itself as required; over any other
   * control, the label says it in its own name
   * <!-- only: web -->
   * on iOS and Android
   * <!-- /only -->
   * ("Notifications, required").
   */
  required?: boolean;
  /** The control. */
  children?: ReactNode;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

/** The props Field delegates into a label-owning control. */
interface Delegable {
  label?: string;
  required?: boolean;
  error?: boolean;
  "aria-describedby"?: string;
  accessibilityHint?: string;
}

// The message row: the optional glyph centred on the text's line, the text taking the rest.
const MESSAGE_ROW: ViewStyle = { flexDirection: "row", alignItems: "center" };
const MESSAGE_TEXT = { flexShrink: 1 } as const;

export function createField(skin: FieldSkin, labelOwners: ComponentType<never>[]) {
  function Field(props: FieldProps) {
    const { label, helper, error, required, children, testID, style } = props;
    const { tokens } = useTheme();
    // FILL: the labeled field spans the parent it is given.
    const fill = useFillStyle("Field", props);

    // One id for the message, so a delegated control can point at it. The hand-off's Field skips
    // this wiring; a screen reader should hear the hint with the field, so the kit does it.
    const messageId = `${useId()}-message`;

    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Label, Control, Helper or error, Required mark, taken before the tree's
    // AnatomyScope so the control's own parts (an Input's Label and Field) register
    // nothing. A delegated control draws the label, its star and the box, so it takes
    // Field's Label, Required mark and Control with the label (atoms/input/delegated-parts.ts).
    const labelPart = useAnatomyPart("Label");
    const controlPart = useAnatomyPart("Control");
    const messagePart = useAnatomyPart("Helper or error");
    const requiredPart = useAnatomyPart("Required mark");
    const delegatedParts = useMemo(
      () => (labelPart || controlPart || requiredPart ? { label: labelPart, control: controlPart, required: requiredPart } : null),
      [labelPart, controlPart, requiredPart],
    );

    const isError = !!error;
    const message = isError ? error : helper;

    // Validation and descriptions belong to a recognized single control independently of
    // who supplies its label. Preserve the child's explicit state and native hint.
    const kids = Children.toArray(children);
    const only = kids.length === 1 && isValidElement(kids[0]) ? (kids[0] as ReactElement<Delegable>) : null;
    const fieldChild = only != null && labelOwners.includes(only.type as ComponentType<never>) ? only : null;
    const delegate = label != null && fieldChild != null && fieldChild.props.label == null;
    const hasMessage = message != null && message !== "";
    const describedBy = fieldChild ? [...new Set([
      ...(fieldChild.props["aria-describedby"]?.split(/\s+/).filter(Boolean) ?? []),
      ...(hasMessage ? [messageId] : []),
    ])].join(" ") || undefined : undefined;

    // Pass the state as well as the message, so the control exposes validation to
    // assistive technology and uses its own error visuals where its skin supports them.
    const wired = fieldChild ? cloneElement(fieldChild, {
      ...(delegate ? { label } : {}),
      required: fieldChild.props.required ?? required,
      error: fieldChild.props.error ?? isError,
      "aria-describedby": describedBy,
      accessibilityHint: fieldChild.props.accessibilityHint ?? (hasMessage ? message : undefined),
    }) : children;
    const control = delegate ? (
      <DelegatedPartsContext.Provider value={delegatedParts}>
        {wired}
      </DelegatedPartsContext.Provider>
    ) : (
      <AnatomyPart part={controlPart}>{wired}</AnatomyPart>
    );

    // The message line: an errored one leads with the skin's alert glyph (the web's), in
    // the message's own ink, and under a delegated filled field it keeps the skin's inset.
    const messageStyle = skin.message(tokens, isError);
    const glyph = isError ? skin.errorGlyph : undefined;

    return (
      <AnatomyScope>
      <View testID={testID} style={[skin.stack, fill, style]}>
        {label != null && !delegate ? (
          // The label heads a control that names itself, so it stays a stop of its own
          // natively, named without its star (labelA11y). Field hands that control no
          // label anatomy, so the heading's native name says when it is required.
          <Text ref={labelPart?.ref} onLayout={labelPart?.onLayout} style={skin.label(tokens)} {...labelA11y(requiredName(label, required), false)}>
            <LabelContent label={label} required={required} starColor={tokens.destructive} starPart={requiredPart} />
          </Text>
        ) : null}
        {control}
        {message != null && message !== "" ? (
          <View ref={messagePart?.ref} onLayout={messagePart?.onLayout} style={[MESSAGE_ROW, glyph ? { gap: glyph.gap } : null, delegate && skin.delegatedInset ? { paddingHorizontal: skin.delegatedInset } : null]}>
            {glyph ? <Icon circleAlert color={messageStyle.color as string} size={glyph.size} decorative /> : null}
            <Text
              nativeID={messageId}
              accessibilityRole={isError ? "alert" : undefined}
              role={isError ? "alert" : undefined}
              style={[messageStyle, MESSAGE_TEXT]}
            >
              {message}
            </Text>
          </View>
        ) : null}
      </View>
      </AnatomyScope>
    );
  }

  Field.displayName = "Field";
  return Field;
}
