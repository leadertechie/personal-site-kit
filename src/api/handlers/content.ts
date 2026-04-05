import { createJSONResponse, createErrorResponse } from '../utils';
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  clearRateLimit,
  verifyCredentials,
  getClientIP,
  getAuthStore
} from './auth';

function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';')
    .find(c => c.trim().startsWith('session='));
  return match?.split('=')[1] || null;
}

export async function handleContent(request: Request, env: any, subpath: string): Promise<Response> {
  const bucket = env.CONTENT_BUCKET;
  if (!bucket) {
    return createErrorResponse('Content bucket not configured', 500);
  }

  const method = request.method;
  const clientIP = getClientIP(request);

  const rateCheck = await checkRateLimit(env, clientIP);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ 
      error: 'Too many failed attempts. Please wait.',
      retryAfter: Math.ceil(rateCheck.delayMs / 1000)
    }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(rateCheck.delayMs / 1000))
      }
    });
  }

  const store = await getAuthStore(env);
  
  if (!store) {
    if (method === 'GET') {
      return handleGet(request, bucket, subpath);
    }
    return createErrorResponse('Admin not configured. Use POST /auth/setup to configure.', 401);
  }

  const sessionToken = getSessionToken(request);
  let isAuthenticated = false;
  
  if (sessionToken) {
    const session = await env.KV.get(`session:${sessionToken}`, 'json');
    if (session && session.expiresAt > Date.now()) {
      isAuthenticated = true;
    }
  }

  const authHeader = request.headers.get('Authorization');
  if (!isAuthenticated && authHeader?.startsWith('Basic ')) {
    try {
      const credentials = atob(authHeader.slice(6));
      const [username, password] = credentials.split(':');
      if (await verifyCredentials(env, username, password)) {
        isAuthenticated = true;
      }
    } catch (e) {}
  }

  if (!isAuthenticated) {
    await recordFailedAttempt(env, clientIP);
    return createErrorResponse('Unauthorized', 401);
  }

  await clearRateLimit(env, clientIP);

  if (method === 'GET') {
    return handleGet(request, bucket, subpath);
  }

  return handleWrite(request, bucket, subpath, env, method);
}

async function handleGet(request: Request, bucket: any, subpath: string): Promise<Response> {
  if (request.method === 'GET' && (!subpath || subpath === '/')) {
    try {
      const list = await bucket.list();
      return createJSONResponse(list.objects.map((o: any) => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded,
        httpEtag: o.httpEtag
      })));
    } catch (e: any) {
      return createErrorResponse('Failed to list content: ' + e.message, 500);
    }
  }

  if (request.method === 'GET' && subpath) {
    try {
      const object = await bucket.get(subpath);
      if (!object) {
        return createErrorResponse('Content not found', 404);
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      return new Response(object.body, { headers });
    } catch (e: any) {
      return createErrorResponse('Failed to get content: ' + e.message, 500);
    }
  }

  return createErrorResponse('Method not allowed', 405);
}

async function handleWrite(request: Request, bucket: any, subpath: string, env: any, method: string): Promise<Response> {
  if (method === 'PUT' && subpath) {
    try {
      await bucket.put(subpath, request.body);
      return createJSONResponse({ success: true, key: subpath });
    } catch (e: any) {
      return createErrorResponse('Failed to upload content: ' + e.message, 500);
    }
  }

  if (method === 'DELETE' && subpath) {
    try {
      await bucket.delete(subpath);
      return createJSONResponse({ success: true, key: subpath });
    } catch (e: any) {
      return createErrorResponse('Failed to delete content: ' + e.message, 500);
    }
  }

  return createErrorResponse('Method not allowed', 405);
}
