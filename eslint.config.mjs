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

// Every hand-written TypeScript tree in the repo, kit AND docs app. The docs app used
// to be ignored wholesale ("docs/**"), which did two bad things at once: it left the
// docs sources completely unlinted (the root `eslint .` is the only lint CI runs), and
// it made `cd docs && bun run lint` a hard failure, since the docs workspace has no
// config of its own, so ESLint resolves THIS file and then found every path it was
// handed already ignored (ESLint 9 exits 2 on that). Docs source is React Native code
// with the same hooks hazards as the kit, so it gets the same rules.
const SOURCES = [
  "src/**/*.{ts,tsx}",
  "tools/**/*.ts",
  "scripts/**/*.ts",
  "test/**/*.{ts,tsx}",
  "docs/src/**/*.{ts,tsx}",
  "docs/scripts/**/*.ts",
];

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "**/node_modules/**",
      "**/*.d.ts",
      // The docs app's build output and its generated native projects, never its source.
      "docs/dist/**",
      "docs/.expo/**",
      "docs/android/**",
      "docs/ios/**",
      // Local Claude Code session state. It is gitignored, and it holds nested git
      // worktrees whose checkouts would otherwise be linted as if they were this one.
      ".claude/**",
    ],
  },
  {
    files: SOURCES,
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
