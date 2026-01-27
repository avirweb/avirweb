export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const objectName = url.pathname.slice(1);

    if (!objectName) {
      return new Response('Missing object name', { status: 400 });
    }

    try {
      const object = await env.AVIR_VIDEOS.get(objectName);

      if (!object) {
        return new Response('Object not found', { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          'Content-Type': object.httpMetadata?.contentType || 'video/mp4',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  },
};
