import { createContext, useContext, type ComponentType, type RefObject } from "react";
import type { ScrollView, View } from "react-native";

// What the component audit's native driver (driver.native.tsx) needs to know about the
// screen it is photographing, published by the screens themselves: the Playground its
// preview card and the example the card shows, the page frame its scroller, a pattern
// or template page that it is the page on screen. The default is null and only the
// audit build provides a probe, so in every other build each registration is a no-op
// and the sensor below is never rendered. This module is the one piece of the audit
// that ships everywhere, and it imports nothing from the driver
// (tools/docs/audit-driver-bundle.test.ts holds both).

export interface ProbeCard {
  ref: RefObject<View | null>;
  /** The selected example's label, as the markdown spells it. */
  label: string;
}

export interface ProbeScroller {
  ref: RefObject<ScrollView | null>;
}

export interface ProbePage {
  /** The page's name, its H1. */
  name: string;
  /** The route the page was rendered for. */
  path: string;
  sections: string[];
}

export interface AuditProbe {
  /** Registers the preview card; the returned function unregisters it. */
  card(entry: ProbeCard): () => void;
  /** Registers the page frame's scroller; the returned function unregisters it. */
  scroller(entry: ProbeScroller): () => void;
  /** Registers a pattern or template page; the returned function unregisters it. */
  page(entry: ProbePage): () => void;
  /**
   * Rendered by the page frame over its scroller: reports the band of the window that no
   * navigation or tab bar covers, which only a view inside the screen can know.
   */
  Sensor: ComponentType;
}

export const AuditProbeContext = createContext<AuditProbe | null>(null);

/** The audit probe, or null outside the audit build. */
export function useAuditProbe(): AuditProbe | null {
  return useContext(AuditProbeContext);
}
