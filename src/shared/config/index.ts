import { InfrastructureConfig, StaticDetails, WebsiteConfig } from './types';

export * from './types';

const DEFAULT_INFRA: InfrastructureConfig = {
  baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  apiUrl: (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) || 'http://localhost:8787'
};

const DEFAULT_STATIC: StaticDetails = {
  siteTitle: 'My Personal Website',
  copyright: '2026 My Personal Website',
  linkedin: 'https://linkedin.com/in/yourname',
  github: 'https://github.com/yourname',
  email: 'yourname@domain.com'
};

let activeConfig: WebsiteConfig = { ...DEFAULT_INFRA, ...DEFAULT_STATIC };

export async function initializeConfig(infra?: Partial<InfrastructureConfig>): Promise<WebsiteConfig> {
  if (infra) {
    activeConfig = { ...activeConfig, ...infra };
  }

  try {
    const res = await fetch(`${activeConfig.apiUrl}/api/static`);
    if (res.ok) {
      const remoteStatic = await res.json();
      activeConfig = { ...activeConfig, ...remoteStatic };
    }
  } catch (e) {
    console.warn('Failed to load static details from R2, using defaults.');
  }

  return activeConfig;
}

export function getConfig(): WebsiteConfig {
  return activeConfig;
}
