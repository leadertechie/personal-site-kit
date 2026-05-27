/*
 * Banner Component — Kumo-inspired header.
 *
 * Tokens are from theme.css @layer theme. Custom properties defined
 * there penetrate Shadow DOM, so references like var(--brand-color)
 * resolve without explicit fallback. Fallbacks are provided for the
 * standalone (non-Toldby) case.
 */
import { css } from 'lit';

export const bannerStyles = css`
:host {
  /* Layout */
  display: block;
  position: relative;

  /* Box */
  width: 100%;
  box-sizing: border-box;

  /* Typography */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-primary, #0b1120);
  background-color: var(--bg-primary, #ffffff);

  /* Misc */
  border-bottom: 1px solid var(--border-subtle, #e5e7eb);
}

.banner,
.banner-component {
  /* Layout */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  /* Box */
  padding: var(--space-sm, 0.5lh) var(--space-lg, 2lh);

  /* Visual */
  background-color: var(--bg-primary, #ffffff);
  color: var(--text-primary, #0b1120);

  /* Misc */
  transition: background-color var(--transition-slow, 0.3s ease),
              color var(--transition-slow, 0.3s ease);
}

.header-content {
  /* Layout */
  display: flex;
  align-items: center;

  /* Box */
  margin-bottom: 0;
  margin-right: auto;
  gap: var(--space-sm, 0.5lh);
}

.logo-link {
  /* Layout */
  display: inline-flex;
  align-items: center;

  /* Misc */
  text-decoration: none;
  cursor: pointer;
}

.logo {
  /* Box */
  height: 48px;
  margin-right: var(--space-sm, 0.5lh);
  width: auto;

  /* Misc */
  cursor: pointer;
}

/* Logo dark mode - invert colors for better contrast */
[data-theme="dark"] .logo {
  filter: brightness(0.85) invert(1);
}

h1 {
  /* Typography */
  font-size: var(--font-size-h3, clamp(1.15rem, 1.75vw, 1.375rem));
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: -0.02em;
  color: var(--text-primary, #0b1120);

  /* Box */
  margin: 0;
}

.nav-and-theme {
  /* Layout */
  display: flex;
  align-items: center;
  gap: var(--space-md, 1lh);
}

nav {
  /* Layout */
  display: flex;
  align-items: center;

  /* Box */
  padding: 0 var(--space-md, 1lh);
  gap: var(--space-2xs, 0.25lh);
}

nav a {
  /* Typography */
  text-decoration: none;
  color: var(--link-color, #2563eb);
  font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));
  font-weight: var(--font-weight-medium, 500);

  /* Box */
  padding: var(--space-2xs, 0.25lh) var(--space-sm, 0.5lh);
  border-radius: var(--radius-sm, 0.375rem);

  /* Misc */
  transition: background-color var(--transition-base, 0.2s ease),
              color var(--transition-base, 0.2s ease);
}

nav a:hover {
  background-color: var(--bg-accent, #eff6ff);
  color: var(--link-hover, #1d4ed8);
  text-decoration: none;
}

@media (max-width: 768px) {
  .banner,
  .banner-component {
    flex-direction: column;
    gap: var(--space-sm, 0.5lh);
    padding: var(--space-sm, 0.5lh);
  }
  
  .header-content {
    margin-right: 0;
    justify-content: center;
  }
  
  nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3xs, 0.125lh);
  }
}
`;
