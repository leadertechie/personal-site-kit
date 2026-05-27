import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('admin-login-form')
export class AdminLoginForm extends LitElement {

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .container {
      width: 100%;
      max-width: var(--content-medium, 960px);
      margin: 0 auto;
      padding: var(--space-md, 1lh);
    }

    .login-box {
      border: 1px solid var(--border-subtle, #e5e7eb);
      padding: var(--space-xl, 3lh) var(--space-lg, 2lh);
      border-radius: var(--radius-xl, 1rem);
      width: 100%;
      max-width: 420px;
      margin: 80px auto;
      text-align: center;
      background: var(--bg-primary, #ffffff);
      box-shadow: var(--shadow-md, 0 4px 6px -2px oklch(0% 0 0 / 0.06));
    }

    .login-box h2 {
      margin: 0 0 var(--space-sm, 0.5lh) 0;
      font-size: var(--font-size-h2, clamp(1.35rem, 2.25vw, 1.75rem));
      font-weight: var(--font-weight-semibold, 600);
      color: var(--text-primary, #0b1120);
    }

    .login-box p {
      color: var(--text-secondary, #475569);
      margin-bottom: var(--space-md, 1lh);
    }

    input {
      width: 100%;
      padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
      margin-bottom: var(--space-sm, 0.5lh);
      border: 1.5px solid var(--border-subtle, #e5e7eb);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-primary, #ffffff);
      color: var(--text-primary, #0b1120);
      font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));
      box-sizing: border-box;
      transition: border-color var(--transition-fast, 0.15s ease),
                  box-shadow var(--transition-fast, 0.15s ease);
    }

    input:focus {
      outline: none;
      border-color: var(--brand-color, #2563eb);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-color, #2563eb), transparent 85%);
    }

    button {
      padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
      border: none;
      border-radius: var(--radius-sm, 0.375rem);
      cursor: pointer;
      font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));
      font-weight: var(--font-weight-medium, 500);
      transition: background-color var(--transition-base, 0.2s ease);
    }

    .btn-primary {
      background: var(--brand-color, #2563eb);
      color: var(--text-inverse, #ffffff);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--brand-color, #2563eb), transparent 75%);
    }

    .btn-primary:hover {
      background: color-mix(in srgb, var(--brand-color, #2563eb), black 15%);
    }

    .error-message {
      color: var(--accent-warm, #f59e0b);
      margin-bottom: var(--space-sm, 0.5lh);
      font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
    }
  `;

  @property({ type: String })
  accessor errorMessage = '';

  @property({ type: Boolean })
  accessor isSetup = false;

  private handleSubmit(e: Event) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    this.dispatchEvent(new CustomEvent('login-submit', {
      detail: { username, password, confirmPassword },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="container">
        <div class="login-box">
          <h2>${this.isSetup ? 'Admin Login' : 'Admin Setup'}</h2>
          <p>${this.isSetup ? 'Enter your credentials' : 'Create your admin credentials'}</p>
          <form @submit=${this.handleSubmit}>
            <input type="text" name="username" placeholder="Username${this.isSetup ? '' : ' (3+ chars)'}" autocomplete="username" required />
            <input type="password" name="password" placeholder="Password${this.isSetup ? '' : ' (8+ chars)'}" autocomplete="current-password" required />
            ${!this.isSetup ? html`<input type="password" name="confirmPassword" placeholder="Confirm Password" required />` : ''}
            ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
            <button type="submit" class="btn-primary">${this.isSetup ? 'Login' : 'Create Account'}</button>
          </form>
        </div>
      </div>
    `;
  }
}