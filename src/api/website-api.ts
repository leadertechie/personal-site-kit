import { createErrorResponse } from './utils';
import { handleAboutMe, clearContentCache } from './handlers/about-me';
import { handleHome } from './handlers/home';
import { handleInfo } from './handlers/info';
import { handleContent } from './handlers/content';
import { handleAuth } from './handlers/auth-handler';
import { handleBlogs, handleStories, handleSearch } from './handlers/content-api';
import { handleLogo } from './handlers/logo';
import { handleStaticDetails } from './handlers/static-details';
import { getAuthStore } from './handlers/auth';

export type APIHandler = (request: Request, env: any) => Promise<Response>;

export class WebsiteAPI {
  private customHandlers = new Map<string, APIHandler>();

  public registerHandler(route: string, handler: APIHandler) {
    this.customHandlers.set(route, handler);
  }

  private addCORSHeaders(response: Response): Response {
    response.headers.set('Access-Control-Allow-Origin', '*' );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS' );
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  private addAdminCORSHeaders(response: Response, origin: string): Response {
    const allowOrigin = origin.includes('localhost') || origin.includes('127.0.0.1') 
      ? origin 
      : 'same-origin';
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  private handleCORS(origin: string): Response {
    const allowOrigin = origin.includes('localhost') || origin.includes('127.0.0.1') 
      ? origin 
      : '*';
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin ,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' ,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  public async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || url.origin;

    if (request.method === 'OPTIONS') {
      return this.handleCORS(origin);
    }

    const pathname = url.pathname;
    const route = pathname
      .replace(/^\/api\//, '')
      .replace(/^\//, '')
      .replace(/\/+$/, '');

    // Check custom handlers first
    if (this.customHandlers.has(route)) {
      const handler = this.customHandlers.get(route)!;
      return this.addCORSHeaders(await handler(request, env));
    }

    try {
      // Check for content route first (content/*)
      if (route === 'content' || route.startsWith('content/')) {
        const subpath = route.replace(/^content\/?/, '');
        return this.addAdminCORSHeaders(await handleContent(request, env, subpath), origin);
      }

      switch (route) {
        case 'info':
          return this.addCORSHeaders(await handleInfo());
        case 'home':
          return this.addCORSHeaders(await handleHome(env));
        case 'cache-clear':
          const cookieHeader = request.headers.get('Cookie');
          const sessionToken = cookieHeader?.split(';')
            .find(c => c.trim().startsWith('session='))
            ?.split('=')[1];
          const session = sessionToken ? await env.KV.get(`session:${sessionToken}`, 'json') : null;
          if (!session || session.expiresAt < Date.now()) {
            return this.addAdminCORSHeaders(createErrorResponse('Unauthorized', 401), origin);
          }
          clearContentCache();
          return this.addAdminCORSHeaders(new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), { status: 200 }), origin);
        case 'aboutme':
          return this.addCORSHeaders(await handleAboutMe(env));
        case 'logo':
          return this.addCORSHeaders(await handleLogo(env));
        case 'static':
          return this.addCORSHeaders(await handleStaticDetails(env));
        case 'auth':
          return this.addAdminCORSHeaders(await handleAuth(request, env, '/auth'), origin);
        case 'blogs':
          return this.addCORSHeaders(await handleBlogs(env));
        case 'blogs/latest':
          const latestCount = url.searchParams.get('count');
          return this.addCORSHeaders(await handleBlogs(env, undefined, latestCount ? parseInt(latestCount) : 5));
        default:
          if (route.startsWith('blogs/')) {
            const slug = route.replace('blogs/', '');
            return this.addCORSHeaders(await handleBlogs(env, slug));
          }
          if (route.startsWith('stories')) {
            if (route === 'stories') {
              return this.addCORSHeaders(await handleStories(env));
            }
            if (route === 'stories/latest') {
              const latestCount = url.searchParams.get('count');
              return this.addCORSHeaders(await handleStories(env, undefined, latestCount ? parseInt(latestCount) : 5));
            }
            const slug = route.replace('stories/', '');
            return this.addCORSHeaders(await handleStories(env, slug));
          }
          if (route === 'search') {
            const query = url.searchParams.get('q');
            return this.addCORSHeaders(await handleSearch(env, query || undefined));
          }
          return this.addCORSHeaders(createErrorResponse('Route not found', 404));
      }
    } catch (error) {
      console.error('API Error:', error);
      return this.addCORSHeaders(createErrorResponse('Internal server error', 500));
    }
  }
}
