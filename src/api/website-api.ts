import { createErrorResponse } from './utils';
import { handleAboutMe, clearContentCache } from './handlers/about-me';
import { handleHome } from './handlers/home';
import { handleInfo } from './handlers/info';
import { handleContent } from './handlers/content';
import { handleBlogs, handleStories, handleSearch } from './handlers/content-api';
import { handleLogo } from './handlers/logo';
import { handleStaticDetails } from './handlers/static-details';

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

  private handleCORS(): Response {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*' ,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' ,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  private requireAuth(request: Request, env?: any): Response | null {
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

  public async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return this.handleCORS();
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
        return this.addCORSHeaders(await handleContent(request, env, subpath));
      }

      switch (route) {
        case 'info':
          return this.addCORSHeaders(await handleInfo());
        case 'home':
          return this.addCORSHeaders(await handleHome(env));
        case 'cache-clear':
          const authError = this.requireAuth(request, env);
          if (authError) return this.addCORSHeaders(authError);
          clearContentCache();
          return this.addCORSHeaders(new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), { status: 200 }));
        case 'aboutme':
          return this.addCORSHeaders(await handleAboutMe(env));
        case 'logo':
          return this.addCORSHeaders(await handleLogo(env));
        case 'static':
          return this.addCORSHeaders(await handleStaticDetails(env));
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
