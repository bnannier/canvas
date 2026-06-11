import { createCalendar } from "./calendar.shared.js";
import { androidSkin } from "./calendar.styles.js";

// Material 3 date picker Calendar. Metro resolves this file on Android; the docs import it for preview.
export const Calendar = createCalendar(androidSkin);
export type { CalendarProps } from "./calendar.shared.js";
