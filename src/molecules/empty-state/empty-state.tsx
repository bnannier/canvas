import { createEmptyState } from "./empty-state.shared.js";
import { webSkin } from "./empty-state.styles.js";
import { Button } from "../../atoms/button/button.js";

// Web EmptyState (the base; Metro falls back to it on native, web bundlers resolve it).
// The default web-base Button is correct here.
export const EmptyState = createEmptyState(webSkin, Button);
export type { EmptyStateProps } from "./empty-state.shared.js";
