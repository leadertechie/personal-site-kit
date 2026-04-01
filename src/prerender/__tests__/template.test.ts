import { describe, it, expect } from 'vitest';
import { createHtmlTemplate } from '../template';

describe('createHtmlTemplate', () => {
  it('should generate complete HTML template', async () => {
    const props = {
      title: 'Test Title',
      description: 'Test Description',
      canonicalUrl: 'https://example.com/test',
      content: '<main>Test Content</main>'
    };

    const html = await createHtmlTemplate(props);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<title>Test Title</title>');
    expect(html).toContain('<meta name="description" content="Test Description" />');
    expect(html).toContain('<meta property="og:title" content="Test Title" />');
    expect(html).toContain('<link rel="canonical" href="https://example.com/test" />');
    expect(html).toContain('<main>Test Content</main>');
  });

  it('should escape HTML entities properly', async () => {
    const props = {
      title: 'Test & Title',
      description: 'Test "Description"',
      canonicalUrl: 'https://example.com/test',
      content: '<main>Test Content</main>'
    };

    const html = await createHtmlTemplate(props);

    expect(html).toContain('<title>Test & Title</title>');
    expect(html).toContain('<meta name="description" content="Test "Description"" />');
  });

  it('should have proper HTML structure', async () => {
    const props = {
      title: 'Test',
      description: 'Test',
      canonicalUrl: 'https://example.com',
      content: '<div>Content</div>'
    };

    const html = await createHtmlTemplate(props);

    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<html lang="en" data-theme="light">');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
    expect(html).toContain('<div id="app">');
    expect(html).toContain('</html>');
  });
});