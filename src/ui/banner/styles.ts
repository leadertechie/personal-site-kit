import { css } from 'lit';

export const bannerStyles = css`
:host {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
}

.banner,
.banner-component {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, color 0.3s;
  background-color: var(--background-color);
  color: var(--text-color);
}

.header-content {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  margin-right: auto;
}

.logo {
  height: 50px;
  margin-right: 1rem;
  width: auto;
}

/* Logo dark mode - invert colors for better contrast */
[data-theme="dark"] .logo {
  filter: brightness(0.85) invert(1);
}

h1 {
  margin: 0;
  font-size: 1.8em;
  font-weight: 600;
  color: var(--text-color);
}

.nav-and-theme {
  display: flex;
  align-items: center;
  gap: 1rem;
}

nav {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 10px;
}

nav a {
  text-decoration: none;
  color: var(--nav-link-color, #333);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

nav a:hover {
  background-color: var(--nav-link-hover-bg, #e2e6ea);
  text-decoration: none;
}

@media (max-width: 768px) {
  .banner,
  .banner-component {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-content {
    margin-right: 0;
    justify-content: center;
  }
  
  nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}
`;
