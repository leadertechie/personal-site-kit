import { LitElement, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { ContentItem, StaticDetails, AdminSectionProps } from '../types';

export abstract class AdminSection extends LitElement implements AdminSectionProps {

  static styles = css`
    :host {
      display: block;
      width: 100%;
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
    }

    .help-text {
      color: var(--secondary-text, #666);
      margin-bottom: 1rem;
    }

    .current-file {
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--nav-link-hover-bg, #f5f5f5);
      border-radius: 8px;
    }

    input[type="text"],
    input[type="file"] {
      width: 100%;
      padding: 10px;
      margin-bottom: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--background-color);
      color: var(--text-color);
      box-sizing: border-box;
    }

    input[type="file"] {
      margin-bottom: 1rem;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s ease;
      margin-right: 10px;
    }

    .btn-primary {
      background: var(--link-color, #646cff);
      color: white;
    }

    .btn-primary:hover {
      background: var(--link-hover-color, #535bf2);
    }

    .btn-secondary {
      background: var(--nav-link-hover-bg, #f0f0f0);
      color: var(--text-color, #213547);
    }

    .btn-secondary:hover {
      background: var(--border-color, #e0e0e0);
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .file-list {
      margin-top: 1rem;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border-color, #eee);
    }

    .file-item:last-child {
      border-bottom: none;
    }
  `;

  @property({ type: Array })
  accessor contentList: ContentItem[] = [];

  @property({ type: Object })
  accessor staticDetails: StaticDetails = {};

  @property({ type: Function })
  accessor onUpload: (key: string, file: File) => Promise<void> = async () => {};

  @property({ type: Function })
  accessor onDelete: (key: string) => Promise<void> = async () => {};

  @property({ type: Function })
  accessor onStatusMessage: (message: string) => void = () => {};

  protected getContent(key: string): ContentItem | undefined {
    return this.contentList.find(c => c.key === key);
  }

  protected getSectionFiles(prefix: string): ContentItem[] {
    return this.contentList.filter(c => c.key.startsWith(prefix));
  }
}