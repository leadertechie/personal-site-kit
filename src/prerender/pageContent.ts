import { R2ContentLoader } from "@leadertechie/r2tohtml";

interface Profile {
  name: string;
  title: string;
  experience: string;
  profileImageUrl: string;
}

export interface IRoute {
  text: string;
  link: string;
}

export interface IFooterLink {
  text: string;
  link: string;
}

export interface PageContent {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
}

interface BlogMeta {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
}

let loader: R2ContentLoader | null = null;

function getLoader(env: any): R2ContentLoader | null {
  if (!loader) {
    if (!env?.CONTENT_BUCKET) return null;
    loader = new R2ContentLoader(
      { bucket: env.CONTENT_BUCKET, cacheTTL: 5 * 60 * 1000 },
      { md2html: { imagePathPrefix: "images/", styleOptions: { classPrefix: "md-", addHeadingIds: true } } }
    );
  }
  return loader;
}

async function fetchProfile(env: any): Promise<Profile | null> {
  try {
    const r2 = getLoader(env);
    if (!r2) return null;
    const obj = await r2.getObject("profile.json");
    if (!obj) return null;
    return await obj.json() as Profile;
  } catch { return null; }
}

async function fetchAboutMe(env: any): Promise<string> {
  try {
    const r2 = getLoader(env);
    if (!r2) return "";
    const result = await r2.getRendered("about-me.md");
    return result?.content || "";
  } catch { return ""; }
}

async function fetchHome(env: any): Promise<string> {
  try {
    const r2 = getLoader(env);
    if (!r2) return "";
    const result = await r2.getRendered("home.md");
    return result?.content || "";
  } catch { return ""; }
}

async function fetchLatestBlogSummaries(env: any, count: number = 3): Promise<BlogMeta[]> {
  try {
    const r2 = getLoader(env);
    if (!r2) return [];
    const list = await r2.list("blogs/");
    const metas: BlogMeta[] = [];
    for (const obj of list.objects) {
      if (obj.key.endsWith(".json")) {
        try {
          const metaObj = await r2.getObject(obj.key);
          if (metaObj) metas.push(await metaObj.json() as BlogMeta);
        } catch {}
      }
    }
    return metas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, count);
  } catch { return []; }
}

async function fetchLatestStorySummaries(env: any, count: number = 3): Promise<BlogMeta[]> {
  try {
    const r2 = getLoader(env);
    if (!r2) return [];
    const list = await r2.list("stories/");
    const metas: BlogMeta[] = [];
    for (const obj of list.objects) {
      if (obj.key.endsWith(".json")) {
        try {
          const metaObj = await r2.getObject(obj.key);
          if (metaObj) metas.push(await metaObj.json() as BlogMeta);
        } catch {}
      }
    }
    return metas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, count);
  } catch { return []; }
}

