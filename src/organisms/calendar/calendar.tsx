import { createCalendar } from "./calendar.shared.js";
import { webSkin } from "./calendar.styles.js";

// Web Calendar (the base; Metro falls back to it on native, web bundlers resolve it).
export const Calendar = createCalendar(webSkin);
export type { CalendarProps } from "./calendar.shared.js";
