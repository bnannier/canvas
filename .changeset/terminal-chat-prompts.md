---
"@nannier/canvas": minor
---

Add opt-in terminal transcripts and bare multiline prompts to Chat, ChatMessage, ChatThread, ChatComposer, and Markdown. Preserve semantic Markdown in monospace with flat scrolling tables, and support IME-safe hardware Enter sending, Shift+Enter newlines, and composer autofocus. Add terminal Textarea metrics and a Typography terminal face modifier that preserves reading sizes. Terminal transcripts, prompts, and CodeBlock transcript output use a modern system monospace stack independently of existing mono typography. Preserve all existing defaults.

Minor justification: new public options (`terminal` on Chat, ChatMessage, ChatThread, ChatComposer, Markdown, Textarea and Typography) that consumers such as Argus use for terminal transcripts and prompts.
