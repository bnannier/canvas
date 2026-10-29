import { createContext, useContext, type ReactNode } from "react";

// The label ink a control hands the glyphs in its label. The v4 hand-off's controls set
// one colour on their root and draw their label and their icons in it (`K.btn` in
// tools/v4/handoff/cv-kit.js: `background:'+bg+';color:'+fg+'`, with `<cv-icon>`
// "painted with currentColor", tools/v4/handoff/canvas-assets.js), so a glyph in a
// primary button is the primary's contrast ink, in a quiet one the muted ink, in a link
// the link ink. React Native has no currentColor: a control that owns a label ink
// provides it here, around the slots a caller fills with an Icon, and Icon reads the
// nearest one when it carries no colour of its own (src/atoms/icon/icon.shared.tsx
// `strokeOf`: an explicit tone or `color` first, then this ink, then the foreground).
//
// Outside a provider the read is one context lookup answering undefined, so an Icon on
// the page keeps the foreground it always had. A provider never overrides an explicit
// tone: `<Icon trash destructive />` inside any button stays destructive.

const InkContext = createContext<string | undefined>(undefined);

/** The label ink of the nearest control that provides one, undefined on the page. */
export function useInk(): string | undefined {
  return useContext(InkContext);
}

export interface InkProviderProps {
  /** The host's resolved label ink for its current intent and state; undefined hands the glyphs back to the foreground. */
  ink: string | undefined;
  children?: ReactNode;
}

/** Hands the glyphs inside it the host control's label ink (Button around its icon slots). */
export function InkProvider({ ink, children }: InkProviderProps) {
  return <InkContext.Provider value={ink}>{children}</InkContext.Provider>;
}
