import { BasePageGenerator, StaticDetails } from './base';
import { IRoute, IFooterLink, PageContent } from '../page-content';

export interface BlogDetailPageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
  slug: string;
}

export class BlogDetailPageGenerator extends BasePageGenerator {
  public generate(data: BlogDetailPageData): PageContent {
    const { slug, staticDetails, ...baseData } = data;

    const mainContent = `
      <main class="container container-narrow">
        <my-blog-viewer slug="${slug}"></my-blog-viewer>
      </main>`;

    return this.generatePage(
      baseData.pathname,
      baseData.routes,
      baseData.footerLinks,
      staticDetails,
      baseData.apiUrl,
      baseData.baseUrl,
      mainContent,
      `Blog: ${slug}`,
      "Blog post"
    );
  }
}