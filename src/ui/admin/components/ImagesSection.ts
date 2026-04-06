import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-images-section')
export class AdminImagesSection extends AdminSection {
  private async handleUpload() {
    const fileInput = this.shadowRoot?.querySelector('#imageFile') as HTMLInputElement;
    const pathInput = this.shadowRoot?.querySelector('#imagePath') as HTMLInputElement;

    if (fileInput.files?.[0] && pathInput.value) {
      try {
        await this.onUpload(`images/${pathInput.value}`, fileInput.files[0]);
        this.onStatusMessage('Upload successful!');
      } catch (e) {
        this.onStatusMessage('Upload failed.');
      }
    }
  }

  private async handleDelete(key: string) {
    if (!confirm(`Delete ${key}?`)) return;
    try {
      await this.onDelete(key);
    } catch (e) {
      this.onStatusMessage('Delete failed.');
    }
  }

  render() {
    const images = this.getSectionFiles('images/');
    return html`
      <div class="section">
        <h3>Images</h3>
        <p class="help-text">Upload images for use in your content. In markdown, reference images by filename only (e.g., use <code>my-photo.jpg</code> not <code>/images/my-photo.jpg</code>). The renderer automatically prepends <code>images/</code>.</p>

        <input type="file" id="imageFile" accept="image/*" />
        <input type="text" id="imagePath" placeholder="Image name (e.g., profile-photo.jpg)" class="mt-1" />
        <button class="btn-primary" @click=${this.handleUpload}>Upload to images/</button>

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
}