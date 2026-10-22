// The smoke app renders every Canvas component's generated docs examples, which live in
// the docs app (docs/src/core: the examples, their registry and their helpers). Those
// modules import only @nannier/canvas, React and React Native, so Metro watches that
// tree and resolves every package from this app's own node_modules: the sealed candidate
// a verification run installs here, never the docs app's source link.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const docs = path.resolve(__dirname, "../docs");
config.watchFolders = [path.join(docs, "src/core"), path.join(docs, "public")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
