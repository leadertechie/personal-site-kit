import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { MarkdownPipeline, ContentNode } from '@leadertechie/md2html';

import { blogviewerStyles } from './styles';

const pipeline = new MarkdownPipeline({
  imagePathPrefix: 'images/',
  styleOptions: {
    classPrefix: 'md-',
    addHeadingIds: true
  }
});

interface BlogPost {
  title: string;
  description: string;
  date: string;
  tags: string[];
  author: string;
  imageUrl: string;
  content: string;
}

@customElement('my-blog-viewer')
export class BlogViewer extends LitElement {
  static styles = blogviewerStyles;

  @property({ type: String })
  accessor slug = '';

  @state()
  accessor blogPost: BlogPost | null = null;

  @state()
  accessor loading = true;

  @state()
  accessor error = '';

  private get apiBaseUrl(): string {
    return 'https://api.techieleader.com';
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.slug) {
      this.loadBlog();
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('slug') && this.slug) {
      this.loadBlog();
    }
  }

  loadBlog() {
    this.loading = true;
    this.error = '';
    console.log('[BlogViewer] Loading blog:', this.slug);

    fetch(`${this.apiBaseUrl}/api/blogs/${this.slug}`)
      .then(res => {
        console.log('[BlogViewer] Response status:', res.status);
        if (res.ok) return res.json();
        throw new Error('Failed to load blog');
      })
      .then(blog => {
        console.log('[BlogViewer] Found blog:', blog?.title, 'slug:', blog?.slug);
        if (blog && blog.content) {
          this.blogPost = blog;
        } else {
          this.error = 'Blog content not found';
        }
        this.loading = false;
      })
      .catch(e => {
        console.error('[BlogViewer] Failed to load blog:', e);
        this.error = 'Failed to load blog';
        this.loading = false;
      });
  }

  render() {
    if (this.loading) {
      return html`<div class="blog-viewer"><div class="loading">Loading...</div></div>`;
    }

    if (this.error) {
      return html`<div class="blog-viewer"><div class="error">${this.error}</div></div>`;
    }

    if (!this.blogPost) {
      return html`<div class="blog-viewer"><div class="error">Blog not found</div></div>`;
    }

    const { title, date, tags, content } = this.blogPost;

    return html`
      <article class="blog-viewer">
        <h1>${title}</h1>
        <div class="meta">
          <span>${date}</span>
        </div>
        ${tags?.length ? html`
          <div class="tags">
            ${tags.map(tag => html`<span class="tag">${tag}</span>`)}
          </div>
        ` : ''}
        <div class="content">
          ${unsafeHTML(this.renderMarkdown(content))}
        </div>
      </article>
    `;
  }

  renderMarkdown(content: string): string {
    if (!content) return '';
    const nodes = pipeline.parse(content);
    return pipeline.render(nodes);
  }
}
