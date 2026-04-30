// Simple JSON response handler for Cloudflare Workers

import { R2ContentLoader, ContentCacheV2, type ContentNode } from '@leadertechie/r2tohtml';

interface Profile {
  name: string;
  title: string;
  experience: string;
  profileImageUrl: string;
}

interface AboutMeApiResponse {
  profile: Profile;
  contentNodes: ContentNode[];
  processedMarkdown: string;
}

let loader: R2ContentLoader | null = null;

// Use ContentCacheV2 with SWR for stale-while-revalidate caching
const swrCache = new ContentCacheV2(
  5 * 60 * 1000,   // TTL: 5 minutes fresh
  true,             // enabled
  30 * 60 * 1000    // SWR TTL: 30 minutes stale window
);

function getLoader(env: any): R2ContentLoader | null {
  if (!env?.CONTENT_BUCKET) {
    return null;
  }
  
  if (!loader) {
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
          imagePathPrefix: 'images/',
          preserveRawHTML: true,
          errorRecovery: 'warn',
          maxRecursionDepth: 50,
          styleOptions: {
            classPrefix: 'md-',
            addHeadingIds: true,
            emitScopeAnchors: true
          }
        }
      } as any
    );
  }
  return loader;
}

export function clearContentCache() {
  loader?.clearCache();
}

export async function handleAboutMe(env?: any): Promise<Response> {
  try {
    console.log('handleAboutMe: env?.CONTENT_BUCKET =', !!env?.CONTENT_BUCKET);
    
    if (!env?.CONTENT_BUCKET) {
      return new Response(JSON.stringify({ error: 'Content bucket not configured', env: !!env }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const r2 = getLoader(env);
    if (!r2) {
      return new Response(JSON.stringify({ error: 'Content bucket not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.log('handleAboutMe: r2 created, fetching data');

    const [profileObj, rendered] = await Promise.all([
      r2.getObject('profile.json'),
      r2.getRendered('about-me.md')
    ]);

    if (!rendered) {
      return new Response(JSON.stringify({ error: 'About-me content not found. Please run seed.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let profile: Profile = {
      name: 'Your Name',
      title: 'Professional',
      experience: 'Experienced',
      profileImageUrl: ''
    };

    if (profileObj) {
      profile = await profileObj.json() as Profile;
    }
    console.log('handleAboutMe: profile loaded:', profile.name);

    const responseData: AboutMeApiResponse = {
      profile,
      contentNodes: [],
      processedMarkdown: rendered.content
    };

    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error serving aboutme content:', error);
    return new Response(JSON.stringify({ error: 'Content not available', message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
