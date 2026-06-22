import { createAccordion } from "./accordion.shared.js";
import { iosSkin } from "./accordion.styles.js";

// iOS (HIG inset-grouped disclosure / SwiftUI DisclosureGroup) Accordion. Metro
// resolves this file on iOS; the docs import it for preview.
export const Accordion = createAccordion(iosSkin);
export type { AccordionProps, AccordionItem } from "./accordion.shared.js";
