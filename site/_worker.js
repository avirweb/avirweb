export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Redirect .html URLs to clean URLs (except 404.html)
    if (pathname.endsWith('.html') && pathname !== '/404.html') {
      const cleanPath = pathname === '/index.html' ? '/' : pathname.slice(0, -5);
      return Response.redirect(new URL(cleanPath, url.origin), 301);
    }

    // Handle clean URLs - try to serve .html file
    if (!pathname.includes('.') && pathname !== '/') {
      const htmlPath = pathname + '.html';
      const htmlUrl = new URL(request.url);
      htmlUrl.pathname = htmlPath;
      
      const response = await env.ASSETS.fetch(new Request(htmlUrl, request));
      if (response.status !== 404) {
        return response;
      }
    }

    // Handle trailing slash - redirect to non-trailing
    if (pathname.length > 1 && pathname.endsWith('/')) {
      return Response.redirect(new URL(pathname.slice(0, -1), url.origin), 301);
    }

    // Serve static assets
    const response = await env.ASSETS.fetch(request);
    
    // If 404, serve custom 404 page
    if (response.status === 404) {
      const notFoundUrl = new URL('/404.html', url.origin);
      const notFoundResponse = await env.ASSETS.fetch(new Request(notFoundUrl, request));
      return new Response(notFoundResponse.body, {
        status: 404,
        headers: notFoundResponse.headers
      });
    }

    return response;
  }
};
