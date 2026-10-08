// ============================================================================
// marketing · sitemap (ruled 2026-10-08: structured data, sitemap and robots
// did not exist). Public marketing + legal surfaces only — app-internal
// routes are excluded here and disallowed in robots.ts. Two audiences, two
// route families; no claim is made about how search engines present them.
// ============================================================================

import type { MetadataRoute } from 'next'

const BASE = 'https://authorslab.ai'

const AUTHOR_ROUTES = ['', '/how-it-works', '/editors', '/pricing', '/faq', '/free-analysis']
const PUBLISHER_ROUTES = [
  '/publishers',
  '/publishers/the-read',
  '/publishers/the-method',
  '/publishers/what-you-get',
  '/publishers/series',
  '/publishers/security',
  '/publishers/getting-started',
  '/publishers/pricing',
  '/publishers/faq',
  '/publishers/how-it-works',
]
const LEGAL_ROUTES = ['/privacy', '/terms', '/cookies', '/subprocessors', '/dpa']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [...AUTHOR_ROUTES, ...PUBLISHER_ROUTES, ...LEGAL_ROUTES].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/publishers' ? 'weekly' : 'monthly',
    priority: path === '' || path === '/publishers' ? 1 : 0.6,
  }))
}
