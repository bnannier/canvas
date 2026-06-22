import { createToastSystem } from "./toast.shared.js";
import { webSkin } from "./toast.styles.js";

// Web Toast system (the base; Metro falls back to it on native, web bundlers resolve it).
export const { Toast, ToastProvider, useToast } = createToastSystem(webSkin);
export type { ToastProps, ToastOptions, ToastAction, ToastHandle } from "./toast.shared.js";
