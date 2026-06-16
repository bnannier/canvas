// Metro config for the universal Canvas docs app (iOS / Android / web from one
// React Native codebase). It consumes the source-only @olympusoss/canvas library and
// the generated docs-core as live symlinks (see package.json postinstall):
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
