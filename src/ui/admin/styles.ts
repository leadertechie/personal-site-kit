import { css } from 'lit';

export const adminStyles = css`
:host {
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-color, #213547);
  background-color: var(--background-color, #fff);
  min-height: 100vh;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.login-box {
  border: 1px solid var(--border-color, #e0e0e0);
  padding: 3rem 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  margin: 80px auto;
  text-align: center;
  background: var(--card-bg, #fff);
  box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.05);
}

.login-box h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color, #213547);
}

.login-box p {
  color: var(--secondary-text, #666);
  margin-bottom: 1.5rem;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  padding: 0.5rem;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: 100%;
}

.nav-tab {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  color: var(--text-color, #213547);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  background: var(--nav-link-hover-bg, #f0f0f0);
  color: var(--link-color, #646cff);
}

.nav-tab.active {
  background: var(--link-color, #646cff);
  color: white;
  box-shadow: 0 2px 8px rgba(100, 108, 255, 0.3);
}

.section {
  width: 100%;
  border: none;
  padding: 24px;
  border-radius: 16px;
  background: var(--card-bg, #fff);
  box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  min-height: 450px;
  box-sizing: border-box;
}

.section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color, #213547);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-list {
  margin-top: 20px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #eee);
  border-radius: 8px;
  transition: background 0.15s ease;
}

.file-item:hover {
  background: var(--nav-link-hover-bg, #f8f9fa);
}

.file-item:last-child {
  border-bottom: none;
}

button {
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--link-color, #646cff);
  color: white;
  box-shadow: 0 2px 4px rgba(100, 108, 255, 0.25);
}

.btn-primary:hover {
  background: var(--link-hover-color, #535bf2);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(100, 108, 255, 0.3);
}

.btn-danger {
  color: #dc3545;
  background: transparent;
  border: 1px solid #dc3545;
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-danger:hover {
  background: #dc3545;
  color: white;
}

.btn-secondary {
  background: var(--nav-link-hover-bg, #f0f0f0);
  color: var(--text-color, #333);
  border: none;
  font-size: 0.85rem;
  padding: 8px 16px;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

input[type="text"], input[type="password"], input[type="file"] {
  padding: 12px 14px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 12px;
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 10px;
  background-color: var(--background-color, #fff);
  color: var(--text-color, #213547);
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type="text"]:focus, input[type="password"]:focus {
  outline: none;
  border-color: var(--link-color, #646cff);
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.15);
}

input[type="file"] {
  padding: 10px;
  border-style: dashed;
  cursor: pointer;
}

input[type="file"]:hover {
  border-color: var(--link-color, #646cff);
  background: rgba(100, 108, 255, 0.03);
}

.help-text {
  color: var(--secondary-text, #666);
  font-size: 0.9rem;
  margin-bottom: 16px;
  line-height: 1.5;
}

.status-message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  background: var(--nav-link-hover-bg, #f5f5f5);
  color: var(--text-color, #333);
}

.status-message.success {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.status-message.error {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color, #eee);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #213547);
}

.mt-1 { margin-top: 12px; }
.mb-1 { margin-bottom: 1rem; }

@media (max-width: 600px) {
  .container {
    padding: 0.5rem;
  }
  .section {
    padding: 16px;
  }
  .nav-tabs {
    gap: 4px;
    padding: 8px;
  }
  .nav-tab {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
}
`;
