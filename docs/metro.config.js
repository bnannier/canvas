// Metro config for the universal Canvas docs app (iOS / Android / web from one
// React Native codebase). The PUBLISHED @olympusoss/canvas is a compiled dist
// package, but the docs develop against the LIVE SOURCE via a symlink (see
// package.json postinstall):
//   - the resolver pins the bare "@olympusoss/canvas" import to src/index.ts, so
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

config.watchFolders = [repoRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Live-source pin: the package's main/exports point at dist (the publish
  // artifact), but docs development must track src edits without a rebuild.
  if (moduleName === "@olympusoss/canvas") {
    // Resolve through the node_modules symlink path (docs/node_modules/@olympusoss/
    // canvas -> repoRoot), NOT a raw repoRoot path: Metro's file map indexes the kit
    // under the node_modules path it crawls, so the raw out-of-tree path misses on the
    // Linux CI runner and `expo export` fails "Failed to get the SHA-1 for src/index.ts".
    return {
      type: "sourceFile",
      filePath: path.join(projectRoot, "node_modules", "@olympusoss", "canvas", "src", "index.ts"),
    };
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
