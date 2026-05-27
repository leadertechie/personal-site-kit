/*
 * StoryViewer Component — Kumo-inspired story/article layout.
 *
 * Tokens are from theme.css @layer theme.
 */
import { css } from 'lit';

export const storyviewerStyles = css`
:host {
  display: block;
  max-width: var(--content-narrow, 720px);
  margin: 0 auto;
  width: 100%;
}

.loading {
  text-align: center;
  padding: var(--space-xl, 3lh);
  color: var(--text-secondary, #475569);
}

.error {
  color: var(--accent-warm, #f59e0b);
  text-align: center;
  padding: var(--space-xl, 3lh);
}

h1 {
  /* Typography */
  font-size: var(--font-size-h1, clamp(1.75rem, 3vw, 2.5rem));
  font-weight: var(--font-weight-bold, 700);
  line-height: var(--line-height-tight, 1.15);
  letter-spacing: -0.02em;
  color: var(--text-primary, #0b1120);

  /* Box */
  margin-bottom: var(--space-sm, 0.5lh);
}

.meta {
  /* Typography */
  color: var(--text-secondary, #475569);
  font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));

  /* Box */
  margin-bottom: var(--space-lg, 2lh);
  padding-bottom: var(--space-sm, 0.5lh);
  border-bottom: 1px solid var(--border-subtle, #e5e7eb);
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

  /* Misc */
  transition: background-color var(--transition-fast, 0.15s ease),
              border-color var(--transition-fast, 0.15s ease);
}

.tag:hover {
  background: var(--bg-accent, #eff6ff);
  border-color: var(--brand-color, #2563eb);
}

.content {
  /* Typography */
  line-height: var(--line-height-relaxed, 1.8);
  text-align: left;
  color: var(--text-primary, #0b1120);
}

.content h1, .content h2, .content h3 {
  margin-top: var(--space-lg, 2lh);
}
`;
