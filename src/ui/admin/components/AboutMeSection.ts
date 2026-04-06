import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-about-me-section')
export class AdminAboutMeSection extends AdminSection {
  private async handleUpload() {
    const input = this.shadowRoot?.querySelector('#aboutFile') as HTMLInputElement;
    if (input.files?.[0]) {
      try {
        await this.onUpload('about-me.md', input.files[0]);
        this.onStatusMessage('Upload successful!');
      } catch (e) {
        this.onStatusMessage('Upload failed.');
      }
    }
  }

  private async handleDelete() {
    if (!confirm('Delete about-me.md?')) return;
    try {
      await this.onDelete('about-me.md');
    } catch (e) {
      this.onStatusMessage('Delete failed.');
    }
  }

  render() {
    const aboutMe = this.getContent('about-me.md');
    return html`
      <div class="section">
        <h3>About Me Page <span class="required-badge">Required</span></h3>
        <p class="help-text">Content for your About Me page. Supports Markdown with frontmatter.</p>

        ${aboutMe ? html`
          <div class="current-file">
            <strong>Current:</strong> about-me.md (${aboutMe.size} bytes)
            <button class="btn-danger" @click=${this.handleDelete}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="aboutFile" accept=".md" />
        <button class="btn-primary" @click=${this.handleUpload}>Upload about-me.md</button>
      </div>
    `;
  }
}