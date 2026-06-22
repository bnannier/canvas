import { createAccordion } from "./accordion.shared.js";
import { webSkin } from "./accordion.styles.js";

// Web Accordion (the base; Metro falls back to it on native, web bundlers resolve it).
export const Accordion = createAccordion(webSkin);
export type { AccordionProps, AccordionItem } from "./accordion.shared.js";
