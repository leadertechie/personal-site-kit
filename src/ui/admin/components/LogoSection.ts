import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-logo-section')
export class AdminLogoSection extends AdminSection {
  private async handleUpload() {
    const input = this.shadowRoot?.querySelector('#logoFile') as HTMLInputElement;
    if (input.files?.[0]) {
      try {
        await this.onUpload('logo.svg', input.files[0]);
        this.onStatusMessage('Upload successful!');
      } catch (e) {
        this.onStatusMessage('Upload failed.');
      }
    }
  }

  private async handleDelete() {
    if (!confirm('Delete logo.svg?')) return;
    try {
      await this.onDelete('logo.svg');
    } catch (e) {
      this.onStatusMessage('Delete failed.');
    }
  }

  render() {
    const logo = this.getContent('logo.svg');
    const logoUrl = `/api/logo?t=${Date.now()}`;

    return html`
      <div class="section">
        <h3>Site Logo</h3>
        <p class="help-text">Upload your site logo (SVG format recommended). This appears in the header of your site.</p>

        ${logo ? html`
          <div class="current-file">
            <div class="mb-1">
              <strong>Current:</strong> logo.svg (${logo.size} bytes)
            </div>
            <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; margin-bottom: 10px; display: inline-block;">
              <img src="${logoUrl}" alt="Current Logo" style="max-height: 100px; display: block;" />
            </div>
            <br/>
            <button class="btn-danger" @click=${this.handleDelete}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="logoFile" accept=".svg,image/svg+xml" />
        <button class="btn-primary mt-1 mb-1" @click=${this.handleUpload}>Upload logo.svg</button>

        <div class="info-box">
          <strong>Tip:</strong> Use an SVG with transparent background. The logo will automatically adapt to light/dark themes.
        </div>
      </div>
    `;
  }
}