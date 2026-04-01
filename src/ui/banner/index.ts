import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { bannerStyles } from './styles';

@customElement('my-banner')
export class MyBanner extends LitElement {
  static styles = bannerStyles;

  static properties = {
    header: { type: String },
    logo: { type: String },
  };

  declare header: string;
  declare logo: string;

  constructor() {
    super();
    this.header = 'My App';
    this.logo = '';
  }

  render() {
    return html`
      <header class="banner banner-component">
        <div class="header-content">
          ${this.logo ? html`<img src="${this.logo}" alt="Logo" class="logo" />` : ''}
          <h1>${this.header}</h1>
        </div>
        <div class="nav-and-theme">
          <slot name="nav-links"></slot>
          <slot name="theme-switcher"></slot>
        </div>
      </header>
    `;
  }
}
