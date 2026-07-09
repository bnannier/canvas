import { createEmptyState } from "./empty-state.shared.js";
import { androidSkin } from "./empty-state.styles.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";

// Material 3 EmptyState. Metro resolves this file on Android; the docs import it for
// preview. The action Button is passed as its Android-skinned atom so the WEB docs
// 3-up shows the M3 filled pill in the Android row (a barrel import would resolve the
// web atom there); on a real device Metro resolves the right extension regardless.
export const EmptyState = createEmptyState(androidSkin, ButtonAndroid);
export type { EmptyStateProps } from "./empty-state.shared.js";
