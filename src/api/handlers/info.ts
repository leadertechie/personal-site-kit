import { createJSONResponse } from '../utils';

export async function handleInfo(): Promise<Response> {
  return createJSONResponse({
    name: 'TechieLeader',
    version: '1.0.0',
    description: 'TechieLeader API',
    endpoints: [
      { path: '/info', method: 'GET', description: 'Get API information' }
    ]
  });
}
