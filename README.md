# @leadertechie/personal-site-kit

A high-performance, modular engine for building personal websites and professional portfolios. Powered by Cloudflare Workers, R2 Storage, Lit Web Components, and the **@leadertechie** ecosystem.

## Features

- **🚀 Zero-to-Running**: Standardized architecture designed for quick deployment.
- **🛠️ 4-Section Engine**: Fully integrated logic for **API**, **UI**, **Prerender**, and **Admin**.
- **🎨 Modern Layout**: Semantic grid system with responsive `main-column` and `sidebar-column` components.
- **🌓 Theme Engine**: Built-in light/dark mode support with persistent user preferences.
- **📝 Content Driven**: Dynamic Markdown rendering with frontmatter support via `@leadertechie/md2html` (v2).
- **⚙️ Remote Config**: Manage site settings (title, copyright, social links) directly from R2 without re-deploying.
- **🔍 SEO Optimized**: Server-side prerendering ensures search engines see your content perfectly.
- **🔄 SWR Caching**: Stale-while-revalidate caching via `@leadertechie/r2tohtml` for optimal performance.
- **⚡ Client-Side Interactivity**: DOM interaction patterns (poll, live-update, click-toggle, infinite-scroll, form-live) via `@leadertechie/md2interact`.
- **🎯 CSS Hydration**: Inline critical CSS, layer injection, and theme toggle support.

## Architecture

The kit is divided into four logical subpaths:

1.  **/shared**: Common interfaces, types, the reactive `SiteStore`, and the `WebsiteUI` bootstrap.
2.  **/ui**: Web components for the Banner, Footer, About Me, Blog Viewer, Story Viewer, and Admin Portal.
3.  **/api**: Standard handlers for Cloudflare Workers to manage R2 content with v2 caching.
4.  **/prerender**: SEO engine to generate static HTML for crawlers with SWR caching.

## Installation

```bash
npm install @leadertechie/personal-site-kit
```

## Quick Start (Usage)

### 1. API Worker (`api/index.ts`)

```typescript
import { WebsiteAPI } from '@leadertechie/personal-site-kit/api';

export default new WebsiteAPI();
```

### 2. UI Entry (`ui/index.ts`)

```typescript
import { WebsiteUI } from '@leadertechie/personal-site-kit/shared';
import '@leadertechie/personal-site-kit/styles/theme.css';
import '@leadertechie/personal-site-kit/ui';

// Bootstrap the UI — md2interact is automatically initialized
WebsiteUI.getInstance({
  apiUrl: window.location.origin,
  // Optional: configure md2interact interactions
  interactConfig: {
    interactions: {
      'poll': { selector: '[data-interact="poll"]' },
      'live-update': { selector: '[data-interact="live-update"]' },
      'click-toggle': { selector: '[data-interact="click-toggle"]' },
      'infinite-scroll': { selector: '[data-interact="infinite-scroll"]' },
      'form-live': { selector: '[data-interact="form-live"]' }
    },
    cssHydration: {
      inlineCritical: true,
      layerInjection: true,
      themeToggle: true
    }
  }
}).bootstrap();
```

### 3. Prerender (`prerender/index.ts`)

```typescript
import { WebsitePrerender } from '@leadertechie/personal-site-kit/prerender';

export default new WebsitePrerender();
```

## Client-Side Interactivity with md2interact

The kit automatically initializes `@leadertechie/md2interact` during `WebsiteUI.bootstrap()`. This enables:

### DOM Interaction Patterns

Markdown content with frontmatter can declare interaction patterns:

```markdown
---
interaction: poll
interactConfig:
  url: /api/data
  interval: 5000
---

# Live Poll Data
```

Supported patterns: `poll`, `live-update`, `click-toggle`, `infinite-scroll`, `form-live`, `mfe`, `custom`

### CSS Hydration

- **inlineCritical**: Injects critical CSS directly into the DOM
- **layerInjection**: Uses CSS `@layer` for organized style injection
- **themeToggle**: Enables light/dark theme toggling

### SPA Navigation

After dynamic content loads (e.g., blog detail pages), call `reinitInteract()` to re-scan the DOM:

```typescript
const ui = WebsiteUI.getInstance();
ui.reinitInteract();
```

## Caching Strategy (v2)

The kit uses `@leadertechie/r2tohtml` with a multi-tier caching strategy:

| Tier | Cache | TTL |
|------|-------|-----|
| In-Memory | `ContentCacheV2` with SWR | 5 min fresh, 30 min stale |
| Cloudflare Edge | `cfCache` | 5 min |

This means:
- **Fresh**: Served instantly from memory
- **Stale**: Served from memory while revalidating in background (SWR)
- **Miss**: Fetched from R2, cached at edge and in-memory

## Deployment

This kit is designed to be deployed to **Cloudflare**. Ensure your `wrangler.toml` is configured with an R2 bucket named `CONTENT_BUCKET`.

---

## License

MIT © [Techie Leader](https://github.com/leadertechie)
