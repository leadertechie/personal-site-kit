import { WebsitePrerender } from '@leadertechie/personal-site-kit/prerender';

// The WebsitePrerender generates static HTML for SEO:
//   - Home page with profile, latest blogs, latest stories
//   - About me page
//   - Blogs list page
//   - Blog detail pages (fetches content from R2)
//   - Stories list page
//   - Story detail pages
//   - 404 page
//
// Uses ContentCacheV2 with SWR caching for rendered markdown content.
// The R2ContentLoader is configured with:
//   - cfCache: true (Cloudflare edge cache)
//   - SWR: 30 min stale window
//   - md2html v2 with scope anchors, heading IDs, and error recovery
export default new WebsitePrerender();
