import { html, TemplateResult } from 'lit';
import { ContentNode } from '@leadertechie/md2html';

export class AboutMeRenderer {
  renderContent(nodes: ContentNode[]): TemplateResult[] {
    return (nodes || []).map(node => {
      switch (node.type) {
        case 'heading':
          const level = (node as any).level || 2;
          if (level === 1) return html`<h1>${node.content}</h1>`;
          if (level === 3) return html`<h3>${node.content}</h3>`;
          return html`<h2>${node.content}</h2>`;
        case 'paragraph':
          return html`<p>${node.content}</p>`;
        case 'list':
          const items = (node as any).items || [];
          return html`<ul>${items.map((item: string) => html`<li>${item}</li>`)}</ul>`;
        default:
          return html`<div>${node.content}</div>`;
      }
    });
  }
}
