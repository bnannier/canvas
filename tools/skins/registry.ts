// The docs' platform-skin registry (docs/src/core/platform-skins.ts), read as text. The
// module imports the kit's `.ios` and `.android` builds, which need React Native, so
// the registry guard (docs/scripts/check-platform-skins.ts) and the audit facts
// (tools/audit/facts.ts) read which names each table registers from the source instead.

export type RegistryTable = "ios" | "android";

/** The export names registered in each table, keyed the way the module spells them. */
export function registeredSkins(source: string): Record<RegistryTable, Set<string>> {
  const read = (table: RegistryTable): Set<string> => {
    const block = source.split(`${table}: {`)[1]?.split("},")[0] ?? "";
    const suffix = table === "ios" ? "IOS" : "Android";
    return new Set([...block.matchAll(new RegExp(`(\\w+):\\s*\\w+${suffix}`, "g"))].map((m) => m[1]));
  };
  return { ios: read("ios"), android: read("android") };
}
