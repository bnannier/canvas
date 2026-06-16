// Metro config for the universal Canvas docs app.
//
// Native target: renders the RN components in src/. Web target: REUSES the existing
// Vite docs components (docs/src) for exact visual parity, so their imports are
// bridged here — react-router-dom -> an Expo Router shim, and "@/..." -> docs/src.
//
// The library + generated docs-core are consumed as source via live symlinks (see
// package.json postinstall). watchFolders sees the out-of-tree source;
// nodeModulesPaths + disableHierarchicalLookup force a single react/RN/svg copy.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");
const docsSrc = path.resolve(repoRoot, "docs", "src");
const routerShim = path.resolve(projectRoot, "src", "web", "react-router-shim.tsx");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [repoRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

function asSourceFile(absNoExt) {
  if (fs.existsSync(absNoExt) && fs.statSync(absNoExt).isFile()) return absNoExt;
  for (const ext of [".tsx", ".ts", ".jsx", ".js", ".json"]) {
    if (fs.existsSync(absNoExt + ext)) return absNoExt + ext;
  }
  for (const ext of [".tsx", ".ts", ".jsx", ".js"]) {
    const idx = path.join(absNoExt, "index" + ext);
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Reused Vite docs components (web target) → bridge their imports.
  if (moduleName === "react-router-dom") {
    return { type: "sourceFile", filePath: routerShim };
  }
  if (moduleName.startsWith("@/")) {
    const fp = asSourceFile(path.join(docsSrc, moduleName.slice(2)));
    if (fp) return { type: "sourceFile", filePath: fp };
  }
  // The library ships NodeNext-style ".js" specifiers that resolve to .ts/.tsx source,
  // and this also restores per-OS .ios/.android skin resolution on native.
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
