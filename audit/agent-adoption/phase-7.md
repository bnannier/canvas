# Phase 7: public discovery verification

Canvas 4.1.0 passed a manual public HTTP discovery check on 2026-11-02. This is
public delivery and policy evidence; real crawler visits and search indexing
remain unverified. The exact observation time, per-response headers and hashes
are in [phase-7.json](phase-7.json).

The reusable [checker](../../tools/discovery/README.md) runs only when invoked.
It adds no UI changes, telemetry, scheduled monitoring, external writes or CI
triggers. Its JSON keeps compact response metadata and digests, with no raw
response bodies, secrets, IP addresses, account data or user logs.

| Check | Observed result |
| --- | --- |
| HTTP responses | 144 checked; 143 expected 200s and one expected 404; no failures |
| Versioned source reference | All 113 manifest file SHA-256 digests matched |
| Global discovery files | agents.md, llms.txt and llms-full.txt matched all three current-version manifest digests |
| Release identity | Manifest matched the pre-existing 4.1.0 delivery record pin `92e205ea91494f8476572dfc5aaf7d057410a1a982f329eeda0cd653a5839bac` |
| Catalog | 107 components; package/version/schema/source hash matched; Markdown component URLs present in manifest |
| Public links | 123 distinct critical links checked, including human docs, installation/guides, versioned component references and archived 4.0.0 index |
| Sitemap | 1,113 URLs; all 116 required human/Markdown discovery URLs present |
| Robots policy | Wildcard `Allow: /`; all six documented bot tokens allowed on all 123 successful baseline paths |
| Indexing headers | No X-Robots-Tag or recognized robots meta directives observed in checked responses |
| Missing asset | A deliberately absent versioned JSON path returned a real 404, rather than a successful HTML shell |
| Synthetic UA checks | 18/18 valid 200 responses with bodies matching the baseline; explicitly synthetic |
| Focused parser tests | Four tests passed, covering soft 404s, exact-byte hash failures, meta/XML/link parsing and robots precedence |

The sitemap omits `/llms.txt`, `/llms-full.txt`,
`/ai/4.1.0/manifest.json` and `/ai/4.1.0/catalog.json`. These files are directly
linked from the discovery index and/or onboarding guide and returned their
expected content types and hashes. The checker records their absence as an
observation; sitemap membership is required for the checked human and Markdown
pages, not every TXT/JSON asset.

The HTTP matrix probes the following documented identities: OAI-SearchBot
(search), GPTBot (training), ChatGPT-User (user-directed retrieval), ClaudeBot
(training), Claude-SearchBot (search) and Claude-User (user-directed retrieval).
OpenAI documents independent search and training choices and notes that
user-directed ChatGPT requests may not apply robots.txt. Its examples currently
use version 1.4 for the search/training agents and 1.0 for ChatGPT-User.
[Official OpenAI crawler documentation](https://developers.openai.com/api/docs/bots).
Anthropic documents the three robot tokens and robots.txt support; its article
does not specify complete HTTP User-Agent strings, so its synthetic checks send
the token only.
[Official Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).
Both sources were searched and opened on 2026-11-02 before the probes.

Synthetic requests originate from the operator's network. They establish only
how these headers were served at check time. They do not establish crawler IP
identity, real OpenAI/Anthropic crawls, indexing, citations, recommendations,
model adoption or verified-bot WAF treatment. This checker did not access
Cloudflare account settings, WAF rules or request logs. The separate account
access investigation belongs in the integration record. No logs or analytics
were inferred from successful public requests.

Human routes are verified as server-delivered HTML without client-side rendering;
only selected human component routes are fetched. External links are not fetched.
Retained archive global hashes are skipped once the current global index advances.
The manifest pin ties this run to the prior release delivery evidence; without
that optional pin, manifest/file agreement alone proves served consistency.

Reproduce with the command in the checker README. A manual recheck can detect
later drift; this task does not create a recurring monitor or claim future access.

## Bounded search observation

A later manual query for `site:canvas.nannier.com "@nannier/canvas"` surfaced the
homepage with cached **3.4.4** copy and a displayed crawl age of three weeks.
Direct public versioned references were separately verified at **4.1.0**. This is
evidence of stale search retrieval, not a stale production deployment. One exact
query for `"bnannier/canvas-plugins"` surfaced no result; that does not establish
absence from all search indexes or AI products. The compact JSON preserves the
queries, observation time and scope.

Cloudflare dashboard access required sign-in. The owner chose to continue without
account access, so verified-crawler visits and WAF/account logs remain unmeasured.
