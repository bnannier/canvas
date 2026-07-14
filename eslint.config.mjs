// Focused ESLint flat config. This is NOT a full style linter (Prettier/format is
// deliberately not adopted); it enables ONLY the rule classes the 2026 audit proved
// this hook-heavy kit needs and that tsc + the test suite cannot catch:
//   - react-hooks/rules-of-hooks: a hook called conditionally is a real bug.
//   - react-hooks/exhaustive-deps: a stale-closure warning (non-blocking).
//   - react/jsx-no-constructed-context-values: a fresh context value object every
//     render re-renders every consumer (the RadioGroup finding).
//   - no static imports of the optional peers in src/** (they load via a guarded
//     require(); a value import breaks consumers who skip the peer).
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";

const OPTIONAL_PEERS = [
  "expo-blur",
  "expo-glass-effect",
  "react-native-qrcode-svg",
  "react-native-safe-area-context",
];

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "docs/**", // the docs app is its own project; the kit lint focuses on the package
      "**/*.d.ts",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}", "tools/**/*.ts", "scripts/**/*.ts", "test/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, react, "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-no-constructed-context-values": "error",
    },
  },
  {
    // The optional-peer import ban is the source-level half of the verify-package
    // dist scan; allowTypeImports keeps the erased `import type` in qrcode legal.
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: { parser: tseslint.parser },
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: OPTIONAL_PEERS.map((name) => ({
            name,
            allowTypeImports: true,
            message: `${name} is an optional peer: load it via a guarded require(), not a static import.`,
          })),
        },
      ],
    },
  },
);
