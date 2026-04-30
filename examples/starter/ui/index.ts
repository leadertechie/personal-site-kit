import { WebsiteUI } from '@leadertechie/personal-site-kit/shared';
import '@leadertechie/personal-site-kit/styles/theme.css';
import '@leadertechie/personal-site-kit/ui';

// Bootstrap the UI with default config
// md2interact is automatically initialized for DOM interactions, CSS hydration, and theme toggle
WebsiteUI.getInstance({
  apiUrl: window.location.origin,
  // Optional: configure md2interact interactions
  interactConfig: {
    interactions: {
      'poll': { selector: '[data-interact="poll"]' },
      'live-update': { selector: '[data-interact="live-update"]' },
      'click-toggle': { selector: '[data-interact="click-toggle"]' },
      'infinite-scroll': { selector: '[data-interact="infinite-scroll"]' },
      'form-live': { selector: '[data-interact="form-live"]' }
    },
    cssHydration: {
      inlineCritical: true,
      layerInjection: true,
      themeToggle: true
    }
  }
}).bootstrap();
