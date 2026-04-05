import { WebsiteAPI } from './website-api';
export { WebsiteAPI };
export type { APIHandler } from './website-api';
export * from './handlers/auth';
export * from './handlers/auth-handler';

// Default worker export using WebsiteAPI
const defaultAPI = new WebsiteAPI();
export default defaultAPI;
