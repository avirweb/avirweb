export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Redirect .html URLs to clean URLs (except 404.html and root)
    if (pathname.endsWith('.html') && pathname !== '/404.html' && pathname !== '/index.html') {
      const cleanPath = pathname.slice(0, -5); // Remove .html
      return Response.redirect(new URL(cleanPath, url.origin), 301);
    }

    // Handle index.html -> /
    if (pathname === '/index.html') {
      return Response.redirect(new URL('/', url.origin), 301);
    }

    // Handle clean URLs - serve .html file directly
    if (!pathname.includes('.') && pathname !== '/') {
      const htmlPath = pathname + '.html';
      
      // Try to fetch the .html file from assets
      const htmlUrl = new URL(request.url);
      htmlUrl.pathname = htmlPath;
      
      const response = await env.ASSETS.fetch(new Request(htmlUrl, request));
      
      // If file exists, return it
      if (response.status === 200) {
        return new Response(response.body, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
      }
      
      // File doesn't exist, continue to 404 handling
    }

    // Serve static assets
    const response = await env.ASSETS.fetch(request);
    
    // If 404, serve custom 404 page
    if (response.status === 404) {
      const notFoundUrl = new URL('/404.html', url.origin);
      const notFoundResponse = await env.ASSETS.fetch(new Request(notFoundUrl, request));
      if (notFoundResponse.status === 200) {
        return new Response(notFoundResponse.body, {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
      }
    }

    return response;
  }
};
