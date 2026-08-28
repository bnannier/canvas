---
"@nannier-com/canvas": patch
---

The kit declares its own client boundary: `dist/index.js` now carries a `"use client"` prologue. Canvas is a react-native-web kit whose exports reach React context on module evaluation, so importing it from a React Server Component (Next.js App Router) threw `createContext only works in Client Components` and every consumer had to remember its own wrapper. Patch, not minor: no new component, prop, or API, only the packaging declaration that makes the existing surface importable from a server component.
