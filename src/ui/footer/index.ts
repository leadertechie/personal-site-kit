import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { IFooterLink } from '../../shared/interfaces/ifooter-link';

import { footerStyles } from './styles';

@customElement('my-footer')
export class FooterComponent extends LitElement {
  static styles = footerStyles;

  @property({ type: String })
  accessor copyright = '';

  @property({ type: Array, attribute: 'footer-links' })
  accessor footerLinks: IFooterLink[] = [];

  render() {
    const links = this.footerLinks && this.footerLinks.length > 0 
      ? this.footerLinks 
      : [
          { text: 'LinkedIn', link: 'https://linkedin.com' },
          { text: 'GitHub', link: 'https://github.com' },
          { text: 'Email', link: 'mailto:you@example.com' }
        ];

    return html`
      <div class="footer-content">
        <span>&copy; ${this.copyright || '2026 Personal Site'}</span>
        <span class="links">
          ${links.map(
            (link) => {
              const isExternal = link.link.startsWith('http') || link.link.startsWith('mailto:');
              return html`<a 
                href="${link.link}" 
                target="${isExternal ? '_blank' : '_self'}" 
                rel="${isExternal ? 'noopener noreferrer' : ''}"
              >${link.text}</a>`;
            }
          )}
        </span>
      </div>
    `;
  }
}
