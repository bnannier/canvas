// Fallback entry for type resolution only. At bundle time Metro/Vite pick
// build-scopes.web.ts or build-scopes.native.ts by platform extension; this plain
// module exists so that `import ... from "docs-core/build-scopes"` also resolves
// under tsc (which does not understand platform extensions). The signature matches
// both platform variants.
export * from "./build-scopes.native";
