import { BasePageGenerator, StaticDetails } from './base';
import { IRoute, IFooterLink, PageContent } from '../page-content';
import { BlogMeta } from '../data-fetcher';

export interface StoriesListPageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
  latestStories: BlogMeta[];
  name: string;
}

export class StoriesListPageGenerator extends BasePageGenerator {
  public generate(data: StoriesListPageData): PageContent {
    const { latestStories, name, staticDetails, ...baseData } = data;

    const storyGists = latestStories.map(s => `<div class="gist-card"><a href="/stories/${s.slug}"><h4>${s.title}</h4></a><p>${s.summary}</p><small>${s.date}</small></div>`).join("");

    const mainContent = `
      <main class="container container-wide">
        <h1>Stories</h1>
        <input type="text" placeholder="Search stories..." class="search-input" />
        <div class="story-list">
          ${storyGists || "<p>No stories yet.</p>"}
        </div>
      </main>`;

    return this.generatePage(
      baseData.pathname,
      baseData.routes,
      baseData.footerLinks,
      staticDetails,
      baseData.apiUrl,
      baseData.baseUrl,
      mainContent,
      `Stories – ${name}`,
      "Read the latest stories."
    );
  }
}