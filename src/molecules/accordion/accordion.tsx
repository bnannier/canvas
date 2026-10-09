import { createAccordion } from "./accordion.shared.js";
import { webSkin } from "./accordion.styles.js";

// Web Accordion (the base; Metro falls back to it on native, web bundlers resolve it).
/** A vertical stack of collapsible disclosure panels. */
export const Accordion = createAccordion(webSkin);
export type { AccordionProps, AccordionItem } from "./accordion.shared.js";
