const AUTH_KV = 'auth_store';
const RATE_LIMIT_KV = 'rate_limit';
const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 1000; // 1 second
const MAX_DELAY_MS = 60000; // 1 minute

interface AuthStore {
  username: string;
  passwordHash: string;
  salt: string;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const saltBuffer = encoder.encode(salt);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
}

async function generateSalt(): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...saltBytes));
}

async function checkRateLimit(env: any, ip: string): Promise<{ allowed: boolean; delayMs: number }> {
  const kvKey = `rate:${ip}`;
  const entry = await env.KV.get(kvKey, 'json') as RateLimitEntry | null;
  
  if (!entry) {
    return { allowed: true, delayMs: 0 };
  }
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minute window
  
  // Reset if window expired
  if (now - entry.firstAttempt > windowMs) {
    return { allowed: true, delayMs: 0 };
  }
  
  // Check if exceeded max attempts
  if (entry.attempts >= MAX_ATTEMPTS) {
    const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, entry.attempts - MAX_ATTEMPTS), MAX_DELAY_MS);
    const timeSinceLast = now - entry.lastAttempt;
    
    if (timeSinceLast < delayMs) {
      return { allowed: false, delayMs: delayMs - timeSinceLast };
    }
  }
  
  return { allowed: true, delayMs: 0 };
}

async function recordFailedAttempt(env: any, ip: string): Promise<void> {
  const kvKey = `rate:${ip}`;
  const entry = await env.KV.get(kvKey, 'json') as RateLimitEntry | null;
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  if (!entry || now - entry.firstAttempt > windowMs) {
    // Start new window
    await env.KV.put(kvKey, JSON.stringify({
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    }), { expirationTtl: Math.ceil(windowMs / 1000) + 60 });
  } else {
    entry.attempts++;
    entry.lastAttempt = now;
    await env.KV.put(kvKey, JSON.stringify(entry), { 
      expirationTtl: Math.ceil(windowMs / 1000) + 60 
    });
  }
}

async function clearRateLimit(env: any, ip: string): Promise<void> {
  const kvKey = `rate:${ip}`;
  await env.KV.delete(kvKey);
}

async function getAuthStore(env: any): Promise<AuthStore | null> {
  const store = await env.KV.get(AUTH_KV, 'json') as AuthStore | null;
  return store;
}

async function setupAuth(env: any, username: string, password: string): Promise<void> {
  const salt = await generateSalt();
  const passwordHash = await hashPassword(password, salt);
  
  await env.KV.put(AUTH_KV, JSON.stringify({
    username,
    passwordHash,
    salt
  }));
}

async function verifyCredentials(env: any, username: string, password: string): Promise<boolean> {
  const store = await getAuthStore(env);
  
  if (!store) {
    return false;
  }
  
  if (username !== store.username) {
    return false;
  }
  
  const hash = await hashPassword(password, store.salt);
  return hash === store.passwordHash;
}

function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
         'unknown';
}

export { 
  hashPassword, 
  generateSalt, 
  checkRateLimit, 
  recordFailedAttempt, 
  clearRateLimit,
  getAuthStore,
  setupAuth,
  verifyCredentials,
  getClientIP,
  AUTH_KV,
  RATE_LIMIT_KV,
  MAX_ATTEMPTS,
  BASE_DELAY_MS
};
