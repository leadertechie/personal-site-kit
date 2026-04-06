import { BasePageGenerator, StaticDetails } from './base';
import { IRoute, IFooterLink, PageContent } from '../page-content';
import { Profile, BlogMeta } from '../data-fetcher';

export interface HomePageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
  profile: Profile | null;
  homeContent: string;
  latestBlogs: BlogMeta[];
  latestStories: BlogMeta[];
}

export class HomePageGenerator extends BasePageGenerator {
  public generate(data: HomePageData): PageContent {
    const { profile, homeContent, latestBlogs, latestStories, staticDetails, ...baseData } = data;

    const name = profile?.name || "User";
    const title = profile?.title || "Professional";

    const homeHtml = homeContent || `<h1>Welcome to ${name}</h1><p>Upload home.md to customize this page.</p>`;
    const blogGists = latestBlogs.map(b => `<div class="gist-card"><a href="/blogs/${b.slug}"><h4>${b.title}</h4></a><p>${b.summary}</p><small>${b.date}</small></div>`).join("");
    const storyGists = latestStories.map(s => `<div class="gist-card"><a href="/stories/${s.slug}"><h4>${s.title}</h4></a><p>${s.summary}</p><small>${s.date}</small></div>`).join("");

    const mainContent = `
      <main class="container container-wide column-layout">
        <div class="main-column">
          ${homeHtml}
        </div>
        <div class="sidebar-column">
          <h3>Recent Blogs</h3>
          ${blogGists || "<p>No blogs yet.</p>"}
          <h3 class="mt-2">Recent Stories</h3>
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
      `${name} – ${title}`,
      `Welcome to ${name}'s personal website. Professional portfolio and content.`
    );
  }
}