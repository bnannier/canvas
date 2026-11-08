import { type ReactNode, useState } from "react";
import { ScrollView, View, ThemeProvider, useTheme, useContainerWidth } from "../../style/index.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Typography } from "../../atoms/typography/typography.js";
import { Dialog as WebDialog } from "../dialog/dialog.js";
import { DialogPanelPart } from "../dialog/dialog.shared.js";
import { AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";
import { Steps as WebSteps, type Step } from "../steps/steps.js";
import * as s from "./wizard.styles.js";
import { webTypography, type WizardTypography } from "./wizard.typography.js";

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
  /** Maximum panel width; defaults to the hand-off's 620px and shrinks to its parent. */
  panelWidth?: number;
  /** Named previous stage action at the footer's start. */
  previous?: { label: string; onPress: () => void; disabled?: boolean };
  /** Application actions at the footer's end. */
  actions?: ReactNode;
  /** Save/progress status beside the title in the fixed header. */
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
  /**
   * Lay the wizard out like a desktop assistant's window (the Claude desktop window,
   * reference claude-desktop-chat): the steps as sidebar rows down the panel's full height,
   * a 44 px top bar with the title, the status, `previous` and `actions`, and no footer
   * band. The body is unpadded so a `flush` Chat fills it; a scrolled body centers its
   * content in the conversation's column. The description is not drawn.
   */
  assistant?: boolean;
  /** Prefix for modal, steps, body-scroll and footer test hooks. */
  testID?: string;
}

type WizardParts = { Dialog: typeof WebDialog; Steps: typeof WebSteps; Button: typeof WebButton };

