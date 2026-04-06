import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-home-section')
export class AdminHomeSection extends AdminSection {
  private async handleUpload() {
    const input = this.shadowRoot?.querySelector('#homeFile') as HTMLInputElement;
    if (input.files?.[0]) {
      try {
        await this.onUpload('home.md', input.files[0]);
        this.onStatusMessage('Upload successful!');
      } catch (e) {
        this.onStatusMessage('Upload failed.');
      }
    }
  }

  private async handleDelete() {
    if (!confirm('Delete home.md?')) return;
    try {
      await this.onDelete('home.md');
    } catch (e) {
      this.onStatusMessage('Delete failed.');
    }
  }

  render() {
    const home = this.getContent('home.md');
    return html`
      <div class="section">
        <h3>Home Page</h3>
        <p class="help-text">Content for your home page. Upload home.md with your main content.</p>

        ${home ? html`
          <div class="current-file">
            <strong>Current:</strong> home.md (${home.size} bytes)
            <button class="btn-danger" @click=${this.handleDelete}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="homeFile" accept=".md" />
        <button class="btn-primary" @click=${this.handleUpload}>Upload home.md</button>
      </div>
    `;
  }
}