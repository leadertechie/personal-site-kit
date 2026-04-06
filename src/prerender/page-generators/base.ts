import { IRoute, IFooterLink, PageContent } from '../page-content';

export interface StaticDetails {
  siteTitle?: string;
  copyright?: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

export interface BasePageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
  name?: string;
  title?: string;
}

export class BasePageGenerator {
  protected generateBanner(routes: IRoute[], siteTitle: string, logo: string): string {
    const navLinks = routes
      .map(r => `<a href="${r.link}" class="nav-link" data-route="${r.link === "/" ? "home" : r.text.toLowerCase()}">${r.text}</a>`)
      .join("");

    return `
      <my-banner header="${siteTitle}" logo="${logo}">
        <theme-toggle slot="theme-switcher"></theme-toggle>
        <nav slot="nav-links">
          ${navLinks}
        </nav>
      </my-banner>`;
  }

  protected generateFooter(footerLinks: IFooterLink[], copyright: string): string {
    return `
      <my-footer
        copyright="${copyright}"
        footerlinks='${JSON.stringify(footerLinks)}'>
      </my-footer>`;
  }

  protected generateMeta(title: string, description: string, canonicalUrl: string): void {
    // This would be handled in the main function
  }

  protected wrapContent(banner: string, mainContent: string, footer: string): string {
    return `${banner}${mainContent}${footer}`;
  }

  public generatePage(
    pathname: string,
    routes: IRoute[],
    footerLinks: IFooterLink[],
    staticDetails: StaticDetails,
    apiUrl: string,
    baseUrl: string,
    mainContent: string,
    title: string,
    description: string
  ): PageContent {
    const logo = "/api/logo";
    const banner = this.generateBanner(routes, staticDetails.siteTitle || "My Personal Website", logo);
    const footer = this.generateFooter(footerLinks, staticDetails.copyright || "2026 My Personal Website");
    const canonicalUrl = new URL(pathname, baseUrl).toString();
    const content = this.wrapContent(banner, mainContent, footer);

    return {
      title,
      description,
      canonicalUrl,
      content
    };
  }
}