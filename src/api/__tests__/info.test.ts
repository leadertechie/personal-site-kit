import { describe, expect, it } from 'vitest';

import { handleInfo } from '../handlers/info';

describe('Info Handler', () => {
  it('should return API information', async () => {
    const response = await handleInfo();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.text();
    const data = JSON.parse(body);

    expect(data.name).toBe('TechieLeader');
    expect(data.version).toBe('1.0.0');
    expect(data.description).toBe('TechieLeader API');
    expect(data.endpoints).toBeInstanceOf(Array);
    expect(data.endpoints.length).toBeGreaterThan(0);
  });

  it('should return valid endpoints array', async () => {
    const response = await handleInfo();
    const body = await response.text();
    const data = JSON.parse(body);

    expect(data.endpoints).toContainEqual({
      path: '/info',
      method: 'GET',
      description: 'Get API information'
    });
  });

  it('should have correct response structure', async () => {
    const response = await handleInfo();
    const body = await response.text();
    const data = JSON.parse(body);

    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('endpoints');
  });
});