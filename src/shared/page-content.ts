import { IFooterLink } from './interfaces/ifooter-link';
import { IRoute } from './interfaces/iroute';
export type { IFooterLink, IRoute };
import { MarkdownPipeline } from '@leadertechie/md2html';

export interface PageContent {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
}

export interface ContentMetadata {
  slug: string;
  title: string;
  description?: string;
  summary?: string;
  date: string;
  imageUrl?: string;
  tags?: string[];
  author?: string;
}

const pipeline = new MarkdownPipeline({
  imagePathPrefix: 'images/',
  styleOptions: {
    classPrefix: 'md-',
    addHeadingIds: true
  }
});

export const renderMarkdown = (content: string): string => {
  if (!content) return '';
  return pipeline.renderMarkdown(content);
};

export const generatePageContent = (
  pathname: string,
  routes: IRoute[],
  footerLinks: IFooterLink[],
  data?: {
    blogs?: ContentMetadata[];
    stories?: ContentMetadata[];
    profile?: any;
    content?: string;
    title?: string;
    description?: string;
    date?: string;
    slug?: string;
    siteTitle?: string;
    siteDescription?: string;
    copyright?: string;
    apiUrl?: string;
    baseUrl?: string;
  }
): PageContent => {
  const logo = "/api/logo";
  const siteTitle = data?.siteTitle || "My Personal Website";
  const siteDescription = data?.siteDescription || "Welcome to my professional portfolio and blog.";
  const copyright = data?.copyright || "2026 All Rights Reserved";
  const baseUrl = data?.baseUrl || "";
  const canonicalUrl = baseUrl ? new URL(pathname, baseUrl).toString() : pathname;
  
  const navLinks = routes
    .map(
      (route) =>
        `<a href="${route.link}" class="nav-link" data-route="${route.link === "/" ? "home" : route.text.toLowerCase()}">${route.text}</a>`,
    )
    .join("");

  const bannerTemplate = `
    <my-banner header="${siteTitle}" logo="${logo}">
      <theme-toggle slot="theme-switcher"></theme-toggle>
      <nav slot="nav-links">
        ${navLinks}
      </nav>
    </my-banner>`;

  const footerTemplate = `
    <my-footer
      copyright="${copyright}"
      footerlinks='\${JSON.stringify(footerLinks)}'>
    </my-footer>`;

  const renderContentGists = (items: ContentMetadata[] = [], title: string, type: 'blogs' | 'stories') => {
    const listHtml = items.length > 0 
      ? items.map(item => `
        <div class="gist-card">
          <a href="${type}/${item.slug}" data-route="${type}-${item.slug}"><h4>${item.title}</h4></a>
          <p>${item.summary || item.description || ''}</p>
          <small>${new Date(item.date).toLocaleDateString()}</small>
        </div>
      `).join('')
      : `<p>No ${type} available yet.</p>`;

    return `
      <div class="recent-content-section ${title.includes('Stories') ? 'mt-2' : ''}">
        <h3 class="border-bottom pb-05">${title}</h3>
        ${listHtml}
      </div>
    `;
  };

  if (pathname === "/" || pathname === "") {
    const homeHtml = data?.content || `<h1>Welcome to ${siteTitle}</h1><p>Start by configuring your content in the admin portal.</p>`;
    
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-wide column-layout row-layout">
        <div class="home-main-content main-column text-left">
            ${homeHtml}
        </div>
        <aside class="home-side-content sidebar-column">
            ${renderContentGists(data?.blogs, 'Recent Blogs', 'blogs')}
            ${renderContentGists(data?.stories, 'Recent Stories', 'stories')}
        </aside>
      </main>
      ${footerTemplate}`;

    return {
      title: `${siteTitle} - Home`,
      description: siteDescription,
      canonicalUrl,
      content: mainContent
    };
  } else if (pathname === "/blogs" || pathname === "/stories" || pathname.startsWith("/blogs/") || pathname.startsWith("/stories/")) {
    const isBlog = pathname.includes("blogs");
    const type = isBlog ? "blogs" : "stories";
    const items = isBlog ? data?.blogs : data?.stories;
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    const currentSlug = data?.slug;

    const mainContent = `
    ${bannerTemplate}
    <main class="container container-wide">
        <div class="mb-2">
          <input type="text" id="content-search" placeholder="Search ${type}..." class="search-input search-input-lg">
        </div>
        <div class="column-layout">
          <aside class="sidebar-nav sidebar-column">
            <div id="content-list">
              ${items?.map(item => {
                const searchTerms = [
                  item.title,
                  ...(item.tags || []),
                  item.summary || item.description || '',
                  item.slug
                ].join(' ').toLowerCase();
                
                return `
                <div class="list-item sidebar-item ${item.slug === currentSlug ? 'active' : ''}" 
                     data-search="${searchTerms}">
                  <a href="/${type}/${item.slug}" data-route="${type}-${item.slug}" class="sidebar-item sidebar-item-link">
                    <h4>${item.title}</h4>
                    <small>${new Date(item.date).toLocaleDateString()}</small>
                  </a>
                </div>
              `}).join('') || `<p>No ${type} available yet.</p>`}
            </div>
          </aside>
          <div class="wide-main-column text-left">
            <div id="content-viewer">
              ${currentSlug 
                ? (isBlog ? `<my-blog-viewer slug="${currentSlug}"></my-blog-viewer>` : `<my-story-viewer slug="${currentSlug}"></my-story-viewer>`)
                : (items && items.length > 0 ? `<p>Select a ${type.slice(0, -1)} to read.</p>` : '')}
            </div>
          </div>
        </div>
      </main>
      ${footerTemplate}`;

    return {
      title: `${title} - ${siteTitle}`,
      description: `Read the latest ${type} from ${siteTitle}.`,
      canonicalUrl,
      content: mainContent
    };
  } else if (pathname === "/about-me") {
    const apiBaseUrl = data?.apiUrl || "";
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-narrow">
        <my-aboutme base-url="${apiBaseUrl}"></my-aboutme>
      </main>
      ${footerTemplate}`;

    return {
      title: `About - ${siteTitle}`,
      description: `Learn more about ${siteTitle}.`,
      canonicalUrl,
      content: mainContent
    };
  } else {
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-narrow text-center page-content">
        <h1 class="page-title">Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p><a href="/">Return to home</a></p>
      </main>
      ${footerTemplate}`;

    return {
      title: `404 Not Found - ${siteTitle}`,
      description: "The page you requested could not be found.",
      canonicalUrl,
      content: mainContent
    };
  }
};
