import { BasePageGenerator, StaticDetails } from './base';
import { IRoute, IFooterLink, PageContent } from '../page-content';
import { BlogMeta } from '../data-fetcher';

export interface BlogsListPageData {
  routes: IRoute[];
  footerLinks: IFooterLink[];
  staticDetails: StaticDetails;
  apiUrl: string;
  baseUrl: string;
  pathname: string;
  latestBlogs: BlogMeta[];
  name: string;
}

export class BlogsListPageGenerator extends BasePageGenerator {
  public generate(data: BlogsListPageData): PageContent {
    const { latestBlogs, name, staticDetails, ...baseData } = data;

    const blogGists = latestBlogs.map(b => `<div class="gist-card"><a href="/blogs/${b.slug}"><h4>${b.title}</h4></a><p>${b.summary}</p><small>${b.date}</small></div>`).join("");

    const mainContent = `
      <main class="container container-wide">
        <h1>Blogs</h1>
        <input type="text" placeholder="Search blogs..." class="search-input" />
        <div class="blog-list">
          ${blogGists || "<p>No blogs yet.</p>"}
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
      `Blogs – ${name}`,
      "Read the latest blog posts."
    );
  }
}