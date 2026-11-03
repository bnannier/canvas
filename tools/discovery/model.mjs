import { createHash } from 'node:crypto';

export const sha256 = (body) => createHash('sha256').update(body).digest('hex');
export const isHtml = (body) => /^\s*(?:<!doctype\s+html|<html\b)/i.test(body);
const unescape = (value) => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map((m) => [m[1].toLowerCase(), unescape(m[2] ?? m[3] ?? m[4])]));

export function indexingMeta(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0])).filter((a) => /^(?:robots|googlebot|bingbot|oai-searchbot|gptbot|chatgpt-user|claudebot|claude-user|claude-searchbot)$/i.test(a.name ?? '')).map((a) => ({ name: a.name.toLowerCase(), content: a.content ?? '' })).sort((a, b) => a.name.localeCompare(b.name));
}

export function validateResponse(record, body, { kind, status = 200, expectedHash } = {}) {
  const errors = [];
  if (record.status !== status) errors.push(`Expected HTTP ${status}, received ${record.status}`);
  const type = record.contentType?.split(';')[0].toLowerCase();
  const accepted = { html: ['text/html'], text: ['text/plain', 'text/markdown'], json: ['application/json'], xml: ['application/xml', 'text/xml'] };
  if (kind && !accepted[kind]?.includes(type)) errors.push(`Expected ${kind} content type, received ${type || '(absent)'}`);
  if (kind && kind !== 'html' && isHtml(body)) errors.push('Received an HTML shell instead of the requested data');
  if (kind === 'json') { try { JSON.parse(body); } catch { errors.push('Invalid JSON'); } }
  if (kind === 'xml' && !/<urlset\b[^>]*>[\s\S]*<\/urlset>/i.test(body)) errors.push('Expected sitemap urlset XML');
  if (expectedHash && sha256(body) !== expectedHash) errors.push('SHA-256 differs from manifest');
  return errors;
}

export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => unescape(m[1]));
}

export function markdownLinks(text, base) {
  const withoutFences = text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '');
  return [...new Set([...withoutFences.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].flatMap((m) => {
    try { const url = new URL(m[1], base); return ['https:', 'http:'].includes(url.protocol) ? [url.href] : []; } catch { return []; }
  }))].sort();
}

export function parseRobots(text) {
  const groups = []; const sitemaps = []; let group = null; let rulesStarted = false;
  for (const line of text.split(/\r?\n/)) {
    const m = line.replace(/#.*/, '').match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    const field = m[1].toLowerCase(); const value = m[2];
    if (field === 'sitemap') { sitemaps.push(value); continue; }
    if (field === 'user-agent') {
      if (!group || rulesStarted) { group = { agents: [], rules: [] }; groups.push(group); rulesStarted = false; }
      group.agents.push(value.toLowerCase());
    } else if (group && ['allow', 'disallow'].includes(field)) {
      rulesStarted = true;
      if (value) group.rules.push({ allow: field === 'allow', path: value });
    }
  }
  return { groups, sitemaps: [...new Set(sitemaps)].sort() };
}

// REP wildcard and terminal-$ rules, using longest matching agent and path.
// Discovery URLs here are ASCII; this is not a general URI normalization library.
export function robotsDecision(robots, agent, path) {
  const token = agent.toLowerCase();
  const ranked = robots.groups.map((group) => ({ group, rank: Math.max(-1, ...group.agents.map((a) => a === '*' ? 0 : token.includes(a) ? a.length : -1)) }));
  const best = Math.max(-1, ...ranked.map((x) => x.rank));
  const matching = ranked.filter((x) => x.rank === best && best >= 0).flatMap((x) => x.group.rules).filter((r) => {
    const end = r.path.endsWith('$');
    const pattern = (end ? r.path.slice(0, -1) : r.path).split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    return new RegExp(`^${pattern}${end ? '$' : ''}`).test(path);
  }).sort((a, b) => b.path.replace(/[*$]/g, '').length - a.path.replace(/[*$]/g, '').length || Number(b.allow) - Number(a.allow));
  return { allowed: matching[0]?.allow ?? true, rule: matching[0] ? `${matching[0].allow ? 'Allow' : 'Disallow'}: ${matching[0].path}` : null };
}
