import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Command, type CommandGroup, type CommandItem } from "@olympusoss/canvas";
import { search } from "../core/data/search";

// Map the relevance-sorted results into category groups, preserving FIRST-SEEN order, so the
// best match's category leads and the best match is the first (pre-highlighted) row. Also
// returns a parallel flat list of paths in the same flat order the Command walks, so
// onSelect(item, index) resolves to a route (CommandItem carries no path).
export function buildSearchGroups(query: string): { groups: CommandGroup[]; paths: string[] } {
  const results = search(query);
  const order: string[] = [];
  const items = new Map<string, CommandItem[]>();
  const paths = new Map<string, string[]>();
  for (const r of results) {
    if (!items.has(r.category)) {
      items.set(r.category, []);
      paths.set(r.category, []);
      order.push(r.category);
    }
    items.get(r.category)!.push({ label: r.title, description: r.description });
    paths.get(r.category)!.push(r.path);
  }
  return {
    groups: order.map((cat) => ({ heading: cat, items: items.get(cat)! })),
    paths: order.flatMap((cat) => paths.get(cat)!),
  };
}

// The one docs search surface, built on the kit `Command`. INLINE (default) renders the
// palette full-screen for the native Search tab; `overlay` self-presents it as a responsive
// Modal (web cmd-K: a centered palette on desktop, a bottom sheet on mobile-web). Both are the
// same component fed by the same `search()` index.
export function DocsSearch({
  overlay,
  visible,
  onClose,
}: {
  overlay?: boolean;
  visible?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const { groups, paths } = useMemo(() => buildSearchGroups(query), [query]);

  const close = () => {
    setQuery("");
    onClose?.();
  };
  const go = (path: string) => {
    close();
    router.push(path as never);
  };

  return (
    <Command
      value={query}
      onValueChange={setQuery}
      autoFocus
      // The inline (native) search has no other entrance animation, so play the expand-from-icon
      // reveal there; the web overlay already animates in via its Modal.
      revealOnOpen={!overlay}
      placeholder="Search components, tokens, guides..."
      emptyLabel={query.trim() ? "No results found." : "Type to search components, tokens, and guides."}
      groups={groups}
      onSelect={(_item, i) => go(paths[i])}
      {...(overlay
        ? {
            overlay: true,
            open: visible ?? false,
            onOpenChange: (o: boolean) => {
              if (!o) close();
            },
            safeBottom: insets.bottom,
          }
        : { open: true })}
    />
  );
}
