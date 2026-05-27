export class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.applyThemeFromLocalStorage();
  }

  connectedCallback() {
    this.shadowRoot?.querySelector('button')?.addEventListener('click', this.toggleTheme);
  }

  disconnectedCallback() {
    this.shadowRoot?.querySelector('button')?.removeEventListener('click', this.toggleTheme);
  }

  render() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: var(--font-size-h3, clamp(1.15rem, 1.75vw, 1.375rem));
            padding: var(--space-2xs, 0.25lh);
            color: var(--text-primary, #0b1120);
            transition: color var(--transition-base, 0.2s ease);
            line-height: 1;
          }
          button:hover {
            color: var(--brand-color, #2563eb);
          }
          [data-theme='dark'] button {
            color: var(--text-primary, #f1f5f9);
          }
          [data-theme='dark'] button:hover {
            color: var(--brand-color, #60a5fa);
          }
        </style>
        <button id="theme-toggle" aria-label="Toggle theme">
          <span class="icon">${this.getSunIcon()}</span>
        </button>
      `;
    }
  }

  applyThemeFromLocalStorage() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateToggleButton(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      this.updateToggleButton('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      this.updateToggleButton('light');
    }
  }

  toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.updateToggleButton(newTheme);
    this.dispatchThemeChangeEvent(newTheme);
  };

  updateToggleButton(theme: string) {
    const button = this.shadowRoot?.querySelector('#theme-toggle');
    if (button) {
      const iconSpan = button.querySelector('.icon');
      if (iconSpan) {
        iconSpan.innerHTML = theme === 'dark' ? this.getMoonIcon() : this.getSunIcon();
      }
    }
  }

  getSunIcon(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    `;
  }

  getMoonIcon(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    `;
  }

  dispatchThemeChangeEvent(theme: string) {
    const event = new CustomEvent('theme-changed', {
      detail: { theme: theme },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('theme-toggle', ThemeToggle);
