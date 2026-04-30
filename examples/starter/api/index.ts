import { WebsiteAPI } from '@leadertechie/personal-site-kit/api';

// The WebsiteAPI handles all content routes:
//   GET /api/home       - Home page content (with AST + rendered)
//   GET /api/about-me   - About me content (with profile + rendered)
//   GET /api/static     - Static site details (title, copyright, social links)
//   GET /api/logo       - Logo image
//   GET /api/info       - Site info
//   GET /api/auth       - Authentication
//   GET /api/admin/*    - Admin CRUD operations
//
// Content is served with SWR caching (5 min fresh, 30 min stale)
// and Cloudflare edge cache tier for optimal performance.
export default new WebsiteAPI();
