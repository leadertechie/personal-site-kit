import { WebsitePrerender } from './website-prerender';
export { WebsitePrerender };
export type { PrerenderOptions } from './website-prerender';

// Default worker export using WebsitePrerender
const defaultPrerender = new WebsitePrerender();
export default defaultPrerender;
