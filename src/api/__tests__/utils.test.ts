import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createErrorResponse, createJSONResponse } from '../utils';

describe('Utils', () => {
  describe('createJSONResponse', () => {
    it('should create JSON response with data', async () => {
      const data = { message: 'Hello' };
      const response = createJSONResponse(data);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      const body = await response.text();
      expect(JSON.parse(body)).toEqual(data);
    });

    it('should create JSON response with custom status', async () => {
      const data = { message: 'Not Found' };
      const response = createJSONResponse(data, 404);

      expect(response.status).toBe(404);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle empty data', async () => {
      const response = createJSONResponse(null);

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toBe('null');
    });

    it('should handle complex data structures', async () => {
      const data = {
        nested: {
          array: [1, 2, 3],
          string: 'test'
        },
        number: 42
      };
      const response = createJSONResponse(data);
      
      const body = await response.text();
      expect(JSON.parse(body)).toEqual(data);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with message', async () => {
      const response = createErrorResponse('Something went wrong');

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      const body = await response.text();
      const parsed = JSON.parse(body);
      expect(parsed.error).toBe('Something went wrong');
    });

    it('should create error response with custom status', async () => {
      const response = createErrorResponse('Not found', 404);

      expect(response.status).toBe(404);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      const body = await response.text();
      const parsed = JSON.parse(body);
      expect(parsed.error).toBe('Not found');
    });

    it('should default to status 500 if not provided', () => {
      const response = createErrorResponse('Error');

      expect(response.status).toBe(500);
    });
  });
});