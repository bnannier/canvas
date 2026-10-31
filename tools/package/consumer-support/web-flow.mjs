import { readFile } from "node:fs/promises";

// react-native-svg's web image resolver imports this real RN module. Older RN
// releases publish its Flow annotations as syntax, which esbuild cannot parse.
// Apply the consumer's ordinary RN Babel preset, preserving the runtime module.
export function reactNativeWebFlowPlugin(consumerRequire) {
  return {
    name: "react-native-web-flow",
    setup(build) {
      build.onLoad({ filter: /[/\\]@react-native[/\\]assets-registry[/\\].*\.js$/ }, async ({ path }) => {
        const { transformAsync } = consumerRequire("@babel/core");
        const result = await transformAsync(await readFile(path, "utf8"), {
          filename: path, babelrc: false, configFile: false,
          presets: [[consumerRequire.resolve("@react-native/babel-preset"), {
            disableImportExportTransform: true, enableBabelRuntime: false,
          }]],
        });
        if (typeof result?.code !== "string") throw new Error(`Babel produced no JavaScript for ${path}`);
        return { contents: result.code, loader: "js" };
      });
    },
  };
}
