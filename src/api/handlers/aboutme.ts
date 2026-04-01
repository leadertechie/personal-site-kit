// Simple JSON response handler for Cloudflare Workers

import { R2ContentLoader, type ContentNode } from '@leadertechie/r2tohtml';

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

function getLoader(env: any): R2ContentLoader | null {
  if (!env?.CONTENT_BUCKET) {
    return null;
  }
  
  if (!loader) {
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

    const [profileObj, astResult] = await Promise.all([
      r2.getObject('profile.json'),
      r2.getWithAST('about-me.md')
    ]);

    console.log('handleAboutMe: profileObj =', !!profileObj, 'astResult =', !!astResult);

    if (!profileObj || !astResult) {
      throw new Error('Content not found in R2');
    }

    const profile = await profileObj.json() as Profile;
    console.log('handleAboutMe: profile loaded:', profile.name);

    const responseData: AboutMeApiResponse = {
      profile,
      contentNodes: astResult.contentNodes,
      processedMarkdown: ''
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