export const generatePageContent = async (
  pathname: string,
  routes: IRoute[],
  footerLinks: IFooterLink[],
  env?: any
): Promise<PageContent> => {
  const apiUrl = env?.apiUrl || "https://api.techieleader.com";
  const baseUrl = env?.baseUrl || "https://www.techieleader.com";
  
  let staticDetails = {
    siteTitle: "My Personal Website",
    copyright: "2026 My Personal Website",
    linkedin: "https://linkedin.com/in/yourname",
    github: "https://github.com/yourname",
    email: "yourname@domain.com"
  };
  
  try {
    const res = await fetch(`${apiUrl}/api/static`);
    if (res.ok) staticDetails = await res.json();
  } catch (e) {}
  
  const logo = "/api/logo";
  const navLinks = routes.map(r => `<a href="${r.link}" class="nav-link" data-route="${r.link === "/" ? "home" : r.text.toLowerCase()}">${r.text}</a>`).join("");

  const bannerTemplate = `
    <my-banner header="${staticDetails.siteTitle}" logo="${logo}">
      <theme-toggle slot="theme-switcher"></theme-toggle>
      <nav slot="nav-links">
        ${navLinks}
      </nav>
    </my-banner>`;

  const footerTemplate = `
    <my-footer
      copyright="${staticDetails.copyright}"
      footerlinks='${JSON.stringify(footerLinks)}'>
    </my-footer>`;

  let profile: Profile | null = null;
  let aboutMeContent = "";
  let homeContent = "";
  let latestBlogs: BlogMeta[] = [];
  let latestStories: BlogMeta[] = [];

  if (env?.CONTENT_BUCKET) {
    [profile, aboutMeContent, homeContent, latestBlogs, latestStories] = await Promise.all([
      fetchProfile(env), fetchAboutMe(env), fetchHome(env), fetchLatestBlogSummaries(env, 3), fetchLatestStorySummaries(env, 3)
    ]);
  }

  const name = profile?.name || "User";
  const title = profile?.title || "Professional";
  const experience = profile?.experience || "some";
  const canonicalUrl = new URL(pathname, baseUrl).toString();

  if (pathname === "/" || pathname === "") {
    const homeHtml = homeContent || `<h1>Welcome to ${name}</h1><p>Upload home.md to customize this page.</p>`;
    const blogGists = latestBlogs.map(b => `<div class="gist-card"><a href="/blogs/${b.slug}"><h4>${b.title}</h4></a><p>${b.summary}</p><small>${b.date}</small></div>`).join("");
    const storyGists = latestStories.map(s => `<div class="gist-card"><a href="/stories/${s.slug}"><h4>${s.title}</h4></a><p>${s.summary}</p><small>${s.date}</small></div>`).join("");

    const mainContent = `
    ${bannerTemplate}
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
    </main>
    ${footerTemplate}`;

    return {
      title: `${name} – ${title}`,
      description: `Welcome to ${name}'s personal website. Professional portfolio and content.`,
      canonicalUrl,
      content: mainContent
    };
  } else if (pathname === "/about-me") {
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-narrow">
        <my-aboutme base-url="${apiUrl}"></my-aboutme>
      </main>
      ${footerTemplate}`;

    return {
      title: `About - ${name}`,
      description: `Learn more about ${name}'s experience and skills.`,
      canonicalUrl,
      content: mainContent
    };
  } else if (pathname === "/blogs" || pathname === "/blogs/") {
    const blogGists = latestBlogs.map(b => `<div class="gist-card"><a href="/blogs/${b.slug}"><h4>${b.title}</h4></a><p>${b.summary}</p><small>${b.date}</small></div>`).join("");
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-wide">
      <h1>Blogs</h1>
      <input type="text" placeholder="Search blogs..." class="search-input" />
      <div class="blog-list">
        ${blogGists || "<p>No blogs yet.</p>"}
      </div>
    </main>
    ${footerTemplate}`;
    return { title: `Blogs – ${name}`, description: "Read the latest blog posts.", canonicalUrl, content: mainContent };
  } else if (pathname === "/stories" || pathname === "/stories/") {
    const storyGists = latestStories.map(s => `<div class="gist-card"><a href="/stories/${s.slug}"><h4>${s.title}</h4></a><p>${s.summary}</p><small>${s.date}</small></div>`).join("");
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-wide">
      <h1>Stories</h1>
      <input type="text" placeholder="Search stories..." class="search-input" />
      <div class="story-list">
        ${storyGists || "<p>No stories yet.</p>"}
      </div>
    </main>
    ${footerTemplate}`;
    return { title: `Stories – ${name}`, description: "Read the latest stories.", canonicalUrl, content: mainContent };
  } else if (pathname.startsWith("/blogs/")) {
    const slug = pathname.replace("/blogs/", "").replace("/", "");
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-narrow">
      <my-blog-viewer slug="${slug}"></my-blog-viewer>
    </main>
    ${footerTemplate}`;
    return { title: `Blog: ${slug}`, description: "Blog post", canonicalUrl, content: mainContent };
  } else if (pathname.startsWith("/stories/")) {
    const slug = pathname.replace("/stories/", "").replace("/", "");
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-narrow">
      <my-story-viewer slug="${slug}"></my-story-viewer>
    </main>
    ${footerTemplate}`;
    return { title: `Story: ${slug}`, description: "Story post", canonicalUrl, content: mainContent };
  } else {
    const mainContent = `
    ${bannerTemplate}
    <main class="container container-narrow text-center">
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p><a href="/">Return to home</a></p>
      </main>
      ${footerTemplate}`;
    return { title: "404 Not Found", description: "The page you requested could not be found.", canonicalUrl, content: mainContent };
  }
};
