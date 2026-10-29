import { type ReactNode } from "react";
import { ScrollView, View, useContainerWidth, widths } from "../../style/index.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Row } from "../../atoms/layout/layout.js";
import { Typography } from "../../atoms/typography/typography.js";
import { Dialog as WebDialog } from "../dialog/dialog.js";
import { Steps as WebSteps, type Step } from "../steps/steps.js";
import * as s from "./wizard.styles.js";

export interface WizardProps {
  /** Controlled modal visibility. */
  open: boolean;
  /** Names the modal and its fixed header. */
  title: string;
  /** Supporting text below the title. */
  description?: string;
  /** Ordered stages; the application owns their content and transitions. */
  steps: Step[];
  /** Zero-based active stage; earlier stages read as complete. */
  current: number;
  /** Called when the close action, Escape or native back requests dismissal. */
  onOpenChange: (open: boolean) => void;
  /** Maximum panel width; defaults to the width scale's xxl step (672, the step nearest
   *  the hand-off's 700) and shrinks to the available viewport. */
  panelWidth?: number;
  /** Named previous stage action, before the application actions at the footer's end. */
  previous?: { label: string; onPress: () => void; disabled?: boolean };
  /** Application actions at the footer's end. */
  actions?: ReactNode;
  /** Save/progress status at the footer's start; above the button row when space is narrow. */
  status?: string;
  children?: ReactNode;
  /** Scroll the body (default true). Set false when a child, such as Chat, owns its scroll. */
  scrollBody?: boolean;
  /**
   * Show the open wizard as a non-modal specimen, for a catalogue or a showcase: it keeps
   * its look, its dialog role and its labelling, but does not take focus, trap Tab,
   * claim `aria-modal`, or close on Escape or native back. It renders in place, in the
   * flow of the page, as Dialog's contained form does, rather than presenting into an
   * OverlayProvider.
   */
  embedded?: boolean;
  /** Prefix for modal, steps, body-scroll and footer test hooks. */
  testID?: string;
}

type WizardParts = { Dialog: typeof WebDialog; Steps: typeof WebSteps; Button: typeof WebButton };

/** A wizard delegates modal behavior and platform controls to their existing components. */
export function createWizard(skin: s.WizardSkin, { Dialog = WebDialog, Steps = WebSteps, Button = WebButton }: Partial<WizardParts> = {}) {
  return function Wizard({ open, title, description, steps, current, onOpenChange, panelWidth = widths.xxl, previous, actions, status, children, scrollBody = true, embedded, testID }: WizardProps) {
    const hook = (part: string) => testID ? `${testID}-${part}` : undefined;
    const { width, onLayout } = useContainerWidth();
    // The footer stacks its status over the buttons only when the row cannot hold the status,
    // Back and the actions side by side: under the narrowest step of the width scale.
    const narrowFooter = width < widths.xs;
    // The hand-off's status: 12px mono meta in the third ink, on the face's own line.
    const saveStatus = status ? <Typography caption mono muted natural>{status}</Typography> : null;
    // A specimen is the Dialog's contained form, in the flow of the page that shows it,
    // hugging its stage; a live wizard teleports into the nearest OverlayProvider and fills it.
    // The panel is banded (the header with the segmented steps over its rule, the body, the
    // footer under its rule), and the footer reads status first, then Back and the
    // application actions together at its end.
    return <Dialog form workspace banded overlay={!embedded} compact={embedded} embedded={embedded} open={open} title={title} description={description}
      panelWidth={panelWidth} onOpenChange={onOpenChange} testID={testID}
      workspaceHeader={<Steps segmented steps={steps} current={current} testID={hook("steps")} />}
      footer={<View onLayout={onLayout} testID={hook("footer")} style={skin.footer}>
        {narrowFooter && status ? <Row>{saveStatus}</Row> : null}
        <Row alignCenter snug testID={hook("footer-buttons")}>
          {!narrowFooter && status ? <Row fill start alignCenter>{saveStatus}</Row> : <Row fill />}
          {previous ? <Button shrink ghost disabled={previous.disabled} onPress={previous.onPress}>{previous.label}</Button> : null}
          {actions}
        </Row>
      </View>}>
      {scrollBody ? <ScrollView testID={hook("body-scroll")} style={s.bodyScroll} contentContainerStyle={skin.bodyContent} keyboardShouldPersistTaps="handled">{children}</ScrollView> : children}
    </Dialog>;
  };
}
