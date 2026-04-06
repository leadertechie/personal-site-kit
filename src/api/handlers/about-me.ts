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
