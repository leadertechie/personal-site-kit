import type { ContentItem, AuthStatus, StaticDetails } from './types';

export class AdminApiService {
  constructor(private apiUrl: string) {}

  async checkAuthStatus(): Promise<AuthStatus> {
    const res = await fetch(`${this.apiUrl}/api/auth/status`);
    if (!res.ok) throw new Error('Auth status check failed');
    return res.json();
  }

  async tryAutoLogin(): Promise<ContentItem[]> {
    const res = await fetch(`${this.apiUrl}/api/content`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Auto login failed');
    return res.json();
  }

  async login(username: string, password: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
  }

  async setup(username: string, password: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/api/auth/setup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Setup failed');
    }
  }

  async logout(): Promise<void> {
    await fetch(`${this.apiUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }

  async fetchContent(): Promise<ContentItem[]> {
    const res = await fetch(`${this.apiUrl}/api/content`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  }

  async fetchStaticDetails(): Promise<StaticDetails> {
    const res = await fetch(`${this.apiUrl}/api/static`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch static details');
    return res.json();
  }

  async uploadContent(key: string, file: File): Promise<void> {
    const res = await fetch(`${this.apiUrl}/api/content/${key}`, {
      method: 'PUT',
      credentials: 'include',
      body: file
    });
    if (!res.ok) throw new Error('Upload failed');
  }

  async deleteContent(key: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/api/content/${key}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Delete failed');
  }

  async clearCache(): Promise<void> {
    const res = await fetch(`${this.apiUrl}/api/cache-clear`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to clear cache');
  }
}