import { SiteStore } from './core/site-store';
import { IRoute } from './interfaces/iroute';
import { Router } from './router';
import { init as md2interactInit, reinit as md2interactReinit } from '@leadertechie/md2interact';

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
  interactConfig?: {
    interactions?: Record<string, { selector: string }>;
    cssHydration?: {
      inlineCritical?: boolean;
      layerInjection?: boolean;
      themeToggle?: boolean;
    };
  };
}

export class WebsiteUI {
  private static instance: WebsiteUI;
  private store: SiteStore;
  private config: UIConfig;
  private router: Router | null = null;
  private interactInitialized = false;

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

    // 2. Subscribe to changes
    this.store.subscribe((config) => {
      this.applyTheme();
      this.updateFavicon();
      this.updateBanner(config);
      
      // Only trigger full re-navigation if NOT on admin page to avoid state reset
      if (this.router && window.location.pathname !== '/admin') {
        this.router.navigate(window.location.pathname);
      }
    });

    // 3. Apply theme overrides if any
    this.applyTheme();

    // 4. Update elements
    this.updateFavicon();
    this.updateBanner(this.store.getConfig());

    // 5. Setup Router
    this.router = new Router(this);
    this.router.init(this.config.appElementId || 'app');
    
    // 6. Initialize md2interact for client-side DOM interactions
    this.initInteract();

    // 7. Run bootstrap hook
    if (this.config.onBootstrap) {
      await this.config.onBootstrap(this);
    }

    console.log('WebsiteUI bootstrapped');
  }

  /**
   * Initialize md2interact for client-side DOM interactions,
   * CSS hydration, and event bus communication.
   */
  private initInteract() {
    if (this.interactInitialized) return;
    
    const interactCfg = this.config.interactConfig || {};
    
    md2interactInit({
      interactions: interactCfg.interactions || {
        'poll': { selector: '[data-interact="poll"]' },
        'live-update': { selector: '[data-interact="live-update"]' },
        'click-toggle': { selector: '[data-interact="click-toggle"]' },
        'infinite-scroll': { selector: '[data-interact="infinite-scroll"]' },
        'form-live': { selector: '[data-interact="form-live"]' }
      },
      cssHydration: interactCfg.cssHydration || {
        inlineCritical: true,
        layerInjection: true,
        themeToggle: true
      }
    });
    
    this.interactInitialized = true;
  }

  /**
   * Reinitialize md2interact after dynamic content changes (e.g., SPA navigation).
   * This re-scans the DOM for new interaction elements.
   */
  public reinitInteract() {
    if (this.interactInitialized) {
      md2interactReinit();
    }
  }

  private updateBanner(config: any) {
    const banner = document.querySelector('my-banner');
    if (banner) {
      banner.setAttribute('header', config.siteTitle || 'My Site');
      banner.setAttribute('logo', `${config.apiUrl}/api/logo?t=${Date.now()}`);
    }
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

  private updateFavicon() {
    const favicon = document.querySelector('link[rel="icon"]');
    const logoUrl = `/api/logo?t=${Date.now()}`;
    if (favicon) {
      favicon.setAttribute('href', logoUrl);
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = logoUrl;
      document.head.appendChild(newFavicon);
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
