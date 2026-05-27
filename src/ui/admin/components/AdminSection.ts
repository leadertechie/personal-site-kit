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
      border: 1px solid var(--border-subtle, #e5e7eb);
      padding: var(--space-lg, 2lh);
      border-radius: var(--radius-lg, 0.75rem);
      background: var(--bg-primary, #ffffff);
      box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.05));
      margin-bottom: var(--space-md, 1lh);
      min-height: 450px;
      box-sizing: border-box;
    }

    .section h3 {
      margin: 0 0 var(--space-sm, 0.5lh) 0;
      font-size: var(--font-size-h3, clamp(1.15rem, 1.75vw, 1.375rem));
      font-weight: var(--font-weight-semibold, 600);
      color: var(--text-primary, #0b1120);
    }

    .help-text {
      color: var(--text-secondary, #475569);
      font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
      margin-bottom: var(--space-md, 1lh);
    }

    .current-file {
      margin-bottom: var(--space-md, 1lh);
      padding: var(--space-md, 1lh);
      background: var(--bg-secondary, #f8fafc);
      border: 1px solid var(--border-subtle, #e5e7eb);
      border-radius: var(--radius-sm, 0.375rem);
    }

    input[type="text"],
    input[type="file"] {
      width: 100%;
      padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
      margin-bottom: var(--space-sm, 0.5lh);
      border: 1.5px solid var(--border-subtle, #e5e7eb);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-primary, #ffffff);
      color: var(--text-primary, #0b1120);
      font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));
      box-sizing: border-box;
      transition: border-color var(--transition-fast, 0.15s ease),
                  box-shadow var(--transition-fast, 0.15s ease);
    }

    input:focus {
      outline: none;
      border-color: var(--brand-color, #2563eb);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-color, #2563eb), transparent 85%);
    }

    input[type="file"] {
      margin-bottom: var(--space-md, 1lh);
    }

    button {
      padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
      border: none;
      border-radius: var(--radius-sm, 0.375rem);
      cursor: pointer;
      font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));
      font-weight: var(--font-weight-medium, 500);
      transition: background-color var(--transition-base, 0.2s ease);
    }

    .btn-primary {
      background: var(--brand-color, #2563eb);
      color: var(--text-inverse, #ffffff);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--brand-color, #2563eb), transparent 75%);
    }

    .btn-primary:hover {
      background: color-mix(in srgb, var(--brand-color, #2563eb), black 15%);
    }

    .btn-secondary {
      background: var(--bg-secondary, #f8fafc);
      color: var(--text-primary, #0b1120);
      border: 1px solid var(--border-subtle, #e5e7eb);
      font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
    }

    .btn-secondary:hover {
      background: var(--bg-tertiary, #f1f5f9);
      border-color: var(--border-color, #d1d5db);
    }

    .btn-danger {
      background: var(--color-danger, #ef4444);
      color: var(--text-inverse, #ffffff);
    }

    .btn-danger:hover {
      background: var(--color-danger-hover, #dc2626);
    }

    .file-list {
      margin-top: var(--space-md, 1lh);
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-sm, 0.5lh);
      border-bottom: 1px solid var(--border-subtle, #e5e7eb);
      border-radius: var(--radius-sm, 0.375rem);
      transition: background var(--transition-fast, 0.15s ease);
    }

    .file-item:hover {
      background: var(--bg-secondary, #f8fafc);
    }

    .file-item:last-child {
      border-bottom: none;
    }

    .logo-preview {
      background: var(--bg-secondary, #f8fafc);
      padding: var(--space-sm, 0.5lh);
      border-radius: var(--radius-sm, 0.375rem);
      margin-bottom: var(--space-sm, 0.5lh);
      display: inline-block;
    }

    .logo-preview-img {
      max-height: 100px;
      display: block;
    }

    .field-label {
      display: block;
      margin-bottom: var(--space-2xs, 0.25lh);
      font-weight: var(--font-weight-medium, 500);
      font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));
      color: var(--text-primary, #0b1120);
    }

    .info-box {
      background: var(--bg-secondary, #f8fafc);
      border: 1px solid var(--border-subtle, #e5e7eb);
      border-radius: var(--radius-sm, 0.375rem);
      padding: var(--space-sm, 0.5lh) var(--space-md, 1lh);
      font-size: var(--font-size-small, clamp(0.8125rem, 1vw, 0.875rem));
      color: var(--text-secondary, #475569);
      margin-top: var(--space-sm, 0.5lh);
    }

    h4 {
      font-size: var(--font-size-body, clamp(0.9375rem, 1.15vw, 1rem));
      font-weight: var(--font-weight-semibold, 600);
      color: var(--text-primary, #0b1120);
      margin: 0 0 var(--space-2xs, 0.25lh) 0;
    }

    .required-badge {
      font-size: var(--font-size-tiny, clamp(0.6875rem, 0.85vw, 0.75rem));
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-warning, #f59e0b);
      background: color-mix(in srgb, var(--color-warning, #f59e0b), transparent 85%);
      padding: 0 var(--space-2xs, 0.25lh);
      border-radius: var(--radius-sm, 0.25rem);
      vertical-align: middle;
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