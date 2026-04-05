import { createJSONResponse, createErrorResponse } from '../utils';
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  clearRateLimit,
  verifyCredentials,
  getClientIP,
  getAuthStore
} from './auth';

export async function handleContent(request: Request, env: any, subpath: string): Promise<Response> {
  const bucket = env.CONTENT_BUCKET;
  if (!bucket) {
    return createErrorResponse('Content bucket not configured', 500);
  }

  const method = request.method;
  const clientIP = getClientIP(request);

  // Check rate limit first
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

  // Auth check for all operations (including GET in production)
  const authHeader = request.headers.get('Authorization');
  const sessionToken = request.headers.get('X-Session-Token');
  
  // For dev mode without auth configured, allow basic access
  const store = await getAuthStore(env);
  
  if (!store) {
    // No auth configured - either dev mode or setup required
    if (method === 'GET') {
      return handleGet(request, bucket, subpath);
    }
    return createErrorResponse('Admin not configured. Use POST /auth/setup to configure.', 401);
  }

  // Verify session or basic auth
  let isAuthenticated = false;
  
  if (sessionToken) {
    // Session-based auth
    const session = await env.KV.get(`session:${sessionToken}`, 'json');
    if (session && session.expiresAt > Date.now()) {
      isAuthenticated = true;
    }
  } else if (authHeader?.startsWith('Basic ')) {
    // Basic auth for login
    try {
      const credentials = atob(authHeader.slice(6));
      const [username, password] = credentials.split(':');
      
      if (await verifyCredentials(env, username, password)) {
        isAuthenticated = true;
        
        // Generate session token
        const token = crypto.randomUUID();
        await env.KV.put(`session:${token}`, JSON.stringify({
          createdAt: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }), { expirationTtl: 7 * 24 * 60 * 60 });
        
        // Return response with session header
        const response = await handleWrite(request, bucket, subpath, env, method);
        if (response.status === 401) {
          return response;
        }
        return new Response(response.body, {
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'X-Session-Token': token
          }
        });
      }
    } catch (e) {
      // Invalid base64 or format
    }
  }

  if (!isAuthenticated) {
    await recordFailedAttempt(env, clientIP);
    return createErrorResponse('Unauthorized', 401);
  }

  // Clear rate limit on successful auth
  await clearRateLimit(env, clientIP);

  // Route requests
  if (method === 'GET') {
    return handleGet(request, bucket, subpath);
  }

  return handleWrite(request, bucket, subpath, env, method);
}

async function handleGet(request: Request, bucket: any, subpath: string): Promise<Response> {
  const method = request.method;

  // List content: GET /content (subpath is empty or just slash)
  if (method === 'GET' && (!subpath || subpath === '/')) {
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

  // Get content: GET /content/:key
  if (method === 'GET' && subpath) {
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
  // Upload content: PUT /content/:key
  if (method === 'PUT' && subpath) {
    try {
      await bucket.put(subpath, request.body);
      return createJSONResponse({ success: true, key: subpath });
    } catch (e: any) {
      return createErrorResponse('Failed to upload content: ' + e.message, 500);
    }
  }

  // Delete content: DELETE /content/:key
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
