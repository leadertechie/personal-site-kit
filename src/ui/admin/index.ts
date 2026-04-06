import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { adminStyles } from './styles';
import { AdminApiService } from './api';
import type { ContentItem, StaticDetails } from './types';
import { SiteStore } from '../../shared/core/site-store';
import {
  AdminLoginForm,
  AdminHomeSection,
  AdminProfileSection,
  AdminAboutMeSection,
  AdminBlogsSection,
  AdminStoriesSection,
  AdminImagesSection,
  AdminLogoSection,
  AdminStaticSection
} from './components';

export {
  AdminLoginForm,
  AdminHomeSection,
  AdminProfileSection,
  AdminAboutMeSection,
  AdminBlogsSection,
  AdminStoriesSection,
  AdminImagesSection,
  AdminLogoSection,
  AdminStaticSection
};

@customElement('admin-portal')
export class AdminPortal extends LitElement {
  static styles = adminStyles;

  @state()
  accessor isAuthenticated = false;

  @state()
  accessor isSetup = false;

  @state()
  accessor isLoading = true;

  @state()
  accessor contentList: ContentItem[] = [];

  @state()
  accessor statusMessage = '';

  @state()
  accessor activeSection = 'profile';

  @state()
  accessor staticDetails: StaticDetails = {};

  @state()
  accessor loginError = '';

  private apiService: AdminApiService;

  constructor() {
    super();
    const apiUrl = window.location.origin;
    this.apiService = new AdminApiService(apiUrl);
  }

  private hasSessionCookie(): boolean {
    return document.cookie.includes('session=');
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.checkAuthStatus();
    this.requestUpdate();
  }

  async checkAuthStatus() {
    try {
      const status = await this.apiService.checkAuthStatus();
      this.isSetup = status.configured;
      if (status.configured && this.hasSessionCookie()) {
        await this.tryAutoLogin();
      }
    } catch (e) {
      console.error('Auth status check failed:', e);
    } finally {
      this.isLoading = false;
    }
  }

  async tryAutoLogin() {
    try {
      this.contentList = await this.apiService.tryAutoLogin();
      this.isAuthenticated = true;
    } catch (e) {
      console.error('Auto login failed:', e);
    }
  }

  async handleLogin(e: CustomEvent) {
    const { username, password } = e.detail;
    this.loginError = '';

    if (!username || !password) {
      this.loginError = 'Username and password required';
      return;
    }

    try {
      await this.apiService.login(username, password);
      this.isAuthenticated = true;
      await this.fetchContent();
    } catch (e) {
      this.loginError = (e as Error).message;
    }
  }

  async handleSetup(e: CustomEvent) {
    const { username, password, confirmPassword } = e.detail;
    this.loginError = '';

    if (!username || !password) {
      this.loginError = 'Username and password required';
      return;
    }

    if (username.length < 3) {
      this.loginError = 'Username must be at least 3 characters';
      return;
    }

    if (password.length < 8) {
      this.loginError = 'Password must be at least 8 characters';
      return;
    }

    if (password !== confirmPassword) {
      this.loginError = 'Passwords do not match';
      return;
    }

    try {
      await this.apiService.setup(username, password);
      this.isAuthenticated = true;
      this.isSetup = true;
      await this.fetchContent();
    } catch (e) {
      this.loginError = (e as Error).message;
    }
  }

  async handleLogout() {
    try {
      await this.apiService.logout();
    } catch (e) {}
    this.isAuthenticated = false;
    this.contentList = [];
  }

  async fetchContent() {
    try {
      this.contentList = await this.apiService.fetchContent();
    } catch (e) {
      this.statusMessage = 'Error fetching content.';
    }
  }

  async fetchStaticDetails() {
    try {
      this.staticDetails = await this.apiService.fetchStaticDetails();
    } catch (e) {}
  }

