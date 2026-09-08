import { useEffect, useLayoutEffect } from "react";
import { Platform } from "react-native";

// React 18 warns when useLayoutEffect is called during SSR, even if its callback
// returns early. Native has no document either, but still needs commit-time work.
export const useIsomorphicLayoutEffect = Platform.OS === "web" && typeof document === "undefined"
  ? useEffect
  : useLayoutEffect;
