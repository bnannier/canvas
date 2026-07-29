---
"@nannier/canvas": patch
---

Fix optional peers being treated as required by Metro.

The kit loads its optional peers through a guarded `require()` wrapped in
`if (typeof require === "function")`. That `if` defeats the mechanism it was
meant to support: Metro's `isOptionalDependency` walks up from the require and,
at the first enclosing block statement, returns whether that block belongs to a
`TryStatement`, without climbing further. The `if`'s own block answers no, so
Metro registered a required edge and any consumer who skipped the peer failed to
bundle with "Unable to resolve module".

Every one of the nine sites now places the require directly inside the try. The
runtime behaviour is unchanged: where `require` is undefined the ReferenceError
lands in the same catch that already absorbed a missing module.

Consumers who install every optional peer see no difference. Consumers who skip
one, which is the documented and supported case, can now bundle under Metro.
