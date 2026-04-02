import { WebsiteAPI } from './website-api';
export { WebsiteAPI };
export type { APIHandler } from './website-api';

// Default worker export using WebsiteAPI
const defaultAPI = new WebsiteAPI();
export default defaultAPI;
