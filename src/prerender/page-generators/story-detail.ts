import { BasePageGenerator, StaticDetails } from './base';
import { IRoute, IFooterLink, PageContent } from '../page-content';

export interface StoryDetailPageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
  slug: string;
}

export class StoryDetailPageGenerator extends BasePageGenerator {
  public generate(data: StoryDetailPageData): PageContent {
    const { slug, staticDetails, ...baseData } = data;

    const mainContent = `
      <main class="container container-narrow">
        <my-story-viewer slug="${slug}"></my-story-viewer>
      </main>`;

    return this.generatePage(
      baseData.pathname,
      baseData.routes,
      baseData.footerLinks,
      staticDetails,
      baseData.apiUrl,
      baseData.baseUrl,
      mainContent,
      `Story: ${slug}`,
      "Story post"
    );
  }
}