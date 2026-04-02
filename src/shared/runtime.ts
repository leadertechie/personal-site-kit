// Runtime-only exports for Cloudflare Workers (no DOM/web components)
export * from './interfaces/iroute';
export * from './interfaces/ifooter-link';
export * from './page-content';

// Core utilities and types (DOM-free)
export type { IRoute } from './interfaces/iroute';
export type { IFooterLink } from './interfaces/ifooter-link';

// Page content generation utilities
export { generatePageContent } from './page-content';