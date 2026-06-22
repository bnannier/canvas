import { createToastSystem } from "./toast.shared.js";
import { androidSkin } from "./toast.styles.js";

// Material 3 Toast system. Metro resolves this file on Android; the docs import it for preview.
export const { Toast, ToastProvider, useToast } = createToastSystem(androidSkin);
export type { ToastProps, ToastOptions, ToastAction, ToastHandle } from "./toast.shared.js";
