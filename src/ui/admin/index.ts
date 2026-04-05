import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { adminStyles } from './styles';

interface ContentItem {
  key: string;
  size: number;
  uploaded?: string;
}

interface StaticDetails {
  siteTitle?: string;
  copyright?: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

interface AuthStatus {
  configured: boolean;
  username: string | null;
}

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

  get apiUrl() {
    return (window as any).__VITE_API_URL__ || import.meta.env.VITE_API_URL || 'http://localhost:8787';
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const res = await fetch(`${this.apiUrl}/auth/status`, {
        credentials: 'include'
      });
      if (res.ok) {
        const status: AuthStatus = await res.json();
        this.isSetup = status.configured;
        
        if (status.configured) {
          await this.tryAutoLogin();
        } else {
          this.isLoading = false;
        }
      } else {
        this.isSetup = false;
        this.isLoading = false;
      }
    } catch (e) {
      this.isSetup = false;
      this.isLoading = false;
    }
  }

  async tryAutoLogin() {
    try {
      const res = await fetch(`${this.apiUrl}/content`, {
        credentials: 'include'
      });
      if (res.ok) {
        this.contentList = await res.json();
        this.isAuthenticated = true;
      }
    } catch (e) {}
    this.isLoading = false;
  }

  async handleLogin(e: Event) {
    e.preventDefault();
    this.loginError = '';

    const usernameInput = this.shadowRoot?.querySelector('#username') as HTMLInputElement;
    const passwordInput = this.shadowRoot?.querySelector('#password') as HTMLInputElement;

    if (!usernameInput?.value || !passwordInput?.value) {
      this.loginError = 'Username and password required';
      return;
    }

    try {
      const res = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value
        })
      });

      if (res.ok) {
        this.isAuthenticated = true;
        await this.fetchContent();
      } else {
        const data = await res.json();
        this.loginError = data.error || 'Login failed';
      }
    } catch (e) {
      this.loginError = 'Connection error';
    }
  }

  async handleSetup(e: Event) {
    e.preventDefault();
    this.loginError = '';

    const usernameInput = this.shadowRoot?.querySelector('#username') as HTMLInputElement;
    const passwordInput = this.shadowRoot?.querySelector('#password') as HTMLInputElement;
    const confirmInput = this.shadowRoot?.querySelector('#confirmPassword') as HTMLInputElement;

    if (!usernameInput?.value || !passwordInput?.value) {
      this.loginError = 'Username and password required';
      return;
    }

    if (usernameInput.value.length < 3) {
      this.loginError = 'Username must be at least 3 characters';
      return;
    }

    if (passwordInput.value.length < 8) {
      this.loginError = 'Password must be at least 8 characters';
      return;
    }

    if (passwordInput.value !== confirmInput?.value) {
      this.loginError = 'Passwords do not match';
      return;
    }

    try {
      const res = await fetch(`${this.apiUrl}/auth/setup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value
        })
      });

      if (res.ok) {
        this.isAuthenticated = true;
        this.isSetup = true;
        await this.fetchContent();
      } else {
        const data = await res.json();
        this.loginError = data.error || 'Setup failed';
      }
    } catch (e) {
      this.loginError = 'Connection error';
    }
  }

  async handleLogout() {
    try {
      await fetch(`${this.apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {}
    this.isAuthenticated = false;
    this.contentList = [];
  }

  async fetchContent() {
    try {
      const res = await fetch(`${this.apiUrl}/content`, {
        credentials: 'include'
      });
      if (res.ok) {
        this.contentList = await res.json();
      } else {
        this.statusMessage = 'Failed to fetch content.';
      }
    } catch (e) {
      this.statusMessage = 'Error fetching content.';
    }
  }

  async fetchStaticDetails() {
    try {
      const res = await fetch(`${this.apiUrl}/static`, {
        credentials: 'include'
      });
      if (res.ok) {
        this.staticDetails = await res.json();
      }
    } catch (e) {}
  }

  async handleUpload(key: string, file: File) {
    try {
      this.statusMessage = 'Uploading...';
      const res = await fetch(`${this.apiUrl}/content/${key}`, {
        method: 'PUT',
        credentials: 'include',
        body: file
      });

      if (res.ok) {
        this.statusMessage = 'Upload successful!';
        this.fetchContent();
      } else {
        this.statusMessage = 'Upload failed.';
      }
    } catch (e) {
      this.statusMessage = 'Error uploading.';
    }
  }

  async handleClearCache() {
    try {
      this.statusMessage = 'Clearing cache...';
      const res = await fetch(`${this.apiUrl}/cache-clear`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        this.statusMessage = 'Cache cleared!';
      } else {
        this.statusMessage = 'Failed to clear cache.';
      }
    } catch (e) {
      this.statusMessage = 'Error clearing cache.';
    }
  }

  async handleDelete(key: string) {
    if (!confirm(`Delete ${key}?`)) return;

    try {
      const res = await fetch(`${this.apiUrl}/content/${key}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        this.fetchContent();
      } else {
        this.statusMessage = 'Delete failed.';
      }
    } catch (e) {
      this.statusMessage = 'Error deleting.';
    }
  }

  getContent(key: string): ContentItem | undefined {
    return this.contentList.find(c => c.key === key);
  }

  getSectionFiles(prefix: string): ContentItem[] {
    return this.contentList.filter(c => c.key.startsWith(prefix));
  }

  renderLoginForm() {
    return html`
      <div class="container">
        <div class="login-box">
          <h2>Admin Setup</h2>
          <p>Create your admin credentials</p>
          <form @submit=${this.handleSetup}>
            <input type="text" id="username" placeholder="Username (3+ chars)" />
            <input type="password" id="password" placeholder="Password (8+ chars)" />
            <input type="password" id="confirmPassword" placeholder="Confirm Password" />
            ${this.loginError ? html`<div class="error-message">${this.loginError}</div>` : ''}
            <button type="submit" class="btn-primary">Create Account</button>
          </form>
        </div>
      </div>
    `;
  }

  renderLogin() {
    return html`
      <div class="container">
        <div class="login-box">
          <h2>Admin Login</h2>
          <p>Enter your credentials</p>
          <form @submit=${this.handleLogin}>
            <input type="text" id="username" placeholder="Username" autocomplete="username" />
            <input type="password" id="password" placeholder="Password" autocomplete="current-password" />
            ${this.loginError ? html`<div class="error-message">${this.loginError}</div>` : ''}
            <button type="submit" class="btn-primary">Login</button>
          </form>
        </div>
      </div>
    `;
  }

  renderHomeSection() {
    const home = this.getContent('home.md');
    return html`
      <div class="section">
        <h3>Home Page</h3>
        <p class="help-text">Content for your home page. Upload home.md with your main content.</p>
        
        ${home ? html`
          <div class="current-file">
            <strong>Current:</strong> home.md (${home.size} bytes)
            <button class="btn-danger" @click=${() => this.handleDelete('home.md')}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="homeFile" accept=".md" />
        <button class="btn-primary" @click=${() => {
          const input = this.shadowRoot?.querySelector('#homeFile') as HTMLInputElement;
          if (input.files?.[0]) this.handleUpload('home.md', input.files[0]);
        }}>Upload home.md</button>
      </div>
    `;
  }

  renderProfileSection() {
    const profile = this.getContent('profile.json');
    return html`
      <div class="section">
        <h3>Profile <span class="required-badge">Required</span></h3>
        <p class="help-text">This file contains your profile information (name, title, experience).</p>
        
        ${profile ? html`
          <div class="current-file">
            <strong>Current:</strong> profile.json (${profile.size} bytes)
            <button class="btn-danger" @click=${() => this.handleDelete('profile.json')}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="profileFile" accept=".json" />
        <button class="btn-primary" @click=${() => {
          const input = this.shadowRoot?.querySelector('#profileFile') as HTMLInputElement;
          if (input.files?.[0]) this.handleUpload('profile.json', input.files[0]);
        }}>Upload profile.json</button>
      </div>
    `;
  }

  renderAboutMeSection() {
    const aboutMe = this.getContent('about-me.md');
    return html`
      <div class="section">
        <h3>About Me Page <span class="required-badge">Required</span></h3>
        <p class="help-text">Content for your About Me page. Supports Markdown with frontmatter.</p>
        
        ${aboutMe ? html`
          <div class="current-file">
            <strong>Current:</strong> about-me.md (${aboutMe.size} bytes)
            <button class="btn-danger" @click=${() => this.handleDelete('about-me.md')}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="aboutFile" accept=".md" />
        <button class="btn-primary" @click=${() => {
          const input = this.shadowRoot?.querySelector('#aboutFile') as HTMLInputElement;
          if (input.files?.[0]) this.handleUpload('about-me.md', input.files[0]);
        }}>Upload about-me.md</button>
      </div>
    `;
  }

  renderBlogsSection() {
    const blogs = this.getSectionFiles('blogs/').filter(b => b.key.endsWith('.json'));
    return html`
      <div class="section">
        <h3>Blog Posts</h3>
        <p class="help-text">Each blog needs 2 files: a JSON (metadata) and MD (content) file.</p>
        
        <h4>Upload New Blog</h4>
        <input type="file" id="blogMetaFile" accept=".json" />
        <input type="file" id="blogContentFile" accept=".md" />
        <input type="text" id="blogSlug" placeholder="Slug (e.g., my-new-post)" class="mt-1" />
        <button class="btn-primary" @click=${() => {
          const metaInput = this.shadowRoot?.querySelector('#blogMetaFile') as HTMLInputElement;
          const contentInput = this.shadowRoot?.querySelector('#blogContentFile') as HTMLInputElement;
          const slugInput = this.shadowRoot?.querySelector('#blogSlug') as HTMLInputElement;
          if (metaInput.files?.[0] && contentInput.files?.[0] && slugInput.value) {
            this.handleUpload(`blogs/${slugInput.value}.json`, metaInput.files[0]);
            this.handleUpload(`blogs/${slugInput.value}.md`, contentInput.files[0]);
          }
        }}>Upload Blog (JSON + MD)</button>

        <div class="file-list">
          <h4>Current Blogs (${blogs.length})</h4>
          ${blogs.map(b => html`
            <div class="file-item">
              <span>${b.key.replace('.json', '')}</span>
              <button class="btn-danger" @click=${() => {
                const slug = b.key.replace('blogs/', '').replace('.json', '');
                this.handleDelete(`blogs/${slug}.json`);
                this.handleDelete(`blogs/${slug}.md`);
              }}>Delete</button>
            </div>
          `)}
          ${blogs.length === 0 ? html`<p>No blogs yet.</p>` : ''}
        </div>
      </div>
    `;
  }

  renderStoriesSection() {
    const stories = this.getSectionFiles('stories/').filter(s => s.key.endsWith('.json'));
    return html`
      <div class="section">
        <h3>Stories</h3>
        <p class="help-text">Each story needs 2 files: a JSON (metadata) and MD (content) file.</p>
        
        <h4>Upload New Story</h4>
        <input type="file" id="storyMetaFile" accept=".json" />
        <input type="file" id="storyContentFile" accept=".md" />
        <input type="text" id="storySlug" placeholder="Slug (e.g., my-story)" class="mt-1" />
        <button class="btn-primary" @click=${() => {
          const metaInput = this.shadowRoot?.querySelector('#storyMetaFile') as HTMLInputElement;
          const contentInput = this.shadowRoot?.querySelector('#storyContentFile') as HTMLInputElement;
          const slugInput = this.shadowRoot?.querySelector('#storySlug') as HTMLInputElement;
          if (metaInput.files?.[0] && contentInput.files?.[0] && slugInput.value) {
            this.handleUpload(`stories/${slugInput.value}.json`, metaInput.files[0]);
            this.handleUpload(`stories/${slugInput.value}.md`, contentInput.files[0]);
          }
        }}>Upload Story (JSON + MD)</button>

        <div class="file-list">
          <h4>Current Stories (${stories.length})</h4>
          ${stories.map(s => html`
            <div class="file-item">
              <span>${s.key.replace('.json', '')}</span>
              <button class="btn-danger" @click=${() => {
                const slug = s.key.replace('stories/', '').replace('.json', '');
                this.handleDelete(`stories/${slug}.json`);
                this.handleDelete(`stories/${slug}.md`);
              }}>Delete</button>
            </div>
          `)}
          ${stories.length === 0 ? html`<p>No stories yet.</p>` : ''}
        </div>
      </div>
    `;
  }

  renderImagesSection() {
    const images = this.getSectionFiles('images/');
    return html`
      <div class="section">
        <h3>Images</h3>
        <p class="help-text">Upload images for use in your content. In markdown, reference images by filename only (e.g., use <code>my-photo.jpg</code> not <code>/images/my-photo.jpg</code>). The renderer automatically prepends <code>images/</code>.</p>
        
        <input type="file" id="imageFile" accept="image/*" />
        <input type="text" id="imagePath" placeholder="Image name (e.g., profile-photo.jpg)" class="mt-1" />
        <button class="btn-primary" @click=${() => {
          const fileInput = this.shadowRoot?.querySelector('#imageFile') as HTMLInputElement;
          const pathInput = this.shadowRoot?.querySelector('#imagePath') as HTMLInputElement;
          if (fileInput.files?.[0] && pathInput.value) {
            this.handleUpload(`images/${pathInput.value}`, fileInput.files[0]);
          }
        }}>Upload to images/</button>

        <div class="file-list">
          <h4>Current Images (${images.length})</h4>
          ${images.map(img => html`
            <div class="file-item">
              <span>${img.key} (${img.size} bytes)</span>
              <button class="btn-danger" @click=${() => this.handleDelete(img.key)}>Delete</button>
            </div>
          `)}
          ${images.length === 0 ? html`<p>No images yet.</p>` : ''}
        </div>
      </div>
    `;
  }

  renderLogoSection() {
    const logo = this.getContent('logo.svg');
    return html`
      <div class="section">
        <h3>Site Logo</h3>
        <p class="help-text">Upload your site logo (SVG format recommended). This appears in the header of your site.</p>
        
        ${logo ? html`
          <div class="current-file">
            <strong>Current:</strong> logo.svg (${logo.size} bytes)
            <button class="btn-danger" @click=${() => this.handleDelete('logo.svg')}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="logoFile" accept=".svg,image/svg+xml" />
        <button class="btn-primary mt-1 mb-1" @click=${() => {
          const input = this.shadowRoot?.querySelector('#logoFile') as HTMLInputElement;
          if (input.files?.[0]) this.handleUpload('logo.svg', input.files[0]);
        }}>Upload logo.svg</button>

        <div class="info-box">
          <strong>Tip:</strong> Use an SVG with transparent background. The logo will automatically adapt to light/dark themes.
        </div>
      </div>
    `;
  }

  renderStaticSection() {
    return html`
      <div class="section">
        <h3>Site Settings</h3>
        <p class="help-text">Manage your site's static details like title, footer links, etc.</p>
        
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">Site Title</label>
          <input type="text" id="siteTitle" .value=${this.staticDetails?.siteTitle || ''} />
        </div>
        
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">Copyright Text</label>
          <input type="text" id="copyright" .value=${this.staticDetails?.copyright || ''} />
        </div>
        
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">LinkedIn URL</label>
          <input type="text" id="linkedin" .value=${this.staticDetails?.linkedin || ''} />
        </div>
        
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">GitHub URL</label>
          <input type="text" id="github" .value=${this.staticDetails?.github || ''} />
        </div>
        
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">Email</label>
          <input type="text" id="email" .value=${this.staticDetails?.email || ''} />
        </div>
        
        <button class="btn-primary" @click=${async () => {
          const siteTitle = (this.shadowRoot?.querySelector('#siteTitle') as HTMLInputElement)?.value;
          const copyright = (this.shadowRoot?.querySelector('#copyright') as HTMLInputElement)?.value;
          const linkedin = (this.shadowRoot?.querySelector('#linkedin') as HTMLInputElement)?.value;
          const github = (this.shadowRoot?.querySelector('#github') as HTMLInputElement)?.value;
          const email = (this.shadowRoot?.querySelector('#email') as HTMLInputElement)?.value;
          
          const data: Record<string, string> = {};
          if (siteTitle) data.siteTitle = siteTitle;
          if (copyright) data.copyright = copyright;
          if (linkedin) data.linkedin = linkedin;
          if (github) data.github = github;
          if (email) data.email = email;
          
          try {
            const url = `${this.apiUrl}/content/staticdetails.json`;
            const res = await fetch(url, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            if (res.ok) {
              this.statusMessage = 'Settings saved!';
              this.fetchContent();
            } else {
              this.statusMessage = 'Failed to save settings.';
            }
          } catch (e) {
            this.statusMessage = 'Error saving settings.';
          }
        }}>Save Settings</button>
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
