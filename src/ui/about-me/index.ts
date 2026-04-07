import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Profile } from './api';
import { aboutmeStyles } from './styles';
import { fetchAboutMe } from './api';

@customElement('my-aboutme')
export class MyAboutme extends LitElement {
  static styles = aboutmeStyles;

  @property({ type: String })
  accessor baseUrl = '';

  @state()
  accessor profile: Profile | null = null;

  @state()
  accessor htmlContent: string = '';

  @state()
  accessor loading = true;

  public fetcher = fetchAboutMe;

  constructor() {
    super();
  }

  private get apiBaseUrl(): string {
    return this.baseUrl || this.getAttribute('base-url') || '';
  }

  async connectedCallback() {
    super.connectedCallback();

    if (typeof window !== 'undefined' && (window as any).__HYDRATION_DATA__) {
      const hydrationData = (window as any).__HYDRATION_DATA__;
      this.profile = hydrationData.profile;
      this.htmlContent = hydrationData.processedMarkdown;
      this.loading = false;
      return;
    }

    this.loadContent();
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    
    if (this.loading === false && this.profile && this.htmlContent) {
      return;
    }
    
    if (changedProperties.has('baseUrl') || changedProperties.has('base-url')) {
      this.loadContent();
    }
  }

  private async loadContent() {
    const url = this.apiBaseUrl;
    if (!url) {
      this.loading = false;
      this.setFallbackContent();
      return;
    }

    try {
      this.loading = true;
      const data = await this.fetcher(url);

      this.profile = data.profile;
      this.htmlContent = (data as any).processedMarkdown;
      this.loading = false;
      await this.updateComplete;
    } catch (error) {
      this.loading = false;
      this.setFallbackContent();
      await this.updateComplete;
    }
  }

  private setFallbackContent() {
    this.profile = null;
    this.htmlContent = `
      <h2>Profile Not Found</h2>
      <p>Your about-me profile has not been initialized yet. Please run the seed command to get started:</p>
      <pre>npm run seed -- &lt;username&gt; '&lt;password&gt;'</pre>
    `;
  }

  render() {
    if (this.loading) {
      return html`<div class="aboutme"><div class="loading">Loading...</div></div>`;
    }

    if (!this.profile) {
      return html`<div class="aboutme"><div class="content-section" .innerHTML="${this.htmlContent}"></div></div>`;
    }

    const profileImageUrl = this.profile.profileImageUrl 
      ? (this.profile.profileImageUrl.startsWith('http') || this.profile.profileImageUrl.startsWith('/') 
         ? this.profile.profileImageUrl 
         : `${this.apiBaseUrl}/api/images/${this.profile.profileImageUrl}`)
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
        <div class="content-section" .innerHTML="${this.htmlContent}"></div>
      </div>
    `;
  }
}
