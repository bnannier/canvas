import { useMemo, useState } from "react";
import { Command, Dialog, Drawer, useFormFactor, type CommandGroup, type CommandItem, type CommandProps } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { search } from "../core/data/search";

// Mount a new search session for each opening. Command owns navigation, option
// semantics and scrolling; the docs index owns matching and category order.
export function SearchModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return visible ? <SearchSession onClose={onClose} /> : null;
}

function SearchSession({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const formFactor = useFormFactor();
  // Keep the chosen host for this opening so a resize cannot replace the focused
  // field, lose its query or overwrite the overlay's original focus target.
  const [sheet] = useState(() => formFactor !== "desktop");
  const [query, setQuery] = useState("");
  const { groups, paths } = useMemo(() => {
    const categories = new Map<string, CommandItem[]>();
    const paths = new Map<CommandItem, string>();
    for (const entry of search(query)) {
      const item: CommandItem = { label: entry.title, description: entry.description };
      paths.set(item, entry.path);
      const items = categories.get(entry.category) ?? [];
      items.push(item);
      categories.set(entry.category, items);
    }
    const groups: CommandGroup[] = [...categories].map(([heading, items]) => ({ heading, items }));
    return { groups, paths };
  }, [query]);
  const onKeyPress: CommandProps["onKeyPress"] = (event) => {
    const native = event.nativeEvent as typeof event.nativeEvent & {
      metaKey?: boolean; ctrlKey?: boolean; isComposing?: boolean; keyCode?: number;
    };
    if (!native.isComposing && native.keyCode !== 229 && (native.metaKey || native.ctrlKey) && native.key.toLowerCase() === "k") {
      event.preventDefault();
      onClose();
    }
  };
  const command = (
    <Command embedded filtered autoFocus footer open
      placeholder="Search components..." accessibilityLabel="Search components"
      query={query} onQueryChange={setQuery} groups={groups} onKeyPress={onKeyPress}
      emptyMessage={query.trim() ? "No results found." : "Type to search components, tokens, and guides."}
      onSelect={(item) => {
        const path = paths.get(item);
        if (path == null) return;
        onClose();
        router.push(path as never);
      }}
    />
  );
  return sheet ? (
    <Drawer bottom open accessibilityLabel="Search components" onOpenChange={(open) => { if (!open) onClose(); }}>
      {command}
    </Drawer>
  ) : (
    <Dialog overlay dismissible large open accessibilityLabel="Search components" onOpenChange={(open) => { if (!open) onClose(); }}>
      {command}
    </Dialog>
  );
}
