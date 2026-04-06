import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminSection } from './AdminSection';

@customElement('admin-static-section')
export class AdminStaticSection extends AdminSection {
  @state()
  accessor localDetails = { ...this.staticDetails };

  private async handleSave() {
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
      await this.onUpload('staticdetails.json', new File([JSON.stringify(data)], 'staticdetails.json', { type: 'application/json' }));
      this.onStatusMessage('Settings saved!');
    } catch (e) {
      this.onStatusMessage('Failed to save settings.');
    }
  }

  render() {
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

        <button class="btn-primary" @click=${this.handleSave}>Save Settings</button>
      </div>
    `;
  }
}