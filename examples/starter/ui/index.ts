import { WebsiteUI } from '@leadertechie/personal-site-kit/shared';
import '@leadertechie/personal-site-kit/styles/theme.css';
import '@leadertechie/personal-site-kit/ui';

// Bootstrap the UI with default config
WebsiteUI.getInstance({
  apiUrl: window.location.origin,
}).bootstrap();
