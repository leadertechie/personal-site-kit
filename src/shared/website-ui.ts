import { SiteStore } from './core/site-store';
import { IRoute } from './interfaces/iroute';
import { Router } from './router';

export interface UIConfig {
  apiUrl?: string;
  baseUrl?: string;
  routes?: IRoute[];
  appElementId?: string;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    customCss?: string;
  };
  onBootstrap?: (ui: WebsiteUI) => void | Promise<void>;
}

export class WebsiteUI {
  private static instance: WebsiteUI;
  private store: SiteStore;
  private config: UIConfig;
  private router: Router | null = null;

  private constructor(config: UIConfig = {}) {
    this.store = SiteStore.getInstance();
    this.config = config;
  }

  public static getInstance(config?: UIConfig): WebsiteUI {
    if (!WebsiteUI.instance) {
      WebsiteUI.instance = new WebsiteUI(config);
    } else if (config) {
      // Merge config if provided on existing instance
      WebsiteUI.instance.config = { ...WebsiteUI.instance.config, ...config };
    }
    return WebsiteUI.instance;
  }

  public async bootstrap() {
    // 1. Initialize SiteStore with infra config
    await this.store.init({
      apiUrl: this.config.apiUrl,
      baseUrl: this.config.baseUrl
    });

    // 2. Apply theme overrides if any
    this.applyTheme();

    // 3. Setup Router
    this.router = new Router(this);
    this.router.init(this.config.appElementId || 'app');
    
    // 4. Run bootstrap hook
    if (this.config.onBootstrap) {
      await this.config.onBootstrap(this);
    }

    console.log('WebsiteUI bootstrapped');
  }

  private applyTheme() {
    if (!this.config.theme) return;

    const { theme } = this.config;
    const root = document.documentElement;

    if (theme.primaryColor) root.style.setProperty('--link-color', theme.primaryColor);
    if (theme.backgroundColor) root.style.setProperty('--background-color', theme.backgroundColor);
    if (theme.textColor) root.style.setProperty('--text-color', theme.textColor);

    if (theme.customCss) {
      const style = document.createElement('style');
      style.textContent = theme.customCss;
      document.head.appendChild(style);
    }
  }

  public getStore() {
    return this.store;
  }

  public getConfig() {
    return this.config;
  }

  public getRouter() {
    return this.router;
  }
}

export const bootstrap = (config?: UIConfig) => WebsiteUI.getInstance(config).bootstrap();
