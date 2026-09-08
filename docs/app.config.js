const { resolve } = require("node:path");
const { readBuildInfo } = require("./scripts/build-info.cjs");

module.exports = ({ config }) => ({
  ...config,
  // Preserve the optional subpath export supported by the static-server suite.
  experiments: { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL ?? "" },
  extra: { ...config.extra, canvasBuild: readBuildInfo(resolve(__dirname, "..")) },
});
