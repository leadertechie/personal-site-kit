import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-profile-section')
export class AdminProfileSection extends AdminSection {
  private async handleUpload() {
    const input = this.shadowRoot?.querySelector('#profileFile') as HTMLInputElement;
    if (input.files?.[0]) {
      try {
        await this.onUpload('profile.json', input.files[0]);
        this.onStatusMessage('Upload successful!');
      } catch (e) {
        this.onStatusMessage('Upload failed.');
      }
    }
  }

  private async handleDelete() {
    if (!confirm('Delete profile.json?')) return;
    try {
      await this.onDelete('profile.json');
    } catch (e) {
      this.onStatusMessage('Delete failed.');
    }
  }

  render() {
    const profile = this.getContent('profile.json');
    return html`
      <div class="section">
        <h3>Profile <span class="required-badge">Required</span></h3>
        <p class="help-text">This file contains your profile information (name, title, experience).</p>

        ${profile ? html`
          <div class="current-file">
            <strong>Current:</strong> profile.json (${profile.size} bytes)
            <button class="btn-danger" @click=${this.handleDelete}>Delete</button>
          </div>
        ` : ''}

        <input type="file" id="profileFile" accept=".json" />
        <button class="btn-primary" @click=${this.handleUpload}>Upload profile.json</button>
      </div>
    `;
  }
}