---
"@nannier/canvas": minor
---

Every component now reports its named anatomy parts to an enclosing `AnatomyProvider`, so an Anatomy figure numbers the parts of any component, not only Button. `AnatomyPart` is exported to register an element as a named part, and a component's parts belong to it alone: kit components and content nested inside it register nothing of theirs. Outside a provider nothing changes.

Minor justification: new public API (`AnatomyPart`, `AnatomyPartProps`) and a new capability across the kit (anatomy part reporting for every component).
