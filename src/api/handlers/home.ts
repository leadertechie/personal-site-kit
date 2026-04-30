// Home page content handler

import { R2ContentLoader, ContentCacheV2, type ContentNode } from '@leadertechie/r2tohtml';

interface HomeApiResponse {
  contentNodes: ContentNode[];
  processedMarkdown: string;
  content: string;
}

let loader: R2ContentLoader | null = null;

// Use ContentCacheV2 with SWR for stale-while-revalidate caching
const swrCache = new ContentCacheV2(
  5 * 60 * 1000,   // TTL: 5 minutes fresh
  true,             // enabled
  30 * 60 * 1000    // SWR TTL: 30 minutes stale window
);

function getLoader(env: any): R2ContentLoader {
  if (!loader && env?.CONTENT_BUCKET) {
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
  return loader!;
}

export function clearContentCache() {
  loader?.clearCache();
}

export async function handleHome(env?: any): Promise<Response> {
  try {
    if (!env?.CONTENT_BUCKET) {
      return new Response(JSON.stringify({ error: 'Content bucket not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const r2 = getLoader(env);
    
    let astResult = await r2.getWithAST('pages/home.md');
    let renderedResult = await r2.getRendered('pages/home.md');
    
     if (!astResult || !renderedResult) {
      return new Response(JSON.stringify({
        contentNodes: [],
        processedMarkdown: '',
        content: ''
      } as HomeApiResponse), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseData: HomeApiResponse = {
      contentNodes: astResult.contentNodes,
      processedMarkdown: '',
      content: renderedResult.content
    };

    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error serving home content:', error);
    return new Response(JSON.stringify({ error: 'Content not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
