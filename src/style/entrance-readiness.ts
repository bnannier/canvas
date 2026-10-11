import { createContext } from "react";

/**
 * Whether every enclosing Entrance has released its card. A held ancestor must not
 * announce ready descendants: a card's focus entry waits while it is false, and an
 * Entrance holds its own card too, so a card hosted in the outlet waits for its logical
 * ancestor (usePortalMount relays this context across the portal).
 */
export const EntranceReadinessContext = createContext(true);
