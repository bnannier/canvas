// Fallback entry for type resolution only. At bundle time Metro picks
// build-scopes.web.ts or build-scopes.native.ts by platform extension; this plain
// module re-exports the per-platform scope builders so the import also resolves
// under tsc (which does not understand platform extensions). The signature matches
// both platform variants.
export * from "./build-scopes.native";
