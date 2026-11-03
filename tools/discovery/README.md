# Manual public discovery verification

Run from the repository root with Node 22+ (or Bun). This tool makes finite,
read-only public HTTP GETs, at most four concurrently. It does not run as a
background service and is not wired to GitHub CI, releases or telemetry.

```sh
node tools/discovery/check.mjs --version 4.1.0 \
  --manifest-sha256 92e205ea91494f8476572dfc5aaf7d057410a1a982f329eeda0cd653a5839bac \
  --synthetic-bots --output audit/agent-adoption/phase-7.json
bun test tools/discovery
```

The optional manifest pin above comes from the existing
`audit/agent-adoption/release-4.1.0.json` delivery record. Omit it when no independent
release pin is available; the output then explicitly reports an unpinned check.
`--origin https://canvas.nannier.com` is the default. `--output` writes only the
requested local JSON file; otherwise output goes to stdout. An unsuccessful
check exits 1. JSON order is stable; observation time, response bytes and hashes
can change when the site changes. Full response bodies, cookies, request IDs,
network addresses and user logs are not retained.

Checks include:

- Real robots.txt and sitemap responses; HTML fallback detection and a real 404
  negative control.
- Package, version, schema and snapshot identity of the manifest and catalog.
  Every versioned manifest file is fetched and SHA-256 verified. Global files are
  verified only when llms.txt still identifies the requested version as current.
- Same-origin links from agents.md, llms.txt and the versioned index; sampled human
  routes and the retained 4.0.0 index; catalog Markdown URL membership in the
  manifest; critical HTML/Markdown URL membership in the sitemap. External links
  and every catalog human route are outside this check.
- Response status, content type, body digest, X-Robots-Tag and robots meta tags.
  A conservative noindex/none observation fails a positive response. The parser
  accepts quoted and unquoted meta attributes without depending on their order.
- Robots policy for all successful baseline paths and six documented OpenAI and
  Anthropic robot tokens. Longest matching agent/rule and allow ties are handled;
  this ASCII-path checker is not a general URI normalization library.

`--synthetic-bots` additionally sends 18 requests: six UA templates against
robots.txt, agents.md and the versioned manifest. These must return the same body
hashes as the baseline. OpenAI templates use its current documented examples;
Anthropic templates are its documented robot tokens, since its help article does
not publish full HTTP UA strings. Sources and their review date are recorded in
the output. Recheck the official sources before relying on these templates later.

**Synthetic headers do not establish bot identity.** The requests come from the
operator's network, not verified crawler infrastructure. No outcome here proves a
real bot crawl, search indexing, citations, recommendations, model training,
Cloudflare WAF behavior for verified bots or external developer adoption. Account
settings and WAF/request logs require separate authorized evidence. TXT/JSON
assets need not appear in a sitemap; their omissions are recorded separately from
missing human/Markdown sitemap pages.
