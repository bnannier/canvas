// Layer a build-time-conditional baseUrl over the static app.json. A static web export
// hosted under a subpath (e.g. GitHub Pages at /canvas/) needs experiments.baseUrl so
// its asset and route links are prefixed; local `expo start --web` / `expo export`
// should stay at root. Set EXPO_BASE_URL=/canvas for the subpath build.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL ?? "",
  },
});
