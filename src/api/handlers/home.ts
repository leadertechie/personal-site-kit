// Home page content handler

import { R2ContentLoader, type ContentNode } from '@leadertechie/r2tohtml';

interface HomeApiResponse {
  contentNodes: ContentNode[];
  processedMarkdown: string;
  content: string;
}

let loader: R2ContentLoader | null = null;

function getLoader(env: any): R2ContentLoader {
  if (!loader && env?.CONTENT_BUCKET) {
    loader = new R2ContentLoader(
      {
        bucket: env.CONTENT_BUCKET,
        cacheTTL: 5 * 60 * 1000,
      },
      {
        md2html: {
          imagePathPrefix: 'images/',
          styleOptions: {
            classPrefix: 'md-',
            addHeadingIds: true
          }
        }
      }
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
    const [astResult, renderedResult] = await Promise.all([
      r2.getWithAST('pages/home.md'),
      r2.getRendered('pages/home.md')
    ]);

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
