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
      max-width: 900px;
      margin: 0 auto;
      padding: 1rem;
    }

    .login-box {
      border: 1px solid var(--border-color, #e0e0e0);
      padding: 3rem 2.5rem;
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      margin: 80px auto;
      text-align: center;
      background: var(--card-bg, #fff);
      box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.05);
    }

    .login-box h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-color, #213547);
    }

    .login-box p {
      color: var(--secondary-text, #666);
      margin-bottom: 1.5rem;
    }

    input {
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--background-color);
      color: var(--text-color);
      box-sizing: border-box;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s ease;
    }

    .btn-primary {
      background: var(--link-color, #646cff);
      color: white;
    }

    .btn-primary:hover {
      background: var(--link-hover-color, #535bf2);
    }

    .error-message {
      color: red;
      margin-bottom: 10px;
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