// Metro transform worker for the docs: Expo's own worker, with one change for the web.
//
// Upstream issue: Expo's web asset transform drops an image's density variants. On iOS and
// Android a `require("./grain.png")` registers the asset with React Native's registry
// (`registerAsset({ httpServerLocation, name, type, width, height, scales: [1, 2, 3], ... })`),
// and the platform picks the variant that matches the screen. For the web,
// @expo/metro-config's asset-transformer (`transform-worker/asset-transformer.js`, 57.x)
// instead emits a plain `{ uri, width, height }` object naming the 1x file only, so
// react-native-web, whose Image already picks the scale closest to `PixelRatio.get()` from a
// registered asset's `scales` (`resolveAssetUri`), only ever sees the 1x bitmap and a
// retina screen upscales it. The variants are still on disk, served by the dev server and
// copied by `expo export` (`persistMetroAssets` keeps every web scale); only the URLs are
// missing at runtime.
//
// So for the web, an image that HAS density variants takes the native module: the same
// `generateAssetCodeFileAst(assetRegistryPath, data)` call, with Expo's own asset data
// (`getUniversalAssetData`, which hashes the name on export exactly as the export's asset
// copy does), and Expo resolves the registry to the one module react-native-web's Image
// reads. A single-scale image, a non-image asset, a DOM component and a server bundle keep
// Expo's output untouched. Remove this worker when Expo registers web assets with their
// scales itself.
//
// Wired in metro.config.js as `transformerPath`; Expo's supervising worker loads it, and
// its source is folded into the cache version there so a change re-transforms assets.
const path = require("node:path");

const expoConfigDir = path.dirname(require.resolve("@expo/metro-config/package.json"));
const fromExpo = (id) => require(require.resolve(id, { paths: [expoConfigDir] }));

const worker = fromExpo("@expo/metro-config/build/transform-worker/transform-worker");
const assetTransformer = fromExpo("@expo/metro-config/build/transform-worker/asset-transformer");
const { getUniversalAssetData } = fromExpo("@expo/metro-config/build/transform-worker/getAssets");
const { generateAssetCodeFileAst } = fromExpo("@expo/metro/metro/Bundler/util");

if (typeof assetTransformer.transform !== "function" || typeof getUniversalAssetData !== "function") {
  throw new Error(
    "docs/scripts/web-asset-scales.cjs: @expo/metro-config's asset transformer changed shape; " +
      "check whether Expo now registers web assets with their scales and remove this worker.",
  );
}

const expoAssetTransform = assetTransformer.transform;

/** Whether this asset build is the client web bundle (not a DOM component, not a server bundle). */
function isClientWeb(options) {
  const custom = options.customTransformOptions ?? {};
  return options.platform === "web" && !custom.dom && custom.environment !== "react-server" && custom.environment !== "node";
}

async function webAssetWithScales(args, assetRegistryPath, assetDataPlugins) {
  const { filename, options } = args;
  if (!isClientWeb(options)) return expoAssetTransform(args, assetRegistryPath, assetDataPlugins);
  const absolutePath = path.resolve(options.projectRoot, filename);
  const data = await getUniversalAssetData(absolutePath, filename, assetDataPlugins, options.platform, options.publicPath, true);
  const isImageWithVariants = data.width != null && data.height != null && Array.isArray(data.scales) && data.scales.length > 1;
  if (!isImageWithVariants) return expoAssetTransform(args, assetRegistryPath, assetDataPlugins);
  return { ast: { comments: null, ...generateAssetCodeFileAst(assetRegistryPath, data), errors: [] } };
}

// Expo's worker calls the asset transformer through its module object at call time, so
// replacing the export routes every asset in this worker process through the function above.
assetTransformer.transform = webAssetWithScales;

module.exports = worker;
