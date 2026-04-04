import { css } from 'lit';

export const storyviewerStyles = css`
:host {
  display: block;
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.error {
  color: red;
  text-align: center;
  padding: 2rem;
}

h1 {
  margin-bottom: 0.5rem;
}

.meta {
  color: #666;
  margin-bottom: 2rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.tag {
  background: var(--nav-link-hover-bg, #f0f0f0);
  color: var(--text-color, #333);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, transparent);
}

.content {
  line-height: 1.8;
  text-align: left;
}

.content h1, .content h2, .content h3 {
  margin-top: 1.5rem;
}
`;
