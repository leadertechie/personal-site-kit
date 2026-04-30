import { WebsiteUI } from '@leadertechie/personal-site-kit/shared';
import '@leadertechie/personal-site-kit/styles/theme.css';
import '@leadertechie/personal-site-kit/ui';

// Bootstrap the UI with full configuration
//
// md2interact is automatically initialized during bootstrap for:
//   - DOM interaction patterns (poll, live-update, click-toggle, etc.)
//   - CSS hydration (inline critical CSS, layer injection, theme toggle)
//   - Event bus communication
//
// After SPA navigation (e.g., blog detail page loads), call:
//   WebsiteUI.getInstance().reinitInteract()
// to re-scan the DOM for new interaction elements.
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
