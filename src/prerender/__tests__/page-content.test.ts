import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePageContent } from '../page-content';

describe('generatePageContent', () => {
  const mockRoutes = [
    { link: '/', text: 'Home' },
    { link: '/about-me', text: 'About' }
  ];
  const mockFooterLinks = [
    { text: 'Link', href: '#' }
  ];
  const mockEnv = {
    CONTENT_BUCKET: {
      get: vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ name: 'User', title: 'Professional', experience: 'some' })
      }),
      list: vi.fn().mockResolvedValue({ objects: [] })
    },
    apiUrl: 'https://api.example.com',
    baseUrl: 'https://www.example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ siteTitle: 'My Site', copyright: '2026' })
    });
  });

  it('should generate home page content', async () => {
    const result = await generatePageContent('/', mockRoutes, mockFooterLinks, mockEnv);

    expect(result.title).toContain('User');
    expect(result.canonicalUrl).toBe('https://www.example.com/');
    expect(result.content).toContain('<my-banner');
  });

  it('should generate about-me page content', async () => {
    const result = await generatePageContent('/about-me', mockRoutes, mockFooterLinks, mockEnv);

    expect(result.title).toContain('About');
    expect(result.canonicalUrl).toBe('https://www.example.com/about-me');
    expect(result.content).toContain('<my-aboutme');
  });

  it('should generate 404 page content', async () => {
    const result = await generatePageContent('/non-existent', mockRoutes, mockFooterLinks, mockEnv);

    expect(result.title).toContain('Not Found');
    expect(result.canonicalUrl).toBe('https://www.example.com/non-existent');
    expect(result.content).toContain('Page Not Found');
  });
});
