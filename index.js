// index.js
import { Clerk } from '@clerk/backend';
// ¡OJO! Ya no importamos 'assetHandler'.

export default {
  async fetch(request, env, ctx) {
    // It's a best practice to wrap the main fetch handler in a try...catch block
    // to handle any unexpected errors and avoid the generic "Worker threw exception" error.
    try {
      const url = new URL(request.url);

      // Si la petición es para la API, la protegemos con Clerk.
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env);
      }

      // This checks if the ASSETS binding for Cloudflare Pages is available.
      // If not, it means the worker is likely not deployed as a Pages Function.
      if (!env.ASSETS) {
        return new Response('Static asset serving is not configured.', { status: 500 });
      }

      // Para todo lo demás, servimos el sitio estático desde el bucket de KV.
      // 'ASSETS' es el binding que Wrangler crea automáticamente para el bucket definido en [site].
      return await env.ASSETS.fetch(request);
    } catch (e) {
      // This catch block is for when an asset is not found (e.g., a 404).
      // It's a common pattern for Single Page Applications (SPAs) to serve the index.html
      // for any path that doesn't match a static file, letting the frontend router take over.
      if (e.message.includes('Not Found')) {
        const url = new URL(request.url);
        let notFoundResponse = await env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
      }
      
      // For other errors, return a 500.
      console.error("Worker fetch error:", e);
      return new Response('An internal error occurred', { status: 500 });
    }
  },
};

async function handleApiRequest(request, env) {
  try {
    // Validate that the secret key is present before initializing Clerk.
    if (!env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY environment variable not set.');
    }

    // Inicializa Clerk con tu clave secreta
    const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return new Response('Authorization header is missing', { status: 401 });
    }

    // Extrae y verifica el token
    const token = authHeader.replace('Bearer ', '');
    const claims = await clerk.verifyToken(token);

    // ¡Éxito! El usuario está autenticado.
    // claims.sub contiene el ID del usuario.

    // Aquí iría tu lógica para guardar el proyecto en D1, por ejemplo.
    return new Response(JSON.stringify({ success: true, userId: claims.sub }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("API Request Error:", error);
    // Provide a more generic error message for security.
    // The specific error is logged for debugging.
    return new Response('Authentication error', { status: 401 });
  }
}
