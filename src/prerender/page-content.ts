import { R2ContentLoader, ContentCacheV2 } from "@leadertechie/r2tohtml";

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

// Use ContentCacheV2 with SWR for stale-while-revalidate caching
const swrCache = new ContentCacheV2(
  5 * 60 * 1000,   // TTL: 5 minutes fresh
  true,             // enabled
  30 * 60 * 1000    // SWR TTL: 30 minutes stale window
);

function getLoader(env: any): R2ContentLoader | null {
  if (!loader) {
    if (!env?.CONTENT_BUCKET) return null;
    loader = new R2ContentLoader(
      {
        bucket: env.CONTENT_BUCKET,
        cacheTTL: 5 * 60 * 1000,
        cfCache: true,           // Enable Cloudflare edge cache tier
        cfCacheTTL: 300,         // CF cache for 5 minutes
        swrTTL: 30 * 60 * 1000,  // SWR window: 30 minutes
      } as any,
      {
        md2html: {
          imagePathPrefix: "images/",
          preserveRawHTML: true,
          errorRecovery: "warn",
          maxRecursionDepth: 50,
          styleOptions: {
            classPrefix: "md-",
            addHeadingIds: true,
            emitScopeAnchors: true
          }
        }
      } as any
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
    const result = await r2.getRendered("pages/home.md");
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
  const apiUrl = env?.API_URL || env?.apiUrl || "https://api.example.com";
  const baseUrl = env?.BASE_URL || env?.baseUrl || "https://www.example.com";
  
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
  const canonicalUrl = new URL(pathname, baseUrl).toString();

  // Strategy pattern: map pathname patterns to generators
  const strategies = {
    home: async () => {
      const { HomePageGenerator } = await import('./page-generators');
      const generator = new HomePageGenerator();
      return generator.generate({
        routes,
        footerLinks,
        staticDetails,
        apiUrl,
        baseUrl,
        pathname,
        profile,
        homeContent,
        latestBlogs,
        latestStories
      });
    },
    about: async () => {
      const { AboutPageGenerator } = await import('./page-generators');
      const generator = new AboutPageGenerator();
      return generator.generate({
        routes,
        footerLinks,
        staticDetails,
        apiUrl,
        baseUrl,
        pathname,
        profile
      });
    },
    blogsList: async () => {
      const { BlogsListPageGenerator } = await import('./page-generators');
      const generator = new BlogsListPageGenerator();
      return generator.generate({
        routes,
        footerLinks,
        staticDetails,
        apiUrl,
        baseUrl,
        pathname,
        latestBlogs,
        name
      });
    },
    storiesList: async () => {
      const { StoriesListPageGenerator } = await import('./page-generators');
      const generator = new StoriesListPageGenerator();
      return generator.generate({
        routes,
        footerLinks,
        staticDetails,
        apiUrl,
        baseUrl,
        pathname,
        latestStories,
        name
      });
    },
    blogDetail: async (slug: string) => {
      const { BlogDetailPageGenerator } = await import('./page-generators');
      const generator = new BlogDetailPageGenerator();
      return generator.generate({
        routes,
        footerLinks,
        staticDetails,
        apiUrl,
        baseUrl,
        pathname,
        slug
      });
    },
    storyDetail: async (slug: string) => {
      const { StoryDetailPageGenerator } = await import('./page-generators');
      const generator = new StoryDetailPageGenerator();
      return generator.generate({
        routes,
        footerLinks,
        staticDetails,
        apiUrl,
        baseUrl,
        pathname,
        slug
      });
    },
    notFound: async () => {
      const { NotFoundPageGenerator } = await import('./page-generators');
      const generator = new NotFoundPageGenerator();
      return generator.generate({
        routes,
        footerLinks,
        staticDetails,
        apiUrl,
        baseUrl,
        pathname
      });
    }
  };

  if (pathname === "/" || pathname === "") {
    return strategies.home();
  } else if (pathname === "/about-me") {
    return strategies.about();
  } else if (pathname === "/blogs" || pathname === "/blogs/") {
    return strategies.blogsList();
  } else if (pathname === "/stories" || pathname === "/stories/") {
    return strategies.storiesList();
  } else if (pathname.startsWith("/blogs/")) {
    const slug = pathname.replace("/blogs/", "").replace("/", "");
    return strategies.blogDetail(slug);
  } else if (pathname.startsWith("/stories/")) {
    const slug = pathname.replace("/stories/", "").replace("/", "");
    return strategies.storyDetail(slug);
  } else {
    return strategies.notFound();
  }
};
