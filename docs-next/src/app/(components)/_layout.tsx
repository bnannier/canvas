import { TabShell } from "../../shell/tab-shell";

// Thin Expo Router glue: the Components tab delegates to the shared TabShell.
export default function ComponentsTabLayout() {
  return <TabShell section="components" />;
}
