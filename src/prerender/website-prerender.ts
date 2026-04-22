import { createHtmlTemplate, TemplateProps } from './template';
import { IFooterLink, IRoute, generatePageContent } from './page-content';

export interface PrerenderOptions {
  routes?: IRoute[];
  defaultFooterLinks?: IFooterLink[];
  siteTitle?: string;
  copyright?: string;
  templateRenderer?: (props: TemplateProps) => Promise<string> | string;
  apiHandler?: { fetch: (request: Request, env: any, ctx: any) => Promise<Response> | Response };
}

export class WebsitePrerender {
  private routes: IRoute[];
  private defaultFooterLinks: IFooterLink[];
  private footerLinks: IFooterLink[];
  private siteTitle: string;
  private copyright: string;
  private templateRenderer: (props: TemplateProps) => Promise<string> | string;
  private apiHandler?: { fetch: (request: Request, env: any, ctx: any) => Promise<Response> | Response };

  constructor(options: PrerenderOptions = {}) {
    this.routes = options.routes || [
      { link: '/', text: 'Home' },
      { link: '/blogs', text: 'Blogs' },
      { link: '/stories', text: 'Stories' },
      { link: '/about-me', text: 'About Me' },
    ];
    this.defaultFooterLinks = options.defaultFooterLinks || [
      { text: 'LinkedIn', link: 'https://linkedin.com/in/yourname' },
      { text: 'GitHub', link: 'https://github.com/yourname' },
      { text: 'Email', link: 'mailto:yourname@domain.com' },
    ];
    this.footerLinks = [...this.defaultFooterLinks];
    this.siteTitle = options.siteTitle || 'My Personal Website';
    this.copyright = options.copyright || '2026 My Personal Website';
    this.templateRenderer = options.templateRenderer || createHtmlTemplate;
    this.apiHandler = options.apiHandler;
  }

  private async fetchStaticDetails(apiUrl: string, env: any) {
    try {
      let data: any;
      
      // If we have a local API handler, use it instead of network fetch to avoid loops
      if (this.apiHandler) {
        const res = await this.apiHandler.fetch(new Request(`${apiUrl}/api/static`), env, {});
        if (res.ok) data = await res.json();
      } else {
        const res = await fetch(`${apiUrl}/api/static`);
        if (res.ok) data = await res.json();
      }

      if (data) {
        this.siteTitle = data.siteTitle || this.siteTitle;
        this.copyright = data.copyright || this.copyright;
        
        const normalizeUrl = (url?: string) => {
          if (!url) return '';
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          if (url.startsWith('www.')) return `https://${url}`;
          return url;
        };
        
        this.footerLinks = [
          { text: 'LinkedIn', link: normalizeUrl(data.linkedin) || this.defaultFooterLinks[0].link },
          { text: 'GitHub', link: normalizeUrl(data.github) || this.defaultFooterLinks[1].link },
          { text: 'Email', link: data.email ? `mailto:${data.email}` : this.defaultFooterLinks[2].link },
        ];
      }
    } catch (e) {}
  }

  private async fetchAboutMeData(apiUrl: string, env: any): Promise<any> {
    try {
      if (this.apiHandler) {
        const res = await this.apiHandler.fetch(new Request(`${apiUrl}/api/aboutme`), env, {});
        if (res.ok) return await res.json();
      } else {
        const res = await fetch(`${apiUrl}/api/aboutme`);
        if (res.ok) return await res.json();
      }
    } catch (e) {}
    return null;
  }

  public async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const apiUrl = env?.API_URL || `${url.origin}/api`;
    const baseSiteUrl = env?.BASE_SITE_URL || url.origin;

    // Pass through to client-side app for admin route
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      // Fetch the index.html from ASSETS or external source
      const templateResponse = await fetch(`${baseSiteUrl}/index.html`);
      if (templateResponse.ok) {
        return new Response(templateResponse.body, {
          headers: { 'content-type': 'text/html' }
        });
      }
    }

    await this.fetchStaticDetails(apiUrl, env);

    if (url.pathname.startsWith('/api/')) {
      if (this.apiHandler) {
        return this.apiHandler.fetch(request, env, ctx);
      }
      return fetch(`${apiUrl}${url.pathname.replace(/^\/api/, '')}${url.search}`);
    }

    // Try to serve from ASSETS binding if available (Cloudflare Pages/Workers)
    if (env.ASSETS && (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.ico' || url.pathname === '/logo.png')) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.ok) return assetRes;
      } catch (e) {}
    }

    if (url.pathname.startsWith('/images/')) {
      const imageKey = url.pathname.slice(1);
      try {
        const image = await env.CONTENT_BUCKET.get(imageKey);
        if (image) {
          return new Response(image.body, {
            headers: {
              'content-type': image.httpMetadata?.contentType || 'image/jpeg',
              'cache-control': 'public, max-age=86400',
              'access-control-allow-origin': '*',
            },
          });
        }
      } catch (e) {}
      
      // Fallback to API handler if bucket get fails or image not found
      if (this.apiHandler) {
        return this.apiHandler.fetch(request, env, ctx);
      }
      return new Response('Not found', { status: 404 });
    }

    if (url.pathname.startsWith('/assets/') || url.pathname === '/logo.png' || url.pathname === '/favicon.ico') {
      const path = url.pathname;
      const ext = path.split('.').pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        js: 'application/javascript',
        css: 'text/css',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        webp: 'image/webp',
        ico: 'image/x-icon',
      };
      const contentType = contentTypes[ext || ''] || 'application/octet-stream';
      
      // Prevent infinite loop if baseSiteUrl is same as current origin
      if (baseSiteUrl === url.origin) {
         // If ASSETS check above failed, we can't do much more here without risking loops
         // unless we are in a build step. For now, 404 to be safe.
         return new Response('Asset not found', { status: 404 });
      }

      const response = await fetch(`${baseSiteUrl}${path}`);
      if (response.ok) {
        return new Response(response.body, {
          headers: {
            'content-type': contentType,
            'cache-control': 'public, max-age=31536000',
          },
        });
      }
      return new Response('Not found', { status: 404 });
    }

    const PRERENDERED_DOMAINS = [
      url.hostname
    ];

    if (!PRERENDERED_DOMAINS.includes(url.hostname) && !url.hostname.includes('localhost')) {
      return fetch(request);
    }

    let hydrationScript = '';
    if (url.pathname === '/about-me' || url.pathname === '/about-me/') {
      const aboutMeData = await this.fetchAboutMeData(apiUrl, env);
      if (aboutMeData) {
        hydrationScript = `<script>window.__HYDRATION_DATA__ = ${JSON.stringify(aboutMeData)};</script>`;
      }
    }

    const pageContent = await generatePageContent(url.pathname, this.routes, this.footerLinks, { ...env, apiUrl, siteTitle: this.siteTitle, copyright: this.copyright });
    const html = await this.templateRenderer({ ...pageContent, hydrationData: hydrationScript });

    return new Response(html, {
      headers: {
        'content-type': 'text/html',
        'cache-control': 'public, max-age=60',
      },
    });
  }
}