  async handleUpload(key: string, file: File) {
    try {
      this.statusMessage = 'Uploading...';
      await this.apiService.uploadContent(key, file);
      this.statusMessage = 'Upload successful!';
      await this.fetchContent();
    } catch (e) {
      this.statusMessage = 'Error uploading.';
    }
  }

  async handleClearCache() {
    try {
      this.statusMessage = 'Clearing cache...';
      await this.apiService.clearCache();
      this.statusMessage = 'Cache cleared!';
    } catch (e) {
      this.statusMessage = 'Error clearing cache.';
    }
  }

  async handleDelete(key: string) {
    try {
      await this.apiService.deleteContent(key);
      await this.fetchContent();
    } catch (e) {
      this.statusMessage = 'Error deleting.';
    }
  }

  private handleStatusMessage(message: string) {
    this.statusMessage = message;
  }

  renderLoginForm() {
    return html`
      <admin-login-form
        .errorMessage=${this.loginError}
        .isSetup=${false}
        @login-submit=${this.handleSetup}
      ></admin-login-form>
    `;
  }

  renderLogin() {
    return html`
      <admin-login-form
        .errorMessage=${this.loginError}
        .isSetup=${true}
        @login-submit=${this.handleLogin}
      ></admin-login-form>
    `;
  }

  render() {
    if (this.isLoading) {
      return html`<div class="container"><div class="loading">Loading...</div></div>`;
    }

    if (!this.isSetup) {
      return this.renderLoginForm();
    }

    if (!this.isAuthenticated) {
      return this.renderLogin();
    }

    return html`
      <div class="container">
        <div class="header">
          <h1>Content Manager</h1>
          <button class="btn-secondary" @click=${() => this.handleLogout()}>Logout</button>
          <button class="btn-secondary" @click=${() => this.handleClearCache()}>Clear Cache</button>
        </div>

        <div class="nav-tabs">
          <button class="nav-tab ${this.activeSection === 'home' ? 'active' : ''}"
            @click=${() => this.activeSection = 'home'}>Home</button>
          <button class="nav-tab ${this.activeSection === 'profile' ? 'active' : ''}"
            @click=${() => this.activeSection = 'profile'}>Profile</button>
          <button class="nav-tab ${this.activeSection === 'aboutme' ? 'active' : ''}"
            @click=${() => this.activeSection = 'aboutme'}>About Me</button>
          <button class="nav-tab ${this.activeSection === 'blogs' ? 'active' : ''}"
            @click=${() => this.activeSection = 'blogs'}>Blogs</button>
          <button class="nav-tab ${this.activeSection === 'stories' ? 'active' : ''}"
            @click=${() => this.activeSection = 'stories'}>Stories</button>
          <button class="nav-tab ${this.activeSection === 'images' ? 'active' : ''}"
            @click=${() => this.activeSection = 'images'}>Images</button>
          <button class="nav-tab ${this.activeSection === 'logo' ? 'active' : ''}"
            @click=${() => this.activeSection = 'logo'}>Logo</button>
          <button class="nav-tab ${this.activeSection === 'static' ? 'active' : ''}"
            @click=${() => { this.activeSection = 'static'; this.fetchStaticDetails(); }}>Site Settings</button>
        </div>

        ${this.statusMessage ? html`
          <div class="status-message ${this.statusMessage.includes('successful') || this.statusMessage.includes('cleared') ? 'success' : this.statusMessage.includes('failed') || this.statusMessage.includes('Error') ? 'error' : ''}">
            ${this.statusMessage}
          </div>
        ` : ''}

        ${this.activeSection === 'home' ? html`
          <admin-home-section
            .contentList=${this.contentList}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-home-section>
        ` : ''}

        ${this.activeSection === 'profile' ? html`
          <admin-profile-section
            .contentList=${this.contentList}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-profile-section>
        ` : ''}

        ${this.activeSection === 'aboutme' ? html`
          <admin-about-me-section
            .contentList=${this.contentList}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-about-me-section>
        ` : ''}

        ${this.activeSection === 'blogs' ? html`
          <admin-blogs-section
            .contentList=${this.contentList}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-blogs-section>
        ` : ''}

        ${this.activeSection === 'stories' ? html`
          <admin-stories-section
            .contentList=${this.contentList}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-stories-section>
        ` : ''}

        ${this.activeSection === 'images' ? html`
          <admin-images-section
            .contentList=${this.contentList}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-images-section>
        ` : ''}

        ${this.activeSection === 'logo' ? html`
          <admin-logo-section
            .contentList=${this.contentList}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-logo-section>
        ` : ''}

        ${this.activeSection === 'static' ? html`
          <admin-static-section
            .contentList=${this.contentList}
            .staticDetails=${this.staticDetails}
            .onUpload=${this.handleUpload.bind(this)}
            .onDelete=${this.handleDelete.bind(this)}
            .onStatusMessage=${this.handleStatusMessage.bind(this)}
          ></admin-static-section>
        ` : ''}
      </div>
    `;
  }

