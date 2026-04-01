export default {
  async fetch(request: Request, env?: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Extract route from pathname, removing leading/trailing slashes and /api prefix
    const pathname = url.pathname;
    const route = pathname
      .replace(/^\/api\//, '') // Remove /api/ prefix if present
      .replace(/^\//, '') // Remove leading slash
      .replace(/\/+$/, ''); // Remove trailing slashes

    return handleAPIRoute(route, request, env);

  },
};

function handleCORS(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function addCORSHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

import { createErrorResponse } from './utils';

import { handleAboutMe, clearContentCache } from './handlers/aboutme';
import { handleHome } from './handlers/home';
import { handleInfo } from './handlers/info';
import { handleContent } from './handlers/content';
import { handleBlogs, handleStories, handleSearch } from './handlers/content-api';
import { handleLogo } from './handlers/logo';
import { handleStaticDetails } from './handlers/staticdetails';

function requireAuth(request: Request, env?: Env): Response | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse('Unauthorized', 401);
  }
  const token = authHeader.slice(7);
  if (token !== env?.ADMIN_API_KEY) {
    return createErrorResponse('Unauthorized', 401);
  }
  return null;
}

async function handleAPIRoute(route: string, request: Request, env?: Env): Promise<Response> {
  try {
    // Check for content route first (content/*)
    if (route === 'content' || route.startsWith('content/')) {
      const subpath = route.replace(/^content\/?/, '');
      return addCORSHeaders(await handleContent(request, env, subpath));
    }

    switch (route) {
      case 'info':
        return addCORSHeaders(await handleInfo());
      case 'home':
        return addCORSHeaders(await handleHome(env));
      case 'cache-clear':
        const authError = requireAuth(request, env);
        if (authError) return addCORSHeaders(authError);
        clearContentCache();
        return addCORSHeaders(new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), { status: 200 }));
      case 'aboutme':
        return addCORSHeaders(await handleAboutMe(env));
      case 'logo':
        return addCORSHeaders(await handleLogo(env));
      case 'static':
        return addCORSHeaders(await handleStaticDetails(env));
      case 'blogs':
        return addCORSHeaders(await handleBlogs(env));
      case 'blogs/latest':
        const url = new URL(request.url);
        const latestCount = url.searchParams.get('count');
        return addCORSHeaders(await handleBlogs(env, undefined, latestCount ? parseInt(latestCount) : 5));
      default:
        if (route.startsWith('blogs/')) {
          const slug = route.replace('blogs/', '');
          return addCORSHeaders(await handleBlogs(env, slug));
        }
        if (route.startsWith('stories')) {
          if (route === 'stories') {
            return addCORSHeaders(await handleStories(env));
          }
          if (route === 'stories/latest') {
            const url = new URL(request.url);
            const latestCount = url.searchParams.get('count');
            return addCORSHeaders(await handleStories(env, undefined, latestCount ? parseInt(latestCount) : 5));
          }
          const slug = route.replace('stories/', '');
          return addCORSHeaders(await handleStories(env, slug));
        }
        if (route === 'search') {
          const url = new URL(request.url);
          const query = url.searchParams.get('q');
          return addCORSHeaders(await handleSearch(env, query || undefined));
        }
        return addCORSHeaders(createErrorResponse('Route not found', 404));
    }
  } catch (error) {
    return addCORSHeaders(createErrorResponse('Internal server error', 500));
  }
}

interface Env {
  CONTENT_BUCKET?: any; // R2Bucket type not strictly enforced here to avoid large diff
  ADMIN_API_KEY?: string;
}
