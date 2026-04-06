import { BasePageGenerator, StaticDetails } from './base';
import { IRoute, IFooterLink, PageContent } from '../page-content';
import { Profile } from '../data-fetcher';

export interface AboutPageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
  profile: Profile | null;
}

export class AboutPageGenerator extends BasePageGenerator {
  public generate(data: AboutPageData): PageContent {
    const { profile, staticDetails, ...baseData } = data;

    const name = profile?.name || "User";

    const mainContent = `
      <main class="container container-narrow">
        <my-aboutme base-url="${baseData.apiUrl}"></my-aboutme>
      </main>`;

    return this.generatePage(
      baseData.pathname,
      baseData.routes,
      baseData.footerLinks,
      staticDetails,
      baseData.apiUrl,
      baseData.baseUrl,
      mainContent,
      `About - ${name}`,
      `Learn more about ${name}'s experience and skills.`
    );
  }
}