import { createToastSystem } from "./toast.shared.js";
import { iosSkin } from "./toast.styles.js";

// iOS (HIG) Toast system. Metro resolves this file on iOS; the docs import it for preview.
export const { Toast, ToastProvider, useToast } = createToastSystem(iosSkin);
export type { ToastProps, ToastOptions, ToastAction, ToastHandle } from "./toast.shared.js";
