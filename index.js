// index.js
import { Clerk } from '@clerk/backend';

// Esta es la función que maneja las peticiones de la API
const handleApiRequest = async (request, env) => {
  const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
      return new Response('Authorization header is missing', { status: 401 });
  }

  try {
      const token = authHeader.replace('Bearer ', '');
      const claims = await clerk.verifyToken(token);
      return new Response(JSON.stringify({ success: true, userId: claims.sub }), {
          headers: { 'Content-Type': 'application/json' },
      });
  } catch (error) {
      return new Response('Invalid token', { status: 401 });
  }
};

// Este es el manejador principal que se exporta
export default {
  async fetch(request, env, ctx) {
      const url = new URL(request.url);

      // Si la ruta empieza con /api/, usa la lógica de la API
      if (url.pathname.startsWith('/api/')) {
          return handleApiRequest(request, env);
      }

      // Para todo lo demás, sirve los archivos estáticos de tu sitio
      // El "try...catch" es una salvaguarda por si env.ASSETS no está disponible
      try {
          return await env.ASSETS.fetch(request);
      } catch (e) {
          // Si el asset no se encuentra (404), sirve el index.html para que la SPA maneje la ruta.
          if (e.constructor.name === 'NotFoundError') {
              return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
          }
          return new Response(e.message || e.toString(), { status: 500 });
      }
  },
};
