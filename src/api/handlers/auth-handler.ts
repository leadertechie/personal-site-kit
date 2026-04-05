import { createJSONResponse, createErrorResponse } from '../utils';
import { 
  setupAuth, 
  getAuthStore,
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  verifyCredentials,
  getClientIP,
  MAX_ATTEMPTS
} from './auth';

function createSessionCookie(token: string, secure: boolean): string {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  const SameSite = secure ? 'Strict' : 'Lax';
  return `session=${token}; HttpOnly; Secure; SameSite=${SameSite}; Path=/; Expires=${expires}`;
}

export async function handleAuth(request: Request, env: any, subpath: string): Promise<Response> {
  const method = request.method;
  const clientIP = getClientIP(request);
  const path = subpath.replace(/^\//, '').split('/')[0];
  const url = new URL(request.url);
  const isSecure = url.protocol === 'https:';

  // Check rate limit for login attempts
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

  switch (path) {
    case 'setup':
      return handleSetup(request, env, clientIP, isSecure);
    case 'status':
      return handleStatus(env);
    case 'login':
      return handleLogin(request, env, clientIP, isSecure);
    case 'logout':
      return handleLogout(request, env);
    default:
      return createErrorResponse('Not found', 404);
  }
}

async function handleSetup(request: Request, env: any, clientIP: string, isSecure: boolean): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const existing = await getAuthStore(env);
  if (existing) {
    return createErrorResponse('Admin already configured. Use /auth/login to login.', 400);
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return createErrorResponse('Username and password required', 400);
    }

    if (username.length < 3 || password.length < 8) {
      return createErrorResponse('Username must be 3+ chars, password must be 8+ chars', 400);
    }

    await setupAuth(env, username, password);
    await clearRateLimit(env, clientIP);

    const token = crypto.randomUUID();
    await env.KV.put(`session:${token}`, JSON.stringify({
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    }), { expirationTtl: 7 * 24 * 60 * 60 });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Set-Cookie': createSessionCookie(token, isSecure)
    };

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Admin configured successfully'
    }), {
      status: 201,
      headers
    });
  } catch (e) {
    return createErrorResponse('Invalid request body', 400);
  }
}

async function handleStatus(env: any): Promise<Response> {
  const store = await getAuthStore(env);
  
  return createJSONResponse({
    configured: !!store,
    username: store?.username || null
  });
}

async function handleLogin(request: Request, env: any, clientIP: string, isSecure: boolean): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const store = await getAuthStore(env);
  if (!store) {
    return createErrorResponse('Admin not configured. Use POST /auth/setup first.', 401);
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return createErrorResponse('Username and password required', 400);
    }

    if (await verifyCredentials(env, username, password)) {
      await clearRateLimit(env, clientIP);

      const token = crypto.randomUUID();
      await env.KV.put(`session:${token}`, JSON.stringify({
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
      }), { expirationTtl: 7 * 24 * 60 * 60 });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Set-Cookie': createSessionCookie(token, isSecure)
      };

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Login successful'
      }), {
        status: 200,
        headers
      });
    } else {
      await recordFailedAttempt(env, clientIP);
      return createErrorResponse('Invalid credentials', 401);
    }
  } catch (e) {
    return createErrorResponse('Invalid request body', 400);
  }
}

async function handleLogout(request: Request, env: any): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const cookieHeader = request.headers.get('Cookie');
  const sessionToken = cookieHeader?.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1];

  if (sessionToken) {
    await env.KV.delete(`session:${sessionToken}`);
  }

  return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    }
  });
}
