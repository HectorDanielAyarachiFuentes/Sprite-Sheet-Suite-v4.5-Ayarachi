// index.js
import { Clerk } from '@clerk/backend';
// ¡OJO! Ya no importamos 'assetHandler'.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Si la petición es para la API, la protegemos con Clerk.
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request, env);
    }

    // Para todo lo demás, servimos el sitio estático desde el bucket de KV.
    // 'ASSETS' es el binding que Wrangler crea automáticamente para el bucket definido en [site].
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      // Si el asset no se encuentra, puede que sea una ruta de la app (ej. /login)
      // En ese caso, servimos el index.html para que el router del frontend se encargue.
      let notFoundResponse = await env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
      return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
    }
  },
};

async function handleApiRequest(request, env) {
  // Inicializa Clerk con tu clave secreta
  const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return new Response('Authorization header is missing', { status: 401 });
  }

  try {
    // Extrae y verifica el token
    const token = authHeader.replace('Bearer ', '');
    const claims = await clerk.verifyToken(token);

    // ¡Éxito! El usuario está autenticado.
    // claims.sub contiene el ID del usuario.
    console.log(`User ${claims.sub} is authenticated.`);

    // Aquí iría tu lógica para guardar el proyecto en D1, por ejemplo.
    return new Response(JSON.stringify({ success: true, userId: claims.sub }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response('Invalid token', { status: 401 });
  }
}
