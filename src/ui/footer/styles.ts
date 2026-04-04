import { css } from 'lit';

export const footerStyles = css`
:host {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--background-color);
  color: var(--text-color);
  border-top: 1px solid var(--nav-link-hover-bg);
  flex-wrap: wrap;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.links a {
  color: inherit;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.links a:hover {
  background-color: rgba(0, 0, 0, 0.1);
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
