import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { MarkdownPipeline } from '@leadertechie/md2html';

import { storyviewerStyles } from './styles';

const pipeline = new MarkdownPipeline({
  imagePathPrefix: 'images/',
  styleOptions: {
    classPrefix: 'md-',
    addHeadingIds: true
  }
});

interface StoryPost {
  title: string;
  description: string;
  date: string;
  tags: string[];
  author: string;
  imageUrl: string;
  content: string;
}

@customElement('my-story-viewer')
export class StoryViewer extends LitElement {
  static styles = storyviewerStyles;

  @property({ type: String })
  accessor slug = '';

  @state()
  accessor storyPost: StoryPost | null = null;

  @state()
  accessor loading = true;

  @state()
  accessor error = '';

  private get apiBaseUrl(): string {
    return this.getAttribute('api-url') || 
           (window as any).__VITE_API_URL__ || 
           import.meta.env.VITE_API_URL || 
           'https://api.exampledomain.com';
  }

  async connectedCallback() {
    super.connectedCallback();
    if (this.slug) {
      await this.loadStory();
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('slug') && this.slug) {
      this.loadStory();
    }
  }

  async loadStory() {
    this.loading = true;
    this.error = '';

    try {
      const res = await fetch(`${this.apiBaseUrl}/api/stories/${this.slug}`);
      if (res.ok) {
        const story = await res.json();
        if (story && story.content) {
          this.storyPost = story;
        } else {
          this.error = 'Story content not found';
        }
      } else {
        this.error = 'Story not found';
      }
    } catch (e) {
      this.error = 'Failed to load story';
    }

    this.loading = false;
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    if (!this.storyPost) {
      return html`<div class="error">Story not found</div>`;
    }

    const { title, date, tags, content } = this.storyPost;

    return html`
      <article>
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

  private renderMarkdown(content: string): string {
    if (!content) return '';
    const nodes = pipeline.parse(content);
    return pipeline.render(nodes);
  }
}
