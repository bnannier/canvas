import { Redirect } from "expo-router";

// Legacy slug: the Emblem component used to document under /components/icon-tile.
export default function IconTileRedirect() {
  return <Redirect href="/components/emblem" />;
}
