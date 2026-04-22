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
  private cachedAssets: { js: string; css: string } | null = null;

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

  private async discoverAssets(env: any, baseSiteUrl: string): Promise<{ js: string; css: string }> {
    if (this.cachedAssets) return this.cachedAssets;

    try {
      let html: string = '';
      
      // 1. Try to get index.html from ASSETS binding (most reliable in Workers/Pages)
      if (env.ASSETS) {
        const res = await env.ASSETS.fetch(new Request('http://localhost/index.html'));
        if (res.ok) html = await res.text();
      }
      
      // 2. Fallback to network fetch if not found via binding
      if (!html) {
        const res = await fetch(`${baseSiteUrl}/index.html`, {
          headers: { 'X-Asset-Discovery': 'true' }
        });
        if (res.ok) html = await res.text();
      }

      if (html) {
        const jsMatch = html.match(/src="([^"]*assets\/index-[^"]+\.js)"/);
        const cssMatch = html.match(/href="([^"]*assets\/index-[^"]+\.css)"/);
        
        if (jsMatch || cssMatch) {
          this.cachedAssets = {
            js: jsMatch ? (jsMatch[1].startsWith('/') ? jsMatch[1] : '/' + jsMatch[1]) : "/assets/index.js",
            css: cssMatch ? (cssMatch[1].startsWith('/') ? cssMatch[1] : '/' + cssMatch[1]) : "/assets/index.css"
          };
          return this.cachedAssets;
        }
      }
    } catch (e) {
      console.warn("Asset discovery failed:", e);
    }

    return { js: "/assets/index.js", css: "/assets/index.css" };
  }

  private async fetchStaticDetails(apiUrl: string, env: any) {
    try {
      let data: any;
      
      if (this.apiHandler) {
        const res = await this.apiHandler.fetch(new Request('http://localhost/api/static'), env, {});
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
        const res = await this.apiHandler.fetch(new Request('http://localhost/api/aboutme'), env, {});
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

    // Admin pass-through
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      if (env.ASSETS) {
        const assetRes = await env.ASSETS.fetch(new Request('http://localhost/index.html'));
        if (assetRes.ok) return assetRes;
      }
      const templateResponse = await fetch(`${baseSiteUrl}/index.html`);
      if (templateResponse.ok) {
        return new Response(templateResponse.body, {
          headers: { 'content-type': 'text/html' }
        });
      }
    }

    // Discovery pass-through
    if (request.headers.get('X-Asset-Discovery') === 'true') {
       if (env.ASSETS) {
         return env.ASSETS.fetch(new Request('http://localhost/index.html'));
       }
    }

    await this.fetchStaticDetails(apiUrl, env);

    if (url.pathname.startsWith('/api/')) {
      if (this.apiHandler) {
        return this.apiHandler.fetch(request, env, ctx);
      }
      return fetch(`${apiUrl}${url.pathname.replace(/^\/api/, '')}${url.search}`);
    }

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
      
      if (baseSiteUrl === url.origin && !env.ASSETS) {
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

    const assets = await this.discoverAssets(env, baseSiteUrl);
    const pageContent = await generatePageContent(url.pathname, this.routes, this.footerLinks, { ...env, apiUrl, siteTitle: this.siteTitle, copyright: this.copyright });
    
    const html = await this.templateRenderer({ 
      ...pageContent, 
      hydrationData: hydrationScript,
      baseSiteUrl,
      jsAsset: assets.js,
      cssAsset: assets.css
    });

    return new Response(html, {
      headers: {
        'content-type': 'text/html',
        'cache-control': 'public, max-age=60',
      },
    });
  }
}
