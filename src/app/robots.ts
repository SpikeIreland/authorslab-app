// ============================================================================
// marketing · robots (ruled 2026-10-08). Public marketing/legal surfaces are
// crawlable; the working application is not. '/publisher$' and '/publisher/'
// block the app shell without touching '/publishers'.
// ============================================================================

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/projects/',
        '/author-studio/',
        '/publisher$',
        '/publisher/',
        '/lobby/',
        '/onboarding/',
        '/profile/',
        '/checkout/',
        '/marketing-hub',
        '/marketing-hub-demo',
        '/publishing-hub',
        '/phase-complete',
        '/phase-transition',
        '/re-upload',
        '/home',
      ],
    },
    sitemap: 'https://authorslab.ai/sitemap.xml',
  }
}
