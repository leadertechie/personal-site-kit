/*
 * Admin Portal — Kumo-inspired content management UI.
 *
 * Tokens are from theme.css @layer theme.
 */
import { css } from 'lit';

export const adminStyles = css`
:host {
  /* Layout */
  display: block;

  /* Box */
  width: 100%;
  max-width: 100%;
  padding: var(--space-lg, 2lh);
  min-height: 100vh;
  box-sizing: border-box;

  /* Typography */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-primary, #0b1120);
  background-color: var(--bg-primary, #ffffff);
}

*, *::before, *::after {
  box-sizing: border-box;
}

.container {
  /* Box */
  width: 100%;
  max-width: var(--content-medium, 960px);
  margin: 0 auto;
  padding: var(--space-md, 1lh);
}

.login-box {
  /* Layout */
  text-align: center;

  /* Box */
  border: 1px solid var(--border-subtle, #e5e7eb);
  padding: var(--space-xl, 3lh) var(--space-lg, 2lh);
  border-radius: var(--radius-xl, 1rem);
  width: 100%;
  max-width: 420px;
  margin: 80px auto;
  background: var(--bg-primary, #ffffff);
  box-shadow: var(--shadow-md, 0 4px 6px -2px oklch(0% 0 0 / 0.06));
}

.login-box h2 {
  /* Typography */
  font-size: var(--font-size-h2, clamp(1.35rem, 2.25vw, 1.75rem));
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #0b1120);

  /* Box */
  margin: 0 0 var(--space-sm, 0.5lh) 0;
}

.login-box p {
  color: var(--text-secondary, #475569);
  margin-bottom: var(--space-md, 1lh);
}

.nav-tabs {
  /* Layout */
  display: flex;
  gap: var(--space-2xs, 0.25lh);

  /* Box */
  margin-bottom: var(--space-lg, 2lh);
  padding: var(--space-sm, 0.5lh);
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-lg, 0.75rem);
  box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.05));
  width: 100%;
  flex-wrap: wrap;
}

.nav-tab {
  /* Box */
  padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
  border: none;
  border-radius: var(--radius-sm, 0.375rem);
  background: transparent;

  /* Typography */
  color: var(--text-primary, #0b1120);
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;

  /* Misc */
  transition: all var(--transition-fast, 0.15s ease);
}

.nav-tab:hover {
  background: var(--bg-secondary, #f8fafc);
  color: var(--link-color, #2563eb);
}

.nav-tab.active {
  background: var(--brand-color, #2563eb);
  color: var(--text-inverse, #ffffff);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--brand-color, #2563eb), transparent 70%);
}

.section {
  /* Box */
  width: 100%;
  border: 1px solid var(--border-subtle, #e5e7eb);
  padding: var(--space-lg, 2lh);
  border-radius: var(--radius-lg, 0.75rem);
  background: var(--bg-primary, #ffffff);
  box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.05));
  margin-bottom: var(--space-md, 1lh);
  min-height: 450px;
  box-sizing: border-box;
}

.section h3 {
  /* Typography */
  font-size: var(--font-size-h3, clamp(1.15rem, 1.75vw, 1.375rem));
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #0b1120);

  /* Box */
  margin: 0 0 var(--space-sm, 0.5lh) 0;

  /* Layout */
  display: flex;
  align-items: center;
  gap: var(--space-sm, 0.5lh);
}

.file-list {
  margin-top: var(--space-md, 1lh);
}

.file-item {
  /* Layout */
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* Box */
  padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
  border-bottom: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-sm, 0.375rem);

  /* Misc */
  transition: background var(--transition-fast, 0.15s ease);
}

.file-item:hover {
  background: var(--bg-secondary, #f8fafc);
}

.file-item:last-child {
  border-bottom: none;
}

button {
  cursor: pointer;
  padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
  border-radius: var(--radius-sm, 0.375rem);
  font-weight: var(--font-weight-medium, 500);
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
  transition: all var(--transition-fast, 0.15s ease);
  border: none;
}

.btn-primary {
  background: var(--brand-color, #2563eb);
  color: var(--text-inverse, #ffffff);
  box-shadow: 0 2px 4px color-mix(in srgb, var(--brand-color, #2563eb), transparent 75%);
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--brand-color, #2563eb), black 15%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px color-mix(in srgb, var(--brand-color, #2563eb), transparent 70%);
}

.btn-danger {
  color: var(--color-danger, #ef4444);
  background: transparent;
  border: 1px solid var(--color-danger, #ef4444);
  padding: var(--space-2xs, 0.25lh) var(--space-sm, 0.5lh);
  font-size: var(--font-size-tiny, clamp(0.6875rem, 0.85vw, 0.75rem));
}

.btn-danger:hover {
  background: var(--color-danger, #ef4444);
  color: var(--text-inverse, #ffffff);
}

.btn-secondary {
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-primary, #0b1120);
  border: 1px solid var(--border-subtle, #e5e7eb);
  font-size: var(--font-size-tiny, clamp(0.6875rem, 0.85vw, 0.75rem));
  padding: var(--space-2xs, 0.25lh) var(--space-sm, 0.5lh);
}

.btn-secondary:hover {
  background: var(--bg-tertiary, #f1f5f9);
  border-color: var(--border-color, #d1d5db);
}

input[type="text"], input[type="password"], input[type="file"] {
  /* Box */
  padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
  width: 100%;
  margin-bottom: var(--space-sm, 0.5lh);
  border: 1.5px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-md, 0.5rem);
  background-color: var(--bg-primary, #ffffff);

  /* Typography */
  color: var(--text-primary, #0b1120);
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
  box-sizing: border-box;

  /* Misc */
  transition: border-color var(--transition-fast, 0.15s ease),
              box-shadow var(--transition-fast, 0.15s ease);
}

input[type="text"]:focus, input[type="password"]:focus {
  outline: none;
  border-color: var(--brand-color, #2563eb);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-color, #2563eb), transparent 85%);
}

input[type="file"] {
  padding: var(--space-sm, 0.5lh);
  border-style: dashed;
  cursor: pointer;
}

input[type="file"]:hover {
  border-color: var(--brand-color, #2563eb);
  background: color-mix(in srgb, var(--brand-color, #2563eb), transparent 97%);
}

.help-text {
  color: var(--text-secondary, #475569);
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
  margin-bottom: var(--space-md, 1lh);
  line-height: var(--line-height-normal, 1.5);
}

.status-message {
  padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
  border-radius: var(--radius-sm, 0.375rem);
  margin-bottom: var(--space-md, 1lh);
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-primary, #0b1120);
  border: 1px solid var(--border-subtle, #e5e7eb);
}

.status-message.success {
  background: color-mix(in srgb, var(--color-success, #10b981), transparent 90%);
  color: color-mix(in srgb, var(--color-success, #10b981), black 30%);
  border: 1px solid color-mix(in srgb, var(--color-success, #10b981), transparent 60%);
}

.status-message.error {
  background: color-mix(in srgb, var(--color-danger, #ef4444), transparent 90%);
  color: color-mix(in srgb, var(--color-danger, #ef4444), black 20%);
  border: 1px solid color-mix(in srgb, var(--color-danger, #ef4444), transparent 60%);
}

.header {
  /* Layout */
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* Box */
  margin-bottom: var(--space-lg, 2lh);
  padding-bottom: var(--space-md, 1lh);
  border-bottom: 1px solid var(--border-subtle, #e5e7eb);
  gap: var(--space-sm, 0.5lh);
  flex-wrap: wrap;
}

.header h1 {
  /* Typography */
  font-size: var(--font-size-h2, clamp(1.35rem, 2.25vw, 1.75rem));
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #0b1120);

  /* Box */
  margin: 0;
}

.mt-1 { margin-top: var(--space-sm, 0.5lh); }
.mb-1 { margin-bottom: var(--space-md, 1lh); }

@media (max-width: 600px) {
  :host {
    padding: var(--space-sm, 0.5lh);
  }
  .container {
    padding: var(--space-2xs, 0.25lh);
  }
  .section {
    padding: var(--space-md, 1lh);
  }
  .nav-tabs {
    gap: var(--space-3xs, 0.125lh);
    padding: var(--space-2xs, 0.25lh);
  }
  .nav-tab {
    padding: var(--space-2xs, 0.25lh) var(--space-sm, 0.5lh);
    font-size: var(--font-size-tiny, clamp(0.6875rem, 0.85vw, 0.75rem));
  }
}
`;
