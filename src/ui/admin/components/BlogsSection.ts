import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-blogs-section')
export class AdminBlogsSection extends AdminSection {
  private async handleUpload() {
    const metaInput = this.shadowRoot?.querySelector('#blogMetaFile') as HTMLInputElement;
    const contentInput = this.shadowRoot?.querySelector('#blogContentFile') as HTMLInputElement;
    const slugInput = this.shadowRoot?.querySelector('#blogSlug') as HTMLInputElement;

    if (metaInput.files?.[0] && contentInput.files?.[0] && slugInput.value) {
      try {
        await this.onUpload(`blogs/${slugInput.value}.json`, metaInput.files[0]);
        await this.onUpload(`blogs/${slugInput.value}.md`, contentInput.files[0]);
        this.onStatusMessage('Upload successful!');
      } catch (e) {
        this.onStatusMessage('Upload failed.');
      }
    }
  }

  private async handleDelete(slug: string) {
    if (!confirm(`Delete blog ${slug}?`)) return;
    try {
      await this.onDelete(`blogs/${slug}.json`);
      await this.onDelete(`blogs/${slug}.md`);
    } catch (e) {
      this.onStatusMessage('Delete failed.');
    }
  }

  render() {
    const blogs = this.getSectionFiles('blogs/').filter(b => b.key.endsWith('.json'));
    return html`
      <div class="section">
        <h3>Blog Posts</h3>
        <p class="help-text">Each blog needs 2 files: a JSON (metadata) and MD (content) file.</p>

        <h4>Upload New Blog</h4>
        <input type="file" id="blogMetaFile" accept=".json" />
        <input type="file" id="blogContentFile" accept=".md" />
        <input type="text" id="blogSlug" placeholder="Slug (e.g., my-new-post)" class="mt-1" />
        <button class="btn-primary" @click=${this.handleUpload}>Upload Blog (JSON + MD)</button>

        <div class="file-list">
          <h4>Current Blogs (${blogs.length})</h4>
          ${blogs.map(b => {
            const slug = b.key.replace('blogs/', '').replace('.json', '');
            return html`
              <div class="file-item">
                <span>${b.key.replace('.json', '')}</span>
                <button class="btn-danger" @click=${() => this.handleDelete(slug)}>Delete</button>
              </div>
            `;
          })}
          ${blogs.length === 0 ? html`<p>No blogs yet.</p>` : ''}
        </div>
      </div>
    `;
  }
}