import { TabShell } from "../../shell/tab-shell";

// Thin Expo Router glue: the Home tab delegates entirely to the shared TabShell, which
// is a bare <Slot/> on web and a stacked, glass-headered tab on native.
export default function HomeTabLayout() {
  return <TabShell section="home" />;
}
