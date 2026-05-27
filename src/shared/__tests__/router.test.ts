import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from '../router';
import { WebsiteUI } from '../website-ui';

// Mock the @leadertechie/md2interact module
vi.mock('@leadertechie/md2interact', () => ({
  init: vi.fn(),
  reinit: vi.fn(),
}));

// Mock the page-content module to avoid dependency on MarkdownPipeline
vi.mock('../page-content', () => ({
  generatePageContent: vi.fn((_pathname: string, routes: any[], _footerLinks: any[], _data?: any) => {
    const navLinks = routes
      .map((r: any) =>
        `<a href="${r.link}" class="nav-link" data-route="${r.link === "/" ? "home" : r.text.toLowerCase()}">${r.text}</a>`,
      )
      .join('');
    return {
      title: 'Test Page',
      description: 'Test description',
      canonicalUrl: _pathname,
      content: `<nav>${navLinks}</nav><main>Test content</main>`,
    };
  }),
}));

// Helper to create a mock WebsiteUI instance
function createMockUI(configOverrides: Record<string, any> = {}): WebsiteUI {
  const ui = WebsiteUI.getInstance({
    apiUrl: 'http://localhost:8787',
    routes: configOverrides.routes,
    ...configOverrides,
  });
  return ui;
}

// Helper to wait for all pending async operations
function flushAsync() {
  return new Promise(resolve => setTimeout(resolve, 50));
}

describe('Router', () => {
  let appElement: HTMLDivElement;

  beforeEach(() => {
    // Reset WebsiteUI singleton between tests
    (WebsiteUI as any).instance = undefined;

    // Create a fresh app element in the DOM
    appElement = document.createElement('div');
    appElement.id = 'app';
    document.body.appendChild(appElement);

    // Set initial pathname
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    // Clean up DOM
    if (appElement.parentNode) {
      appElement.parentNode.removeChild(appElement);
    }
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('routes', () => {
    it('should use custom routes when provided via UIConfig', async () => {
      const customRoutes = [
        { link: '/', text: 'Home' },
        { link: '/projects', text: 'Projects' },
        { link: '/contact', text: 'Contact Me' },
      ];

      const ui = createMockUI({ routes: customRoutes });
      const router = new Router(ui);

      router.init('app');
      await flushAsync();

      expect(appElement.innerHTML).toContain('href="/projects"');
      expect(appElement.innerHTML).toContain('data-route="projects"');
      expect(appElement.innerHTML).toContain('Projects');
      expect(appElement.innerHTML).toContain('href="/contact"');
      expect(appElement.innerHTML).toContain('Contact Me');
      expect(appElement.innerHTML).toContain('Home');
    });

    it('should use custom routes with different link structure', async () => {
      const customRoutes = [
        { link: '/dashboard', text: 'Dashboard' },
        { link: '/profile', text: 'Profile' },
        { link: '/settings', text: 'Settings' },
      ];

      const ui = createMockUI({ routes: customRoutes });
      const router = new Router(ui);

      router.init('app');
      await flushAsync();

      expect(appElement.innerHTML).toContain('href="/dashboard"');
      expect(appElement.innerHTML).toContain('Dashboard');
      expect(appElement.innerHTML).toContain('href="/profile"');
      expect(appElement.innerHTML).toContain('Profile');
      expect(appElement.innerHTML).toContain('href="/settings"');
      expect(appElement.innerHTML).toContain('Settings');
    });

    it('should use default routes when no routes are provided in UIConfig', async () => {
      const ui = createMockUI(); // No routes provided
      const router = new Router(ui);

      router.init('app');
      await flushAsync();

      // Default routes should be present
      expect(appElement.innerHTML).toContain('href="/"');
      expect(appElement.innerHTML).toContain('Home');
      expect(appElement.innerHTML).toContain('href="/blogs"');
      expect(appElement.innerHTML).toContain('Blogs');
      expect(appElement.innerHTML).toContain('href="/stories"');
      expect(appElement.innerHTML).toContain('Stories');
      expect(appElement.innerHTML).toContain('href="/about"');
      expect(appElement.innerHTML).toContain('About');
    });

    it('should use default routes when empty routes array is provided', async () => {
      const ui = createMockUI({ routes: [] }); // Empty array
      const router = new Router(ui);

      router.init('app');
      await flushAsync();

      // Should fall back to defaults
      expect(appElement.innerHTML).toContain('href="/blogs"');
      expect(appElement.innerHTML).toContain('Blogs');
      expect(appElement.innerHTML).toContain('href="/stories"');
      expect(appElement.innerHTML).toContain('Stories');
      expect(appElement.innerHTML).toContain('href="/about"');
      expect(appElement.innerHTML).toContain('About');
    });

    it('should pass routes to generatePageContent for all page types', async () => {
      const customRoutes = [
        { link: '/', text: 'Home' },
        { link: '/work', text: 'Work' },
      ];

      const ui = createMockUI({ routes: customRoutes });
      const router = new Router(ui);

      // Navigate to home
      router.init('app');

      // Navigate to about-me (non-async render)
      window.history.pushState({}, '', '/about');
      router.navigate('/about');

      // Navigate to blogs list
      window.history.pushState({}, '', '/blogs');
      await router.navigate('/blogs');
      await flushAsync();

      // All renders should contain the custom routes
      const { generatePageContent } = await import('../page-content');
      expect(generatePageContent).toHaveBeenCalled();
      
      // Check that every call included the custom routes
      const calls = (generatePageContent as any).mock.calls;
      calls.forEach((call: any[]) => {
        expect(call[1]).toEqual(customRoutes);
      });
    });
  });
});
