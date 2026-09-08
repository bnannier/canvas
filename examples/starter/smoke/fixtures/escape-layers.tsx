import { useState } from "react";
import {
  ActionSheet, Autocomplete, Column, Command, DataTable, DescriptionList,
  Dialog, Drawer, Dropdown, Typography,
} from "@nannier-com/canvas";

export function EscapeLayersBody({ scenario }: { scenario?: string }) {
  const initiallyOpen = scenario === "initial";
  const [dialogOpen, setDialogOpen] = useState(initiallyOpen);
  const [menuOpen, setMenuOpen] = useState(initiallyOpen);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [parentCloses, setParentCloses] = useState(0);
  const [childCloses, setChildCloses] = useState(0);
  const [queryChanges, setQueryChanges] = useState(0);
  const [commits, setCommits] = useState(0);
  const menu = (
    <Dropdown trigger="Open menu" items={[{ label: "Rename" }, { label: "Archive" }]}
      open={menuOpen} onOpenChange={(next) => {
        setMenuOpen(next);
        if (!next) setChildCloses((count) => count + 1);
      }} />
  );

  return (
      <Column relaxed>
        <Typography testID="parent-close-count">{parentCloses}</Typography>
        <Typography testID="child-close-count">{childCloses}</Typography>
        <Typography testID="query-change-count">{queryChanges}</Typography>
        <Typography testID="commit-count">{commits}</Typography>
        {scenario === "drawer" ? (
          <Drawer trigger="Open drawer" open={drawerOpen} onOpenChange={(next) => {
            setDrawerOpen(next);
            if (!next) setParentCloses((count) => count + 1);
          }}>
            <Column relaxed>
              <Typography>Drawer content</Typography>
              {menu}
              <DataTable inlineEdit columns={[{ label: "Name" }]} rows={[["Alice"]]}
                onCellCommit={() => setCommits((count) => count + 1)} />
              <DescriptionList items={[{ term: "Email", value: "alice@example.com", update: true }]}
                onUpdate={() => setCommits((count) => count + 1)} />
              <ActionSheet trigger="Open actions" actions={[{ label: "Share", onPress: () => {} }]}
                onOpenChange={(next) => { if (!next) setChildCloses((count) => count + 1); }} />
            </Column>
          </Drawer>
        ) : (
          <Dialog overlay trigger="Open dialog" accessibilityLabel="Keyboard dialog" open={dialogOpen}
            onOpenChange={setDialogOpen} onCancel={() => setParentCloses((count) => count + 1)}>
            <Column relaxed>
              <Typography>Dialog content</Typography>
              {scenario === "autocomplete" ? (
                <Autocomplete label="Fruit" options={["Apple", "Apricot", "Banana"]}
                  onOpenChange={(next) => { if (!next) setChildCloses((count) => count + 1); }}
                  onQueryChange={() => setQueryChanges((count) => count + 1)} />
              ) : scenario === "command" ? (
                <Command trigger defaultOpen defaultQuery="missing" placeholder="Find a command"
                  groups={[{ items: [{ label: "Open file" }] }]}
                  onOpenChange={(next) => { if (!next) setChildCloses((count) => count + 1); }}
                  onQueryChange={() => setQueryChanges((count) => count + 1)} />
              ) : menu}
            </Column>
          </Dialog>
        )}
      </Column>
  );
}
