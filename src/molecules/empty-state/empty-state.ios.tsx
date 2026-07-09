import { createEmptyState } from "./empty-state.shared.js";
import { iosSkin } from "./empty-state.styles.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";

// iOS (HIG) EmptyState. Metro resolves this file on iOS; the docs import it for
// preview. The action Button is passed as its iOS-skinned atom so the WEB docs 3-up
// shows the iOS button in the iOS row (a barrel import would resolve the web atom
// there); on a real device Metro resolves the right extension regardless.
export const EmptyState = createEmptyState(iosSkin, ButtonIOS);
export type { EmptyStateProps } from "./empty-state.shared.js";
