import { css } from 'lit';

export const blogviewerStyles = css`
:host {
  display: block;
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
`;
