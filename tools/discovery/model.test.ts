import { describe, expect, test } from 'bun:test';
import { indexingMeta, markdownLinks, parseRobots, robotsDecision, sha256, sitemapUrls, validateResponse } from './model.mjs';

describe('public discovery parser safety', () => {
  test('rejects a soft 404 HTML shell and a real 404 as successful data', () => {
    expect(validateResponse({ status: 200, contentType: 'text/html' }, '<!DOCTYPE html><html>shell</html>', { kind: 'json' })).toContain('Received an HTML shell instead of the requested data');
    expect(validateResponse({ status: 404, contentType: 'application/json' }, '{}', { kind: 'json' })).toContain('Expected HTTP 200, received 404');
    expect(validateResponse({ status: 404, contentType: 'text/html' }, '<html>missing</html>', { kind: 'html', status: 404 })).toEqual([]);
  });
  test('checks exact body bytes and rejects modified manifest assets', () => {
    expect(validateResponse({ status: 200, contentType: 'text/plain; charset=utf-8' }, 'docs\n', { kind: 'text', expectedHash: sha256('docs\n') })).toEqual([]);
    expect(validateResponse({ status: 200, contentType: 'text/plain' }, 'docs', { kind: 'text', expectedHash: sha256('docs\n') })).toContain('SHA-256 differs from manifest');
  });
  test('parses reordered mixed-case indexing tags and XML entities', () => {
    expect(indexingMeta(`<META content='noindex, follow' NAME="Robots"><meta name="viewport" content="width=400"><meta name=googlebot content="index,follow">`)).toEqual([{ name: 'googlebot', content: 'index,follow' }, { name: 'robots', content: 'noindex, follow' }]);
    expect(sitemapUrls('<urlset><url><loc>https://example.com/?a=1&amp;b=2</loc></url></urlset>')).toEqual(['https://example.com/?a=1&b=2']);
    expect(markdownLinks('[guide](/ai/4.1.0/index.md)\n```sh\n[ignore](/secret)\n```', 'https://example.com/agents.md')).toEqual(['https://example.com/ai/4.1.0/index.md']);
  });
  test('respects crawler-specific groups, merged groups, longest rules and allow ties', () => {
    const robots = parseRobots('User-agent: *\nDisallow: /\nUser-agent: ClaudeBot\nUser-agent: Claude-User\nDisallow: /private*\nAllow: /private/public\nUser-agent: ClaudeBot\nAllow: /private$\nSitemap: https://example.com/sitemap.xml');
    expect(robotsDecision(robots, 'ClaudeBot', '/private')).toEqual({ allowed: true, rule: 'Allow: /private$' });
    expect(robotsDecision(robots, 'Claude-User', '/private/secret').allowed).toBe(false);
    expect(robotsDecision(robots, 'ClaudeBot', '/private/public/readme').allowed).toBe(true);
    expect(robotsDecision(robots, 'GPTBot', '/docs').allowed).toBe(false);
    expect(robots.sitemaps).toEqual(['https://example.com/sitemap.xml']);
  });
});
