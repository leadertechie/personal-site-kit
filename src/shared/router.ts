import { generatePageContent, ContentMetadata, IFooterLink } from './page-content';
import { IRoute } from './interfaces/iroute';
import { WebsiteUI } from './website-ui';

export class Router {
  private routes: IRoute[];
  private siteTitle: string;
  private copyright: string;
  private footerLinks: IFooterLink[];
  private apiUrl: string;
  private logo: string = '/api/logo';
  private appElement: HTMLElement | null = null;

  constructor(private ui: WebsiteUI) {
    const store = ui.getStore();
    const config = store.getConfig();
    
    // Default routes if not provided in bootstrap
    this.routes = [
      { link: '/', text: 'Home' },
      { link: '/blogs', text: 'Blogs' },
      { link: '/stories', text: 'Stories' },
      { link: '/about-me', text: 'About Me' },
    ];

    this.siteTitle = config.siteTitle;
    this.copyright = config.copyright;
    this.apiUrl = config.apiUrl;
    
    const normalizeUrl = (url?: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('www.')) return `https://${url}`;
      return url;
    };

    this.footerLinks = [
      { text: 'LinkedIn', link: normalizeUrl(config.linkedin) },
      { text: 'GitHub', link: normalizeUrl(config.github) },
      { text: 'Email', link: config.email ? `mailto:${config.email}` : '' },
    ].filter(link => link.link !== '');
  }

  public init(appElementId: string = 'app') {
    this.appElement = document.getElementById(appElementId);
    if (!this.appElement) {
      console.error(`App element with id ${appElementId} not found`);
      return;
    }

    this.setupEventListeners();
    this.navigate(window.location.pathname);
  }

  private setupEventListeners() {
    document.body.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest('a[data-route]');
      if (target) {
        event.preventDefault();
        const route = target.getAttribute('href');
        if (route && route !== window.location.pathname) {
          window.history.pushState({}, '', route);
          this.navigate(route);
        }
      }
    });

    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });

    // Search input handler
    document.body.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.id === 'content-search') {
        const query = target.value.toLowerCase().trim();
        const items = document.querySelectorAll('#content-list .list-item');
        items.forEach(item => {
          const searchText = item.getAttribute('data-search') || '';
          if (searchText.includes(query)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      }
    });
  }

  public async navigate(path: string) {
    if (path.startsWith('/blogs/') && path.length > 7) {
      await this.renderContentDetailPage(path);
      return;
    }
    if (path.startsWith('/stories/') && path.length > 9) {
      await this.renderContentDetailPage(path);
      return;
    }

    switch (path) {
      case '/':
        await this.renderHomePage();
        break;
      case '/about-me':
        this.renderAboutMePage();
        break;
      case '/blogs':
      case '/stories':
        await this.renderContentListPage(path);
        break;
      case '/admin':
        await this.renderAdminPage();
        break;
      default:
        await this.renderHomePage(); // Fallback to home for now
    }
  }

  private setPageMeta(title: string, description: string, url: string) {
    document.title = title;
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url }
    ];

    metaTags.forEach(tag => {
      let element = tag.name 
        ? document.querySelector(`meta[name="${tag.name}"]`)
        : document.querySelector(`meta[property="${tag.property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        if (tag.name) element.setAttribute('name', tag.name);
        if (tag.property) element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);
  }

  private async renderHomePage() {
    let blogs: ContentMetadata[] = [];
    let stories: ContentMetadata[] = [];
    let homeContent = '';
    
    try {
      const [blogsRes, storiesRes, homeRes] = await Promise.all([
        fetch(`${this.apiUrl}/api/blogs`),
        fetch(`${this.apiUrl}/api/stories`),
        fetch(`${this.apiUrl}/api/home`)
      ]);
      if (blogsRes.ok) {
        const data = await blogsRes.json().catch(() => []);
        blogs = Array.isArray(data) ? data.slice(0, 3) : [];
      }
      if (storiesRes.ok) {
        const data = await storiesRes.json().catch(() => []);
        stories = Array.isArray(data) ? data.slice(0, 3) : [];
      }
      if (homeRes.ok) {
        const data = await homeRes.json().catch(() => ({}));
        homeContent = data.content || '';
      }
    } catch (e) {
      console.error('Failed to fetch home content', e);
    }

    const pageContent = generatePageContent('/', this.routes, this.footerLinks, { 
      blogs, stories, content: homeContent, siteTitle: this.siteTitle, copyright: this.copyright 
    });
    if (this.appElement) this.appElement.innerHTML = pageContent.content;
    this.setPageMeta(pageContent.title, pageContent.description, pageContent.canonicalUrl);
  }

  private renderAboutMePage() {
    const pageContent = generatePageContent('/about-me', this.routes, this.footerLinks, { 
      siteTitle: this.siteTitle, copyright: this.copyright, apiUrl: this.apiUrl 
    });
    if (this.appElement) this.appElement.innerHTML = pageContent.content;
    this.setPageMeta(pageContent.title, pageContent.description, pageContent.canonicalUrl);
  }

  private async renderContentListPage(pathname: string) {
    const type = pathname === '/blogs' ? 'blogs' : 'stories';
    let items: ContentMetadata[] = [];
    try {
      const res = await fetch(`${this.apiUrl}/api/${type}`);
      if (res.ok) items = await res.json();
    } catch (e) {}

    const latestSlug = items.length > 0 ? items[0].slug : undefined;
    const data = type === 'blogs' ? { blogs: items, slug: latestSlug } : { stories: items, slug: latestSlug };
    const pageContent = generatePageContent(pathname, this.routes, this.footerLinks, { 
      ...data, siteTitle: this.siteTitle, copyright: this.copyright 
    });
    if (this.appElement) this.appElement.innerHTML = pageContent.content;
    this.setPageMeta(pageContent.title, pageContent.description, pageContent.canonicalUrl);
  }

  private async renderContentDetailPage(pathname: string) {
    const isBlog = pathname.startsWith('/blogs/');
    const type = isBlog ? 'blogs' : 'stories';
    const slug = pathname.replace(`/${type}/`, '').split('/')[0];
    
    let items: ContentMetadata[] = [];
    try {
      const res = await fetch(`${this.apiUrl}/api/${type}`);
      if (res.ok) items = await res.json();
    } catch (e) {}

    const data = type === 'blogs' ? { blogs: items, slug } : { stories: items, slug };
    const pageContent = generatePageContent(pathname, this.routes, this.footerLinks, { 
      ...data, siteTitle: this.siteTitle, copyright: this.copyright 
    });
    if (this.appElement) this.appElement.innerHTML = pageContent.content;
    this.setPageMeta(`${slug.replace(/-/g, ' ')} - ${this.siteTitle}`, 'Read more content', window.location.href);
  }

  private async renderAdminPage() {
    // Admin portal should be lazy loaded or integrated
    const pageContent = generatePageContent('/admin', this.routes, this.footerLinks, { 
      siteTitle: this.siteTitle, copyright: this.copyright 
    });
    
    if (this.appElement) {
      this.appElement.innerHTML = `
        <my-banner header="${this.siteTitle}" logo="${this.logo}">
          <theme-toggle slot="theme-switcher"></theme-toggle>
          <nav slot="nav-links">
            <a href="/" class="nav-link" data-route="home">Home</a>
          </nav>
        </my-banner>
        <main class="container container-medium">
          <admin-portal></admin-portal>
        </main>
        <my-footer copyright="${this.copyright}" footerlinks='[]'></my-footer>
      `;
    }
  }
}