/** A wizard delegates modal behavior and platform controls to their existing components. */
export function createWizard(skin: s.WizardSkin, { Dialog = WebDialog, Steps = WebSteps, Button = WebButton }: Partial<WizardParts> = {}, typography: WizardTypography = webTypography) {
  return function Wizard({ open, title, description, steps, current, onOpenChange, panelWidth = 620, previous, actions, status, children, scrollBody = true, embedded, assistant, testID }: WizardProps) {
    const hook = (part: string) => testID ? `${testID}-${part}` : undefined;
    const theme = useTheme();
    const { tokens } = theme;
    // The footer spans the panel, so its width says whether the step rail and a usable
    // body fit side by side; on a narrower panel (a phone) the steps become segmented
    // bars in the header and the body takes the full width.
    const panelWidthNow = useContainerWidth();
    const narrow = panelWidthNow.width > 0 && panelWidthNow.width < s.RAIL_MINIMUM_PANEL;
    const bodyBounds = [s.bodyScroll, { minWidth: narrow ? 0 : typography.bodyMinimum }];
    // The assistant layout measures its body, which the rail narrows while it shows, so the
    // panel's width is the body's plus the rail's; that keeps the switch from flapping.
    const [assistantPanel, setAssistantPanel] = useState(0);
    const assistantNarrow = assistantPanel > 0 && assistantPanel < s.ASSISTANT_MINIMUM_PANEL;
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Panel, Steps, Body, Footer actions. Taken before the tree's
    // AnatomyScope so the Dialog, Steps and Buttons register nothing of their own; the
    // Panel is the Dialog's card, which the Dialog registers through DialogPanelPart.
    const panelPart = useAnatomyPart("Panel");
    const stepsPart = useAnatomyPart("Steps");
    const bodyPart = useAnatomyPart("Body");
    const footerPart = useAnatomyPart("Footer actions");
    const saveStatus = status ? assistant ? <Typography caption subtle natural>{status}</Typography> : <Typography caption mono subtle natural>{status}</Typography> : null;
    // A specimen is the Dialog's contained form, in the flow of the page that shows it,
    // hugging its stage; a live wizard teleports into the nearest OverlayProvider and fills it.
    // The panel follows K.def('wizard'): title/status, a fixed short step rail beside
    // the scrolling content, and opposite ends of the footer for Back and the actions.
    if (assistant) {
      const rail = assistantNarrow ? undefined : <View ref={stepsPart?.ref} onLayout={stepsPart?.onLayout} style={[s.assistantRail, { backgroundColor: tokens.muted, borderColor: tokens.border }]}>
        <Steps vertical rows steps={steps} current={current} testID={hook("steps")} />
      </View>;
      const topActions = <View ref={footerPart?.ref} onLayout={footerPart?.onLayout} testID={hook("footer")} style={s.assistantActions}>
        {previous ? <Button shrink ghost small disabled={previous.disabled} onPress={previous.onPress}>{previous.label}</Button> : null}
        <View testID={hook("footer-buttons")} style={s.assistantActions}>{actions}</View>
      </View>;
      const body = scrollBody
        ? <ScrollView ref={bodyPart?.ref} onLayout={bodyPart?.onLayout} testID={hook("body-scroll")} style={s.bodyScroll} contentContainerStyle={assistantNarrow ? s.assistantColumnNarrow : s.assistantColumn} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        : <View ref={bodyPart?.ref} onLayout={bodyPart?.onLayout} style={s.bodyScroll}>{children}</View>;
      const windowed = <Dialog form workspace banded toolbar overlay={!embedded} compact={embedded} embedded={embedded} open={open} title={title} description={description}
        panelWidth={panelWidth} onOpenChange={onOpenChange} testID={testID} headerAccessory={saveStatus} headerActions={topActions}
        workspaceHeader={assistantNarrow ? <View style={s.headerSteps}><Steps segmented steps={steps} current={current} testID={hook("steps")} /></View> : undefined}
        workspaceSidebar={rail}>
        <View style={s.bodyScroll} onLayout={(event) => {
          const next = Math.round(event.nativeEvent.layout.width + (rail ? s.ASSISTANT_RAIL + 1 : 0));
          if (next !== assistantPanel) setAssistantPanel(next);
        }}>{body}</View>
      </Dialog>;
      const scopedWindow = <AnatomyScope><DialogPanelPart.Provider value={panelPart}>{windowed}</DialogPanelPart.Provider></AnatomyScope>;
      return typography.fonts ? <ThemeProvider scheme={theme.scheme} surface={theme.surface} cyan={theme.palette === "cyan"} mint={theme.palette === "mint"} rose={theme.palette === "rose"} amber={theme.palette === "amber"} tokens={tokens} fonts={{ ...theme.fonts, ...typography.fonts }}>{scopedWindow}</ThemeProvider> : scopedWindow;
    }
    const panel = <Dialog form workspace banded overlay={!embedded} compact={embedded} embedded={embedded} open={open} title={title} description={description}
      panelWidth={panelWidth} onOpenChange={onOpenChange} testID={testID}
      headerAccessory={saveStatus}
      workspaceHeader={narrow ? <View ref={stepsPart?.ref} onLayout={stepsPart?.onLayout} style={s.headerSteps}>
        <Steps segmented steps={steps} current={current} testID={hook("steps")} />
      </View> : undefined}
      workspaceSidebar={narrow ? undefined : <View ref={stepsPart?.ref} onLayout={stepsPart?.onLayout} style={[skin.sidebar, { borderColor: tokens.border }]}>
        <Steps vertical compact steps={steps} current={current} testID={hook("steps")} />
      </View>}
      footer={<View ref={footerPart?.ref} onLayout={(event) => { footerPart?.onLayout?.(); panelWidthNow.onLayout(event); }} testID={hook("footer")} style={skin.footer}>
          {previous ? <Button shrink ghost disabled={previous.disabled} onPress={previous.onPress}>{previous.label}</Button> : null}
          <View testID={hook("footer-buttons")} style={s.actions}>{actions}</View>
      </View>}>
      {scrollBody ? <ScrollView ref={bodyPart?.ref} onLayout={bodyPart?.onLayout} testID={hook("body-scroll")} style={bodyBounds} contentContainerStyle={[skin.bodyContent, narrow ? s.dialogPadsBody : null]} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View ref={bodyPart?.ref} onLayout={bodyPart?.onLayout} style={[bodyBounds, skin.bodyContent, narrow ? s.dialogPadsBody : null]}>{children}</View>}
    </Dialog>;
    const scoped = <AnatomyScope><DialogPanelPart.Provider value={panelPart}>{panel}</DialogPanelPart.Provider></AnatomyScope>;
    return typography.fonts ? <ThemeProvider scheme={theme.scheme} surface={theme.surface} cyan={theme.palette === "cyan"} mint={theme.palette === "mint"} rose={theme.palette === "rose"} amber={theme.palette === "amber"} tokens={tokens} fonts={{ ...theme.fonts, ...typography.fonts }}>{scoped}</ThemeProvider> : scoped;
  };
}
