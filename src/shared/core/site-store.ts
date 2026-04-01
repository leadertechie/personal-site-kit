import { StaticDetails, WebsiteConfig, initializeConfig, getConfig } from '../config';

export class SiteStore {
  private static instance: SiteStore;
  private config: WebsiteConfig | null = null;
  private listeners: Set<(config: WebsiteConfig) => void> = new Set();

  private constructor() {}

  static getInstance(): SiteStore {
    if (!SiteStore.instance) {
      SiteStore.instance = new SiteStore();
    }
    return SiteStore.instance;
  }

  async init(infra?: { baseUrl: string; apiUrl: string }) {
    this.config = await initializeConfig(infra);
    this.notify();
    return this.config;
  }

  subscribe(listener: (config: WebsiteConfig) => void) {
    this.listeners.add(listener);
    if (this.config) listener(this.config);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    if (this.config) {
      this.listeners.forEach(l => l(this.config!));
    }
  }

  getConfig(): WebsiteConfig {
    return this.config || getConfig();
  }
}
