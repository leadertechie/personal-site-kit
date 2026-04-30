import { R2ContentLoader, ContentCacheV2 } from "@leadertechie/r2tohtml";

export interface Profile {
  name: string;
  title: string;
  experience: string;
  profileImageUrl: string;
}

export interface BlogMeta {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
}

let loader: R2ContentLoader | null = null;

// Use ContentCacheV2 with SWR support for stale-while-revalidate caching
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

export async function fetchProfile(env: any): Promise<Profile | null> {
  try {
    const r2 = getLoader(env);
    if (!r2) return null;
    const obj = await r2.getObject("profile.json");
    if (!obj) return null;
    return await obj.json() as Profile;
  } catch { return null; }
}

export async function fetchAboutMe(env: any): Promise<string> {
  try {
    const r2 = getLoader(env);
    if (!r2) return "";
    const result = await r2.getRendered("about-me.md");
    return result?.content || "";
  } catch { return ""; }
}

export async function fetchHome(env: any): Promise<string> {
  try {
    const r2 = getLoader(env);
    if (!r2) return "";
    const result = await r2.getRendered("pages/home.md");
    return result?.content || "";
  } catch { return ""; }
}

export async function fetchLatestBlogSummaries(env: any, count: number = 3): Promise<BlogMeta[]> {
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

export async function fetchLatestStorySummaries(env: any, count: number = 3): Promise<BlogMeta[]> {
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