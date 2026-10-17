import { type ReactNode } from "react";
import { ScrollView, View, breakpoints, useContainerWidth } from "../../style/index.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Icon } from "../../atoms/icon/icon.js";
import { Row, Column } from "../../atoms/layout/layout.js";
import { Divider } from "../../atoms/divider/divider.js";
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
  /** Maximum panel width; defaults to 960 and shrinks to the available viewport. */
  panelWidth?: number;
  /** Named previous stage action in the left footer cell. */
  previous?: { label: string; onPress: () => void; disabled?: boolean };
  /** Application actions in the right footer cell. */
  actions?: ReactNode;
  /** Centered save/progress status; above the button row when space is narrow. */
  status?: string;
  children?: ReactNode;
  /** Scroll the body (default true). Set false when a child, such as Chat, owns its scroll. */
  scrollBody?: boolean;
  /** Prefix for modal, steps, body-scroll and footer test hooks. */
  testID?: string;
}

type WizardParts = { Dialog: typeof WebDialog; Steps: typeof WebSteps; Button: typeof WebButton };

/** A wizard delegates modal behavior and platform controls to their existing components. */
export function createWizard({ Dialog = WebDialog, Steps = WebSteps, Button = WebButton }: Partial<WizardParts> = {}) {
  return function Wizard({ open, title, description, steps, current, onOpenChange, panelWidth = 960, previous, actions, status, children, scrollBody = true, testID }: WizardProps) {
    const hook = (part: string) => testID ? `${testID}-${part}` : undefined;
    const { width, onLayout } = useContainerWidth();
    const narrowFooter = width <= breakpoints.sm;
    const saveStatus = status ? <Typography small muted>{status}</Typography> : null;
    return <Dialog form workspace overlay open={open} title={title} description={description}
      panelWidth={panelWidth} onOpenChange={onOpenChange} testID={testID}
      workspaceHeader={<Steps stacks steps={steps} current={current} testID={hook("steps")} />}
      footer={<Column comfortable><Divider /><View onLayout={onLayout} testID={hook("footer")} style={s.footer}>
        {narrowFooter && status ? <Row center>{saveStatus}</Row> : null}
        <Row alignCenter testID={hook("footer-buttons")}>
          <Row fill start>{previous ? <Button shrink outline iconLeft={<Icon chevronLeft decorative size={14} />} disabled={previous.disabled} onPress={previous.onPress}>{previous.label}</Button> : null}</Row>
          {!narrowFooter && status ? <Row center alignCenter>{saveStatus}</Row> : null}
          <Row fill end>{actions}</Row>
        </Row>
      </View></Column>}>
      {scrollBody ? <ScrollView testID={hook("body-scroll")} style={s.bodyScroll} contentContainerStyle={s.bodyContent} keyboardShouldPersistTaps="handled">{children}</ScrollView> : children}
    </Dialog>;
  };
}
