import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { ContentNode } from '@leadertechie/md2html';
import { Profile } from '@techieleader/content';

import { aboutmeStyles } from './styles';

import { AboutMeRenderer } from './renderer';
import { fetchAboutMe } from './api';

interface AboutMeData {
  profile: Profile;
  contentNodes: ContentNode[];
}

@customElement('my-aboutme')
export class MyAboutme extends LitElement {
  static styles = aboutmeStyles;

  @property({ type: String })
  accessor baseUrl = '';

  @state()
  accessor profile: Profile | null = null;

  @state()
  accessor contentNodes: ContentNode[] = [];

  @state()
  accessor loading = true;

  private renderer: AboutMeRenderer;
  /**
   * Injectable fetcher function used to retrieve About Me data.
   * Tests can override this (e.g. componentInstance.fetcher = myMock)
   * to avoid network I/O. By default it uses the stable `fetchAboutMe` helper.
   */
  public fetcher = fetchAboutMe;

  constructor(renderer?: AboutMeRenderer) {
    super();
    this.renderer = renderer || new AboutMeRenderer();
  }

  private get apiBaseUrl(): string {
    return this.baseUrl || this.getAttribute('base-url') || '';
  }

  async connectedCallback() {
    super.connectedCallback();

    // If we have initial data from SSR, use it immediately.
    if (typeof window !== 'undefined' && (window as any).__HYDRATION_DATA__) {
      const hydrationData = (window as any).__HYDRATION_DATA__;
      this.profile = hydrationData.profile;
      this.contentNodes = hydrationData.contentNodes;
      this.loading = false;
      return;
    }

    // Load content if a baseUrl is provided. In dev/prod, this will be set.
    const url = this.apiBaseUrl;
    if (url) {
      this.loadContent();
    }
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    
    // Only load content from API if we haven't already loaded via hydration data
    if (this.loading === false && this.profile && this.contentNodes.length > 0) {
      return;
    }
    
    // If baseUrl changed and we have a valid baseUrl, load content
    if (changedProperties.has('baseUrl') || changedProperties.has('base-url')) {
      const url = this.apiBaseUrl;
      if (url) {
        this.loadContent();
      }
    }
  }

  private async loadContent() {
    try {
      this.loading = true;

      // Fetch content from API using the injectable fetcher.
      // Use the apiBaseUrl getter to get either property or attribute
      const url = this.apiBaseUrl;
      const data = await this.fetcher(url);

      this.profile = data.profile;
      this.contentNodes = data.contentNodes;
      this.loading = false;
      // Wait for the render to complete
      await this.updateComplete;
    } catch (error) {
      this.loading = false;
      // Set fallback content
      this.setFallbackContent();
      // Wait for the render to complete
      await this.updateComplete;
    }
  }

  private setFallbackContent() {
    this.profile = null; // No profile data
    this.contentNodes = [
      {
        type: 'paragraph',
        content: 'Unable to Load Content'
      }
    ];
  }

  render() {
    if (this.loading) {
      return html`<div class="aboutme"><div class="loading">Loading...</div></div>`;
    }

    // If profile is not available, check if fallback content is present.
    if (!this.profile) {
      if (this.contentNodes && this.contentNodes.length > 0) {
        return html`<div class="aboutme">${this.renderer.renderContent(this.contentNodes)}</div>`;
      }
      return html`<div class="aboutme"><div class="loading">Failed to load content</div></div>`;
    }

    // Render profile header + content
    const profileImageUrl = this.profile.profileImageUrl 
      ? (this.profile.profileImageUrl.startsWith('http') || this.profile.profileImageUrl.startsWith('/') 
         ? this.profile.profileImageUrl 
         : `images/${this.profile.profileImageUrl}`)
      : '';
    
    return html`
      <div class="aboutme">
        <div class="profile-section">
          ${profileImageUrl ? html`
            <img src="${profileImageUrl}" alt="${this.profile.name}" 
                 class="profile-picture">
          ` : ''}
          <h1>${this.profile.name}</h1>
          <p class="profile-title">${this.profile.title} • ${this.profile.experience}</p>
        </div>
        <div class="content-section">
          ${this.renderer.renderContent(this.contentNodes)}
        </div>
      </div>
    `;
  }
}