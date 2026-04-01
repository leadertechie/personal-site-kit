# @leadertechie/personal-site-kit

A high-performance, modular engine for building personal websites and professional portfolios. Powered by Cloudflare Workers, R2 Storage, and Lit Web Components.

## Features

- **🚀 Zero-to-Running**: Standardized architecture designed for quick deployment.
- **🛠️ 4-Section Engine**: Fully integrated logic for **API**, **UI**, **Prerender**, and **Admin**.
- **🎨 Modern Layout**: Semantic grid system with responsive `main-column` and `sidebar-column` components.
- **🌓 Theme Engine**: Built-in light/dark mode support with persistent user preferences.
- **📝 Content Driven**: Dynamic Markdown rendering with frontmatter support via `@leadertechie/md2html`.
- **⚙️ Remote Config**: Manage site settings (title, copyright, social links) directly from R2 without re-deploying.
- **🔍 SEO Optimized**: Server-side prerendering ensures search engines see your content perfectly.

## Architecture

The kit is divided into four logical subpaths:

1.  **/shared**: Common interfaces, types, and the reactive `SiteStore`.
2.  **/ui**: Web components for the Banner, Footer, About Me, and Admin Portal.
3.  **/api**: Standard handlers for Cloudflare Workers to manage R2 content.
4.  **/prerender**: SEO engine to generate static HTML for crawlers.

## Installation

```bash
npm install @leadertechie/personal-site-kit
```

## Quick Start (Usage)

### 1. API Worker (`api.ts`)
```typescript
import { handleAPIRoute } from '@leadertechie/personal-site-kit/api';

export default {
  async fetch(request, env) {
    return handleAPIRoute(request, env);
  }
};
```

### 2. UI Entry (`main.ts`)
```typescript
import { SiteStore } from '@leadertechie/personal-site-kit/shared';
import '@leadertechie/personal-site-kit/ui/banner';

const store = SiteStore.getInstance();
await store.init({ apiUrl: 'https://api.yourdomain.com' });
```

## Deployment

This kit is designed to be deployed to **Cloudflare**. Ensure your `wrangler.toml` is configured with an R2 bucket named `CONTENT_BUCKET`.

---

## License

MIT © [Techie Leader](https://github.com/leadertechie)
