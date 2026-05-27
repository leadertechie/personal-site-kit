/*
 * AboutMe Component — Kumo-inspired profile card.
 *
 * Tokens are from theme.css @layer theme.
 */
import { css } from 'lit';

export const aboutmeStyles = css`
:host {
  display: block;
}

.aboutme {
  /* Layout */
  display: block;

  /* Box */
  padding: var(--space-lg, 2lh);
  max-width: var(--content-medium, 960px);
  margin: 0 auto;

  /* Typography */
  line-height: var(--line-height-relaxed, 1.6);
  color: var(--text-primary, #0b1120);
}

.aboutme h2 {
  /* Typography */
  font-size: var(--font-size-h2, clamp(1.35rem, 2.25vw, 1.75rem));
  color: var(--text-primary, #0b1120);
  font-weight: var(--font-weight-semibold, 600);

  /* Box */
  margin-bottom: var(--space-sm, 0.5lh);
}

.aboutme h3 {
  /* Typography */
  font-size: var(--font-size-h3, clamp(1.15rem, 1.75vw, 1.375rem));
  color: var(--text-primary, #0b1120);
  font-weight: var(--font-weight-semibold, 600);

  /* Box */
  margin-bottom: var(--space-2xs, 0.25lh);
}

.aboutme p {
  margin-bottom: var(--space-2xs, 0.25lh);
  text-align: left;
}

.aboutme ul {
  list-style-type: disc;
  margin-left: var(--space-lg, 2lh);
  text-align: left;
}

.aboutme li {
  margin-bottom: var(--space-3xs, 0.125lh);
}

.aboutme .profile-picture {
  /* Box */
  width: 150px;
  height: 150px;
  border-radius: var(--radius-full, 9999px);
  object-fit: cover;
  margin-bottom: var(--space-md, 1lh);

  /* Visual */
  border: 3px solid var(--border-accent, #2563eb);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--brand-color, #2563eb), transparent 80%),
    var(--shadow-md, 0 4px 6px -2px oklch(0% 0 0 / 0.06)),
    var(--shadow-lg, 0 10px 20px -4px oklch(0% 0 0 / 0.08));
}

.aboutme .profile-section {
  /* Layout */
  text-align: center;

  /* Box */
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-xl, 1rem);
  padding: var(--space-lg, 2lh);
  box-shadow: var(--shadow-md, 0 4px 6px -2px oklch(0% 0 0 / 0.06));

  /* Box model */
  margin-bottom: var(--space-lg, 2lh);
}

.aboutme .profile-section::before {
  content: '';
  display: block;
  width: 3rem;
  height: var(--accent-line-thickness, 3px);
  background: linear-gradient(
    90deg,
    var(--brand-color, #2563eb),
    var(--accent-secondary, #6366f1)
  );
  margin: 0 auto var(--space-md, 1lh) auto;
  border-radius: var(--radius-full, 9999px);
}

.aboutme .profile-title {
  /* Typography */
  color: var(--text-secondary, #475569);
  font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));

  /* Box */
  margin-bottom: 0;
  text-align: center;
}

.aboutme h1 {
  margin-bottom: var(--space-sm, 0.5lh);
}

.aboutme .loading {
  text-align: center;
  padding: var(--space-lg, 2lh);
  color: var(--text-secondary, #475569);
}

.aboutme .content-section {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`;
