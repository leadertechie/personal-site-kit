import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { IFooterLink } from '../../shared/interfaces/iFooterLink';

import { footerStyles } from './styles';

@customElement('my-footer')
export class FooterComponent extends LitElement {
  static styles = footerStyles;

  @property({ type: String })
  accessor copyright = '';

  @property({ type: Array })
  accessor footerLinks: IFooterLink[] = [];

  render() {
    return html`
      <div class="footer-content">
        <span>&copy; ${this.copyright}</span>
        <span class="links">
          ${this.footerLinks.map(
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
