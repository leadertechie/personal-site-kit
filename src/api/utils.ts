export interface APIResponse {
  data?: any;
  error?: string;
  status: number;
}

export function createJSONResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createErrorResponse(message: string, status: number = 500): Response {
  return createJSONResponse({ error: message }, status);
}