import { useState } from "react";
import {
  ActionSheet, AlertDialog, Autocomplete, Column, Command, DataTable, DescriptionList,
  Dialog, Drawer, Dropdown, ThemeProvider, Typography, useTheme,
} from "@nannier-com/canvas";

function GatedAlertBody() {
  const [open, setOpen] = useState(false);
  const [cancellations, setCancellations] = useState(0);
  const [confirmations, setConfirmations] = useState(0);
  const [closes, setCloses] = useState(0);
  return (
    <Column relaxed>
      <Typography testID="alert-cancellations">Cancellations: {cancellations}</Typography>
      <Typography testID="alert-confirmations">Confirmations: {confirmations}</Typography>
      <Typography testID="alert-closes">Closes: {closes}</Typography>
      <AlertDialog overlay destructive withInput trigger="Open gated alert"
        title="Delete draft?" description="Type DELETE to confirm this sample action."
        confirmLabel="Delete draft" cancelLabel="Keep draft" open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setCloses((count) => count + 1);
        }}
        onCancel={() => setCancellations((count) => count + 1)}
        onConfirm={() => setConfirmations((count) => count + 1)} />
    </Column>
  );
}

function GlassMessagesBody() {
  const { scheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <ThemeProvider scheme={scheme} glass>
      <Column relaxed>
        <Dialog trigger="Open glass message dialog" title="Glass refund details"
          description="Check the refund amount and reason before continuing." withBody
          open={dialogOpen} onOpenChange={setDialogOpen}
          confirmLabel="Refund" cancelLabel="Cancel" />
        <ActionSheet trigger="Open glass message sheet" title="Glass sharing actions"
          message="Choose a sharing action for this document."
          open={sheetOpen} onOpenChange={setSheetOpen}
          actions={[{ label: "Copy document link", onPress: () => {} }]}
          cancelLabel="Close sheet" />
      </Column>
    </ThemeProvider>
  );
}

export function EscapeLayersBody({ scenario }: { scenario?: string }) {
  const initiallyOpen = scenario === "initial";
  const [dialogOpen, setDialogOpen] = useState(initiallyOpen);
  const [menuOpen, setMenuOpen] = useState(initiallyOpen);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [parentCloses, setParentCloses] = useState(0);
  const [childCloses, setChildCloses] = useState(0);
  const [queryChanges, setQueryChanges] = useState(0);
  const [commits, setCommits] = useState(0);
  const [menuSelected, setMenuSelected] = useState("None");
  const [menuSelections, setMenuSelections] = useState(0);
  if (scenario === "glass-messages") return <GlassMessagesBody />;
  if (scenario === "alert-gated") return <GatedAlertBody />;
  const menu = (
    <Dropdown trigger="Open menu" items={[{ label: "Rename" }, { label: "Archive", disabled: scenario === "drawer-disabled" }]}
      onSelect={(item) => {
        setMenuSelected(item.label);
        setMenuSelections((count) => count + 1);
      }}
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
        {scenario === "drawer" || scenario === "drawer-disabled" ? (
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
              <Typography small muted testID="menu-selected">Selected: {menuSelected}</Typography>
              <Typography small muted testID="menu-select-count">Selections: {menuSelections}</Typography>
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
