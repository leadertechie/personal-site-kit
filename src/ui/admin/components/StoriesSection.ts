import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-stories-section')
export class AdminStoriesSection extends AdminSection {
  private async handleUpload() {
    const metaInput = this.shadowRoot?.querySelector('#storyMetaFile') as HTMLInputElement;
    const contentInput = this.shadowRoot?.querySelector('#storyContentFile') as HTMLInputElement;
    const slugInput = this.shadowRoot?.querySelector('#storySlug') as HTMLInputElement;

    if (metaInput.files?.[0] && contentInput.files?.[0] && slugInput.value) {
      const slug = slugInput.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      try {
        await this.onUpload(`stories/${slug}.json`, metaInput.files[0]);
        await this.onUpload(`stories/${slug}.md`, contentInput.files[0]);
        this.onStatusMessage('Upload successful!');
      } catch (e) {
        this.onStatusMessage('Upload failed.');
      }
    }
  }

  private async handleDelete(slug: string) {
    if (!confirm(`Delete story ${slug}?`)) return;
    try {
      await this.onDelete(`stories/${slug}.json`);
      await this.onDelete(`stories/${slug}.md`);
    } catch (e) {
      this.onStatusMessage('Delete failed.');
    }
  }

  render() {
    const stories = this.getSectionFiles('stories/').filter(s => s.key.endsWith('.json'));
    return html`
      <div class="section">
        <h3>Stories</h3>
        <p class="help-text">Each story needs 2 files: a JSON (metadata) and MD (content) file.</p>

        <h4>Upload New Story</h4>
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">Metadata (JSON)</label>
          <input type="file" id="storyMetaFile" accept=".json" />
        </div>
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">Content (Markdown)</label>
          <input type="file" id="storyContentFile" accept=".md" />
        </div>
        <div class="mb-1">
          <label style="display:block;margin-bottom:4px;font-weight:500">URL Slug</label>
          <input type="text" id="storySlug" placeholder="Slug (e.g., my-story)" />
        </div>
        <button class="btn-primary" @click=${this.handleUpload}>Upload Story (JSON + MD)</button>

        <div class="file-list">
          <h4>Current Stories (${stories.length})</h4>
          ${stories.map(s => {
            const slug = s.key.replace('stories/', '').replace('.json', '');
            return html`
              <div class="file-item">
                <span>${s.key.replace('.json', '')}</span>
                <button class="btn-danger" @click=${() => this.handleDelete(slug)}>Delete</button>
              </div>
            `;
          })}
          ${stories.length === 0 ? html`<p>No stories yet.</p>` : ''}
        </div>
      </div>
    `;
  }
}