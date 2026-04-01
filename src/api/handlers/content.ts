import { createJSONResponse, createErrorResponse } from '../utils';

export async function handleContent(request: Request, env: any, subpath: string): Promise<Response> {
  const bucket = env.CONTENT_BUCKET;
  if (!bucket) {
    return createErrorResponse('Content bucket not configured', 500);
  }

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

  // Auth check for write operations
  const authHeader = request.headers.get('Authorization');
  const apiKey = env.ADMIN_API_KEY; 
  // Allow if apiKey is not set (dev mode) OR matches
  // WARN: In prod, ADMIN_API_KEY should be set!
  if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    return createErrorResponse('Unauthorized', 401);
  }

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
