import { BasePageGenerator, StaticDetails } from './base';
import { IRoute, IFooterLink, PageContent } from '../page-content';

export interface NotFoundPageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
}

export class NotFoundPageGenerator extends BasePageGenerator {
  public generate(data: NotFoundPageData): PageContent {
    const { staticDetails, ...baseData } = data;

    const mainContent = `
      <main class="container container-narrow text-center">
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p><a href="/">Return to home</a></p>
      </main>`;

    return this.generatePage(
      baseData.pathname,
      baseData.routes,
      baseData.footerLinks,
      staticDetails,
      baseData.apiUrl,
      baseData.baseUrl,
      mainContent,
      "404 Not Found",
      "The page you requested could not be found."
    );
  }
}