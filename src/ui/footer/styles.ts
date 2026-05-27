/*
 * Footer Component — Kumo-inspired footer with clean separation.
 *
 * Tokens are from theme.css @layer theme. Custom properties defined
 * there penetrate Shadow DOM.
 */
import { css } from 'lit';

export const footerStyles = css`
:host {
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* Box */
  padding: var(--space-md, 1lh) var(--space-lg, 2lh);

  /* Visual */
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #0b1120);
  border-top: 1px solid var(--border-subtle, #e5e7eb);

  /* Misc */
  flex-wrap: wrap;
}

.footer-content {
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  /* Typography */
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
  color: var(--text-secondary, #475569);
}

.links {
  /* Layout */
  display: flex;
  gap: var(--space-sm, 0.5lh);

  /* Box */
  margin-top: var(--space-2xs, 0.25lh);
}

.links a {
  /* Typography */
  color: var(--link-color, #2563eb);
  text-decoration: none;
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));

  /* Box */
  padding: var(--space-3xs, 0.125lh) var(--space-2xs, 0.25lh);
  border-radius: var(--radius-sm, 0.25rem);

  /* Misc */
  transition: background-color var(--transition-base, 0.2s ease),
              color var(--transition-base, 0.2s ease);
}

.links a:hover {
  background-color: var(--bg-accent, #eff6ff);
  color: var(--link-hover, #1d4ed8);
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
  .links {
    margin-top: 0;
  }
}
`;
