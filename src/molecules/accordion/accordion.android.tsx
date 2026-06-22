import { createAccordion } from "./accordion.shared.js";
import { androidSkin } from "./accordion.styles.js";

// Material 3 (expandable list rows) Accordion. Metro resolves this file on
// Android; the docs import it for preview.
export const Accordion = createAccordion(androidSkin);
export type { AccordionProps, AccordionItem } from "./accordion.shared.js";
