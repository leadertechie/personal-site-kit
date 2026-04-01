const DEFAULT_STATIC_DETAILS = {
  siteTitle: "My Personal Website",
  copyright: "2026 My Personal Website",
  linkedin: "https://linkedin.com/in/yourname",
  github: "https://github.com/yourname",
  email: "yourname@domain.com"
};

export async function handleStaticDetails(env?: any, method?: string, body?: any): Promise<Response> {
  try {
    if (!env?.CONTENT_BUCKET) {
      return new Response(JSON.stringify(DEFAULT_STATIC_DETAILS), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET - return static details
    if (!method || method === 'GET') {
      const staticDetails = await env.CONTENT_BUCKET.get('staticdetails.json');
      if (staticDetails) {
        const data = await staticDetails.json();
        return new Response(JSON.stringify({ ...DEFAULT_STATIC_DETAILS, ...data }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }
      return new Response(JSON.stringify(DEFAULT_STATIC_DETAILS), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // PUT - save static details (handled in content handler)
    return new Response(JSON.stringify({ error: 'Use content endpoint for PUT' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error serving static details:', error);
    return new Response(JSON.stringify(DEFAULT_STATIC_DETAILS), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
