// Metro config for the universal Canvas docs app.
//
// The Canvas library (`@olympusoss/canvas`) and the generated docs core
// (`docs-core`) are consumed as `file:` dependencies (see package.json), so Metro
// resolves them as normal linked packages and follows the symlinks into the repo.
// The library and docs core ship TypeScript SOURCE (no build step), so:
//   - watchFolders watches the whole repo root, so Metro indexes those linked
//     source files (their real paths live outside docs-next/);
//   - nodeModulesPaths + disableHierarchicalLookup force a SINGLE copy of react,
//     react-native and react-native-svg — including for imports made from inside
//     the linked library source (the Metro analogue of the Vite config's React
//     `dedupe`; two copies break hooks / the renderer).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [repoRoot];

config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

// The library ships TypeScript source with NodeNext-style ".js" import specifiers
// (e.g. `from "./tokens.js"` where the file is tokens.ts). Vite remaps these; Metro
// doesn't. Map a relative ".js" specifier that doesn't resolve to its source sibling
// by stripping ".js" and letting Metro re-resolve — which also restores per-OS skin
// resolution (./button/button -> button.ios.tsx / button.android.tsx / button.tsx).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.endsWith(".js") &&
    (moduleName.startsWith("./") || moduleName.startsWith("../"))
  ) {
    try {
      return context.resolveRequest(context, moduleName, platform);
    } catch {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
