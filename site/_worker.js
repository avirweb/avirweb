export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Only handle API requests
    if (url.pathname === '/api/submit-form' && request.method === 'POST') {
      return new Response(JSON.stringify({ error: 'Not implemented yet' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve static assets
    return env.ASSETS.fetch(request);
  }
};
