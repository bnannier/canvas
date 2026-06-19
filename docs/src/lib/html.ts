// The component/pattern descriptions carry a little inline HTML (e.g. `<code>mono</code>`)
// and a few HTML entities, since the web docs render them with dangerouslySetInnerHTML.
// Native renders plain text, so strip the tags and decode the handful of entities used.
const ENTITIES: Record<string, string> = {
  "&rarr;": "→",
  "&larr;": "←",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&times;": "×",
  "&rsquo;": "’",
  "&nbsp;": " ",
};

export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}
