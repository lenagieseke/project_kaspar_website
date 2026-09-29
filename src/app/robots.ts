// Generates /robots.txt. Search engines may crawl the site, but known AI
// crawlers are blocked. Together with the TDM header in next.config.ts, this
// makes the "no AI training / data mining" reservation in the imprint
// machine-readable (§ 44b UrhG requires that for it to be valid).
// The Studio is excluded for everyone: it's an editor, not public content.
// robots.txt contains a dot, so proxy.ts doesn't add a locale prefix to it.

import type { MetadataRoute } from 'next';

const AI_CRAWLERS = [
  'GPTBot', // OpenAI
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot', // Anthropic
  'Claude-Web',
  'anthropic-ai',
  'CCBot', // Common Crawl (used by many AI training sets)
  'Google-Extended', // Google AI training (doesn't affect Google Search)
  'Applebot-Extended', // Apple AI training (doesn't affect Apple search)
  'PerplexityBot',
  'Meta-ExternalAgent',
  'FacebookBot',
  'Bytespider', // ByteDance
  'Amazonbot',
  'cohere-ai',
  'Diffbot',
  'Omgilibot',
  'Timpibot',
  'ImagesiftBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, disallow: '/' },
      { userAgent: '*', allow: '/', disallow: '/studio' },
    ],
  };
}