  render() {
    if (this.isLoading) {
      return html`<div class="container"><div class="loading">Loading...</div></div>`;
    }

    if (!this.isSetup) {
      return this.renderLoginForm();
    }

    if (!this.isAuthenticated) {
      return this.renderLogin();
    }

    return html`
      <div class="container">
        <div class="header">
          <h1>Content Manager</h1>
          <button class="btn-secondary" @click=${() => this.handleLogout()}>Logout</button>
          <button class="btn-secondary" @click=${() => this.handleClearCache()}>Clear Cache</button>
        </div>
        
        <div class="nav-tabs">
          <button class="nav-tab ${this.activeSection === 'home' ? 'active' : ''}" 
            @click=${() => this.activeSection = 'home'}>Home</button>
          <button class="nav-tab ${this.activeSection === 'profile' ? 'active' : ''}" 
            @click=${() => this.activeSection = 'profile'}>Profile</button>
          <button class="nav-tab ${this.activeSection === 'aboutme' ? 'active' : ''}"
            @click=${() => this.activeSection = 'aboutme'}>About Me</button>
          <button class="nav-tab ${this.activeSection === 'blogs' ? 'active' : ''}"
            @click=${() => this.activeSection = 'blogs'}>Blogs</button>
          <button class="nav-tab ${this.activeSection === 'stories' ? 'active' : ''}"
            @click=${() => this.activeSection = 'stories'}>Stories</button>
          <button class="nav-tab ${this.activeSection === 'images' ? 'active' : ''}"
            @click=${() => this.activeSection = 'images'}>Images</button>
          <button class="nav-tab ${this.activeSection === 'logo' ? 'active' : ''}"
            @click=${() => this.activeSection = 'logo'}>Logo</button>
          <button class="nav-tab ${this.activeSection === 'static' ? 'active' : ''}"
            @click=${() => { 
              this.activeSection = 'static'; 
              this.fetchStaticDetails(); 
            }}>Site Settings</button>
        </div>

        ${this.statusMessage ? html`
          <div class="status-message ${this.statusMessage.includes('successful') || this.statusMessage.includes('cleared') ? 'success' : this.statusMessage.includes('failed') || this.statusMessage.includes('Error') ? 'error' : ''}">
            ${this.statusMessage}
          </div>
        ` : ''}

        ${this.activeSection === 'home' ? this.renderHomeSection() : ''}
        ${this.activeSection === 'profile' ? this.renderProfileSection() : ''}
        ${this.activeSection === 'aboutme' ? this.renderAboutMeSection() : ''}
        ${this.activeSection === 'blogs' ? this.renderBlogsSection() : ''}
        ${this.activeSection === 'stories' ? this.renderStoriesSection() : ''}
        ${this.activeSection === 'images' ? this.renderImagesSection() : ''}
        ${this.activeSection === 'logo' ? this.renderLogoSection() : ''}
        ${this.activeSection === 'static' ? this.renderStaticSection() : ''}
      </div>
    `;
  }
}

export const adminLoaded = true;
