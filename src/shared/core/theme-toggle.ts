import { init as initInteract, reinit as reinitInteract } from '@leadertechie/md2interact';

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
            font-size: 1.5rem;
            padding: 0.5rem;
            color: var(--text-color, #213547);
            transition: color 0.3s ease;
          }
          button:hover {
            color: var(--primary-color, #747bff);
          }
          html[data-theme='dark'] button {
            color: var(--dark-mode-text-color, rgba(255, 255, 255, 0.87));
          }
          html[data-theme='dark'] button:hover {
            color: var(--dark-mode-primary-color, #646cff);
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
