import { TabShell } from "../../shell/tab-shell";

// Thin Expo Router glue: the Utilities tab delegates to the shared TabShell.
export default function UtilitiesTabLayout() {
  return <TabShell section="utilities" />;
}
