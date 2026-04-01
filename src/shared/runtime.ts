// Runtime-only exports for Cloudflare Workers (no DOM/web components)
export * from './interfaces/iRoute';
export * from './interfaces/iFooterLink';
export * from './pageContent';

// Core utilities and types (DOM-free)
export type { IRoute } from './interfaces/iRoute';
export type { IFooterLink } from './interfaces/iFooterLink';

// Page content generation utilities
export { generatePageContent } from './pageContent';