import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MarkdownPipeline, ContentNode } from '@leadertechie/r2tohtml';

import { blogviewerStyles } from './styles';

// Use PipelineConfigV2 with scope anchors, error recovery, and slot patterns
const pipeline = new MarkdownPipeline({
  imagePathPrefix: 'images/',
  preserveRawHTML: true,
  errorRecovery: 'warn',
  maxRecursionDepth: 50,
  styleOptions: {
    classPrefix: 'md-',
    addHeadingIds: true,
    emitScopeAnchors: true
  },
  slotPattern: /\[\[(.*?)\]\]/g,
  onSlot: (name: string) => {
    const slotMap: Record<string, string> = {
      'CURRENT_YEAR': new Date().getFullYear().toString(),
    };
    return slotMap[name] || `[[${name}]]`;
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
    return this.getAttribute('api-url') || 
           this.getAttribute('base-url') ||
           (window as any).__VITE_API_URL__ || 
           (import.meta as any).env?.VITE_API_URL || 
           (typeof window !== 'undefined' ? window.location.origin : '');
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

    const url = `${this.apiBaseUrl}/api/blogs/${this.slug}`;
    fetch(url)
      .then(res => {
        console.log('[BlogViewer] Response status:', res.status, 'from:', url);
        if (res.ok) return res.json();
        throw new Error(`Failed to load blog: ${res.statusText}`);
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
        <div class="content" .innerHTML=${this.renderMarkdown(content)}></div>
      </article>
    `;
  }

  renderMarkdown(content: string): string {
    if (!content) return '';
    const nodes = pipeline.parse(content);
    return pipeline.render(nodes);
  }
}
