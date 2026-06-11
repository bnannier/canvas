import { createCalendar } from "./calendar.shared.js";
import { iosSkin } from "./calendar.styles.js";

// iOS (HIG date picker) Calendar. Metro resolves this file on iOS; the docs import it for preview.
export const Calendar = createCalendar(iosSkin);
export type { CalendarProps } from "./calendar.shared.js";
