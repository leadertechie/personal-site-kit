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
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
    return response;
  }

  private addAdminCORSHeaders(response: Response, origin: string): Response {
    const allowOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1')) 
      ? origin 
      : 'same-origin';
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
    return response;
  }

  private handleCORS(origin: string): Response {
    const allowOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1')) 
      ? origin 
      : '*';
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin ,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' ,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
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

      // Check for auth route (auth/*)
      if (route === 'auth' || route.startsWith('auth/')) {
        const subpath = route.replace(/^auth\/?/, '');
        return this.addAdminCORSHeaders(await handleAuth(request, env, subpath || '/'), origin);
      }

      switch (route) {
        case 'info':
          return this.addCORSHeaders(await handleInfo());
        case 'home':
          return this.addAdminCORSHeaders(await handleHome(env), origin);
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
          return this.addAdminCORSHeaders(await handleAboutMe(env), origin);
        case 'logo':
          return this.addAdminCORSHeaders(await handleLogo(env), origin);
        case 'static':
          return this.addAdminCORSHeaders(await handleStaticDetails(env), origin);
        case 'blogs':
          return this.addAdminCORSHeaders(await handleBlogs(env), origin);
        case 'blogs/latest':
          const latestCount = url.searchParams.get('count');
          return this.addAdminCORSHeaders(await handleBlogs(env, undefined, latestCount ? parseInt(latestCount) : 5), origin);
        default:
          if (route.startsWith('images/')) {
            return this.addAdminCORSHeaders(await handleContent(request, env, route), origin);
          }
          if (route.startsWith('blogs/')) {
            const slug = route.replace('blogs/', '');
            return this.addAdminCORSHeaders(await handleBlogs(env, slug), origin);
          }
          if (route.startsWith('stories')) {
            if (route === 'stories') {
              return this.addAdminCORSHeaders(await handleStories(env), origin);
            }
            if (route === 'stories/latest') {
              const latestCount = url.searchParams.get('count');
              return this.addAdminCORSHeaders(await handleStories(env, undefined, latestCount ? parseInt(latestCount) : 5), origin);
            }
            const slug = route.replace('stories/', '');
            return this.addAdminCORSHeaders(await handleStories(env, slug), origin);
          }
          if (route === 'search') {
            const query = url.searchParams.get('q');
            return this.addAdminCORSHeaders(await handleSearch(env, query || undefined), origin);
          }
          return this.addAdminCORSHeaders(createErrorResponse('Route not found', 404), origin);
      }
    } catch (error) {
      console.error('API Error:', error);
      return this.addCORSHeaders(createErrorResponse('Internal server error', 500));
    }
  }
}
