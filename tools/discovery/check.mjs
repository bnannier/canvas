#!/usr/bin/env node
// Manual, bounded public GETs only. No telemetry, credentials, account APIs or scheduling.
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { indexingMeta, markdownLinks, parseRobots, robotsDecision, sha256, sitemapUrls, validateResponse } from './model.mjs';

export const crawlerSources = [
  { publisher: 'OpenAI', url: 'https://developers.openai.com/api/docs/bots', reviewedAt: '2026-11-02', note: 'Search, training and user-directed agents have independent purposes. User-directed ChatGPT requests may not apply robots.txt.' },
  { publisher: 'Anthropic', url: 'https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler', reviewedAt: '2026-11-02', note: 'Documents three robot tokens and robots.txt support; does not specify complete HTTP User-Agent strings.' },
];
export const crawlers = [
  { token: 'OAI-SearchBot', role: 'search', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot', template: 'official example' },
  { token: 'GPTBot', role: 'training', userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot', template: 'official example' },
  { token: 'ChatGPT-User', role: 'user-directed retrieval', userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot', template: 'official full string' },
  ...['ClaudeBot', 'Claude-SearchBot', 'Claude-User'].map((token, i) => ({ token, role: ['training', 'search', 'user-directed retrieval'][i], userAgent: token, template: 'official robot token only; synthetic HTTP header, not a documented full string' })),
];
const own = (object, key) => Object.hasOwn(object, key);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export async function checkDiscovery({ origin = 'https://canvas.nannier.com', version = '4.1.0', syntheticBots = false, manifestSha256, fetcher = fetch } = {}) {
  const base = new URL(origin);
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw new Error('Origin must be a bare HTTP(S) origin without credentials');
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error('Invalid package version');
  origin = base.origin;
  if (manifestSha256 && !/^[a-f0-9]{64}$/.test(manifestSha256)) throw new Error('Invalid manifest SHA-256');
  const prefix = `/ai/${version}/`;
  const errors = [];
  const records = new Map();
  const bodies = new Map();
  const get = async (pathname, { kind, status = 200, expectedHash, userAgent, synthetic = false } = {}) => {
    const url = new URL(pathname, origin);
    if (url.origin !== origin) throw new Error('Cross-origin probe refused');
    url.hash = '';
    const key = `${userAgent ?? ''} ${url.href}`;
    if (records.has(key)) return { record: records.get(key), body: bodies.get(key) ?? '' };
    const record = { path: url.pathname + url.search, ...(synthetic ? { synthetic: true, userAgent } : {}), status: null, contentType: null, xRobotsTag: null, metaRobots: [], bytes: 0, sha256: null, errors: [] };
    let body = '';
    try {
      let response; let final = url;
      for (let redirect = 0; redirect <= 4; redirect++) {
        response = await fetcher(final, { method: 'GET', headers: { 'user-agent': userAgent ?? 'CanvasDiscoveryCheck/1.0 (manual public documentation verification)', accept: '*/*' }, redirect: 'manual', signal: AbortSignal.timeout(20_000) });
        if (![301, 302, 303, 307, 308].includes(response.status)) break;
        if (redirect === 4) throw new Error('Redirect limit exceeded');
        final = new URL(response.headers.get('location') ?? '', final);
        if (final.origin !== origin) throw new Error('Cross-origin redirect refused');
      }
      record.status = response.status;
      record.contentType = response.headers.get('content-type');
      record.xRobotsTag = response.headers.get('x-robots-tag');
      if (final.href !== url.href) record.finalPath = final.pathname + final.search;
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length > 16 * 1024 * 1024) throw new Error('Response exceeds 16 MiB limit');
      body = new TextDecoder().decode(bytes);
      record.bytes = bytes.length;
      record.sha256 = sha256(bytes);
      if (record.contentType?.includes('text/html')) record.metaRobots = indexingMeta(body);
      record.errors.push(...validateResponse(record, body, { kind, status, expectedHash }));
      // nofollow is recorded but does not itself prohibit indexing a page.
      if (status === 200 && /\b(noindex|none)\b/i.test([record.xRobotsTag, ...record.metaRobots.map((m) => m.content)].join(','))) record.errors.push('Indexing restriction observed');
    } catch (error) {
      // Do not retain system errors that may contain local paths or network addresses.
      record.errors.push(error?.name === 'TimeoutError' ? 'Public HTTP request timed out' : ['Cross-origin redirect refused', 'Redirect limit exceeded', 'Response exceeds 16 MiB limit'].includes(error?.message) ? error.message : 'Public HTTP request failed');
    }
    records.set(key, record); bodies.set(key, body);
    return { record, body };
  };
  const batch = async (items, fn) => {
    // At most four concurrent requests; deliberately finite, no retry loop.
    let index = 0;
    await Promise.all(Array.from({ length: Math.min(items.length, 4) }, async () => { while (index < items.length) await fn(items[index++]); }));
  };
  const discoveryPaths = ['/robots.txt', '/sitemap.xml', '/agents.md', '/llms.txt', '/llms-full.txt', `${prefix}manifest.json`, `${prefix}catalog.json`];
  await batch(discoveryPaths, (p) => get(p, { kind: p.endsWith('.json') ? 'json' : p.endsWith('.xml') ? 'xml' : 'text' }));
  const plainBody = (p) => bodies.get(` ${new URL(p, origin).href}`) ?? '';
  const parse = (p) => { try { return JSON.parse(plainBody(p)); } catch { errors.push(`Cannot parse ${p}`); return null; } };
  const manifest = parse(`${prefix}manifest.json`);
  const catalog = parse(`${prefix}catalog.json`);
  const servedManifestHash = records.get(` ${origin}${prefix}manifest.json`)?.sha256;
  if (manifestSha256 && servedManifestHash !== manifestSha256) errors.push('Manifest SHA-256 differs from supplied release pin');
  const manifestFiles = manifest?.files && typeof manifest.files === 'object' && !Array.isArray(manifest.files) ? Object.entries(manifest.files) : [];
  if (!manifestFiles.length) errors.push('Manifest has no versioned files');
  for (const [label, object] of [['manifest', manifest], ['catalog', catalog]]) {
    if (!object || object.package !== '@nannier/canvas' || object.version !== version || object.schemaVersion !== 1 || object.status !== 'source-snapshot') errors.push(`Unexpected ${label} package/version/schema/status`);
  }
  if (manifest?.sourceHash !== catalog?.sourceHash) errors.push('Catalog sourceHash differs from manifest');
  await batch(manifestFiles, async ([file, hash]) => {
    if (!/^[a-zA-Z0-9/_-]+\.(?:json|md)$/.test(file) || file.split('/').includes('..') || !/^[a-f0-9]{64}$/.test(hash)) { errors.push(`Invalid manifest file entry: ${file}`); return; }
    const cached = records.get(` ${origin}${prefix}${file}`);
    if (cached) { if (cached.sha256 !== hash) cached.errors.push('SHA-256 differs from manifest'); }
    else await get(prefix + file, { kind: file.endsWith('.json') ? 'json' : 'text', expectedHash: hash });
  });
  // Globals track the current source snapshot, so only enforce archived global hashes
  // if the live discovery index still identifies this package version as current.
  const globalsCurrent = plainBody('/llms.txt').includes(`Repository source snapshot: ${version};`);
  let globalHashes = 0;
  if (globalsCurrent) for (const file of ['agents.md', 'llms.txt', 'llms-full.txt']) {
    const hash = manifest?.globalFiles?.[file]; const record = records.get(` ${origin}/${file}`);
    if (!hash || record?.sha256 !== hash) errors.push(`Global hash mismatch: /${file}`); else globalHashes++;
  }
  const robots = parseRobots(plainBody('/robots.txt'));
  if (!robots.groups.length) errors.push('robots.txt has no user-agent groups');
  if (!robots.sitemaps.includes(`${origin}/sitemap.xml`)) errors.push('robots.txt does not advertise the checked sitemap');
  const sitemap = new Set(sitemapUrls(plainBody('/sitemap.xml')));
  if (!sitemap.size) errors.push('Sitemap has no URLs');
  const requiredSitemapPaths = ['/', '/components', '/components/button', '/agents.md', ...manifestFiles.filter(([file]) => file.endsWith('.md')).map(([file]) => prefix + file)];
  const discoveryUrlsAbsentFromSitemap = discoveryPaths.filter((p) => !['/robots.txt', '/sitemap.xml'].includes(p) && !sitemap.has(origin + p));
  const missingSitemap = requiredSitemapPaths.filter((p) => !sitemap.has(origin + p));
  if (missingSitemap.length) errors.push(`${missingSitemap.length} critical URLs absent from sitemap`);
  const links = new Set(['/','/components','/components/button','/integration','/licenses', '/ai/4.0.0/index.md'].map((p) => origin + p));
  for (const p of ['/agents.md', '/llms.txt', `${prefix}index.md`]) for (const url of markdownLinks(plainBody(p), origin + p)) if (new URL(url).origin === origin) links.add(url);
  for (const component of catalog?.components ?? []) {
    if (!component.url || !component.humanUrl || !component.url.startsWith(`${origin}${prefix}`) || !own(manifest?.files ?? {}, component.url.slice((origin + prefix).length))) errors.push(`Catalog component link absent from versioned manifest: ${component.slug}`);
  }
  await batch([...links].sort(), async (url) => {
    const u = new URL(url); const kind = u.pathname.endsWith('.json') ? 'json' : /\.(?:md|txt)$/.test(u.pathname) ? 'text' : 'html';
    const { body } = await get(u.pathname + u.search, { kind });
    if (u.hash && kind === 'html' && ![...body.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].some((m) => m[1] === decodeURIComponent(u.hash.slice(1)))) errors.push(`HTML fragment absent: ${u.pathname}${u.hash}`);
  });
  // A guaranteed-unused discovery path must be a real 404, not a successful SPA shell.
  const missingPath = `${prefix}__canvas_discovery_missing__.json`;
  const negative = await get(missingPath, { status: 404 });
  const negativeControl = { path: missingPath, expectedStatus: 404, observedStatus: negative.record.status, passed: negative.record.status === 404 };
  const inspectedPaths = [...new Set([...records.values()].filter((r) => r.status === 200).map((r) => r.path))].sort();
  const robotsChecks = crawlers.map(({ token, role }) => {
    const blocked = inspectedPaths.filter((p) => !robotsDecision(robots, token, p).allowed);
    if (blocked.length) errors.push(`robots.txt blocks ${token} on ${blocked.length} checked URLs`);
    return { token, role, checkedPaths: inspectedPaths.length, blockedPaths: blocked, interpretation: 'robots.txt policy evaluation, not observed crawler behavior' };
  });
  if (syntheticBots) await batch(crawlers.flatMap((crawler) => ['/robots.txt', '/agents.md', `${prefix}manifest.json`].map((p) => ({ ...crawler, path: p }))), ({ path, userAgent }) => get(path, { kind: path.endsWith('.json') ? 'json' : 'text', synthetic: true, userAgent, expectedHash: records.get(` ${origin}${path}`)?.sha256 }));
  const responses = [...records.values()].sort((a, b) => compare(a.path, b.path) || compare(a.userAgent ?? '', b.userAgent ?? ''));
  const responseFailures = responses.filter((r) => r.errors.length);
  return {
    schemaVersion: 1, kind: 'manual-public-discovery-verification', checkedAt: new Date().toISOString(), origin, package: '@nannier/canvas', version,
    scope: 'Bounded read-only public HTTP GETs; no screenshots, telemetry, account access, scheduled checks or external writes.',
    limitations: ['Successful public and synthetic requests do not verify real bot access or IP identity.', 'Search indexing, citations, recommendations, external adoption and real crawler visits are unmeasured.', 'Cloudflare account settings, WAF rules and request logs were not accessed by this checker.', 'No external links are fetched; human routes are checked as HTTP HTML, without client-side rendering.', 'A supplied manifest pin connects hashes to a prior release record; without a pin, hashes establish only consistency with the served manifest.'],
    crawlerSources, crawlers: crawlers.map(({ token, role, template, userAgent }) => ({ token, role, template, ...(syntheticBots ? { syntheticUserAgent: userAgent } : {}) })),
    summary: { ok: !errors.length && !responseFailures.length, responses: responses.length, failedResponses: responseFailures.length, versionedHashesChecked: manifestFiles.length, currentGlobalHashesChecked: globalHashes, globalHashesSkippedBecauseArchive: !globalsCurrent, catalogComponents: catalog?.components?.length ?? 0, sitemapUrls: sitemap.size, requiredSitemapUrls: requiredSitemapPaths.length, missingSitemapUrls: missingSitemap, criticalLinksChecked: links.size, syntheticRequests: responses.filter((r) => r.synthetic).length },
    releasePin: { suppliedManifestSha256: manifestSha256 ?? null, observedManifestSha256: servedManifestHash, matched: manifestSha256 ? servedManifestHash === manifestSha256 : null },
    sitemapObservations: { discoveryUrlsAbsentFromSitemap, note: 'TXT and JSON discovery assets need not be sitemap pages; validate their public discovery links and responses separately.' },
    negativeControl, robots: { groups: robots.groups, sitemaps: robots.sitemaps, checks: robotsChecks }, errors, responses,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2); const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--synthetic-bots') options.syntheticBots = true;
    else if (['--origin', '--version', '--output', '--manifest-sha256'].includes(args[i]) && args[i + 1]) options[args[i++].slice(2)] = args[i];
    else throw new Error(`Unknown or missing argument: ${args[i]}`);
  }
  options.manifestSha256 = options['manifest-sha256'];
  const result = await checkDiscovery(options);
  const json = JSON.stringify(result, null, 2) + '\n';
  if (options.output) await writeFile(options.output, json);
  else process.stdout.write(json);
  if (!result.summary.ok) process.exitCode = 1;
}
