---
"@nannier/canvas": patch
---

The skin divergence reader (`tools/skins/divergence.ts`) now says what each reason a platform build differs from the web build is made of: a skin or data of the component's own, another component's platform build injected as a part, another component's skin or data handed to that component's own factory, or a form it cannot read. Data an entry hands another component's factory is that part's look: AvatarMenu's 6 gap on the native Dropdown no longer reads as a look of Avatar's own. The reasons it spells out, and so `check:skins`, the shells gate and the audit facts, are unchanged. Repository tooling and docs only; nothing in the package changes.
