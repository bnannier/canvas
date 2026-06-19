// babel-preset-expo provides the RN/Expo transforms (incl. reanimated when present).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
