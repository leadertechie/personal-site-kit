/*
 * BlogViewer Component — Kumo-inspired blog tags.
 *
 * Tokens are from theme.css @layer theme.
 */
import { css } from 'lit';

export const blogviewerStyles = css`
:host {
  display: block;
}

.tags {
  /* Layout */
  display: flex;
  gap: var(--space-2xs, 0.25lh);
  flex-wrap: wrap;

  /* Box */
  margin-top: var(--space-md, 1lh);
}

.tag {
  /* Box */
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-secondary, #475569);
  padding: var(--space-3xs, 0.125lh) var(--space-sm, 0.5lh);
  border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-full, 9999px);

  /* Typography */
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
  font-weight: var(--font-weight-medium, 500);
  letter-spacing: 0.01em;

  /* Misc */
  transition: background-color var(--transition-fast, 0.15s ease),
              border-color var(--transition-fast, 0.15s ease),
              color var(--transition-fast, 0.15s ease);
}

.tag:hover {
  background: var(--bg-accent, #eff6ff);
  border-color: var(--brand-color, #2563eb);
  color: var(--brand-color, #2563eb);
}
`;
