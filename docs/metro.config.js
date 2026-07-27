// Metro config for the universal Canvas docs app (iOS / Android / web from one
// React Native codebase). The PUBLISHED @nannier/canvas is a compiled dist
// package, but the docs develop against the LIVE SOURCE via a symlink (see
// package.json postinstall):
//   - the resolver pins the bare "@nannier/canvas" import to src/index.ts, so
//     docs never load a stale dist build during development;
//   - watchFolders sees the out-of-tree source;
//   - nodeModulesPaths + disableHierarchicalLookup force a single react/RN/svg copy;
//   - the resolver maps the library's NodeNext ".js" specifiers to their .ts/.tsx
//     source (which also restores per-OS .ios/.android skin resolution on native).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Optional peers of @nannier/canvas that this app deliberately does not install.
// See the resolveRequest note below for why an explicit stub is required.
const ABSENT_OPTIONAL_PEERS = new Set(["@shopify/react-native-skia"]);

config.watchFolders = [repoRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Live-source pin: the package's main/exports point at dist (the publish
  // artifact), but docs development must track src edits without a rebuild.
  if (moduleName === "@nannier/canvas") {
    // Resolve through the node_modules symlink path (docs/node_modules/@nannier/
    // canvas -> repoRoot), NOT a raw repoRoot path: Metro's file map indexes the kit
    // under the node_modules path it crawls, so the raw out-of-tree path misses on the
    // Linux CI runner and `expo export` fails "Failed to get the SHA-1 for src/index.ts".
    return {
      type: "sourceFile",
      filePath: path.join(projectRoot, "node_modules", "@nannier", "canvas", "src", "index.ts"),
    };
  }
  // Optional peers that are NOT installed here must resolve to an empty module.
  //
  // Metro resolves `require("literal")` statically and does not honour the
  // surrounding try/catch, so the kit's guarded require of an optional peer is a
  // HARD bundling failure when the package is absent — the try/catch only ever
  // protects against a runtime throw, never a build-time resolution. Verified: a
  // fresh `expo export -p web` fails with "Unable to resolve module
  // @shopify/react-native-skia from src/organisms/backdrop/skia-runtime.ts".
  //
  // The kit degrades correctly at runtime once the module resolves to something,
  // so an empty stub is all that is needed: Backdrop's probe finds no drawing
  // backend and renders its SVG baseline, which is the documented behaviour for a
  // consumer who skips the peer. Any consumer who does install Skia needs no entry
  // here, because normal resolution then succeeds.
  if (ABSENT_OPTIONAL_PEERS.has(moduleName)) {
    return { type: "empty" };
  }
  if (moduleName.endsWith(".js") && (moduleName.startsWith("./") || moduleName.startsWith("../"))) {
    try {
      return context.resolveRequest(context, moduleName, platform);
    } catch {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
