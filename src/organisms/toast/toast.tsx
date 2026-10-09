import { createToastSystem } from "./toast.shared.js";
import { webSkin } from "./toast.styles.js";

// Web Toast system (the base; Metro falls back to it on native, web bundlers resolve it).
// One build, exported member by member so each carries its own summary (a destructured
// export reaches the published declarations without one).
const toast = createToastSystem(webSkin);
/**
 * A transient notification capsule. Render it directly, or show one through useToast
 * inside a ToastProvider.
 */
export const Toast = toast.Toast;
/** Hosts the toasts that useToast shows for everything inside it. */
export const ToastProvider = toast.ToastProvider;
/** Shows and dismisses toasts from inside a ToastProvider. */
export const useToast = toast.useToast;
export type { ToastProps, ToastOptions, ToastAction, ToastHandle } from "./toast.shared.js";
