// babel-preset-expo provides the RN/Expo transforms (incl. reanimated when present).
// The local plugin inlines Vite `?raw` imports so the reused docs pages bundle on Metro.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["./babel-plugin-inline-raw.js"],
  };
};
