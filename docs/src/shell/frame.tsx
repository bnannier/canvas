import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { Dimensions } from "react-native";
import { SHELL } from "./page-look";

// The web shell's frame, shared by the shell (./navbar.tsx) and the page (../ui/page.tsx):
// whether the rail stands beside the page, so the page's content clears it. The frame's
// gutter needs no number here: the rail and the content both sit in a column capped at
// the hand-off's 1440 px frame and centred, so the gutter is the browser's arithmetic.
// Native screens have no rail; outside the web shell the context reads no rail.

interface ShellFrame {
  /** The rail stands at the frame's start edge. */
  rail: boolean;
  /** Scroll clearance for the floating mobile tabs, including their safe-area space. */
  bottom: number;
}

const Ctx = createContext<ShellFrame>({ rail: false, bottom: 0 });

export function ShellFrameProvider({ rail, bottom = 0, children }: { rail: boolean; bottom?: number; children: ReactNode }) {
  const value = useMemo(() => ({ rail, bottom }), [rail, bottom]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The web shell's frame (no rail outside the shell). */
export function useShellFrame(): ShellFrame {
  return useContext(Ctx);
}

/** The content's start inset where the rail stands: the rail and its gap (S9). */
export const RAIL_INSET = SHELL.railWidth + SHELL.railGap;

// Whether the window is wide enough for the rail: the hand-off's own cut (S9, a window of
// 760 px or more), a window-level read because the rail is window chrome. The server and
// the hydration render cannot measure a window, so both assume a wide one; a narrower
// window drops the rail on the next frame, and until the bundle runs the document root's
// pre-hydration rule hides it there (docs/src/app/+html.tsx). One Dimensions listener per
// subscriber, re-rendering only when the answer flips.
function subscribe(onChange: () => void): () => void {
  const subscription = Dimensions.addEventListener("change", onChange);
  return () => subscription.remove();
}
const fitsNow = () => Dimensions.get("window").width >= SHELL.railMinWidth;
const fitsOnServer = () => true;

export function useRailFits(): boolean {
  return useSyncExternalStore(subscribe, fitsNow, fitsOnServer);
}
